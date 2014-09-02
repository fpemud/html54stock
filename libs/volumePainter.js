/*
html5行情图库
author:yukaizhao
blog:http://www.cnblogs.com/yukaizhao/
商业或公开发布请联系：yukaizhao@gmail.com
*/
/*options like:
{
    region:{x:x,y:y,width:width,height:height},
    bar:{width:1,color:'red'},
    maxDotsCount:241,
    getDataLength:function(){return this.data.items.length;}
}
*/
function volumePainter(options) {
    this.options = options;

    this.barWidth = options.bar.width;
    this.spaceWidth = options.region.width / options.maxDotsCount - options.bar.width;
    if (this.spaceWidth < 1) this.spaceWidth = 0;
    if (this.barWidth * options.maxDotsCount > options.region.width) this.barWidth = options.region.width / options.maxDotsCount;
}

volumePainter.prototype = {
    initialize: function (absPainter) {
        absPainter.options = this.options;
        absPainter.barWidth = this.barWidth;
        absPainter.spaceWidth = this.spaceWidth;
    },
    getDataLength: function () { return this.options.getDataLength.call(this); },
    getX: function (i) {
        return this.options.region.x + i * (this.barWidth + this.spaceWidth);
    },
    start: function () {
        var ctx = this.ctx;
        var options = this.options;
        var region = options.region;
        ctx.save();
        //转换坐标
        var maxVolume = 0;
        this.data.items.each(function (item) {
            maxVolume = Math.max(maxVolume, item.volume);
        });

        this.maxVolume = maxVolume;
        ctx.fillStyle = options.bar.color;
    },
    end: function () {
        this.ctx.restore();
    },
    getY: function (i) {
        var diff = this.options.region.y + (this.maxVolume - this.data.items[i].volume) * this.options.region.height / this.maxVolume;
        return diff;
    },
    paintItem: function (i, x, y) {
        var ctx = this.ctx;
        ctx.beginPath();
        ctx.rect(x, y, this.barWidth, this.options.region.y + this.options.region.height - y);
        ctx.fill();
    }
};
/*
var ctx = canvas.getContext('2d');
var maxVolume = 0;

data.each(function (val, arr, i) {
    maxVolume = Math.max(maxVolume, val.volume);
});

function getY(v) { return canvas.height - canvas.height / maxVolume * v; }
function getX(i) { return i * (candleOptions.spaceWidth + candleOptions.barWidth) + (candleOptions.spaceWidth) * .5; }

data.each(function (val, arr, i) {
    var x = getX(i);
    var y = getY(val.volume);
    ctx.beginPath();
    ctx.rect(x, y, candleOptions.barWidth, canvas.height / maxVolume * val.volume);
    ctx.closePath();
    ctx.fillStyle = val.close > val.open ? riseColor : fallColor;
    ctx.fill();
});
*/