/*
html5行情图库
author:yukaizhao
blog:http://www.cnblogs.com/yukaizhao/
商业或公开发布请联系：yukaizhao@gmail.com
*/
/*
options = {
  region:{x:10,y:10,width:300,height:200},
  maxDotsCount:241,
  getDataLength:function(){},
  getItemValue:function(item){return item.price;},
  middleValue: 10.4, //通常是昨收
  color:'blue'
}
*/
function linePainter(options){
  this.options = options;
}

linePainter.prototype = {
    initialize:function(absPainter){
      absPainter.options  = this.options;
    },
    getDataLength:function(){return this.options.getDataLength.call(this);},
    getX: function (i) {
        return (i + 1) * (this.options.region.width / this.options.maxDotsCount);
    },
    start: function () {
        var ctx = this.ctx;
        var options = this.options;
        var region = options.region;
        ctx.save();
        //转换坐标
        ctx.translate(region.x, region.y + region.height / 2);


        var maxDiff = 0;
        var me = this;
        
        this.data.items.each(function (item) {
            var diff = Math.abs(options.middleValue - options.getItemValue(item));
            maxDiff = Math.max(diff, maxDiff);
        });

        this.maxDiff = maxDiff;
        ctx.beginPath();
        ctx.strokeStyle = options.lineColor;
    },
    end: function () {
        this.ctx.stroke();
        this.ctx.restore();
    },
    getY: function (i) {
        var options = this.options; 
        var diff =options.getItemValue(this.data.items[i]) - options.middleValue;
        return 0 - diff * options.region.height / 2 / this.maxDiff; 
    },
    paintItem: function (i, x, y) {
        var ctx = this.ctx;

        if (i == 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
};