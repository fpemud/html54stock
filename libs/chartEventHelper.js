/*
html5行情图库
author:yukaizhao
blog:http://www.cnblogs.com/yukaizhao/
商业或公开发布请联系：yukaizhao@gmail.com
*/
/*使用此文件需要引用util.js和crossLine以及tip*/
/*
    canvas: 添加事件的画布
    options: {
        getCrossPoint:function (ev){return {x:x,y:y};},
        triggerEventRanges:{},
        tipOptions{
            tipHtml:function(ev){}
        },
        crossLineOptions:{
            color:'red'
        }
    }
*/
function disableBubbleAndPreventDefault(e) {
    if (e.preventDefault) e.preventDefault();
    e.cancelBubble = true;
}

function setTouchEventOffsetPosition(e, relativePoint) {
    e = e || event;
    if (e.touches && e.touches.length) {
        e = e.touches[0];
    } else if (e.changedTouches && e.changedTouches.length) {
        e = e.changedTouches[0];
    }
    
    var offsetX, offsetY;
    offsetX = e.pageX - relativePoint.x;
    offsetY = e.pageY - relativePoint.y;
    return { offsetX: offsetX, offsetY: offsetY };
}

function crossLinesAndTipMgr(canvas, options) {
    if (typeof Tip != 'function') {
        window.Tip = function () { };
        window.Tip.prototype = { show: function () { }, hide: function () { }, update: function () { } };
    }
    this.canvas = canvas;
    this.options = options;
}

crossLinesAndTipMgr.prototype._removeTipAndCrossLines = function () {
    //var canvas = this.canvas;
    var me = this;
    if (me.tip) me.tip.hide();
    if (me.clsMgr) me.clsMgr.removeCrossLines();
};
crossLinesAndTipMgr.prototype.updateOptions = function (options) {
    this.options = options;
};
crossLinesAndTipMgr.prototype._onMouseOrTouchMove = function (ev) {
    ev = ev || event;
    ev = getOffset(ev);
    var me = this;
    var options = me.options;
    var canvas = me.canvas;
    var canvasPosition = getPageCoord(canvas);
    var range = options.triggerEventRanges;

    //判断是否在范围之内，如果不在范围之内则移去十字线和tip
    if (ev.offsetX < range.x || ev.offsetX > range.x + range.width
            || ev.offsetY < range.y || ev.offsetY > range.y + range.height) {
        me._removeTipAndCrossLines();
        return;
    }

    var crossPoint = options.getCrossPoint(ev);
    //添加鼠标和触摸Event
    var crossLinesOptions = {
        crossPoint: crossPoint,
        verticalRange: { y1: range.y, y2: range.y + range.height },
        horizontalRange: { x1: range.x, x2: range.x + range.width },
        color: options.crossLineOptions.color,
        canvas: canvas
    };
    if (!me.clsMgr) {
        var clsMgr = new crossLines(crossLinesOptions);
        clsMgr.setMouseEvents(function (evHLine) {
            evHLine = evHLine || event;
            evHLine = getOffset(evHLine);
            var translatedEv = { offsetX: evHLine.offsetX + range.x, offsetY: parseInt(me.clsMgr.getHLine().style.top) - canvasPosition.y };
            var point = options.getCrossPoint(translatedEv);
            clsMgr.updateCrossPoint(point);
            if (me.tip) {
                me.tip.update(point, options.tipOptions.getTipHtml(translatedEv));
            }
        }, function (evl) {
            evl = evl || event;
            evl = getOffset(evl);
            var translatedEv = { offsetX: parseInt(me.clsMgr.getVLine().style.left) - canvasPosition.x, offsetY: evl.offsetY + range.y };
            var point = options.getCrossPoint(translatedEv);
            clsMgr.updateCrossPoint(point);
            if (me.tip) {
                me.tip.update(point, options.tipOptions.getTipHtml(translatedEv));
            }
        });

        me.clsMgr = clsMgr;
    } else {
        me.clsMgr.updateOptions(crossLinesOptions);
    }
    me.clsMgr.drawCrossLines();
    if (options.tipOptions) {
        var tipOp = options.tipOptions;
        if (!me.tip) {
            //tip设置
            var tip = new Tip({
                position: { x: tipOp.position.x || false, y: tipOp.position.y || false }, //position中的值是相对于canvas的左上角的
                size: tipOp.size,
                opacity: tipOp.opacity || 80,
                cssClass: tipOp.cssClass,
                offsetToPoint: tipOp.offsetToPoint || 30,
                relativePoint: { x: crossPoint.x, y: crossPoint.y },
                canvas: canvas,
                canvasRange: options.triggerEventRanges,
                innerHTML: tipOp.getTipHtml(ev)
            });
            me.tip = tip;
        }

        me.tip.show(crossPoint, tipOp.getTipHtml(ev));
    }
};

