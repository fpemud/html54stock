using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.IO;
using System.Text.RegularExpressions;
using System.Collections.Specialized;

using Yahoo.Yui.Compressor;
namespace ConsoleApplication3
{
    class Program
    {
        static void Main(string[] args)
        {
            string dirName = args == null || args.Length == 0 ? @"X:\html5test" : args[0];
            DirectoryInfo dir = new DirectoryInfo(dirName);
            FileInfo[] files = dir.GetFiles("*.htm?");
            for (int i = 0; i < files.Length; i++)
            {
                FileInfo file = files[i];
                Console.WriteLine("process " + file.FullName);
                CompressFile(file);
            }
        }

        private static void CompressFile(FileInfo file)
        {
            string dir = Path.GetDirectoryName(file.FullName);
            string initialContent;
            using (StreamReader rdr = new StreamReader(file.OpenRead(), Encoding.Default))
            {
                initialContent = rdr.ReadToEnd();
                rdr.BaseStream.Seek(0, SeekOrigin.Begin);

                Regex regexScript = new Regex("<script[^>]*src=\"(?<src>[^\"]+)\"[^>]*>\\s*</script>", RegexOptions.Compiled | RegexOptions.IgnoreCase);
                MatchCollection mc = regexScript.Matches(initialContent);
                foreach (Match match in mc)
                {
                    if (match.Success)
                    {
                        string val = match.Value;

                        string src = match.Groups["src"].Value;
                        if (!src.StartsWith("libs/", StringComparison.CurrentCultureIgnoreCase)) continue;
                        string jsPath = Path.Combine(dir, src.Replace('/', '\\'));
                        int questionMarkIndex = jsPath.IndexOf('?');
                        if (questionMarkIndex > 0)
                        {
                            jsPath = jsPath.Substring(0, questionMarkIndex);
                        }
                        string jsContent;
                        using (StreamReader rdrJs = new StreamReader(jsPath, Encoding.Default))
                        {
                            jsContent = rdrJs.ReadToEnd();
                        }

                        jsContent = "<script>\r\n" + jsContent + "\r\n</script>";

                        initialContent = initialContent.Replace(val, jsContent);
                    }
                }
            }

            Regex regexScripts = new Regex("</script[^>]*>\\s*<script[^>]*>", RegexOptions.Compiled | RegexOptions.IgnoreCase | RegexOptions.Multiline);
            initialContent = regexScripts.Replace(initialContent, string.Empty);



            //compress with yui
            Regex regexScriptTag = new Regex(@"<script[^>]*>(?<js>[\s\S]*?)</script>",
                RegexOptions.Compiled | RegexOptions.IgnoreCase | RegexOptions.Multiline);
            MatchCollection mcScripts = regexScriptTag.Matches(initialContent);

            initialContent = regexScriptTag.Replace(initialContent, delegate(Match m)
            {
                string js = m.Groups["js"].Value;
                if (string.IsNullOrEmpty(js)) return m.Value;
                string compressedJs = JavaScriptCompressor.Compress(js);
                return "<script>" + Environment.NewLine + compressedJs + Environment.NewLine + "</script>";
            });



            string saveToFileName = Path.GetFileName(file.FullName);
            string saveToDir = Path.Combine(dir, "compiled");
            if (!Directory.Exists(saveToDir)) Directory.CreateDirectory(saveToDir);
            saveToFileName = Path.Combine(saveToDir, saveToFileName);
            using (StreamWriter writer = new StreamWriter(saveToFileName, false, Encoding.GetEncoding("GBK")))
            {
                writer.Write(initialContent);
            }
        }
    }
}
