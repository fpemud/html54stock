/*
html5行情图库
author:yukaizhao
blog:http://www.cnblogs.com/yukaizhao/
商业或公开发布请联系：yukaizhao@gmail.com
*/
/*使用此文件需要同时引用util.js*/
/*
    options:{
        position:{x:false,y:33}, //position中的值是相对于canvas的左上角的
        size:{width:150,height:200},
        opacity:80,
        cssClass:'',
        offsetToPoint:30,
        relativePoint:{x:15,y30},
        canvas:canvas,
        canvasRange:{x:1,y:2,width:200,height:100},
        innerHTML;'some text'
    }
*/
function Tip(options) {
    extendObject(options, this);
}

Tip.prototype = {
    getElementId: function () { return this.canvas.id + '_tip'; },
    _getRightLimit: function () { return this.canvasRange.x + this.canvasRange.width; },
    _getLeftLimit: function () { return this.canvasRange.x; },
    _getTopLimit: function () { return this.canvasRange.y; },
    _getBottomLimit: function () { return this.canvasRange.y + this.canvasRange.height; },
    show: function (relativePoint, html) {
        if (relativePoint) this.relativePoint = relativePoint;
        if (html) this.innerHTML = html;
        var otip = $id(this.getElementId());
        var size = this.size;
        var offset = this.offsetToPoint;
        var position = this.position;
        var relativePoint = this.relativePoint;

        var canvasPosition = getPageCoord(this.canvas);
        var y = position.y || relativePoint.y;
        var x = position.x || relativePoint.x;
        var tipX = 0;
        var tipY = 0;
        if (position.x) tipX = position.x;
        else {
            if (otip) {
                var currentX = parseInt(otip.style.left) - canvasPosition.x;
                //提示框在鼠标的右边
                if (currentX > x) {
                    if (offset + x + size.width > this._getRightLimit()) {
                        currentX = x - offset - size.width;
                    } else {
                        currentX = x + offset;
                    }
                } else {
                    if (x - offset - size.width > this._getLeftLimit()) {
                        currentX = x - offset - size.width;
                    } else {
                        currentX = x + offset;
                    }
                }
                tipX = currentX;
            } else {
                tipX = x + offset;
                if (tipX > this._getRightLimit()) {
                    tipX = x - offset - size.width;
                }
            }
        }

        //y值固定
        if (position.y) tipY = position.y;
        else {
            if (otip) {
                var currentY = parseInt(otip.style.top) - canvasPosition.y;
                //提示框在鼠标的右边
                if (currentY > y) {
                    if (offset + y + size.height > this._getBottomLimit()) {
                        currentY = y - offset - size.height;
                    } else {
                        currentY = y + offset;
                    }
                } else {
                    if (y - offset - size.height > this._getTopLimit()) {
                        currentY = y - offset - size.height;
                    } else {
                        currentY = y + offset;
                    }
                }
                tipY = currentY;
            } else {
                tipY = y + offset;
                if (tipY > this._getBottomLimit()) {
                    tipY = y - offset - size.height;
                }
            }
        }


        if (!otip) {
            otip = document.createElement('DIV');
            otip.id = this.getElementId();
            var opacity = this.opacity || 100;
            otip.style.cssText = '-moz-opacity:.' + opacity + '; filter:alpha(opacity='
                + opacity + '); opacity:' + (opacity / 100) + ';line-height:18px;font-family:Arial,"宋体";font-size:9pt;padding:4px;';
            otip.style.position = 'absolute';
            otip.style.zIndex = 4 + (this.canvas.style.zIndex || 1);
            otip.style.backgroundColor = 'white';
            otip.style.border = '1px solid gray';
            otip.style.width = this.size.width + 'px';
            otip.style.height = this.size.height + 'px';
            if (this.cssClass) otip.className = this.cssClass;
            document.body.appendChild(otip);
        }

        tipX = canvasPosition.x + tipX;
        tipY = canvasPosition.y + tipY;
        otip.style.left = tipX + 'px';
        otip.style.top = tipY + 'px';
            otip.style.display = 'block';
        otip.innerHTML = this.innerHTML;
    },
    hide: function () {
        var o = $id(this.getElementId());
        if (o) o.style.display = 'none';
    },
    update: function (relativePoint, html) {
        this.relativePoint = relativePoint;
        this.innerHTML = html;
        this.show();
    }
};