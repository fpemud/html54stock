/*
html5行情图库
author:yukaizhao
blog:http://www.cnblogs.com/yukaizhao/
商业或公开发布请联系：yukaizhao@gmail.com
*/
(function () {
    function painter() { }

    painter.prototype = {
        _clear: function (canvas) {
            this.ctxs[canvas.id].clearRect(0, 0, canvas.width, canvas.height);
        },

        _createLayer: function (options, clear) {
            if (!options.id) {
                alert('_createCanvas必须指定id');
                return;
            }
            if (!this.layers) this.layers = {};
            if (!this.ctxs) this.ctxs = {};
            if (!this.drawOptions) this.drawOptions = {};
            if (this.layers[options.id]) {
                if (clear !== false) this._clear(this.layers[options.id]);
            } else {
                var z = this.maxZIndex++;
                var obj = document.createElement('canvas');
                obj.id = options.id;
                obj.style.position = 'absolute';
                obj.style.zIndex = z;
                obj.style.left = this.coords.x + options.left + 'px';
                obj.style.top = this.coords.y + options.top + 'px';
                obj.width = (options.width || (this.width - options.left));
                obj.height = (options.height || (this.height - options.top));
                if (this.debug && options.debug_backgroundColor) obj.style.backgroundColor = options.debug_backgroundColor;
                document.body.appendChild(obj);
                this.layers[options.id] = obj;
                this.ctxs[options.id] = obj.getContext('2d');
                this.drawOptions[options.id] = options;
            }
            return this.ctxs[options.id];
        },
        _drawRect: function (ctx, leftTopX, leftTopY, width, height, backgroundColor, borderWidth, borderColor, offsetX, offsetY) {
            offsetX = offsetX || 0;
            offsetY = offsetY || 0;
            ctx.beginPath();
            ctx.rect(leftTopX + offsetX, leftTopY + offsetY, width, height);
            ctx.lineWidth = borderWidth || 0;
            ctx.strokeStyle = borderColor;
            ctx.stroke();
        },
        _drawLine: function (ctx, leftTopX, leftTopY, rightBottomX, rightBottomY, color, width, offsetX, offsetY) {
            offsetX = offsetX || 0;
            offsetY = offsetY || 0;
            ctx.beginPath();
            var x0 = leftTopX + offsetX;
            var y0 = leftTopY + offsetY;
            var x1 = rightBottomX + offsetX;
            var y1 = rightBottomY + offsetY;
            var isH = (y0 == y1);
            var isV = (x0 == x1);
            if (isH) {
                if (y0 * 10 % 10 == 0) { y0 += .5; y1 += .5; }
            }
            if (isV) {
                if (x0 * 10 % 10 == 0) { x0 += .5; x1 += .5; }
            }
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.strokeStyle = color || '#000000';
            ctx.lineWidth = width || 1;
            ctx.stroke();
        },
        _drawText: function (ctx, txt, x, y, font, color, align) {
            ctx.font = (font || '9pt 宋体');
            ctx.textAlign = (align || 'left');
            ctx.fillStyle = (color || "Black");
            ctx.fillText(txt, x, y);
        },
        _measureText: function (ctx, txt, font) {
            if (font) ctx.font = font;
            var w = ctx.measureText(txt).width;
            return w;
        },

        _getLayer: function (name) {
            return this.layers[this.canvasId + '_' + name];
        },

        _getContext: function (name) {
            return this.ctxs[this.canvasId + '_' + name];
        },

        _getOptions: function (name) {
            return this.drawOptions[this.canvasId + '_' + name];
        }
    };
    window._painter = new painter();
})();
    