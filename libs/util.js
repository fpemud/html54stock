/*
html5行情图库
author:yukaizhao
blog:http://www.cnblogs.com/yukaizhao/
商业或公开发布请联系：yukaizhao@gmail.com
*/
(function () {
    /*if (!Event.hasOwnProperty("fromElement") && Event.prototype.__defineGetter__) {
    Event.prototype.__defineGetter__("fromElement", function () {
    var node;
    if (this.type == "mouseover")
    node = this.relatedTarget;
    else if (this.type == "mouseout")
    node = this.target;
    if (!node) return;
    while (node.nodeType != 1) node = node.parentNode;
    return node;
    });
    Event.prototype.__defineGetter__("toElement", function () {
    var node;
    if (this.type == "mouseout")
    node = this.relatedTarget;
    else if (this.type == "mouseover")
    node = this.target;
    if (!node) return;
    while (node.nodeType != 1) node = node.parentNode;
    return node;
    });
    }*/

    function windowHelper() {
        this.tapTimeLimit = 500;
    }

    Array.prototype.each = function (func, startIndex, endIndex) {
        startIndex = startIndex || 0;
        endIndex = endIndex || this.length - 1;
        for (var i = startIndex; i <= endIndex; i++) {
            func(this[i], this, i);
            if (this.breakLoop) {
                this.breakLoop = false;
                break;
            }
        }
    };

    windowHelper.prototype = {
        preventDefaultEvent: function (ev) {
            if (ev.preventDefault) ev.preventDefault(); else ev.returnValue = false;
        },
        isTouchDevice: function () {
            return !!('ontouchstart' in window);
        },
        toMoney: function (val) {
            /*var pos = 2;
            return Math.round(val * Math.pow(10, pos)) / Math.pow(10, pos);*/
            return val.toFixed(2);
        },
        bigNumberToText: function (val) {
            var result;
            var yi = val / 100000000;
            if (yi > 1) {
                result = yi.toFixed(2) + '亿';
            } else {
                var wan = val / 10000;
                if (wan > 1)
                    result = wan.toFixed() + '万';
                else
                    result = val;
            }
            return result;
        },
        getOffset: function (e) {
            if (!isNaN(e.offsetX) && !isNaN(e.offsetY)) return e;
            var target = e.target;
            if (target.offsetLeft == undefined) {
                target = target.parentNode;
            }
            var pageCoord = getPageCoord(target);
            var eventCoord =
            {     //计算鼠标位置（触发元素与窗口的距离）
                x: window.pageXOffset + e.clientX,
                y: window.pageYOffset + e.clientY
            };
            var offset =
            {
                offsetX: eventCoord.x - pageCoord.x,
                offsetY: eventCoord.y - pageCoord.y
            };
            //e.offsetX = offset.offsetX;
            //e.offsetY = offset.offsetY;
            return offset;
        },
        getPageCoord: function (element)    //计算从触发到root间所有元素的offsetLeft值之和。
        {
            var coord = { x: 0, y: 0 };
            while (element) {
                coord.x += element.offsetLeft;
                coord.y += element.offsetTop;
                element = element.offsetParent;
            }
            return coord;
        },
        addLoadEvent: function (f) {
            var old = window.onload;
            if (typeof old != 'function') window.onload = f;
            else { window.onload = function () { old(); f(); }; }
        },
        addEvent: function (elm, evType, fn, useCapture) {
            if (elm.addEventListener) {
                elm.addEventListener(evType, fn, useCapture);
                return true;
            }
            else if (elm.attachEvent) {
                var r = elm.attachEvent('on' + evType, fn);
                return r;
            }
            else {
                elm['on' + evType] = fn;
            }
        },
        getEventTarget: function (e) {
            return e.srcElement || e.target || e.relatedTarget;
        },
        $id: function (id) { return document.getElementById(id); }
    };

    window.extendObject = function (src, dest) {
        for (var f in src) {
            dest[f] = src[f];
        }
    };
    window.extendWindow = function (src) {
        extendObject(src, window);
    };
    var wh = new windowHelper();
    extendWindow(wh);
    window.getQueryParam = function (paramName, isTop) {
        var oRegex = new RegExp('[\?&]' + paramName + '=([^&]+)', 'i');
        var oMatch = oRegex.exec(isTop ? window.top.location.search : location.search);
        if (oMatch && oMatch.length > 1)
            return decodeURIComponent(oMatch[1]);
        else
            return '';
    };
    window.debug = getQueryParam('debug');
    window.setDebugMsg = function (msg) {
        if (window.debug) {
            try {
                var oid = 'debug';
                var o = $id(oid);
                if (!o) {
                    o = document.createElement('DIV');
                    o.id = oid;
                    document.body.appendChild(o);
                }
                o.innerHTML = (window.debug == 2 ? (msg + '<br/>' + o.innerHTML) : msg);
            } catch (err) {
                alert(msg + ';error:' + err);
            }
        }
    };
})();