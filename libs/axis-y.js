/*
html5行情图库
author:yukaizhao
blog:http://www.cnblogs.com/yukaizhao/
商业或公开发布请联系：yukaizhao@gmail.com
*/
/*
{ font: '11px Arial', region: { x: 0, y: 47, height: 320, width: 55}, color: 'black',align:'right' ,fontHeight:8,textBaseline:'top'}
*/
function yAxis(scalerOptions) {
  this.scalerOptions = scalerOptions;
}

yAxis.prototype = {
    initialize: function (painter) {
        painter.scalerOptions = this.scalerOptions;
    },
    start: function () {
        var ctx = this.ctx;
        ctx.save();
        if (typeof this.scalerOptions.color == 'string') ctx.fillStyle = this.scalerOptions.color;
        ctx.font = this.scalerOptions.font;
        ctx.translate(this.scalerOptions.region.x, this.scalerOptions.region.y);
        if (this.scalerOptions.textBaseline) ctx.textBaseline = this.scalerOptions.textBaseline;
    },
    end: function () { this.ctx.restore(); },
    getX: function (i) {
        if (this.scalerOptions.align == 'left') return 0;

        var w = this.ctx.measureText(this.data[i]).width;
        return this.scalerOptions.region.width - w;
    },
    getY: function (i) {
        if (i == 0) return 0;
        if (i == this.data.length-1) return this.scalerOptions.region.height - this.scalerOptions.fontHeight;
        return (this.scalerOptions.region.height * i / (this.data.length - 1) - this.scalerOptions.fontHeight / 2);
    },
    paintItem: function (i, x, y) {
        if (typeof this.scalerOptions.color == 'function')
            this.ctx.fillStyle = this.scalerOptions.color(this.data[i]);
        this.ctx.fillText(this.data[i], x, y);
    }
};

function calcAxisValues(high, low, count,formatFunc) {
    var diff = high - low;
    var space = diff / (count-1);
    var result = [];
    if (typeof formatFunc == 'undefined') formatFunc = toMoney;
    for (var i = 0; i < count; i++) {
        result.push(toMoney(high - i * space));
    }
    return result;
}

