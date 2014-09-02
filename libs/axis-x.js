/*
html5行情图库
author:yukaizhao
blog:http://www.cnblogs.com/yukaizhao/
商业或公开发布请联系：yukaizhao@gmail.com
*/
/*
options:{font:'11px 宋体',color:black,region:{x:5,y:130,width:180,height:20}}
*/
function xAxis(options){
  this.options = options;
}
xAxis.prototype = {
    initialize: function (painter) { painter.options = this.options; },
    start: function () {
        var ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = this.options.color;
        ctx.font = this.options.font;
        if (this.options.textBaseline) ctx.textBaseline = this.options.textBaseline;
        ctx.translate(this.options.region.x, this.options.region.y);
    },
    getY: function () { return 0; },
    getX: function (i) {
        if (i == 0) return 0;
        var w = this.ctx.measureText(this.data[i]).width;
        if (i == this.data.length - 1) return this.options.region.width - w;
        return (this.options.region.width * i / (this.data.length - 1)) - w / 2;
    },
    paintItem: function (i, x, y) {
        this.ctx.fillText(this.data[i], x, y);
    },
    end: function () {
        this.ctx.restore();
    }
};