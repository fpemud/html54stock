/*
html5行情图库
author:yukaizhao
blog:http://www.cnblogs.com/yukaizhao/
商业或公开发布请联系：yukaizhao@gmail.com
*/
  function controller(canvasId, options) {
      this.canvas = $id(canvasId);
      this.ctx = this.canvas.getContext('2d');
      this.region = options.region;
      this.bar = options.bar;
      this.value = options.value;
      //if (this.value) {console.log('this.value is{left:' + this.value.left + ',right:' + this.value.right + ')');}
      this.minBarDistance = options.minBarDistance || 5;
      this.onPositionChanged = options.onPositionChanged;
      this.prePaint = options.prePaint;
      this.isTouchDevice = isTouchDevice();
      this.touchFaultTolerance = options.touchFaultTolerance;
  }

  controller.prototype =
  {
      calcPositions: function () {
          var width = (this.region.width - this.bar.width);
          this.leftBarPosition = this.value.left * width / 100 + this.bar.width / 2;
          this.rightBarPosition = this.value.right * width / 100 + this.bar.width / 2;
      },
      drawControllerPart: function () {
          var canvas = this.canvas;
          var ctx = this.ctx;
          ctx.save();
          var region = this.region;
          var bar = this.bar;
          this.calcPositions();
          var leftBarPosition = this.leftBarPosition;
          var rightBarPosition = this.rightBarPosition;

          ctx.clearRect(region.x - 1, region.y - 1, region.width + 1, region.height + 1);

          if (typeof this.prePaint == 'function') {
              this.prePaint(ctx);
          }

          //setDebugMsg(leftBarPosition, 'Left');
          // 画线方式画出来的线太粗了
          ctx.lineWidth = 1;
          ctx.strokeStyle = region.borderColor;
          ctx.beginPath();
          ctx.moveTo(region.x, region.y);
          ctx.lineTo(region.x, region.y + region.height);
          ctx.lineTo(region.x + leftBarPosition, region.y + region.height);
          ctx.lineTo(region.x + leftBarPosition, region.y + region.height - (region.height - bar.height) / 2);
          ctx.stroke();

          ctx.strokeStyle = region.borderColor;
          ctx.beginPath();
          ctx.moveTo(region.x + leftBarPosition, region.y + region.height / 2 - bar.height / 2);
          ctx.lineTo(region.x + leftBarPosition, region.y);
          ctx.lineTo(region.x, region.y);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(region.x + leftBarPosition, region.y + region.height);
          ctx.lineTo(region.x + region.width, region.y + region.height);
          ctx.lineTo(region.x + region.width, region.y);
          ctx.lineTo(region.x + rightBarPosition, region.y);
          ctx.lineTo(region.x + rightBarPosition, region.y + region.height / 2 - bar.height / 2);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(region.x + rightBarPosition, region.y + region.height / 2 + bar.height / 2);
          ctx.lineTo(region.x + rightBarPosition, region.y + region.height);
          ctx.stroke();

          ctx.beginPath();
          ctx.fillStyle = 'blue';
          ctx.globalAlpha = .5;
          ctx.rect(region.x + leftBarPosition, region.y, rightBarPosition - leftBarPosition, region.height);
          ctx.closePath();
          ctx.fill();
          ctx.globalAlpha = 1;

          //画左侧小矩形框
          ctx.strokeStyle = bar.borderColor;
          ctx.fillStyle = bar.fillColor;
          ctx.beginPath();
          var leftBarRegion = { x: region.x + leftBarPosition - bar.width / 2, y: region.y + region.height / 2 - bar.height / 2, width: bar.width, height: bar.height };
          ctx.rect(leftBarRegion.x, leftBarRegion.y, leftBarRegion.width, leftBarRegion.height);
          this.leftBarRegion = leftBarRegion;
          ctx.closePath();
          ctx.stroke();
          ctx.fill();
          //画右侧小矩形
          ctx.beginPath();
          var rightBarRegion = { x: region.x + rightBarPosition - bar.width / 2, y: region.y + region.height / 2 - bar.height / 2, width: bar.width, height: bar.height };
          ctx.rect(rightBarRegion.x, rightBarRegion.y, rightBarRegion.width, rightBarRegion.height);
          this.rightBarRegion = rightBarRegion;
          ctx.closePath();
          ctx.stroke();
          ctx.fill();
          ctx.restore();
      },

      setLeftBarPosition: function (x) {
          if (x < this.bar.width / 2) this.leftBarPosition = this.bar.width / 2;
          else if (this.rightBarPosition - x - this.minBarDistance > this.bar.width)
              this.leftBarPosition = x;
          else
              this.leftBarPosition = this.rightBarPosition - this.bar.width - this.minBarDistance;
          this.value = this.getValue();
      },
      setRightBarPosition: function (x) {
          if (x < this.leftBarPosition + this.bar.width + this.minBarDistance) this.rightBarPosition = this.leftBarPosition + this.bar.width + this.minBarDistance;
          else if (x > this.region.width - this.bar.width / 2) this.rightBarPosition = this.region.width - this.bar.width / 2;
          else this.rightBarPosition = x;
          this.value = this.getValue();
      },
      addControllerEvents: function () {
          var me = this;
          if (me.isTouchDevice) {
              var canvas = me.canvas;
              addEvent(canvas, 'touchmove', function (e) {
                  e = e || event;
                  var src = e.srcElement || e.target || e.relatedTarget;

                  var touches = e.touches;
                  if (!touches || !touches.length) return;
                  var changed = false;
                  var canvasPosition = getPageCoord(this.canvas);
                  if (me.fingers && me.fingers.length) {
                      for (var i = 0; i < me.fingers.length; i++) {
                          var finger = me.fingers[i];

                          for (var j = 0; j < touches.length; j++) {
                              var touch = touches[j];
                              if (touch.identifier == finger.id) {
                                  var currentX = touch.pageX - canvasPosition.x;

                                  var moveLength = (currentX - finger.startX);
                                  if (moveLength != 0) {
                                      if (finger.type == 'left') {
                                          me.setLeftBarPosition(finger.leftPosition + moveLength);
                                      } else if (finger.type == 'right') {
                                          me.setRightBarPosition(finger.rightPosition + moveLength);
                                      } else {
                                          me.setLeftBarPosition(finger.leftPosition + moveLength);
                                          me.setRightBarPosition(finger.rightPosition + moveLength);
                                      }
                                      changed = true;
                                  }
                                  break;
                              }
                          }
                      }
                  }
                  if (changed) {
                      me.drawControllerPart();
                      //setDebugMsg('changed='+changed+',me.isValueChanged()=' + me.isValueChanged() + ',me.value=' + me.getValue());
                      if (typeof me.onPositionChanged == 'function' && me.isValueChanged()) {
                          me.value = me.getValue();

                          me.onPositionChanged(me.value);
                      }
                  }
                  disableBubbleAndPreventDefault(e);
              });
              addEvent(canvas, 'touchend', function (e) {
                  e = e||event;
                  //setDebugMsg('enter touchend me.fingers.length='+me.fingers.length);
                  if(me.fingers&&me.fingers.length){
                    if (typeof me.onPositionChanged == 'function' && me.isValueChanged()) {
                        me.value = me.getValue();
                        me.onPositionChanged(me.value);
                    }
                  }else{
                    var timeSpan = new Date().getTime() - me.touchstartTime.getTime();
                    //setDebugMsg('timeSpan='+timeSpan);
                    if(timeSpan < window.tapTimeLimit && me.startTouch){
                        var canvasPosition = getPageCoord(me.canvas);
                        var evt = me.startTouch;
                        var point = { offsetX: evt.pageX - canvasPosition.x, offsetY: evt.pageY - canvasPosition.y };                        
                        var centerX = (me.rightBarPosition+me.leftBarPosition)/2;
                        var moveLength = point.offsetX - centerX;
                        /*
                        setDebugMsg('evt.pageX='+evt.pageX+',centerX='+centerX+',point.offsetX='+point.offsetX+',moveLength='+moveLength);
                        setDebugMsg('me.leftBarPosition+moveLength=' +(me.leftBarPosition+moveLength) 
                          + ',me.rightBarPosition+moveLength=' +(me.rightBarPosition+moveLength));
                          */
                        me.setLeftBarPosition(me.leftBarPosition+moveLength);
                        me.setRightBarPosition(me.rightBarPosition+moveLength);
                        me.drawControllerPart();
                        //setDebugMsg('changed='+changed+',me.isValueChanged()=' + me.isValueChanged() + ',me.value=' + me.getValue());
                        if (typeof me.onPositionChanged == 'function' && me.isValueChanged()) {
                            me.value = me.getValue();

                            me.onPositionChanged(me.value);
                        }
                        me.startTouch = null;
                    }
                  }
                  me.fingers=null;
                  disableBubbleAndPreventDefault(e);
              });
              addEvent(canvas, 'touchstart', function (e) {
                  var touches = e.touches;
                  if (!touches || !touches.length) touches = e.changedTouches;
                  me.touchstartTime = new Date();
                  me.startTouch = touches[0];
                  var src = e.srcElement || e.target || e.relatedTarget;

                  var canvasPosition = getPageCoord(me.canvas);
                  function getTouchType(point) {
                      if (me.isOnLeftBar(point)) return 'left';
                      if (me.isOnRightBar(point)) return 'right';
                      if (me._isBetweenLeftAndRight(point)) return 'middle';
                      return false;
                  }

                  me.fingers = [];
                  if (touches.length) {
                      for (var i = 0; i < touches.length; i++) {
                          var touch = touches[i];
                          var point = { offsetX: touch.pageX - canvasPosition.x, offsetY: touch.pageY - canvasPosition.y };
                          var touchSection = getTouchType(point);
                          if (!touchSection) continue;

                          var finger = {
                              id: touch.identifier,
                              startX: touch.pageX - canvasPosition.x,
                              type: touchSection,
                              leftPosition: me.leftBarPosition,
                              rightPosition: me.rightBarPosition
                          };
                          me.fingers.push(finger);
                      }
                  }

                  disableBubbleAndPreventDefault(e);
                  return false;
              });
          } else {
              var moveHandle = function (ev) {
                  var isOnLeftBar = me.isOnLeftBar(ev);
                  var isOnRightBar = me.isOnRightBar(ev);
                  if (me._isBetweenLeftAndRight(ev)) {
                      document.body.style.cursor = 'pointer';
                  } else if (isOnLeftBar || isOnRightBar || me.triggerBar) {
                      document.body.style.cursor = 'col-resize';
                  }
                  else {
                      document.body.style.cursor = 'default';
                  }
                  if (me.triggerBar) {
                      me.triggerBar.targetX = ev.offsetX;
                      var moveLength = (me.triggerBar.targetX - me.triggerBar.x);
                      if (me.triggerBar.type == 'left') {
                          document.body.style.cursor = 'col-resize';
                          me.setLeftBarPosition(me.triggerBar.position + moveLength);
                      } else if (me.triggerBar.type == 'right') {
                          me.setRightBarPosition(me.triggerBar.position + moveLength);
                      } else {
                          me.setLeftBarPosition(me.triggerBar.leftPosition + moveLength);
                          me.setRightBarPosition(me.triggerBar.rightPosition + moveLength);
                      }

                      if (typeof me.onPositionChanged == 'function' && me.isValueChanged()) {
                          me.value = me.getValue();
                          me.onPositionChanged(me.value);
                      }
                      me.drawControllerPart();
                  }
              };
              var endMove = function (ev) {
                  if (me.triggerBar) {
                  }
                  me.triggerBar = null;
                  document.body.style.cursor = 'default';
                  if (typeof me.onPositionChanged == 'function' && me.isValueChanged()) {
                      me.value = me.getValue();
                      me.onPositionChanged(me.value);
                      //console.log('me.onPositionChanged(me.value) me.value is {left:' + me.value.left + ',right:' + me.value.right + '}');
                  }
              };

              var startHandle = function (ev) {
                  var isOnLeftBar = me.isOnLeftBar(ev);
                  var isOnRightBar = me.isOnRightBar(ev);
                  var isOnMiddle = me._isBetweenLeftAndRight(ev);
                  if (isOnMiddle) {
                      document.body.style.cursor = 'pointer';
                  } else if (isOnLeftBar || isOnRightBar) {
                      document.body.style.cursor = 'col-resize';
                  }
                  else {
                      document.body.style.cursor = 'default';
                  }

                  if (isOnLeftBar) me.triggerBar = { type: 'left', x: ev.offsetX, position: me.leftBarPosition };
                  else if (isOnRightBar) me.triggerBar = { type: 'right', x: ev.offsetX, position: me.rightBarPosition };
                  else if (isOnMiddle) me.triggerBar = { type: 'middle', x: ev.offsetX, leftPosition: me.leftBarPosition, rightPosition: me.rightBarPosition };
                  else me.triggerBar = null;

              };
              addEvent(me.canvas, 'mouseup', endMove);
              addEvent(me.canvas, 'mouseout', endMove);
              addEvent(me.canvas, 'mousemove', function (ev) {
                  ev = ev || event;
                  if (ev.preventDefault) ev.preventDefault();
                  else ev.returnValue = false;
                  var point = getOffset(ev);
                  moveHandle(point);
              });
              addEvent(me.canvas, 'mousedown', function (ev) {
                  ev = ev || event;
                  var point = getOffset(ev);
                  startHandle(point);
              });
          }
      },
      isValueChanged: function () {
          if (typeof this.preValue == 'undefined') {
              this.preValue = this.getValue();
              return false;
          }

          if (isTouchDevice() && this.latestChangeTime) {
              var now = new Date();
              if (now.getTime() - this.latestChangeTime.getTime() < 50) return false;
          }
          var preValue = this.preValue;
          var value = this.getValue();
          var changed = Math.abs(value.left - preValue.left) + Math.abs(value.right - preValue.right);
          this.preValue = value;
          var result = changed != 0;
          if (result) {
              this.latestChangeTime = new Date();
          }
          return changed != 0;
      },
      _isInRegion: function (ev, region) {
          return ev.offsetX > region.x && ev.offsetX < region.x + region.width
            && ev.offsetY > region.y && ev.offsetY < region.y + region.height;
      },

      _isBetweenLeftAndRight: function (ev) {
          var region = this.region;
          var middleRegion = {
              x: region.x + this.leftBarPosition + this.bar.width / 2,
              y: region.y,
              width: this.rightBarPosition - this.leftBarPosition - this.bar.width,
              height: this.region.height
          };
          return this._isInRegion(ev, middleRegion);
      },
      _getTouchFaultToleranceRegion: function (region) {
          var me = this;
          if (me.isTouchDevice) {
              region.x -= me.touchFaultTolerance / 2;
              region.width += me.touchFaultTolerance / 2;
          }
          return region;
      },
      isOnLeftBar: function (ev) {
          var region = this._getTouchFaultToleranceRegion(this.leftBarRegion);

          return this._isInRegion(ev, region);
      },
      isOnRightBar: function (ev) {
          var region = this._getTouchFaultToleranceRegion(this.rightBarRegion);
          return this._isInRegion(ev, region);
      },
      getValue: function () {
          var totalLength = this.region.width - this.bar.width;
          return {
              left: (this.leftBarPosition - this.bar.width / 2) * 100 / totalLength,
              right: (this.rightBarPosition - this.bar.width / 2) * 100 / totalLength
          };
      }
  };