crossLinesAndTipMgr.prototype._touchstart = function (e) {
    e = e || event;
    disableBubbleAndPreventDefault(e);
    var src = e.srcElement || e.target || e.relatedTarget;
    this.touchstartTime = new Date();
};
crossLinesAndTipMgr.prototype._touchmove = function (e) {
    e = e || event;
    disableBubbleAndPreventDefault(e);

    var canvas = this.canvas;

    var relativePoint = getPageCoord(canvas);
    var src = e.srcElement || e.target || e.relatedTarget;
    var fixedEvt = setTouchEventOffsetPosition(e, relativePoint);

    this._onMouseOrTouchMove(fixedEvt);
};

crossLinesAndTipMgr.prototype._touchend = function (e) {
    e = e || event;
    disableBubbleAndPreventDefault(e);
    var src = e.srcElement || e.target || e.relatedTarget;
    var canvas = this.canvas;
    var fixedEvt = setTouchEventOffsetPosition(e, getPageCoord(canvas));
    this._removeTipAndCrossLines();

    var time = new Date();
    var ts = time.getTime() - this.touchstartTime.getTime();
    if (ts < 200) {
        if (typeof this.options.onClick == 'function') this.options.onClick();
    }
};
crossLinesAndTipMgr.prototype._mouseout = function (ev) {
    var e = ev || event;
    ev = getOffset(e);
    var me = this;
    var range = me.options.triggerEventRanges;
    //判断是否在范围之内，如果不在范围之内则移去十字线和tip
    if (ev.offsetX <= range.x || ev.offsetX >= range.x + range.width
            || ev.offsetY <= range.y || ev.offsetY >= range.y + range.height) {
        me._removeTipAndCrossLines();
        return;
    }

    var toEle = e.toElement || e.relatedTarget || e.target;
    
    if (toEle) {
        if (toEle == me.canvas) return;
        if (toEle == me.clsMgr.getHLine() || toEle == me.clsMgr.getVLine()) return;
        me._removeTipAndCrossLines();
    }
};

crossLinesAndTipMgr.prototype.addCrossLinesAndTipEvents = function () {
    var canvas = this.canvas;
    var options = this.options;
    var canvasPosition = getPageCoord(canvas);
    if (canvas.addCrossLinesAndTipEvents == true) return;
    canvas.addCrossLinesAndTipEvents = true;

    var touchable = isTouchDevice();
    var me = this;
    if (touchable) {
        addEvent(canvas, 'touchstart', function (ev) { me._touchstart.call(me, ev); });

        addEvent(canvas, 'touchmove', function (ev) { me._touchmove.call(me, ev); });

        addEvent(canvas, 'touchend', function (ev) { me._touchend.call(me, ev); });
    }
    else {
        addEvent(canvas, 'mouseout', function (ev) { me._mouseout.call(me, ev); });

        addEvent(canvas, 'mousemove', function (ev) { me._onMouseOrTouchMove.call(me, ev); });

        if (typeof options.onClick == 'function') {
            addEvent(canvas, 'click', options.onClick);
        }
    }
};

function addCrossLinesAndTipEvents(canvas, options) { 
    if(!canvas.crossLineAndTipMgrInstance){
        canvas.crossLineAndTipMgrInstance = new crossLinesAndTipMgr(canvas, options);
        canvas.crossLineAndTipMgrInstance.addCrossLinesAndTipEvents();
    }
}