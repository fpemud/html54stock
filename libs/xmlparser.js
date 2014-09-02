/*
html5行情图库
author:yukaizhao
blog:http://www.cnblogs.com/yukaizhao/
商业或公开发布请联系：yukaizhao@gmail.com
*/
function XmlParser(doc) { this.doc = doc; }

XmlParser.prototype = {
    getChildValue: function (node, childTagName, childIndex) {
        childIndex = childIndex || 0;
        var childTagIndex = -1;
        for (var i = 0; i < node.childNodes.length; i++) {
            var child = node.childNodes[i];
            if (child.nodeName == childTagName) {
                childTagIndex += 1;
                if(childTagIndex == childIndex)
                    return child.firstChild.data;
            }
        }
        return null;
        //return node.getElementsByName(childTagName)[childIndex || 0].nodeValue;
    },
    getValue: function (path) {
        var doc = this.doc;
        var secs = path.split('/');
        var preLevelNodeList = [];
        var node = doc;
        for (var i = 0; i < secs.length; i++) {
            var sec = secs[i];
            if (sec == '') continue;
            if (sec.charAt(0) == '@') {
                sec = sec.substring(1, sec.length);
                return node.getAttribute(sec);
            }

            var index = sec.indexOf('[');
            if (index > 0) {
                nodeName = sec.substring(0, index);
                index = sec.substr(index + 1, sec.length - index - 2);
                node = this._getChildren(node, nodeName)[index];
            } else {
                node = this._getChildren(node, sec)[0];
            }
        }
        return node.nodeValue;
    },
    getNode: function (path) {
        var doc = this.doc;
        var secs = path.split('/');
        var previousNode = doc;
        var node;
        for (var i = 0; i < secs.length; i++) {
            var sec = secs[i];
            if (sec == '') continue;
            if (i > 0 && node) { previousNode = node; node = null; }
            var nodeName;
            var index = sec.indexOf('[');
            if (index > 0) {
                nodeName = sec.substring(0, index);
                index = sec.substr(index + 1, sec.length - index - 2);
                node = this._getChildren(previousNode, nodeName)[index];
            } else {
                node = this._getChildren(previousNode, sec)[0];
            }
        }
        return node;
    },
    getNodes: function (path) {
        var doc = this.doc;
        var secs = path.split('/');
        var preLevelNodeList = [];
        preLevelNodeList.push(doc);
        var nodeList = [];
        for (var i = 0; i < secs.length; i++) {
            var sec = secs[i];
            if (sec == '') continue;
            if (i > 0 && nodeList.length) { preLevelNodeList = nodeList; nodeList = []; }
            var nodeName;
            var node;
            var index = sec.indexOf('[');
            if (index > 0) {
                nodeName = sec.substring(0, index);
                index = sec.substr(index + 1, sec.length - index - 2);

                for (var j = 0; j < preLevelNodeList.length; j++) {
                    node = this._getChildren(preLevelNodeList[j], nodeName)[index];
                    nodeList.push(node);
                }
            } else {
                for (var j = 0; j < preLevelNodeList.length; j++) {
                    var nodes = this._getChildren(preLevelNodeList[j], sec);
                    for (var k = 0; k < nodes.length; k++) nodeList.push(nodes[k]);
                }
            }
        }
        return nodeList;
    },
    _getChildren: function (node, name) {
        var result = [];
        if (node.childNodes.length) {
            for (var i = 0; i < node.childNodes.length; i++) {
                if (node.childNodes[i].nodeName == name) result.push(node.childNodes[i]);
            }
        }
        return result;
    }
};