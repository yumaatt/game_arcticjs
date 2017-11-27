/**
 * Arctic.js v0.1.11
 * Copyright (c) 2012 DeNA Co., Ltd. 
 */
(function() {
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
																|| window[vendors[x]+'CancelRequestAnimationFrame'];
	}
 
	if(!window.requestAnimationFrame){
		window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
			timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
	}
 
	if(!window.cancelAnimationFrame){
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
	}
}());

(function(global){
	/**
	 * Wrapper of console.log. It shows arguments in a comma separated style.
	 * @memberOf arc.util
	 */
	function trace(){
		try{
			if(arguments.length == 1){
				console.log(arguments[0]);
			}else{
				var str = "";
				for(var i = 0; i < arguments.length; i++){
					if(i != 0) str += ",";
					str += arguments[i];
				}
				console.log(str);
			}
		}catch(e){
		}
	}
	
	/**
	 * bind
	 * @memberOf arc.util
	 */ 
	function bind(func, scope){
		return function(){
			return func.apply(scope, arguments);
		}
	}
	
	/**
	 * It copies the elements of the passed array and also converts a non-array argument to an array.
	 * @memberOf arc.util
	 */ 
	function copyArray(src){
		var length = src.length, result = [];
		while(length--){
			result[length] = src[length];
		}
		return result;	
	}
	
	function getRotatedPos(x, y, rotation){
		if(arc.ua.isAndroid2_1){
			return [x, y];
		}
		var theta = rotation * Math.PI / 180;
		var returnX = x * Math.cos(theta) - y * Math.sin(theta);
		var returnY = x * Math.sin(theta) + y * Math.cos(theta);
		return [returnX, returnY];
	}

	function getRotatedRect(x, y, width, height, rotation){
		if(arc.ua.isAndroid2_1){
			return [x, y, width, height];
		}
		var pos0 = getRotatedPos(x, y, rotation),
		    pos1 = getRotatedPos(x + width, y, rotation),
		    pos2 = getRotatedPos(x, y + height, rotation),
		    pos3 = getRotatedPos(x + width, y + height, rotation);

		var minX = Math.min(pos0[0], pos1[0], pos2[0], pos3[0]),
		    minY = Math.min(pos0[1], pos1[1], pos2[1], pos3[1]),
		    maxX = Math.max(pos0[0], pos1[0], pos2[0], pos3[0]),
		    maxY = Math.max(pos0[1], pos1[1], pos2[1], pos3[1]);
			
		return [minX, minY, maxX - minX, maxY - minY];	
	}
	
	function getColorStyle(color){
		var red = color >> 16;
		var green = color >> 8 & 0xff;
		var blue = color & 0xff;
		return 'rgb(' + red + ', ' + green + ', ' + blue + ')';
	}

	/**
	 * @namespace arc.util
	 * @description A group of utility functions.
	 */
	var util = {
		trace	: trace,
		bind	: bind,
		copyArray : copyArray
	};
	
	
	/**
	 * @namespace arc.ua
	 * @description It provides a set of properties which determine the platform from the UserAgent.
	 */
	var ua = {};
	/**
	 * Is the platform iPhone?
	 * @name isiPhone
	 * @constant {String} isiPhone
	 * @memberOf arc.ua
	 */
	ua.isiPhone	= /iPhone/i.test(navigator.userAgent);
	/**
	 * Is the platform iPhone4?
	 * @name isiPhone4
	 * @constant {String} isiPhone4
	 * @memberOf arc.ua
	 */
	ua.isiPhone4	= (ua.isiPhone && window.devicePixelRatio == 2);
	/**
	 * Is the platform iPad?
	 * @name isiPad
	 * @constant {String} isiPad
	 * @memberOf arc.ua
	 */
	ua.isiPad	= /iPad/i.test(navigator.userAgent);
	/**
	 * Is the platform iOS?
	 * @name isiOS
	 * @constant {String} isiOS
	 * @memberOf arc.ua
	 */
	ua.isiOS	= ua.isiPhone || ua.isiPad;
	/**
	 * Is the platform iOS3?
	 * @name isiOS3
	 * @constant {String} isiOS3
	 * @memberOf arc.ua
	 */
	ua.isiOS3	= (ua.isiOS && /OS\s3/.test(navigator.userAgent));
	/**
	 * Is the platform Android?
	 * @name isAndroid
	 * @constant {String} isiAndroid
	 * @memberOf arc.ua
	 */
	ua.isAndroid	= /android/i.test(navigator.userAgent);
	/**
	 * Is the platform Android2.1?
	 * @name isAndroid2_1
	 * @constant {String} isAndroid2_1
	 * @memberOf arc.ua
	 */
	ua.isAndroid2_1	= /android\s2\.1/i.test(navigator.userAgent);
	/**
	 * Is the platform a mobile?
	 * @name isMobile
	 * @constant {String} isMobile
	 * @memberOf arc.ua
	 */
	ua.isMobile	= ua.isiOS || ua.isAndroid;
	
	
	var SCREEN_NORMAL_WIDTH = 320;
	
	
	/**
	 * @name arc.Class
	 * @class This class generates a class.
	 */
	var Class = (function(){
		var newclass = function(){};
		/**
		 * Generate a class from the class definition.
		 * @name create
	 	 * @param {Object} definition class definition object.
	 	 * @memberof arc.Class
	 	 */ 
		/**
		 * Generate a class from a parent class and the class definition.
		 * @name create^2
		 * @param {Object} parent　parent class.
	 	 * @param {Object} definition class definition object.
	 	 * @memberof arc.Class
	 	 */ 
		function create(){
			var superclass = (typeof arguments[0] == 'function') ? arguments[0].prototype : {};
			if(!arguments[0]){
				throw new Error("define class");
			}
			
			function klass(){
				this.initialize.apply(this, arguments);
			}
	
			function argumentNames(body)
			{
				var names = body.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
					.replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
					.replace(/\s+/g, '').split(',');
				return names.length == 1 && !names[0] ? [] : names;
			}
			
			function overrideMethod(childMethod, parentMethod){
				var method = function(){
					var childScope = this;
					var $super = (parentMethod !== undefined) ? function(){ return parentMethod.apply(childScope, arguments); } : undefined;
					var args = copyArray(arguments);
					args.unshift($super);
					return childMethod.apply(childScope, args);
				}
				method.valueOf = bind(childMethod.valueOf, childMethod);
				method.toString = bind(childMethod.toString, childMethod);
				return method;		
			}
			
			if(typeof arguments[0] == 'function'){
				newclass.prototype = superclass;
				klass.prototype = new newclass;
				Array.prototype.shift.apply(arguments);
			}
			var def = arguments[0];
			for(var prop in def){
				var value = def[prop];
				if(typeof value == 'function'){
					if(argumentNames(value)[0] == '$super'){
						value = overrideMethod(value, superclass[prop]);
					}else if(prop == 'initialize'){
						if(superclass.initialize){
							var childInitialize = value;
							value = function(){
								superclass.initialize.apply(this, arguments);
								childInitialize.apply(this, arguments);
							}
						}
					}
				}
				klass.prototype[prop] = value;
			}
			klass.prototype.constructor = klass;
			
			return klass;
		}
	
		return {
			create:create
		};	
	})();
	
	
	
	var Event = Class.create(
	/** @lends arc.Event.prototype */
	{
		type:null, target:null,
		_willPropagate: true,
		/**
		 * @class Event Object which is delivered to the listener.
		 * @constructs
		 * @description Create an event object.
		 * @param {String} type A type of the event.
		 * @param {Object} params Properties of the event object.
		 */ 
		initialize:function(type, params){
			this.type = type;
			for(var prop in params){
				if(params.hasOwnProperty(prop)){
					if(prop == 'type' || prop == 'target'){
						continue;
					}
					this[prop] = params[prop];
				}
			}
		},
		/**
		 * Stop event propagation.
		 */
		stopPropagation: function(){
			this._willPropagate = false;
		},

		willPropagate: function(){
			return this._willPropagate;
		}
	});
	/**
	 * @name PROGRESS
	 * @constant {String} PROGRESS
	 * @memberOf arc.Event
	 */
	Event.PROGRESS	= 'PROGRESS';
	/**
	 * @name COMPLETE
	 * @constant {String} COMPLETE
	 * @memberOf arc.Event
	 */
	Event.COMPLETE	= 'COMPLETE';
	/**
	 * @name ENTER_FRAME
	 * @constant {String} ENTER_FRAME
	 * @memberOf arc.Event
	 */
	Event.ENTER_FRAME	= 'ENTER_FRAME';
	/**
	 * @name ERROR
	 * @constant {String} ERROR
	 * @memberOf arc.Event
	 */
	Event.ERROR	= 'ERROR';
	/**
	 * @name TIMER
	 * @constant {String} TIMER
	 * @memberOf arc.Event
	 */
	Event.TIMER	= 'TIMER';
	/**
	 * @name TIMER_COMPLETE
	 * @constant {String} TIMER_COMPLETE
	 * @memberOf arc.Event
	 */
	Event.TIMER_COMPLETE = 'TIMER_COMPLETE';
	/**
	 * @name TOUCH_START
	 * @constant {String} TOUCH_MOVE
	 * @memberOf arc.Event
	 */ 
	Event.TOUCH_START = 'TOUCH_START';
	/**
	 * @name TOUCH_MOVE
	 * @constant {String} TOUCH_MOVE
	 * @memberOf arc.Event
	 */
	Event.TOUCH_MOVE = 'TOUCH_MOVE';
	/**
	 * @name TOUCH_END
	 * @constant {String} TOUCH_END
	 * @memberOf arc.Event
	 */
	Event.TOUCH_END = 'TOUCH_END';
	
	
	/**
	 * @name arc.EventDispatcher
	 * @class Base class for all classes which dispatch events.
	 */
	var EventDispatcher = Class.create(
	/** @lends arc.EventDispatcher.prototype */
	{
		/**
		 * Registers an event listener object to EventDispatcher object so that the listener receives the notification.
		 * @param {String} type The type of event.
		 * @param {Function} callback The listener function.
		 */
		addEventListener:function(type, callback){
			var arr = EventDispatcher.listenHash[type];
			if(!arr){
				arr = EventDispatcher.listenHash[type] = [];
			}
	
			EventDispatcher.listenHash[type].push({target : this, callback : callback});
		},
		/**
		 * Removes a listener from the EventDispatcher object.
		 * @param {String} type The type of event.
		 * @param {Function} callback The listener function.
		 */
		removeEventListener:function(type, callback){
			var arr = EventDispatcher.listenHash[type];
			if(!arr) return;
	
			var succeed = false;
	
			for(var i = 0; i < arr.length; i++){
				var obj = arr[i];
				if(obj.target == this){
					if(callback && obj.callback == callback || !callback){
						arr.splice(i, 1);
						succeed = true;
					}
				}
			}
			if(arr.length == 0){
				delete EventDispatcher.listenHash[type];
				succeed = true;
			}
		},
		/**
		 * Dispatches an event to the event flow.
		 * @param {arc.Event} Event object
		 */ 
		dispatchEvent:function(){
			var type, params, e;
			if(arguments[0].constructor === String){
				type = arguments[0];
				params = arguments[1];
			}else{
				e = arguments[0];
				type = e.type;
			}

			if(!EventDispatcher.listenHash[type]) return;
			
			var arr = [];
			var tmp = EventDispatcher.listenHash[type];
			for(var i = 0; i < tmp.length; i++){
				arr[i] = tmp[i];
			}
			var len = arr.length;
			for(var i = 0; i < len; i++){
				var obj = arr[i];
				if(obj.target == this){
					if(!e){
						e = new Event(type, params);
					}
					e.target = this;
					obj.callback.call(this, e);
				}
			}
		}
	});
	EventDispatcher.listenHash = {};
	
	
	var Timer = Class.create(
	/** @lends arc.Timer.prototype */
	{
		_startTime:0, _isCounting:false, _elapsedTime:0,
		/**
		 * @class The Timer class is used for calculating a time. The class method tick() is called in the main run loop.
		 * @description Creates a Timer instance.
		 * @constructs
		 */
		initialize:function(){
			
		},
		/**
		 * Starts the timer.
		 */ 
		start:function(){
			this._isCounting = true;
			this._startTime = Timer.time;	
		},
		/**
		 * Stops the timer.
		 */ 
		stop:function(){
			this._isCounting = false;
		},
		/**
		 * Resets the timer.
		 */ 
		reset:function(){
			this._isCounting = true;
			this._startTime = Timer.time;	
		},
		/**
		 * Returns the elapsed time since the timer started.
		 * @returns {Number} The elapsed time
		 */ 
		getElapsed:function(){
			if(this._isCounting){
				this._elapsedTime = Timer.time - this._startTime;
			}
			return this._elapsedTime;
		}
	});
	Timer.time = 0;
	/**
	 * Progresses the time of the timer.
	 * @name tick
	 * @memberOf arc.Timer
	 */
	Timer.tick = function(){
		Timer.time = Date.now();
	};
	
	
	var CountTimer = Class.create(EventDispatcher, 
	/** @lends arc.CountTimer.prototype */
	{
		_timer:null,
		_currentCount:0, _repeatCount:0, _delay:0, _isRunning:false,
		_updateFunc:null,
	
		/**
		 * @class The CountTimer object dispatches the event at the times that was registered. It is used for an altanative for setInterval and setTimeout.
		 * @constructs
		 * @augments arc.EventDispatcher
		 * @description Creates CountTimer object
		 * @param {Number} delay A millisecond between the object dispatches events.
		 * @param {int} repeatCount The total number of times the timer is set to run. If the repeat count set to 0, the timer runs indefinitely.
		 */ 	
		initialize:function(delay, repeatCount){
			this._timer = new Timer();
			this._delay = delay;
			this._repeatCount = (repeatCount) ? repeatCount : 0;
		},
		/**
		 * Resets the timer.
		 */ 
		reset:function(){
			this._currentCount = 0;
			this.stop();
		},
		/**
		 * Starts the timer.
		 */
		start:function(){
			this._timer.start();
			if(this._updateFunc) CountTimer.system.removeEventListener(Event.ENTER_FRAME, this._updateFunc);
			this._updateFunc = bind(this._update, this);
			CountTimer.system.addEventListener(Event.ENTER_FRAME, this._updateFunc);
		},
		_update:function(e){
			var elapsed = this._timer.getElapsed();
			if(elapsed >= this._delay){
				this._currentCount++;
				this._timer.reset();
				this.dispatchEvent(Event.TIMER);
				if(this._repeatCount && this._currentCount >= this._repeatCount){
					this.reset();
					this.dispatchEvent(Event.TIMER_COMPLETE);
				}
			}
		},
		/**
		 * Stops the timer.
		 */ 
		stop:function(){
			this._timer.stop();
			if(this._updateFunc){
				CountTimer.system.removeEventListener(Event.ENTER_FRAME, this._updateFunc);
				this._updateFunc = null;
			}
		},
		/**
		 * Sets the delay.
		 * @param {Number} value A millisecond between the object dispatches events.
		 */
		setDelay:function(value){
			this._delay = value;
		},
		/**
		 * Returns the delay.
		 * @returns {Number} A millisecond between the object dispatches events.
		 */
		getDelay:function(){
			return this._delay;
		},
		/**
		 * Set the repeatCount.
		 * @param {int} repeatCount The total number of times the timer is set to run. If the repeat count set to 0, the timer runs indefinitely.
		 */
		setRepeatCount:function(value){
			this._repeatCount = value;
		},
		/**
		 * Returns the repeatCount.
		 * @returns {int} The total number of times the timer is set to run. If the repeat count set to 0, the timer runs indefinitely.
		 */
		getRepeatCount:function(){
			return this._repeatCount;
		}
	});
	CountTimer.system = null;
	
	
	var Ajax = Class.create(EventDispatcher,
	/** @lends arc.Ajax.prototype */
	{
		_method:'GET', _params:null, _url:null,
		_request:null, _jsonResponse:null, _loadedCallBack:null,
	
		/**
		 * @class Ajax class performs asynchronous HTTP request.
		 * @constructs
		 * @augments arc.EventDispatcher
		 * @description Creats an Ajax object
		 */ 
		initialize:function(){
			this._request = new XMLHttpRequest();
			this._loadedCallBack = bind(this._loaded, this);
		},
		/**
		 * Sends a HTTP request asynchronously. A COMPLETE event will be dispatched when it gets the the response.
		 * @param {String} url A URL that is send the request to.
		 * @param {Object} params Parameters
		 */ 
		load:function(url, params){
			this._url = url;
			this._params = params;
			this._request.open(this._method, this._url, true);
			//this._request.onreadystatechange = bind(this._loaded, this);
			this._request.addEventListener('readystatechange', this._loadedCallBack, false);
			this._request.send(this._params);
		},
		_loaded:function(){
			if(this._request.readyState == 4){
				if(this._request.status == 200 || this._request.status == 0){
					this.dispatchEvent(Event.COMPLETE);
				}else{
					this.dispatchEvent(Event.ERROR);
					throw new Error("Load Error : " + this._url);
				}
			}
		},
		unload:function(){
			this._request.abort();
			this._jsonResponse = null;
			this._request.removeEventListener('readystatechange', this._loadedCallBack, false);
		},
		/**
		 * Set the HTTP method.
		 * @param {String} method HTTP method
		 */ 
		setMethod:function(method){
			this._method = method;
		},
		/**
		 * Returns responseText
		 * @returns {String} A reponseText of XHR object
		 */ 
		getResponseText:function(){
			return this._request.responseText;
		},
		/**
		 * Returns response in JSON object.
		 * @returns {Object} JSON Object
		 */
		getResponseJSON:function(){
			if(!this._jsonResponse){
				this._jsonResponse = JSON.parse(this._request.responseText);
			}
			return this._jsonResponse;
		},
		/**
		 * Retuns the URL
		 * @returns {String} URL
		 */
		getURL:function(){
			return this._url;
		}
	});


	function getScreenWidth(){
		if(window.orientation == 90 || window.orientation == -90){
			return screen.height;
		}else{
			return screen.width;
		}
	}	
	
	/**
	 * @name arc.display
	 * @namespace
	 */
	var display = {};
	display.Image = Class.create(EventDispatcher,
	/** @lends arc.display.Image.prototype */
	{
		_data:null, _path:null, _width:null, _height:null, _frameWidth:null,
		_lx:null, _ly:null, _lwidth:null, _lheight:null, _hasLocalPos:false,
	
		/**
		 * @class Image class deals with a image.
		 * @constructs
		 * @augments arc.EventDispatcher
		 * @description Creates Image Object
		 * @param {HTMLImageElement} data HTMLImageElement object or path to a image
		 * @param {Array} localPosArr An array includes local positions and sizes(not required).
		 *
		 */ 
		initialize:function(data, localPosArr){
			if(!data && data.constructor != HTMLImageElement){
				throw new Error('set HTMLImageElement');
			}
			
			this._data = data;
			this._path = data.src;
	
			if(localPosArr && localPosArr.length == 4){
				this._lx = localPosArr[0];
				this._ly = localPosArr[1];
				this._lwidth = localPosArr[2];
				this._lheight = localPosArr[3];
				this._hasLocalPos = true;

				this._width = this._lwidth;
				this._height = this._lheight;
			}else{
				this._width = this._data.width;
				this._height = this._data.height;
			}
		},
		/**
		 * Duplicates the image.
		 * @returns {Image} The duplicated image
		 */ 
		duplicate:function(){
			var newImg = new display.Image();
			newImg._setData(this._data);
			return newImg;
		},
		/**
		 * Creates new image in a specified scale.
		 * @param {Number} xscale A horizontal scale for a new image
		 * @param {Number} yscale A vertical scale for a new image
		 * @returns {Image} The new Image object
		 */ 
		changeScale:function(xscale, yscale){
			return this.changeSize(this._width * xscale, this._height * yscale);
		},
		/**
		 * Creates new image in a specified size.
		 * @param {Number} width A width for a new image
		 * @param {Number} height A height for a new image
		 * @returns {Image} The new Image object
		 */ 
		changeSize:function(nwidth, nheight){
			var canvas = document.createElement('canvas'),
			    x = 0, y = 0, width = this._width, height = this._height;
			
			canvas.width = nwidth;
			canvas.height = nheight;
	
			if(this._hasLocalPos){
				x = this._lx;
				y = this._ly;
				width = this._lwidth;
				height = this._lheight;
	
				this._hasLocalPos = false;
			}
	
			if(arc.ua.isAndroid2_1 && getScreenWidth() != SCREEN_NORMAL_WIDTH){
				var scale = SCREEN_NORMAL_WIDTH /getScreenWidth();
	
				x = ~~(x * scale);
				y = ~~(y * scale);
				width = ~~(width * scale);
				height = ~~(height * scale);
				nwidth = ~~(nwidth * scale);
				nheight = ~~(nheight * scale);
			}
	
			canvas.getContext('2d').drawImage(this._data, x, y, width, height, 0, 0, nwidth, nheight);
			this._data = canvas;
			this._width = this._data.width;
			this._height = this._data.height;
	
			return this;
	
		},
		/**
		 * Changes its color.
		 * @param {int} color A color
		 * @param {Number} density A ratio of its application
		 */ 
		changeColor:function(color, density){
			var width = this._data.width;
			var height = this._data.height;
			var canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;
			var ctx = canvas.getContext('2d');
			ctx.drawImage(this._data, 0, 0);

			var originData = ctx.getImageData(0, 0, width, height);
			var newData = ctx.createImageData(width, height);
	
			var red = color >> 16;
			var green = color >> 8 & 0xff;
			var blue = color & 0xff;		
			
			for(var i = 0; i < height; i++){
				for(var j = 0; j < width; j++){
					var index = j * 4 + i * 4 * width;
					
					var r = (red   - originData.data[index])     * density + originData.data[index];
					var b = (green - originData.data[index + 1]) * density + originData.data[index + 1];
					var g = (blue  - originData.data[index + 2]) * density + originData.data[index + 2];
					var a = originData.data[index + 3];	
					
					newData.data[index]     = (r * a / 255) | 0;
					newData.data[index + 1] = (b * a / 255) | 0;
					newData.data[index + 2] = (g * a / 255) | 0;
					newData.data[index + 3] = a;
				}
			}
			ctx.putImageData(newData, 0, 0);
			this._data = canvas;
	
			return this;
		},
		/**
		 * Draws the image.
		 * @param {Number} x A horizontal position
		 * @param {Number} y A vartical position
		 * @param {Number} rotation A rotation
		 */ 
		draw:function(x, y, rotation){
			//ローカル座標が指定されていたらクロップする
			if(this._hasLocalPos){
				this.drawCrop(this._lx, this._ly, this._lwidth, this._lheight, x, y, this._width, this._height, rotation);
				return;
			}
	
			if(arc.ua.isAndroid2_1 && getScreenWidth() != SCREEN_NORMAL_WIDTH){
				var scale = SCREEN_NORMAL_WIDTH /getScreenWidth();
				x *= scale;
				y *= scale;
			}
			x = ~~(x); y = ~~(y);
			var ctx = display.Image.context;
			ctx.save();
			ctx.translate(x, y);
			if(rotation % 360 != 0) ctx.rotate(rotation);
			ctx.drawImage(this._data, 0, 0);
			ctx.restore();
		},
		/**
		 * Draws the image in a specified size.
		 * @param {Number} x A horizontal position
		 * @param {Number} y A vartical position
		 * @param {Number} width A width of the image
		 * @param {Number} height A height of the image
		 * @param {Number} rotation A rotation
		 */
		drawSize:function(x, y, width, height, rotation){
			//ローカル座標が指定されていたらクロップする
			if(this._hasLocalPos){
				this.drawCrop(this._lx, this._ly, this._lwidth, this._lheight, x, y, width, height, rotation);
				return;
			}
	
			var scaleX = width / this._width;
			var scaleY = height / this._height;
			var ctx = display.Image.context;
	
			if(arc.ua.isAndroid2_1){
				var scale = SCREEN_NORMAL_WIDTH /getScreenWidth();
				x = ~~(x * scale);
				y = ~~(y * scale);
				width = ~~(width * scale);
				height = ~~(height * scale);
	
				ctx.drawImage(this._data, x, y, width, height);
				return;
			}
			x = ~~(x); y = ~~(y); width = ~~(width); height = ~~(height);
			ctx.save();
			ctx.translate(x, y);
			if(rotation % 360 != 0) ctx.rotate(rotation * Math.PI / 180);
			if(scaleX != 1 || scaleY != 1) ctx.scale(scaleX, scaleY);
	
			ctx.drawImage(this._data, 0, 0, this._width, this._height);
			ctx.restore();
		},
		/**
		 * Draws the image within the specified cropping area.
		 * @param {Number} x1 A horizontal position of the cropping area
		 * @param {Number} y1 A vartical position of the cropping area
		 * @param {Number} width1 A width of the cropping area
		 * @param {Number} height1 A height of the cropping area
		 * @param {Number} x2 A horizontal position where to draw the image
		 * @param {Number} y2 A vartical position where to draw the image
		 * @param {Number} width2 A width of the image
		 * @param {Number} height2 A height of the image
		 * @param {Number} rotation A rotation of the image
		 */	
		drawCrop:function(x1, y1, width1, height1, x2, y2, width2, height2, rotation){
			if(this._hasLocalPos && this._frameWidth){
				x1 += this._lx;
				y1 += this._ly;
			}
	
			var width = (this._frameWidth) ? this._frameWidth : this._width;
			var scaleX = width2 / width;
			var scaleY = height2 / this._height;
			var ctx = display.Image.context;
	
			if(arc.ua.isAndroid2_1){
				var scale = SCREEN_NORMAL_WIDTH /getScreenWidth();
	
				if(this._data.constructor != HTMLCanvasElement){
					x1 = ~~(x1 * scale);
					y1 = ~~(y1 * scale);
					width1 = ~~(width1 * scale);
					height1 = ~~(height1 * scale);
				}
				x2 = ~~(x2 * scale);
				y2 = ~~(y2 * scale);
				width2 = ~~(width2 * scale);
				height2 = ~~(height2 * scale);
	
				ctx.drawImage(this._data, x1, y1, width1, height1, x2, y2, width2, height2);
				return;
			}
	
	
			x1 = ~~(x1); y1 = ~~(y1); width1 = ~~(width1); height1 = ~~(height1); x2 = ~~(x2); y2 = ~~(y2); width2 = ~~(width2); height2 = ~~(height2);
			ctx.save();
			ctx.translate(x2, y2);
			if(rotation % 360 != 0) ctx.rotate(rotation * Math.PI / 180);
			if(scaleX != 1 || scaleY != 1) ctx.scale(scaleX, scaleY);
			ctx.drawImage(this._data, x1, y1, width1, height1, 0, 0, width, this._height);
			ctx.restore();
		},
		/**
		 * Sets a width of a frame for a image used for a sprite animation.
		 * @param {Number} frameWidth A width of a frame
		 */ 
		setFrameWidth:function(value){
			this._frameWidth = value;
		},
		/**
		 * Returns a width of a frame.
		 * @returns {Number} A width of a frame
		 */
		getFrameWidth:function(){
			return this._frameWidth;
		},
		/**
		 * Returns a width.
		 * @returns {Number} A width
		 */ 
		getWidth:function(){
			return this._width;
		},
		/**
		 * Returns a height.
		 * @returns {Number} A height
		 */ 
		getHeight:function(){
			return this._height;
		},
		/**
		 * Returns a url of the image
		 * @returns {Number} A URL of the image.
		 */ 
		getPath:function(){
			return this._path;
		}
	});
	display.Image.context = null;
	
	
	display.DisplayObject = Class.create(EventDispatcher, 
	/** @lends arc.display.DisplayObject.prototype */
	{
		_data:null, _parent:null,
		_x:0, _y:0, _width:null, _height:null, _visible:true, _scaleX:1, _scaleY:1, _alpha:1, _rotation:0, _alignX:0, _alignY:0, _screenRect:[],
		/**
		 * @class A base class for all classes that display something.
		 * @constructs
		 * @param {Image} data Image object which is displayed
		 * @augments arc.EventDispatcher
		 * @description Creates DisplayObject.
		 */
		initialize:function(data){
			if(!data) return;
			this._data = data;
			this._width = this._data.getWidth();
			this._height = this._data.getHeight();
			this._screenRect = [0, 0, this._width, this._height];
		},
		/**
		 * Converts local positions to global positions.
		 * @param {Number} x A local horizontal position
		 * @param {Number} y A local vartical position
		 * @return {Array} An array that includes global positions of x and y in [x, y].
		 */ 
		localToGlobal:function(x, y){
			var targ = this, targX = x, targY = y;
			var returnX = 0, returnY = 0;
			while(targ){
				var pos = getRotatedPos(targX, targY, targ.getRotation());
				returnX += pos[0];
				returnY += pos[1];
	
				targX = targ.getX();
				targY = targ.getY();
				targ = targ.getParent();
			}
			return [returnX, returnY];
		},
		/**
		 * Converts global positions to local positions.
		 * @param {Number} x A global horizontal position
		 * @param {Number} y A global vartical position
		 * @return {Array} An array that includes local positions of x and y in [x, y].
		 */ 
		globalToLocal:function(x, y){
			var parentArr = [];
			var targ = this, returnX = x, returnY = y, targX = x, targY = y;
	
			while(targ){
				parentArr.unshift(targ);
				targ = targ.getParent();
			}
			for(var i = 0; i < parentArr.length; i++){
				var tParent = parentArr[i];
				
				targX -= tParent.getX();
				targY -= tParent.getY();

				var pos = getRotatedPos(targX, targY, -1 * tParent.getRotation());
				var tX = pos[0];
				var tY = pos[1];
	
				targX = tX;
				targY = tY;
			}
			
			return [targX, targY];
		},
		hitTestObject:function(targ){
			
		},
		draw:function(){
					
		},
		/**
		 * Sets a horizontal position.
		 * @param {Number} x A horizontal position
		 */ 
		setX:function(value){
			this._x = value;
			this._updateScreenRect();
		},
		/**
		 * Returns the horizontal position.
		 * @returns {Number} A horizontal position
		 */
		getX:function(){
			return this._x;
		},
		/**
		 * Sets a vartical position.
		 * @param {Number} y A vartical position
		 */ 
		setY:function(value){
			this._y = value;
			this._updateScreenRect();
		},
		/**
		 * Returns the vartical position.
		 * @returns {Number} A vartical position
		 */
		getY:function(){
			return this._y;
		},
		/**
		 * Sets a width.
		 * @param {Number} width A width
		 */
		setWidth:function(value){
			if(!value) value = 0;
			this._width = value;
			if(this._data){
				this._scaleX = this._width / this._data.getWidth();
			}
			this._updateScreenRect();
		},
		/**
		 * Returns the width.
		 * @returns {Number} A width
		 */
		getWidth:function(){
			return this._width;
		},
		/**
		 * Sets a height.
		 * @param {Number} height A height
		 */
		setHeight:function(value){
			if(!value) value = 0;
			this._height = value;
			if(this._data){
				this._scaleY = this._height / this._data.getHeight();
			}
			this._updateScreenRect();
		},
		/**
		 * Returns the height.
		 * @returns {Number} A height
		 */ 
		getHeight:function(){
			return this._height;
		},
		/**
		 * Sets a horizontal scale.
		 * @param {Number} scaleX A horizontal scale
		 */
		setScaleX:function(value){
			if(!value) value = 0;
			//if(value > 1) trace("exceed scale 1 :" + value);
			this._scaleX = value;
			this._width = this._data.getWidth() * this._scaleX;
			this._updateScreenRect();
		},
		/**
		 * Returns the horizontal scale.
		 * @returns {Number} A horizontal scale
		 */ 
		getScaleX:function(){
			return this._scaleX;
		},
		/**
		 * Sets a vartical scale.
		 * @param {Number} scaleX A vartical scale
		 */
		setScaleY:function(value){
			//if(value > 1) trace("exceed scale 1 :" + value);
			if(!value) value = 0;
			this._scaleY = value;
			this._height = this._data.getHeight() * this._scaleY;
			this._updateScreenRect();
		},
		/**
		 * Returns the vartical scale.
		 * @returns {Number} A vartical scale
		 */ 
		getScaleY:function(){
			return this._scaleY;
		},
		/**
		 * Sets a visibility.
		 * @param {Boolean} A visibility
		 */
		setVisible:function(value){
			this._visible = value;
		},
		/**
		 * Returns the visibility.
		 * @returns {Boolean} A visibility
		 */
		getVisible:function(){
			return this._visible;
		},
		/**
		 * Returns the parent of this display object.
		 * @returns {DisplayObject} The parent
		 */ 
		getParent:function(){
			return this._parent;
		},
		/**
		 * Sets an alpha.
		 * @param {Number} An alpha
		 */ 
		setAlpha:function(value){
			if(!value) value = 0;
			this._alpha = value;
		},
		/**
		 * Gets the alpha.
		 * @returns {Number} An alpha
		 */ 
		getAlpha:function(){
			return this._alpha;
		},
		/**
		 * Sets a rotation.
		 * @param {Number} A rotation in degree
		 */
		setRotation:function(value){
			if(!value) value = 0;
			this._rotation = value;
		},
		/**
		 * Returns the rotation.
		 * @returns {Number} A rotation in degree
		 */
		getRotation:function(){
			return this._rotation;
		},
		/**
		 * Returns a horizontal position from the origin.
		 * @returns {Number} A horizontal position from the origin
		 */
		getAlignX:function(){
			return this._alignX;
		},
		/**
		 * Returns a vartical position from the origin.
		 * @returns {Number} A vartical position from the origin
		 */ 
		getAlignY:function(){
			return this._alignY;
		},
		/**
		 * Returns a Stage object.
		 * @retuns {Stage} Stage object
		 */
		getStage: function(){
			return display.Stage.instance;
		},

		_updateScreenRect:function(){
			var tX = this._x + this._alignX * this._scaleX,
			    tY = this._y + this._alignY * this._scaleY,
			    tWidth = this._width,
			    tHeight = this._height;
			
			this._screenRect = getRotatedRect(tX, tY, tWidth, tHeight, this._rotation);
		}
	});
	
	
	display.DisplayObjectContainer = Class.create(display.DisplayObject, 
	/** @lends arc.display.DisplayObjectContainer.prototype */
	{
		_displayArr:null, _originWidth:0, _originHeight:0, _maskObj:null,
	
		/**
		 * @class A class that creates a display object which can contain display objects.
		 * @constructs
		 * @augments arc.display.DisplayObject
		 * @description Creates a display object container.
		 */
		initialize:function($super){
			$super(null);
			this._displayArr = [];
			this._minX = this._maxX = this._minY = this._maxY = 0;
		},
		/**
		 * Adds the display object to the display list.
		 * @param {DisplayObject} targ A display object that is going to be added to the display list
		 */
		addChild:function(targ){
			var len = this._displayArr.length;
			for(var i = 0; i < len; i++){
				if(this._displayArr[i] == targ) return;
			}
			
			this._displayArr.push(targ);
			targ._parent = this;
			this._updateSize();
		},
		/**
		 * Adds the display object to the display list at the specified depth.
		 * @param {DisplayObject} targ A display object that is going to be added to the display list
		 * @param {int} index A depth
		 */
		addChildAt:function(targ, index){
			this._displayArr.splice(index, 0, targ);
			targ._parent = this;
			this._updateSize();
		},
		/**
		 * Removes the display object from the display list.
		 * @param {DisplayObject} targ A display object that is going to be removed from the display list
		 */
		removeChild:function(targ){
			var len = this._displayArr.length;
			for(var i = 0; i < len; i++){
				if(this._displayArr[i] == targ){
					this._displayArr.splice(i, 1);
					targ._parent = null;
					if(targ._removeAllChild){
						targ._removeAllChild();
					}
					break;
				}
			}
			this._updateSize();
		},
		_removeAllChild:function(){
			var i, len, targ;
			for(i = 0, len = this._displayArr.length; i < len; i++){
				targ = this._displayArr[i];
				targ._parent = null;
				if(targ._removeAllChild){
					targ._removeAllChild();
				}
			}
			this._displayArr = [];
		},
		/**
		 * Determines whether the display object is a child of the display object container.
		 * @param {DisplayObject} targ A display object to test
		 * @returns {Boolean} true if the display object is a child of the display object container
		 */
		contains:function(targ){
			var len = this._displayArr.length;
			for(var i = 0; i < len; i++){
				if(this._displayArr[i] == targ){
					return true;
				}
			}
			return false;
		}, 
	
		/**
		 * Changes a depth of the display object.
		 * @param {DisplayObject} child A display object which is going to be changed its depth.
		 * @param {Number} index A new depth
		 */
		setChildIndex:function(child, index){
			for(var i = 0, len = this._displayArr.length; i < len; i++){
				var disp = this._displayArr[i];
				if(disp == child){
					this._displayArr.splice(i, 1);
					this._displayArr.splice(index, 0, child);
				}
			}
		},

		draw:function(pX, pY, pScaleX, pScaleY, pAlpha, pRotation){
			if(!this.getVisible()) return;
	
			pX = (pX | 0);
			pY = (pY | 0);
			pScaleX = (!isNaN(pScaleX)) ? pScaleX : 1;
			pScaleY = (!isNaN(pScaleY)) ? pScaleY : 1;
			pAlpha = (!isNaN(pAlpha)) ? pAlpha : 1;
			pRotation = (pRotation) ? pRotation : 0;
	
			var tx = pX;
			var ty = pY;
			var tScaleX = pScaleX * this._scaleX;
			var tScaleY = pScaleY * this._scaleY;
			var tAlpha = pAlpha * this._alpha;
			var tRotation = pRotation + this._rotation;
			var context = display.Image.context;
	
			var dispArr = copyArray(this._displayArr);
			var len = dispArr.length;
			for(var i = 0; i < len; i++){
				var disp = dispArr[i];
				var posX = disp.getX() * tScaleX;  //local position in reality
				var posY = disp.getY() * tScaleY;
	
				if(tRotation % 360 != 0){
					var tmpX = posX;
					var tmpY = posY;
					var pos = getRotatedPos(tmpX, tmpY, tRotation);
					posX = pos[0];
					posY = pos[1];
				}
				var localX = disp.getAlignX() * tScaleX * disp.getScaleX();
				var localY = disp.getAlignY() * tScaleY * disp.getScaleY();
				var pos = getRotatedPos(localX, localY, (disp.getRotation() + tRotation));
				posX += pos[0] + tx;
				posY += pos[1] + ty;
				
				if(!disp.getVisible()) continue;
				if(this._maskObj){
					context.save();
					context.beginPath();
					context.rect(this._maskObj.x * tScaleX + tx, this._maskObj.y * tScaleY + ty, this._maskObj.width * tScaleX, this._maskObj.height * tScaleY);
					context.closePath();
					context.clip();
				}
				disp.draw(posX, posY, tScaleX, tScaleY, tAlpha, tRotation);
	
				if(this._maskObj){
					context.restore();
				}
			}
			
			this._updateSize();
		},
		_updateSize:function(){
			var minX = 0, minY = 0, maxX = 0, maxY = 0;
			var len = this._displayArr.length;
			for(var i = 0; i < len; i++){
				var disp = this._displayArr[i];

				var tminX = disp._screenRect[0],
				    tminY = disp._screenRect[1],
				    tmaxX = disp._screenRect[0] + disp._screenRect[2],
				    tmaxY = disp._screenRect[1] + disp._screenRect[3];

				if(i == 0){
					minX = tminX;
					minY = tminY;
					maxX = tmaxX;
					maxY = tmaxY;
				}
				if(tminX < minX) minX = tminX;
				if(tmaxX > maxX) maxX = tmaxX;
				if(tminY < minY) minY = tminY;
				if(tmaxY > maxY) maxY = tmaxY;
				
			}
	
			this._originWidth = maxX - minX;
			this._originHeight = maxY - minY;
			this._width = this._originWidth * this._scaleX;
			this._height = this._originHeight * this._scaleY;

			this._screenRect = getRotatedRect(
				minX * this._scaleX + this._x,
				minY * this._scaleY + this._y,
				this._width,
				this._height,
				this._rotation
			);
		},
		
		setWidth:function(value){
			this._width = value;
			this._scaleX = this._width / this._originWidth;
		},
		setHeight:function(value){
			this._height = value;
			this._scaleY = this._height / this._originHeight;
		},
		setScaleX:function(value){
			//if(value > 1) trace("exceed scale 1 :" + value);
			this._scaleX = value;
			this._width = this._originWidth * this._scaleX;
		},
		setScaleY:function(value){
			//if(value > 1) trace("exceed scale 1 :" + value);
			this._scaleY = value;
			this._height = this._originHeight * this._scaleY;
		},
		/**
		 * Sets a clipping mask.
		 * @param {Number} x A horizontal position of the clipping mask
		 * @param {Number} y A vartical position of the clipping mask
		 * @param {Number} width A width of the clipping mask
		 * @param {Number} height A height of the clipping mask
		 */ 
		setMask:function(x, y, width, height){
			this._maskObj = {x:x, y:y, width:width, height:height};
		},
		/**
		 * Deletes the clipping mask.
		 */
		clearMask:function(){
			this._maskObj = null;
		},

		_updateScreenRect:function(){
			this._updateSize();
		}
	});
	
	
	/**
	 * @name arc.display.Align
	 * @namespace
	 */
	display.Align = {
		/**
		 * @name TOP
		 * @constant {String} TOP
		 * @memberOf arc.display.Align
		 */
		TOP		:'TOP',
		/**
		 * @name TOP_LEFT
		 * @constant {String} TOP_LEFT
		 * @memberOf arc.display.Align
		 */
		TOP_LEFT	:'TOP_LEFT',
		/**
		 * @name TOP_RIGHT
		 * @constant {String} TOP_RIGHT
		 * @memberOf arc.display.Align
		 */
		TOP_RIGHT	:'TOP_RIGHT',
		/**
		 * @name CENTER
		 * @constant {String} CENTER
		 * @memberOf arc.display.Align
		 */
		CENTER		:'CENTER',
		/**
		 * @name LEFT
		 * @constant {String} LEFT
		 * @memberOf arc.display.Align
		 */
		LEFT		:'LEFT',
		/**
		 * @name RIGHT
		 * @constant {String} RIGHT
		 * @memberOf arc.display.Align
		 */
		RIGHT		:'RIGHT',
		/**
		 * @name BOTTOM
		 * @constant {String} BOTTOM
		 * @memberOf arc.display.Align
		 */
		BOTTOM		:'BOTTOM',
		/**
		 * @name BOTTOM_LEFT
		 * @constant {String} BOTTOM_LEFT
		 * @memberOf arc.display.Align
		 */
		BOTTOM_LEFT	:'BOTTOM_LEFT',
		/**
		 * @name BOTTOM_RIGHT
		 * @constant {String} BOTTOM_RIGHT
		 * @memberOf arc.display.Align
		 */
		BOTTOM_RIGHT	:'BOTTOM_RIGHT'
		
	};
	
	
	
	display.Shape = Class.create(display.DisplayObject, 
	/** @lends arc.display.Shape.prototype */
	{
		_funcStack:null, _minX:0, _maxX:0, _minY:0, _maxY:0, _firstFlg:true, _willBeFilled:false, _willBeStroked:false,
	
		/**
		 * @class A Shape object draws vectors to the canvas.
		 * @constructs
		 * @augments arc.display.DisplayObject
		 * @description Creates Shape object
		 */
		initialize:function(){
			this._funcStack = new Array();
		},
		/**
		 * Begings to fill.
		 * @param {int} color A color of the fill
		 * @param {alpha} alpha An alpha of the fill
		 */ 
		beginFill:function(color, alpha){
			var self = this;
			this._funcStack.push(function(pX, pY, pScaleX, pScaleY, pAlpha){
				self._willBeFilled = true;
				var ctx = display.Image.context;
				ctx.fillStyle = getColorStyle(color);
				ctx.globalAlpha = alpha * pAlpha;
			});
		},
		/**
		 * Ends to fill.
		 */
		endFill:function(){
			var self = this;
			this._funcStack.push(function(pX, pY, pScaleX, pScaleY, pAlpha){
				self._willBeFilled = false;
				var ctx = display.Image.context;
			});
		},
		/**
		 * Begins to stroke.
		 * @param {Number} thickness A thickness of the stroke
		 * @param {int} color A color of the stroke
		 * @param {Number} alpha An alpha of the stroke
		 */
		beginStroke:function(thickness, color, alpha){
			var self = this;
			if(!alpha) alpha = 1;
			this._funcStack.push(function(pX, pY, pScaleX, pScaleY, pAlpha){
				self._willBeStroked = true;
				
				var ctx = display.Image.context;
				ctx.lineWidth = thickness;
				ctx.strokeStyle = getColorStyle(color);
				ctx.globalAlpha = alpha * pAlpha;
			});
		},
		/**
		 * Ends to stroke
		 */
		endStroke:function(){
			var self = this;
			this._funcStack.push(function(pX, pY, pScaleX, pScaleY, pAlpha){
				self._willBeStroked = false;
			});
		},
		/**
		 * Changes the starting position to draw the line.
		 * @param {Number} x A new horizontal position
		 * @param {Number} y A new vartical position
		 */
		moveTo:function(x, y){
			this._funcStack.push(function(pX, pY, pScaleX, pScaleY, pAlpha){
				var ctx = display.Image.context;
				ctx.moveTo((x + pX) / pScaleX, (y + pY) / pScaleY);
			});
		},
		/**
		 * Changes the current position with drawing the line from the previous position.
		 * @param {Number} x A new horizontal position
		 * @param {Number} y A new vartical position
		 */
		lineTo:function(x, y){
			var self = this;
			this._funcStack.push(function(pX, pY, pScaleX, pScaleY, pAlpha){
				var ctx = display.Image.context;
				ctx.lineTo((x + pX) / pScaleX, (y + pY) / pScaleY);
				if(self._willBeStroked) ctx.stroke();
			});
		},
		_updateSize: function(x, y, width, height){
			if(this._firstFlg){
				this._firstFlg = false;
				this._minX = x;
				this._maxX = x + width;
				this._minY = y;
				this._maxY = y + height;
			}
			if(x < this._minX) this._minX = x;
			if(x + width > this._maxX) this._maxX = x + width;
			if(y < this._minY) this._minY = y;
			if(y + height > this._maxY) this._maxY = y + height;
	
			this._originWidth = this._maxX - this._minX;
			this._originHeight = this._maxY - this._minY;

			this._width = this._originWidth * this._scaleX;
			this._height = this._originHeight * this._scaleY;

			this._updateScreenRect();
		},
		/**
		 * Draws a rect.
		 * @param {Number} x A horizontal position of the rect
		 * @param {Number} y A vartical position of the rect
		 * @param {Number} width A width of the rect
		 * @param {Number} height A height of the rect
		 */ 
		drawRect:function(x, y, width, height){
			this._updateSize(x, y, width, height);

			var self = this;
			this._funcStack.push(function(pX, pY, pScaleX, pScaleY, pAlpha){
				var ctx = display.Image.context;
				ctx.beginPath();
				ctx.rect((x + pX) / pScaleX, (y + pY) / pScaleY, width, height);
				if(self._willBeFilled) ctx.fill();
				if(self._willBeStroked) ctx.stroke();
			});
		},
		/**
		 * Draws a circle.
		 * @param {Number} x A horizontal position of the center of the circle
		 * @param {Number} y A vartical position of the center of the circle
		 * @param {Number} radius A radius of the circle
		 */
		drawCircle:function(x, y, radius){
			this._updateSize(x - radius, y - radius, radius * 2, radius * 2);

			var self = this;
			this._funcStack.push(function(pX, pY, pScaleX, pScaleY, pAlpha){
				var ctx = display.Image.context;
				ctx.beginPath();
				ctx.arc((x + pX) / pScaleX, (y + pY) / pScaleY, radius, 0, 360, false);
				if(self._willBeFilled) ctx.fill();
				if(self._willBeStroked) ctx.stroke();
			});
		},
		draw:function(pX, pY, pScaleX, pScaleY, pAlpha, pRotation){
			pX = (pX | 0);
			pY = (pY | 0);
			pScaleX = (!isNaN(pScaleX)) ? pScaleX : 1;
			pScaleY = (!isNaN(pScaleY)) ? pScaleY : 1;
			pAlpha = (!isNaN(pAlpha)) ? pAlpha : 1;
			pRotation = (pRotation) ? pRotation : 0;
	
			var tX = pX;
			var tY = pY;
			var tScaleX = pScaleX * this._scaleX;
			var tScaleY = pScaleY * this._scaleY;
			var tAlpha = pAlpha * this._alpha;
			var tRotation = pRotation + this._rotation;
			
			var len = this._funcStack.length;
			var ctx = display.Image.context;
			
			ctx.save();
			ctx.scale(tScaleX, tScaleY);
			for(var i = 0; i < len; i++){
				var func = this._funcStack[i];
				func.call(this, tX, tY, tScaleX, tScaleY, tAlpha, tRotation);
			}
			ctx.restore();
		},
		setWidth:function(value){
			//this._scaleX = value / this._width;
			this._width = value;
			this._scaleX = this._width / this._originWidth;
			this._updateScreenRect();
		},
		getWidth:function(){
			return this._width * this._scaleX;
		},
		setHeight:function(value){
			//this._scaleY = value / this._height;
			this._height = value;
			this._scaleY = this._height / this._originHeight;
			this._updateScreenRect();
		},
		getHeight:function(){
			return this._height * this._scaleY;
		},
		setScaleX:function(value){
			//this._scaleX = value;
			this._scaleX = value;
			this._width = this._originWidth * this._scaleX;
			this._updateScreenRect();
		},
		setScaleY:function(value){
			//this._scaleY = value;
			this._scaleY = value;
			this._height = this._originHeight * this._scaleY;
			this._updateScreenRect();
		},
		_updateScreenRect:function(){
			var tX = this._x + this._minX * this._scaleX,
			    tY = this._y + this._minY * this._scaleY,
			    tWidth = this._width,
			    tHeight = this._height;
			
			this._screenRect = getRotatedRect(tX, tY, tWidth, tHeight, this._rotation);
		}
	});
	
	
	display.ImageContainer = Class.create(display.DisplayObject, 
	/** @lends arc.display.ImageContainer.prototype */
	{
		_align:display.Align.TOP_LEFT, _alignX:0, _alignY:0,
	
		/**
		 * @class A base class for all display objects that holds Image object.
		 * @constructs
		 * @augments arc.display.DisplayObject
		 * @param {Image} data Image object that is going to be shown
		 */
		initialize:function(data){
			
		},
		/**
		 * Sets the align of the Image object.
		 * @param {String} align
		 */
		setAlign:function(align){
			var dataWidth = (this._data.getFrameWidth()) ? this._data.getFrameWidth() : this._data.getWidth();
			switch(align){
				case display.Align.TOP :
					this._alignX = -1 * dataWidth / 2;
					this._alignY = 0;
					break;
				case display.Align.TOP_LEFT :
					this._alignX = 0;
					this._alignY = 0;
					break;
				case display.Align.TOP_RIGHT :
					this._alignX = -1 * dataWidth;
					this._alignY = 0;
					break;
				case display.Align.CENTER :
					this._alignX = -1 * dataWidth / 2;
					this._alignY = -1 * this._data.getHeight() / 2;
					break;
				case display.Align.LEFT :
					this._alignX = 0;
					this._alignY = -1 * this._data.getHeight() / 2;
					break;
				case display.Align.RIGHT :	
					this._alignX = -1 * dataWidth;
					this._alignY = -1 * this._data.getHeight() / 2;
					break;
				case display.Align.BOTTOM :
					this._alignX = -1 * dataWidth / 2;
					this._alignY = -1 * this._data.getHeight();
					break;
				case display.Align.BOTTOM_LEFT :
					this._alignX = 0;
					this._alignY = -1 * this._data.getHeight();
					break;
				case display.Align.BOTTOM_RIGHT :
					this._alignX = -1 * dataWidth;
					this._alignY = -1 * this._data.getHeight();
					break;
				default :
					throw new Error('Specify align');
					break;
			}
			this._align = align;
		},
		/**
		 * Returns the align
		 * @returns {String} A string of the align
		 */
		getAlign:function(){
			return this._align;
		}
	});
	
	
	display.Sprite = Class.create(display.ImageContainer, 
	/** @lends arc.display.Sprite.prototype */
	{
		/**
		 * @class A display object for a image
		 * @constructs
		 * @augments arc.display.ImageContainer
		 * @param {Image} data Image object that is going to be shown
		 * @example var sp = new arc.display.Sprite(this._system.getImage('a.png'));
		 * sp.setX(10);
		 * sp.setY(10);
		 */
		initialize:function(data){
	
		},
		draw:function(pX, pY, pScaleX, pScaleY, pAlpha, pRotation){
			pX = (pX | 0);
			pY = (pY | 0);
			pScaleX = (!isNaN(pScaleX)) ? pScaleX : 1;
			pScaleY = (!isNaN(pScaleY)) ? pScaleY : 1;
			pAlpha = (!isNaN(pAlpha)) ? pAlpha : 1;
			pRotation = (pRotation) ? pRotation : 0;
	
			var rotation = this._rotation + pRotation;
			var tScaleX = this._scaleX * pScaleX;
			var tScaleY = this._scaleY * pScaleY;
			
			var ctx = display.Image.context;
			ctx.globalAlpha = this._alpha * pAlpha;
	
			this._data.drawSize(pX, pY, this._width * pScaleX, this._height * pScaleY, rotation);
	
			ctx.globalAlpha = 1;
		}
	});
	
	display.MovieClip = Class.create(display.DisplayObjectContainer,
	/** @lends arc.display.MovieClip.prototype */
	{
		_shouldLoop:false,
		_fps:0,
		_timer:null,
		_currentFrame:0,
		_isPlaying:false,
		_isShowed:false,
		_timelineArr:null,
		_totalFrame:0,
		_shouldAutoPlay:false,
	
		/**
		 * @class A display object works like the ActionScript3.0's MovieClip. It controls the animations of its children with a key frame animation definition object that is specified when adding the child.
		 * @constructs
		 * @augments arc.display.DisplayObjectContainer
		 * @param {Number} fps FPS
		 * @param {Boolean} shouldLoop If true the animation will be looped
		 * @param {Boolean} shouldAutoPlay If true the animation plays when it is shown, false the animation plays when the play method is called
		 * @example var mc = new arc.display.MovieClip();
		 * mc.addChild(this._yellowImg, {
		 *	1 : {visible:true},
		 *	3 : {visible:false}
		 *});
		 *mc.addChild(this._orangeImg, {
		 *	1 : {scaleX:0.5, scaleY:0.5, transition:arc.anim.Transition.SINE_OUT},
		 *	5 : {scaleX:3, scaleY:3}
		 *});
		 */
		initialize:function(fps, shouldLoop, shouldAutoPlay){
			this._fps		= fps;
			this._shouldLoop	= (shouldLoop);
			this._timer		= new Timer();
			this._currentFrame	= 1;
			this._timelineArr	= [];
			this._totalFrame	= 0;
			this._shouldAutoPlay	= (shouldAutoPlay == undefined) ? true : (shouldAutoPlay);
		},
		draw:function($super, pX, pY, pScaleX, pScaleY, pAlpha, pRotation){
			if(!this._isShowed && this._shouldAutoPlay){
				this._isShowed = true;
				this.play();
			}
			if(this._isPlaying){
				this._update();
			}
			
			$super(pX, pY, pScaleX, pScaleY, pAlpha, pRotation);
		},
		_update:function(){
			var elapsed = this._timer.getElapsed();
			var dist = 1000 / this._fps;
			if(elapsed >= dist){
				this._step();
				elapsed = this._timer.getElapsed();
			}
	
			for(var i = 0; i < this._timelineArr.length; i++){
				var timeline = this._timelineArr[i];
				timeline.update(this._currentFrame, elapsed);
			}
		},
		_step:function(){
			var timeline, target;
			this._timer.reset();
			this._currentFrame ++;
	
			this._executeKeyFrame(this._currentFrame);
	
			if(this._currentFrame == this._totalFrame){
				if(!this._shouldLoop){
					this.stop();
					return;
				}
				this._currentFrame = 0;
			}
		},
		_executeKeyFrame:function(index){
			var timeline, target;
			for(var i = 0, len = this._timelineArr.length; i < len; i++){
				timeline = this._timelineArr[i];
				target = timeline.getTarget();
				
				if(index == timeline.getFirstFrame() && target.gotoAndPlay){
					target.gotoAndPlay(1);
				}
				timeline.executeKeyFrame(index);
			}
		},
	
		removeChild:function($super, targ){
			$super(targ);
			this._isPlaying = false;
			this._timer.stop();
			
			for(var i = 0, len = this._timelineArr.length; i < len; i++){
				var timeline = this._timelineArr[i];
				if(timeline.getTarget() === targ){
					this._timelineArr.splice(i, 1);
					break;
				}
			}
		},
	
		_setTimeline:function(targ, keyframeObj){
			timeline = new anim.Timeline(targ, keyframeObj, this._fps);
			this._timelineArr.push(timeline);
			totalFrame = timeline.getTotalFrames();
			if(this._totalFrame < totalFrame){
				this._totalFrame = totalFrame;
			}
		},
	
		/**
		 * Adds the display object to the display list with a key frame object.
		 * @param {DisplayObject} targ A display object that is going to be added to the display list
		 * @param {Object} keyFrameObj An object that takes a frame index as a key and a group of properties as a value
		 */
		addChild:function($super, targ, keyframeObj){
			var timeline, totalFrame;
			$super(targ);
			if(keyframeObj){
				this._setTimeline(targ, keyframeObj);
			}
		},
		/**
		 * Adds the display object to the display list at the specified depth with a key frame object.
		 * @param {DisplayObject} targ A display object that is going to be added to the display list
		 * @param {int} index A depth
		 * @param {Object} keyFrameObj An object that takes a frame index as a key and a group of properties as a value
		 */
		addChildAt:function($super, targ, index, keyframeObj){
			var timeline, totalFrame;
			$super(targ, index);
			if(keyframeObj){
				this._setTimeline(targ, keyframeObj);
			}
	
		},
	
		/**
		 * Playes the animation.
		 * @param {Boolean} shouldLoop If true the animation will be looped
		 */
		play:function(){
			this._isPlaying = true;
			this._timer.start();
			this._executeKeyFrame(this._currentFrame);
		},
		/**
		 * Stops the animation.
		 */
		stop:function(){
			this._isPlaying = false;
			this._timer.stop();
		},
		/**
		 * Plays the animation from the specified frame.
		 * @param {int} index A frame which the animation starts from
		 */
		gotoAndPlay:function(index){
			if(index < 1 || index > this._totalFrame) throw new Error("Invalid frame index");
			this._currentFrame = index;
			this.play();
		},
		/**
		 * Stops at the specified frame.
		 * @param {int} index A frame which the animation stops at
		 */
		gotoAndStop:function(index){
			if(index < 1 || index > this._totalFrame) throw new Error("Invalid frame index");
			this._currentFrame = index;
			this.stop();
		}
	});

	display.JSONMovieClip = Class.create(display.MovieClip,
	/** @lends arc.display.JSONMovieClip.prototype */
	{
		/**
		 * @class A class that creates MovieClip from JSON.
		 * @constructs
		 * @augments arc.display.MovieClip
		 * @param {Object} obj JSON object
		 */
		initialize:function($super, obj){
			var Sprite = arc.display.Sprite,
			    System = arc.System,
			    MovieClip = arc.display.MovieClip;

			var lib = obj.lib,
			    fps = obj.fps,
			    mainInfo = getInfo(obj.main);

			$super(fps);

			function getDisplayObject(id, disp){
				var i, info, img, len, timeline, child, disp;
				
				info = getInfo(id);
				if(!info){
					throw new Error("invalid animation");
				}
				
				if(info.type == "data"){
					if(info.pos){
						return new Sprite(arc._system.getImage(info.data, info.pos));
					}else{
						return new Sprite(arc._system.getImage(info.data));
					}
				}

				if(!disp){
					disp = new MovieClip(fps, info.loop);
				}
				for(i = 0, len = info.timelines.length; i < len; i++){
					timeline = info.timelines[i];
					child = getDisplayObject(timeline.target);
					if((child.constructor === Sprite) && timeline.align){
						child.setAlign(timeline.align);
					}
					disp.addChildAt(child, 0, timeline.keyframes);
				}
				return disp;
			}
			function getInfo(id){
				var i, len, info;
				for(i = 0, len = lib.length; i < len; i++){
					info = lib[i];
					if(info.id == id){
						break;
					}
				}
				return info;
			}
			
			this._shouldLoop = (mainInfo.loop);
			getDisplayObject(obj.main, this);
		}
	});	
	
	display.SheetMovieClip = Class.create(display.ImageContainer, 
	/** @lends arc.display.SheetMovieClip.prototype */
	{
		_currentFrame:1, _totalFrame:1, _frameWidth:0, _frameTime:0, _isPlaying:false, _timer:null, _shouldLoop:false, _shouldHide:false,
	
		/**
		 * @class A display object that plays an animation by using a image sheet.
		 * @constructs
		 * @augments arc.display.ImageContainer
		 * @param {Image} data A Image object of a image sheet
		 * @param {Number} frameWidth A width for each frames
		 * @param {Number} fps A FPS for the animation
		 * @param {Boolean} shouldLoop If true the animation will be looped
		 * @param {Boolean} shouldHide If true it will be hidden while the animation stops
		 */
		initialize:function(data, frameWidth, fps, shouldLoop, shouldHide){
			this._timer = new Timer();
			this._frameWidth = frameWidth;
			this._totalFrame = Math.floor(this._data.getWidth() / frameWidth);
			this._width = frameWidth;
			this._frameTime = 1000 / fps;
			this._shouldLoop = shouldLoop;
			this._shouldHide = shouldHide;
	
			this._data.setFrameWidth(this._frameWidth);
	
			if(this._shouldHide) this._visible = false;
	
			this.stop();
		},
		/**
		 * Plays the animation.
		 * @param {Boolean} shouldLoop If true the animation will be looped
		 */
		play:function(shouldLoop){
			this._isPlaying = true;
			if(shouldLoop != undefined) this._shouldLoop = shouldLoop;
			if(this._shouldHide && !this._visible) this._visible = true;
			this._timer.start();
		},
		/**
		 * Stops the animation.
		 */
		stop:function(){
			this._isPlaying = false;
			this._timer.stop();
			if(this._shouldHide) this._visible = false;
		},
		/**
		 * Plays the animation from the specified frame.
		 * @param {int} index A frame which the animation starts from
		 */
		gotoAndPlay:function(index){
			if(index < 1 || index > this._totalFrame) throw new Error("Invalid frame index");
			this._currentFrame = index;
			this.play();
		},
		/**
		 * Stops at the specified frame.
		 * @param {int} index A frame which the animation stops at
		 */
		gotoAndStop:function(index){
			if(index < 1 || index > this._totalFrame) throw new Error("Invalid frame index");
			this._currentFrame = index;
			this.stop();
		},
		draw:function(pX, pY, pScaleX, pScaleY, pAlpha, pRotation){
			pX = (pX | 0);
			pY = (pY | 0);
			pScaleX = (!isNaN(pScaleX)) ? pScaleX : 1;
			pScaleY = (!isNaN(pScaleY)) ? pScaleY : 1;
			pAlpha = (!isNaN(pAlpha)) ? pAlpha : 1;
			pRotation = (pRotation) ? pRotation : 0;
				
			if(!this._visible) return;
			if(this._isPlaying){
				var elapsed = this._timer.getElapsed();
				if(elapsed >= this._frameTime){
					this._currentFrame++;
					this._timer.reset();
					if(this._currentFrame > this._totalFrame){
						if(this._shouldLoop) this._currentFrame = this._currentFrame % this._totalFrame;
						else{
							this._currentFrame = this._totalFrame;
							this.stop();
							this.dispatchEvent(Event.COMPLETE);
						}
					}
				}
			}
	
			var posX = (this._x + this._alignX * this._scaleX) * pScaleX + pX;
			var posY = (this._y + this._alignY * this._scaleY) * pScaleY + pY;
			var tScaleX = this._scaleX * pScaleX;
			var tScaleY = this._scaleY * pScaleY;
			var tRotation = this._rotation + pRotation;
			var ctx = display.Image.context;
	
			ctx.globalAlpha = this._alpha;
			this._data.drawCrop((this._currentFrame - 1) * this._frameWidth, 0, this._frameWidth, this._data.getHeight(), pX, pY, this._width * pScaleX, this._height * pScaleY, tRotation);
			ctx.globalAlpha = 1;
		},
		setWidth:function(value){
			this._width = value;
			this._scaleX = this._width / this._frameWidth;
		},
		setScaleX:function(value){
			this._scaleX = value;
			this._width = this._frameWidth * this._scaleX;
		}
	});
	
	
	display.SequenceMovieClip = Class.create(display.DisplayObjectContainer,
	/** @lends arc.display.SequenceMovieClip.prototype */
	{
		_spriteArr:null,
		_frameTime:0,
		_shouldLoop:false,
		_shouldHide:false,
		_isPlaying:false,
		_totalFrame:0,
		_currentIndex:0,
		_timer:null,
	
		/**
		 * @class A class that plays an animation by using multiple Image objects.
		 * @constructs
		 * @augments arc.display.DisplayObjectContainer
		 * @param {Array} imgArr An array of Image objects
		 * @param {Number} frameTime A millisecond of each frame
		 * @param {Boolean} shouldLoop If true the animation will be looped
		 * @param {shouldHide} shouldHide If true it will be hidden while the animation stops
		 */
		initialize:function(imgArr, frameTime, shouldLoop, shouldHide){
			var i = 0, len = imgArr.length, sprite;
			
			this._spriteArr = [];
			this._frameTime = frameTime;
			this._shouldLoop = shouldLoop;
			this._shouldHide = shouldHide;
			this._totalFrame = imgArr.length;
			this._timer = new Timer();
	
			for(i = 0; i < len; i++){
				sprite = new display.Sprite(imgArr[i]);
				sprite.setVisible(false);
				this._spriteArr.push(sprite);
				this.addChild(sprite);
			}
	
			if(shouldHide){
				this._visible = false;
			}
		},
		draw:function($super, pX, pY, pScaleX, pScaleY, pAlpha, pRotation){
			$super(pX, pY, pScaleX, pScaleY, pAlpha, pRotation);
	
			var i, len = this._spriteArr.length, sprite;
			
			if(this._isPlaying){
				var index = Math.floor(this._timer.getElapsed() / this._frameTime);
				if(index > this._totalFrame - 1){
					if(this._shouldLoop) index = index % this._totalFrame;
					else{
						index = this._totalFrame;
						this.stop();
						this.dispatchEvent(Event.COMPLETE);
					}
				}
				this._currentFrame = index;
			}
	
			for(i = 0; i < len; i++){
				sprite = this._spriteArr[i];
				if(i == this._currentFrame){
					sprite.setVisible(true);
				}else{
					sprite.setVisible(false);
				}
			}
		},
		/**
		 * Plays the animation.
		 * @param {Boolean} shouldLoop If true the animation will be looped
		 */
		play:function(shouldLoop){
			this._isPlaying = true;
			if(shouldLoop) this._shouldLoop = shouldLoop;
			if(this._shouldHide && !this._visible) this._visible = true;
			this._timer.start();
		},
		/**
		 * Stops the animation.
		 */
		stop:function(){
			this._isPlaying = false;
			this._timer.stop();
			if(this._shouldHide) this._visible = false;
		},
		/**
		 * Plays the animation from the specified frame.
		 * @param {int} index A frame which the animation starts from
		 */
		gotoAndPlay:function(index){
			if(index < 1 || index > this._totalFrame) throw new Error("Invalid frame index");
			this._currentFrame = index;
			this.play();
		},
		/**
		 * Stops at the specified frame.
		 * @param {int} index A frame which the animation stops at
		 */
		gotoAndStop:function(index){
			if(index < 1 || index > this._totalFrame) throw new Error("Invalid frame index");
			this._currentFrame = index;
			this.stop();
		}
	});


	display.Stage = Class.create(display.DisplayObjectContainer,
	/** @lends arc.display.Stage.prototype */	
	{
		/**
		 * @class A display object that is a root of the display tree.
		 * @constructs
		 * @augments arc.display.DisplayObjectContainer
		 * @param {Number} width A width of the screen
		 * @param {Number} height A height of the screen
		 */
		initialize: function(width, height){
			if(display.Stage.instance){
				return display.Stage.instance;
			}

			display.Stage.instance = this;
			this._stageWidth = width;
			this._stageHeight = height;
		},
		/**
		 * Returns the width of the screen.
		 * @returns {Number} A width of the screen
		 */
		getStageWidth: function(){
			return this._stageWidth;
		},
		/**
		 * Returns the height of the screen.
		 * @returns {Number} A height of the sreen
		 */
		getStageHeight: function(){
			return this._stageHeight;
		}
	});
	display.Stage.instance = null;
	
	
	display.TextField = Class.create(display.DisplayObject,
	/** @lends arc.display.TextField.prototype */	
	{
		_font:null, _family:'sans-serif', _textArr:null, _color:0x000000, _align:'left', _baseline:'top', _size:10,
	
		/**
		 * @class A display object that handles texts.
		 * @constructs
		 * @augments arc.display.DisplayObject
		 */
		initialize:function(){
			if(ua.isiOS3){
				throw new Error("Your can't use TextField in iOS3");
			}
			this._font = this._size + 'px ' + this._family;
			this._textArr = [];
		},
	
		draw:function(pX, pY, pScaleX, pScaleY, pAlpha, pRotation){
			pX = (pX | 0);
			pY = (pY | 0);
			pScaleX = (!isNaN(pScaleX)) ? pScaleX : 1;
			pScaleY = (!isNaN(pScaleY)) ? pScaleY : 1;
			pAlpha = (!isNaN(pAlpha)) ? pAlpha : 1;
			pRotation = (pRotation) ? pRotation : 0;
	
			var rotation = this._rotation + pRotation;
			var tScaleX = this._scaleX * pScaleX;
			var tScaleY = this._scaleY * pScaleY;
	
			var ctx = display.Image.context;
			ctx.globalAlpha = this._alpha * pAlpha;
	
			ctx.save();
			ctx.fillStyle = getColorStyle(this._color);
			ctx.textBaseline = 'top';
			ctx.font = this._font;
			ctx.textAlign = this._align;
			ctx.textBaseline = this._baseline;
			var posY = pY;
			for(var i = 0, len = this._textArr.length; i < len; i++){
				var text = this._textArr[i];
				ctx.fillText(text, pX, posY);
				posY += this._size;
			}
			ctx.restore();
	
			ctx.globalAlpha = 1;
		},
	
		/**
		 * Sets an align of the text.
		 * @param {String} align
		 */
		setAlign:function(align){
			switch(align){
				case display.Align.TOP :
					this._align = 'center';
					this._baseline = 'top';
					break;
				case display.Align.TOP_LEFT :
					this._align = 'left';
					this._baseline = 'top';
					break;
				case display.Align.TOP_RIGHT :
					this._align = 'right';
					this._baseline = 'top';
					break;
				case display.Align.CENTER :
					this._align = 'center';
					this._baseline = 'middle';
					break;
				case display.Align.LEFT :
					this._align = 'left';
					this._baseline = 'middle';
					break;
				case display.Align.RIGHT :
					this._align = 'right';	
					this._baseline = 'middle';
					break;
				case display.Align.BOTTOM :
					this._align = 'center';
					this._baseline = 'bottom';
					break;
				case display.Align.BOTTOM_LEFT :
					this._align = 'left';
					this._baseline = 'bottom';
					break;
				case display.Align.BOTTOM_RIGHT :
					this._align = 'right';
					this._baseline = 'bottom';
					break;
				default :
					throw new Error('Specify align');
					break;
			}
		},
		/**
		 * Sets texts.
		 * @param {String} text Texts that is going to be shown
		 */	
		setText:function(text){
			if(!(text instanceof String)){
				text = String(text);
			}
			this._textArr = text.split('\n');

			if(this._width){
				this._adjustWidth();
			}
		},
		_adjustWidth:function(){
			var ctx = display.Image.context;
			ctx.font = this._font;

			for(var i = 0; i < this._textArr.length; i++){
				var text = this._textArr[i];
				var metrics = ctx.measureText(text);
				if(metrics.width <= this._width){
					continue;
				}
				for(var j = 0, len = text.length; j < len; j++){
					var word = text.substr(0, j + 1);
					metrics = ctx.measureText(word);
					if(metrics.width > this._width){
						this._textArr[i] = text.substr(0, j);
						this._textArr.splice(i + 1, 0, text.substr(j));
						break;
					}
				}
			}
		},
		/**
		 * Sets a font of the texts.
		 * @param {String} family A font family
		 * @param {Number} size A size of the font
		 * @param {Boolean} isBold If true the text is bold
		 */
		setFont:function(family, size, isBold){
			this._family = family;
			this._size = size;
			
			this._font = size + 'px ' + family;
			if(isBold){
				this._font = 'bold ' + this._font;
			}

			if(this._textArr.length && this._width){
				this._adjustWidth();
			}
		},
	
		/**
		 * Sets a color of the texts.
		 * @param {int} color A color in hex
		 */
		setColor:function(color){
			this._color = color;
		}
	});
	
	
	/**
	 * @name arc.anim
	 * @namespace
	 */
	var anim = {};
	anim.Animation = Class.create(EventDispatcher, 
	/** @lends arc.anim.Animation.prototype */
	{
		_timer:null, _target:null, _system:null, _animObjArr:null, _shouldReplay:false, _isPlaying:false,
		_currentIndex:0, _currentAnim:null, _currentTransFunc:null, _firstParams:null, _currentDuration:null,
		_updateFunc:null,
		_HALF_PI:Math.PI / 2,
	
		/**
		 * @class A class that manages an animation of a display object by specifying multiple animation objects.
		 * @constructs
		 * @augments arc.EventDispatcher
		 * @param {Object} target Any object that will be changed its properties by the animation. Usually the object is a display object.
		 * @param {Object} params An object containing various properties of the target object that you want to animate on the target objects with the final values, a duration and a transition type. If multiple objects are specified, the values of the properties will be changed sequentially. The target object should implements a getter and a setter of the properties. The format of the getter is "getProperty" and the setter is "setProperty".
		 * @example
		 * //Takes 0.5 seconds to move its position to x:10, y:10 with a SINE_OUT transition, and after that takes 1 second to move its position to x:20, y:30 with a SINE_IN transition.
		 * var anim = new arc.anim.Animation(target, 
		 * 					{x:10, y:10, time:500, transition:arc.anim.Transition.SINE_OUT},
		 *					{x:20, y:30, time:1000, transition:arc.anim.Transition.SINE_OUT});
		 * anim.play();
		 */
		initialize:function(target){
			if(!target) throw new Error('Specify target');
			if(arguments.length < 2) throw new Error('Specify Animaiton Objects');
	
			this._target = target;
			this._timer = new Timer();
			this._animObjArr = new Array();
			for(var i = 1; i < arguments.length; i++){
				this._animObjArr.push(arguments[i]);
			}
		},
		/**
		 * Playes the animation.
		 * @param {Boolean} shouldReplay If true the animation will be looped
		 */
		play:function(shouldReplay){
			if(this._isPlaying) return;
	
			var system = anim.Animation.system;
			this._isPlaying = true;
			this._shouldReplay = (shouldReplay);
	
			this._timer.start();
			this._currentIndex = -1;
			if(this._changeAnim()){
				if(this._updateFunc) system.removeEventListener(Event.ENTER_FRAME, this._updateFunc);
				this._updateFunc = bind(this._update, this);
				system.addEventListener(Event.ENTER_FRAME, this._updateFunc);
			}
		},
		/**
		 * Stops the animation.
		 */
		stop:function(){
			if(!this._isPlaying) return;
	
			var system = anim.Animation.system;
			this._isPlaying = false;
			if(this._updateFunc){
				system.removeEventListener(Event.ENTER_FRAME, this._updateFunc);
				this._updateFunc = null;
			}
			this.dispatchEvent(Event.COMPLETE);
		},
		_changeAnim:function(){
			this._currentIndex++;
			if(this._currentIndex >= this._animObjArr.length){
				if(!this._shouldReplay){
					this.stop();
					return false;
				}else{
					this._currentIndex = 0;
				}
			}
			
			this._timer.reset();
			var animObj = this._animObjArr[this._currentIndex];
			this._currentAnim = {}; this._firstParams = {};
			for(var prop in animObj){
				if(prop == 'time' || prop == 'transition') continue;
				this._currentAnim[prop] = animObj[prop];
				this._firstParams[prop] = this._getProperty(this._target, prop);
			}
			
			this._currentDuration = (animObj.time == undefined) ? 1000 : animObj.time;
			this._currentTransFunc = anim.Transition.getTransFunc(animObj.transition);
	
			return true;
		},
		_getProperty:function(target, prop){
			prop.match(/^([a-z])(.*)/);
			var funcName = 'get' + RegExp.$1.toUpperCase() + RegExp.$2;
			if(target[funcName])	return target[funcName]();
			return undefined;
		},
		_setProperty:function(target, prop, value){
			prop.match(/^([a-z])(.*)/);
			var funcName = 'set' + RegExp.$1.toUpperCase() + RegExp.$2;
			if(target[funcName]) target[funcName](value);
		},
		_update:function(){
			var elapsed = this._timer.getElapsed();
			var progress = this._currentTransFunc(elapsed / this._currentDuration);
			if(elapsed >= this._currentDuration){
				for(var prop in this._currentAnim){
					this._setProperty(this._target, prop, this._currentAnim[prop]);
				}	
				if(this._changeAnim()) this._update();
				return;
			}
			
			for(var prop in this._currentAnim){
				var value = (this._currentAnim[prop] - this._firstParams[prop]) * progress + this._firstParams[prop];
				if(prop == 'visible') value = this._firstParams[prop];
				this._setProperty(this._target, prop, value);
			}		
		},
		/**
		 * Determines if the animtion is playing.
		 * @returns {Boolean} If true the animation is playing
		 */ 
		isPlaying:function(){
			return this._isPlaying;
		}
	});
	anim.Animation.system = null;
	
	
	(function(packageName){
		/**
		 * @name arc.anim.Transition
		 * @namespace
		 */
		var Transition = {
			/**
			 * @name SINE_IN
			 * @constant {String} SINE_IN
			 * @memberof arc.anim.Transition
			 */
			SINE_IN		: 'SINE_IN',
			/**
			 * @name SINE_OUT
			 * @constant {String} SINE_OUT
			 * @memberof arc.anim.Transition
			 */
			SINE_OUT	: 'SINE_OUT',
			/**
			 * @name SINE_INOUT
			 * @constant {String} SINE_INOUT
			 * @memberof arc.anim.Transition
			 */
			SINE_INOUT	: 'SINE_INOUT',
			/**
			 * @name LINEAR
			 * @constant {String} LINEAR
			 * @memberof arc.anim.Transition
			 */
			LINEAR		: 'LINEAR',
			/**
			 * @name CIRC_IN
			 * @constant {String} CIRC_IN
			 * @memberof arc.anim.Transition
			 */
			CIRC_IN		: 'CIRC_IN',
			/**
			 * @name CIRC_OUT
			 * @constant {String} CIRC_OUT
			 * @memberof arc.anim.Transition
			 */
			CIRC_OUT	: 'CIRC_OUT',
			/**
			 * @name CIRC_INOUT
			 * @constant {String} CIRC_INOUT
			 * @memberof arc.anim.Transition
			 */
			CIRC_INOUT	: 'CIRC_INOUT',
			/**
			 * @name CUBIC_IN
			 * @constant {String} CUBIC_IN
			 * @memberof arc.anim.Transition
			 */
			CUBIC_IN	: 'CUBIC_IN',
			/**
			 * @name CUBIC_OUT
			 * @constant {String} CUBIC_OUT
			 * @memberof arc.anim.Transition
			 */
			CUBIC_OUT	: 'CUBIC_OUT',
			/**
			 * @name CUBIC_INOUT
			 * @constant {String} CUBIC_INOUT
			 * @memberof arc.anim.Transition
			 */
			CUBIC_INOUT	: 'CIRC_INOUT',
			/**
			 * @name ELASTIC_IN
			 * @constant {String} ELASTIC_IN
			 * @memberof arc.anim.Transition
			 */
			ELASTIC_IN	: 'ELASTIC_IN',
			/**
			 * @name ELASTIC_OUT
			 * @constant {String} ELASTIC_OUT
			 * @memberof arc.anim.Transition
			 */
			ELASTIC_OUT	: 'ELASTIC_OUT',
			/**
			 * @name ELASTIC_INOUT
			 * @constant {String} ELASTIC_INOUT
			 * @memberof arc.anim.Transition
			 */
			ELASTIC_INOUT	: 'ELASTIC_INOUT',
			getTransFunc	: getTransFunc
		};
	
		var HALF_PI = Math.PI / 2;
		/**
		 * Returns a transition funciton by specifying a transition type string.
		 * @memberof arc.anim.Transition
		 * @param {String} type A transition type
		 * @returns {Function} A transition function that is assigned to the transition type
		 */
		function getTransFunc(type){
			switch(type){
				case Transition.LINEAR :
					return getLinear;
				case Transition.SINE_IN :
					return getSineIn;
				case Transition.SINE_OUT :
					return getSineOut;
				case Transition.SINE_INOUT:
					return getSineInOut;
				case Transition.CIRC_IN:
					return getCircIn;
				case Transition.CIRC_OUT:
					return getCircOut;
				case Transition.CIRC_INOUT:
					return getCircInOut;
				case Transition.CUBIC_IN:
					return getCubicIn;
				case Transition.CUBIC_OUT:
					return getCubicOut;
				case Transition.CUBIC_INOUT:
					return getCubicInOut;
				case Transition.ELASTIC_IN:
					return getElasticIn;
				case Transition.ELASTIC_OUT:
					return getElasticOut;
				case Transition.ELASTIC_INOUT:
					return getElasticInOut;
				default :
					return getLinear;
			}
		}
	
		function getLinear(t){
			return t;
		}
	
		/** Sine **/
		function getSineIn(t){
			return 1.0 - Math.cos(t * HALF_PI);	
		}
	
		function getSineOut(t){
			return 1.0 - getSineIn(1.0 - t);
		}
		function getSineInOut(t){
			return (t < 0.5) ? getSineIn(t * 2.0) * 0.5 : 1 - getSineIn(2.0 - t * 2.0) * 0.5;
		}
	
		/** Circ **/
		function getCircIn(t){
			return 1.0 - Math.sqrt(1.0 - t * t);
		}
		function getCircOut(t){
			return 1.0 - getCircIn(1.0 - t);
		}
		function getCircInOut(t){
			return (t < 0.5) ? getCircIn(t * 2.0) * 0.5 : 1 - getCircIn(2.0 - t * 2.0) * 0.5;
		}
	
		/** Cubic **/
		function getCubicIn(t){
			return t * t * t;
		}
		function getCubicOut(t){
			return 1.0 - getCubicIn(1.0 - t);
		}
		function getCubicInOut(t){
			return (t < 0.5) ? getCubicIn(t * 2.0) * 0.5 : 1 - getCubicIn(2.0 - t * 2.0) * 0.5;
		}
	
		/** Elastic **/
		function getElasticIn(t){
			return 1.0 - getElasticOut(1.0 - t);
		}
		function getElasticOut(t){
			var s = 1 - t;
			return 1 - Math.pow(s, 8) + Math.sin(t * t * 6 * Math.PI) * s * s;
		}
		function getElasticInOut(t){
			return (t < 0.5) ? getElasticIn(t * 2.0) * 0.5 : 1 - getElasticIn(2.0 - t * 2.0) * 0.5;
		}
		
		packageName.Transition = Transition;
	})(anim);
	
	
	anim.Timeline = Class.create(
	/** @lends arc.anim.Timeline.prototype */
	{
		_target:null, _keyFrameObj:null, _totalFrame:0, _fps:0, _baseFrame:null, _firstFrame:0,
	
		/**
		 * @class A class that manages a timeline. It is used in MovieClip and KeyFrameAnimation internally.
		 * @constructs
		 * @param {Object} target Any object that will be changed its properties by the animation. Usually the object is a display object.
		 * @param {Object} keyFrameObj An object that takes a frame index as a key and a group of properties as a value
		 */
		initialize:function(target, keyFrameObj, fps){
			var frameNum;
			this._target = target;
			this._keyFrameObj = keyFrameObj;
			
			if(fps){
				this._fps = fps;
			}
			
			for(var prop in this._keyFrameObj){
				var keyFrame = keyFrameObj[prop];
				var index = parseInt(prop, 10);
				if(this._firstFrame == 0 || this._firstFrame > index){
					this._firstFrame = index;
				}
				
				keyFrame.index = prop;
				frameNum = parseInt(prop, 10);
				if(this._totalFrame < frameNum){
					this._totalFrame = frameNum;
				}
			}
		},
		/**
		 * A method that is supposed to be called in every ENTER_FRAME. It changes the values of the properties depending on the elapsed time.
		 * @param {int} index A frame index
		 * @param {Number} elapsed An elapsed time
		 */ 
		update:function(index, elapsed){
			if(!this._baseFrame || !this._baseFrame.transition || !this._baseFrame.nextFrame) return;
	
			elapsed += (index - this._baseFrame.index) * 1000 / this._fps;
			var duration = (this._baseFrame.nextFrame.index - this._baseFrame.index) * 1000 / this._fps;
			var progress = anim.Transition.getTransFunc(this._baseFrame.transition)(elapsed / duration);
	
			for(var prop in this._baseFrame){
				if(prop == 'transition' || prop == 'action' || prop == 'index' || prop == 'nextFrame' || this._baseFrame.nextFrame[prop] == undefined) continue;
	
				var value = (this._baseFrame.nextFrame[prop] - this._baseFrame[prop]) * progress + this._baseFrame[prop];
				if(prop == 'visible') value = this._baseFrame[prop];
				this._setProperty(this._target, prop, value);
			}
		},
		/**
		 * Sets values of the propeties at the specified frame index.
		 * @param {int} index A frame index
		 */ 	
		executeKeyFrame:function(index){
			var keyframe = this._keyFrameObj[index];
			if(!keyframe) return;
	
			this._baseFrame = keyframe;
	
			for(var prop in keyframe){
				if(prop == 'transition' || prop == 'action' || prop == 'index' || prop == 'nextFrame') continue;
				this._setProperty(this._target, prop, keyframe[prop]);
			}
	
			if(keyframe.action && keyframe.action instanceof Function) keyframe.action.apply(this._target);
	
			if(keyframe.transition && !keyframe.nextFrame){
				var indexCount = index;
				while(indexCount <= this._totalFrame){
					indexCount++;
					if(this._keyFrameObj[indexCount]){
						var nextFrame = this._keyFrameObj[indexCount];
						for(var prop in nextFrame){
							if(!keyframe[prop]) keyframe[prop] = this._getProperty(this._target, prop);
						}
						keyframe.nextFrame = nextFrame
						break;
					}
				}
			}
		},
		/**
		 * Sets a number of total frames.
		 * @param {int} totalFrames A number of total frames
		 */ 
		setTotalFrames:function(value){
			this._totalFrame = value;
		},
		/**
		 * Returns the nubmer of total frames.
		 * return {Number} The number of total frames
		 */
		getTotalFrames:function(value){
			return this._totalFrame;
		},
		/**
		 * Sets a FPS.
		 * @param {Number} fps FPS
		 */ 
		setFps:function(value){
			this._fps = value;
		},
		getTarget:function(){
			return this._target;
		},
		getFirstFrame:function(){
			return this._firstFrame;
		},
		_getProperty:function(target, prop){
			prop.match(/^([a-z])(.*)/);
			var funcName = 'get' + RegExp.$1.toUpperCase() + RegExp.$2;
			if(target[funcName])	return target[funcName]();
			return undefined;
		},
		_setProperty:function(target, prop, value){
			prop.match(/^([a-z])(.*)/);
			var funcName = 'set' + RegExp.$1.toUpperCase() + RegExp.$2;
			if(target[funcName]) target[funcName](value);
		}
	});
	
	anim.KeyFrameAnimation = Class.create(EventDispatcher,
	/** @lends arc.anim.KeyFrameAnimation.prototype */
	{
		_fps:0, _totalFrame:0, _timelineArr:null, _timer:null, _updateFunc:null, _shouldLoop:false, _currentFrame:1,
	
		/**
		 * @class A class that manages an key frame animation by specifying Timeline objects.
		 * @constructs
		 * @param {Number} fps FPS
		 * @param {int} totalFrame A number of total frames
		 * @param {Array} timeLineArr An array of Timeline objects
		 * @deprecated Prefered to use MovieClip
		 * @example var keyFrame = new arc.anim.KeyFrameAnimation(12, 5, [
				new arc.anim.Timeline(this._yellowImg, {
					1 : {visible:true},
					3 : {visible:false}
				}),
				new arc.anim.Timeline(this._orangeImg, {
					1 : {visible:true},
					5 : {visible:false}
				}),
				new arc.anim.Timeline(this, {
					1 : {scaleX:0.5, scaleY:0.5, transition:arc.anim.Transition.SINE_OUT},
					5 : {scaleX:3, scaleY:3}
				})
			]);
		 */
		initialize:function(fps, totalFrame, timelineArr){
			this._fps = fps;
			this._totalFrame = totalFrame;
			this._timer = new Timer();
	
			for(var i = 0; i < timelineArr.length; i++){
				var timeline = timelineArr[i];
				if(timeline.constructor != anim.Timeline){
					throw new Error('set an instance of anim.Timeline');
				}
				timeline.setTotalFrames(totalFrame);
				timeline.setFps(this._fps);
			}
			this._timelineArr = (timelineArr) ? timelineArr : [];
		},
		/**
		 * Adds Timeline object.
		 * @param {Timeline} timeline A Timeline object that is added
		 */
		addTimeline:function(timeline){
			this._timelineArr.push(timeline);
		},
		/**
		 * Plays the animation.
		 * @param {Boolean} shouldLoop If true the animation will be looped
		 */
		play:function(shouldLoop){
			this.gotoAndPlay(1, shouldLoop);
		},
		/**
		 * Stops the animation.
		 */
		stop:function(){
			var system = anim.Animation.system;
			if(this._updateFunc){
				system.removeEventListener(Event.ENTER_FRAME, this._updateFunc);
				this._updateFunc = null;
			}
			this.dispatchEvent(Event.COMPLETE);
		},
		/**
		 * Plays the animation from the specified frame.
		 * @param {int} index A frame which the animation starts from
		 * @param {Boolean} shouldLoop If true the animation will be looped
		 */
		gotoAndPlay:function(frame, shouldLoop){
			if(frame > this._totalFrame) throw new Error("invalid frame index");
	
			if(shouldLoop) this._shouldLoop = shouldLoop;
			this._updateFunc = bind(this._update, this);
	
			this._currentFrame = frame;
			this._executeKeyFrame(this._currentFrame);
	
			this._timer.start();
			var system = anim.Animation.system;
			system.addEventListener(Event.ENTER_FRAME, this._updateFunc);
	
		},
		_update:function(){
			var elapsed = this._timer.getElapsed();
			var dist = 1000 / this._fps;
			if(elapsed >= dist){
				this._step();
				elapsed = this._timer.getElapsed();
			}
	
			for(var i = 0; i < this._timelineArr.length; i++){
				var timeline = this._timelineArr[i];
	
				timeline.update(this._currentFrame, elapsed);
			}	
		},
		_step:function(){
			this._timer.reset();
			this._currentFrame ++;
	
			this._executeKeyFrame(this._currentFrame);
	
			if(this._currentFrame == this._totalFrame){
				if(!this._shouldLoop){
					this.stop();
					return;
				}
				this._currentFrame = 0;
			}
		},
		_executeKeyFrame:function(index){
			for(var i = 0; i < this._timelineArr.length; i++){
				var timeline = this._timelineArr[i];
				timeline.executeKeyFrame(index);
			}
		},
		/**
		 * Returns the current frame index.
		 * @returns {int} The current frame index
		 */
		getCurrentFrame:function(){
			return this._currentFrame;
		},
		/**
		 * Returns a number of total frames.
		 * @returns {int} A number of total frames
		 */
		getTotalFrame:function(){
			return this._totalFrame;
		}
	});
		
	

	/**
	 * @name arc.ImageManager
	 * @class A class that manages loading of images.
	 */
	var ImageManager = Class.create(EventDispatcher, 
	(function(){
		var _TYPE_IMAGE = 0,
		    _TYPE_STRING = 1;
		
		function initialize(){
			this._loadImgNum = 0;
			this._loadedImgNum = 0;
			this._imageHash = {};
			this._loadingImgArr = [];
			this._srcArr = [];
		}
		/**
		 * Starts to load the images.
		 * @memberOf arc.ImageManager.prototype
		 * @param {Array} srcArr An array that holds urls of the images
		 */
		function load(srcArr){
			this._srcArr = srcArr;
			this._loadedImgNum = 0;
			this._loadImgNum = srcArr.length;
			this._loadingImgArr = [];

			if(!srcArr || srcArr.length === 0){
				this.dispatchEvent(Event.COMPLETE);
				return;
			}
	
			for(var i = 0, len = this._srcArr.length; i < len; i++){
				var src = this._srcArr[i];
				var img;
				if(src.constructor == HTMLImageElement){
					img = src;
					if(img.complete){
						_loadingImages.call(this, {target:img});
					}else{
						src.onload = bind(_loadingImages, this);
						src.onerror = bind(_errorImages, this);
					}
				}else if(src.constructor == String){
					img = document.createElement('img');
					img.src = src;
					img.onload = bind(_loadingImages, this);
					img.onerror = bind(_errorImages, this);
					this._imageHash[src] = img;
				}
	
				this._loadingImgArr.push(img);
			}
	
			this._srcArr = [];
		}
	
		function _loadingImages(e){
			var percent;
			e.target.onload = null;
			e.target.onerror = null;
			
			this._loadedImgNum++;
	
			this.dispatchEvent(Event.PROGRESS);
			
			if(this._loadedImgNum == this._loadImgNum){
				this.dispatchEvent(Event.COMPLETE);
			}
		}
			
		function _errorImages(e){
			var i, len, img;
			for(i = 0, len = this._loadingImgArr.length; i < len; i++){
				img = this._loadingImgArr[i];
				img.onload = null;
				img.onerror = null;
			}
	
			this.dispatchEvent(Event.ERROR);
			
			throw new Error("Load Error : " + e.target.src);
		}
	
		function _timeOutImage(){
			
		}
		/**
		 * Returns Image object from its list of loaded images.
		 * @memberOf arc.ImageManager.prototype
		 * @param {String} path A url of the image
		 * @param {Array} localPosArr An array of local position and size of the image in a format like [x, y, width, height]. If the parameter is specified, it returns a clipped Image object.(Optional)
		 * @returns {arc.Image} A loaded Image object
		 * @example
		 * var img = loader.getImage('a.png', [10, 10, 100, 100]);
		 */
		function getImage(path, localPosArr){
			if(!this._imageHash[path]){
				return null;
			}

			if(localPosArr && localPosArr.length == 4){
				return new display.Image(this._imageHash[path], localPosArr);
			}else{
				return new display.Image(this._imageHash[path]);
			}
		}

		/**
		 * Returns a number of total images.
		 * @memberOf arc.ImageManager.prototype
		 * @returns {Number} A number of total images
		 */
		function getTotal(){
			return this._loadImgNum;
		}

		/**
		 * Returns a number of total loaded images.
		 * @memberOf arc.ImageManager.prototype
		 * @returns {Number} A number of total loaded images
		 */
		function getLoaded(){
			return this._loadedImgNum;
		}
	
		return {
			initialize	: initialize,
			load		: load,
			getImage	: getImage,
			getTotal	: getTotal,
			getLoaded	: getLoaded
		};
	})());

	
	var System = Class.create(EventDispatcher, 
	/** @lends arc.System.prototype */
	{
		_originFps:0, _width:0, _height:0, _canvas:null, _context:null, _disableClearRect:false,
		_game:null, _gameClass:null, _gameParams:null, _intervalId:null,
		_stage:null, _imageManager:null,
		_realFps:0, _runTime:0, _runCount:0, _prevTime:0, _fpsElem:null,
		_maxFps:0, _adjustCount:1, _timer:null,
		_canvasScale: 1,
	
		_ADJUST_FPS_TIME:10000, _ADJUST_FACTOR:2.5,
		
		/**
		 * @class The main class that manages a game.
		 * @constructs
		 * @param {Number} width A width of the game
		 * @param {Number} height A height of the game
		 * @param {String} canvasId An id of canvas element for the game
		 * @param {Boolean} disableClearRect If true the system will not call clearRect. If the game has a not opaque background, it is better to be true in terms of its performance.
		 */	
		initialize:function(width, height, canvasId, disableClearRect){
			this._width = width;
			this._height = height;
			this._canvas = document.getElementById(canvasId);
			this._context = this._canvas.getContext('2d');
			this._stage = new display.Stage(width, height);
			this._timer = new Timer();
			this._disableClearRect = (disableClearRect) ? true : false;
	
			this._canvas.width = this._width;
			this._canvas.height = this._height;
			
			anim.Animation.system = this;
			CountTimer.system = this;
			display.Image.context = this._context;
			arc._system = this;
	
			this._fpsElem = document.getElementById('fps');
			this._bindedRun = bind(this.run, this);

			this._setEvent();
			this._setScroll();
		},
		/**
		 * Enables a specified full screen mode. There are 3 types of full screen mode "width", "height" and "all". "width" mode keeps its aspect ratio and fits its width to the width of the screen. "height" mode keeps its aspect ratio and fits its height to the height of the screen. "all" mode keeps its aspect ratio and shows all contents in the screen.
		 * @param {String} mode A full screen mode "width", "height" or "all".
		 * @param {Boolean} shouldShrink If true the game will be shrunk when the size of the screen is smaller than the size of the game.
		 * @example
		 * system.setFullScreen("width");		//Keeps its aspect ratio and fits its width to the width of the screen
		 * system.setFullScreen("height");		//Keeps its aspect ratio and fits its height to the height of the screen
		 * system.setFullScreen("all", true);	//Keeps its aspect ratio and shows all contents in the screen
		 */ 
		setFullScreen:function(mode, shouldShrink){
			this._fullScreenMode = (mode) ? mode : 'width';
			this._shouldShrink = shouldShrink;

			this._setViewport();

			if(ua.isiOS){
				window.addEventListener('orientationchange', bind(this._setViewport, this), true);
			}else{
				window.addEventListener('resize', bind(this._setViewport, this), true);
			}

		},
		_setViewport:function(e){
			var width = window.innerWidth,
			    height = window.innerHeight;
				
			if(!this._shouldShrink && width < this._canvas.width){
				width = this._canvas.width;
			}

			if(!this._shouldShrink && height < this._canvas.height){
				height = this._canvas.height;
			}

			var widthScale = width / this._canvas.width,
				heightScale = height / this._canvas.height;

			switch(this._fullScreenMode){
				case 'width':
					this._canvasScale = widthScale;
					break;

				case 'height':
					this._canvasScale = heightScale;
					break;

				case 'all':
					this._canvasScale = (widthScale < heightScale) ? widthScale : heightScale;
					break;

			}

			this._canvas.style.width = Math.floor(this._canvas.width * this._canvasScale) + 'px';
			this._canvas.style.height = Math.floor(this._canvas.height * this._canvasScale) + 'px';
		},
		_setEvent:function(){
			var self = this, touchObj = {};

			function getPos(obj){
				return {x:obj.pageX / self._canvasScale - self._canvas.offsetLeft, y:obj.pageY / self._canvasScale - self._canvas.offsetTop};
			}
			function dispatchTarget(targ, e){
				if(!e.willPropagate()){
					return;
				}
				var tparent = targ.getParent();
				targ.dispatchEvent(e);
				if(tparent){
					dispatchTarget(tparent, e);
				}
			}
			function findTarget(cont, x, y){
				var list = cont._displayArr, disp, pos;
				for(var i = list.length - 1; i >= 0; i--){
					disp = list[i];
					if(!disp.getVisible()){
						continue;
					}
					pos = cont.localToGlobal(disp._screenRect[0], disp._screenRect[1]);
					
					if(pos[0] <= x && pos[0] + disp._screenRect[2] >= x && pos[1] <= y && pos[1] + disp._screenRect[3] >= y){
						if(disp._displayArr){
							var target = findTarget(disp, x, y);
							if(target){
								return target;
							}
						}else{
							return disp;
						}
					}
				}
				return null;
			}
			
			function touchStart(e){
				e.preventDefault();

				function doEvent(obj, id){
					var pos = getPos(obj),
					    target = findTarget(self._stage, pos.x, pos.y);

					if(!target){
						target = self._stage;
					}

					touchObj[id] = target;

					var event = new Event(Event.TOUCH_START, {x:pos.x, y:pos.y});
					dispatchTarget(target, event);
				}

				if(e.type == 'mousedown'){
					window.addEventListener('mousemove', touchMove, true);
					window.addEventListener('mouseup', touchEnd, true);
					doEvent(e, 0);
				}else{
					for(var i = 0, len = e.changedTouches.length; i < len; i++){
						var touch = e.changedTouches[i];
						doEvent(touch, touch.identifier);
					}
				}

			}

			function touchMove(e){
				e.preventDefault();

				function doEvent(obj, id){
					var target = touchObj[id],
					    pos = getPos(obj);
					
					if(target){
						var event = new Event(Event.TOUCH_MOVE, {x:pos.x, y:pos.y});
						dispatchTarget(target, event);	
					}
				}

				if(e.type == 'mousemove'){
					doEvent(e, 0);

				}else{
					for(var i = 0, len = e.changedTouches.length; i < len; i++){
						var touch = e.changedTouches[i];
						doEvent(touch, touch.identifier);
					}
				}
			}

			function touchEnd(e){
				e.preventDefault();
				function doEvent(obj, id){
					var target = touchObj[id],
					    pos = getPos(obj);

					delete touchObj[id];

					if(target){
						var event = new Event(Event.TOUCH_END, {x:pos.x, y:pos.y});
						dispatchTarget(target, event);
					}
				}
				if(e.type == 'mouseup'){
					window.removeEventListener('mousemove', touchMove, true);
					window.removeEventListener('mouseup', touchEnd, true);
					doEvent(e, 0);
				}else{
					for(var i = 0, len = e.changedTouches.length; i < len; i++){
						var touch = e.changedTouches[i];
						doEvent(touch, touch.identifier);
					}
				}
			}
			
			if(ua.isMobile){
				this._canvas.addEventListener('touchstart', touchStart, true);
				this._canvas.addEventListener('touchmove', touchMove, true);
				this._canvas.addEventListener('touchend', touchEnd, true);
			}else{
				this._canvas.addEventListener('mousedown', touchStart, true);
			}
		},
		_setScroll:function(){
			function doScroll(){
				if (window.pageYOffset <= 1) {						
					setTimeout(bind(function () {
						scrollTo(0, 1);
						setTimeout(bind(this._setViewport, this), 1000);
					}, this), 10);
				}
			}
			if(didLoad){
				window.addEventListener("load", bind(doScroll, this), false);
			}else{
				doScroll.call(this);
			}
		},
		/**
		 * Starts to load the images via ImageManger.
		 * @param {Array} resourceArr An array of urls of the images
		 */ 
		load:function(resourceArr){
			this._isStartedWithLoad = true;
			if(!this._imageManager){
				this._imageManager = new ImageManager();
			}
			this._imageManager.addEventListener(Event.PROGRESS, bind(this._loading, this));
			this._imageManager.addEventListener(Event.COMPLETE, bind(this._loaded, this));
			this._imageManager.load(resourceArr);
		},
		_loading:function(){
			this.dispatchEvent(Event.PROGRESS, {total:this._imageManager.getTotal(), loaded:this._imageManager.getLoaded()});
		},
		_loaded:function(){
			this._imageManager.removeEventListener(Event.PROGRESS);
			this._imageManager.removeEventListener(Event.COMPLETE);
			this.dispatchEvent(Event.COMPLETE);
			this._startGame();	
		},
		/**
		 * Sets a main class of the game which extends Game class.
		 * @param {Function} gameClass A main game class
		 * @param {Object} gameParams A initial parameters
		 */ 
		setGameClass:function(gameClass, gameParams){
			this._gameClass = gameClass;
			this._gameParams = gameParams;
		},
		/**
		 * Starts the game.
		 */
		start:function(){
			if(this._game || this._isStartedWithLoad){
				throw new Error('do not call System.start or System.load again');
			}
			this._startGame();
		},

		_startGame: function(){
			Timer.tick();
			this._game = new this._gameClass(this._gameParams, this);
			this._stage.addChild(this._game);
	
			this._prevTime = Timer.time;
	
			this._timer.start();
			this._intervalId = window.requestAnimationFrame(this._bindedRun);
		},
		/**
		 * Stops the game.
		 */ 
		stop:function(){
			window.cancelAnimationFrame(this._intervalId);
		},
		run:function(){
			Timer.tick();
			
			this._runTime += (Timer.time - this._prevTime);
			this._runCount ++;
			if(this._runTime >= 1000){
				this._realFps = this._runCount * 1000 / this._runTime;
				this._runCount = this._runTime = 0;
				if(this._fpsElem) this._fpsElem.innerHTML = this._realFps;
				if(this._realFps > this._maxFps) this._maxFps = this._realFps;
			}
			this._prevTime = Timer.time;

			if(!this._disableClearRect){
				this._context.clearRect(0, 0, this._width, this._height);
			}
	
			this._game.update();
			this._stage.draw();
	
			this.dispatchEvent(Event.ENTER_FRAME);

			this._intervalId = window.requestAnimationFrame(this._bindedRun);
		},
		/**
		 * Returns the width of the canvas element.
		 * @returns {Number} The width of the canvas element
		 */
		getWidth:function(){
			return this._width;
		},
		/**
		 * Returns the height of the canvas element.
		 * @returns {Number} The height of the canvas element
		 */
		getHeight:function(){
			return this._height;
		},
		/**
		 * Returns Image object from its list of loaded images. It uses a ImageManager object so the usage is same.
		 * @param {String} path A url of the image
		 * @param {Array} localPosArr An array of local position and size of the image in a format like [x, y, width, height]. If the parameter is specified, it returns a clipped Image object.(Optional)
		 * @returns {arc.Image} A loaded Image object
		 * @example
		 * var img = system.getImage('a.png', [10, 10, 100, 100]);
		 */
		getImage:function(path, localPosArr){
			return this._imageManager.getImage(path, localPosArr);
		},
		/**
		 * Returns the canvas element.
		 * @returns {HTMLCanvasElement} The canvas element of the game
		 */
		getCanvas:function(){
			return this._canvas;
		},
		/**
		 * Returns the Stage object, which is the root of all display objects.
		 * @returns {DisplayObject} The Stage object
		 */
		getStage:function(){
			return this._stage;
		},
		/**
		 * Returns an actual FPS.
		 * @returns {Number} FPS
		 */ 
		getFps:function(){
			return this._realFps;
		}
	});
	
	
	
	//abstract classes
	var Game = Class.create(display.DisplayObjectContainer, {
		_system:null,
		initialize:function(params, system){
			this._system = system;
		},
		update:function(){
			
		}
	});

	var didLoad = false;
	window.addEventListener("load", function () {
		didLoad = true;
	}, false);

	
	/**
	 * @name arc
	 * @namespace arc
	 */
	global.arc = {
		ua		: ua,
		display		: display,
		anim		: anim,
		util		: util,
		Class		: Class,
		Event		: Event,
		EventDispatcher	: EventDispatcher,
		Timer		: Timer,
		CountTimer	: CountTimer,
		Ajax		: Ajax,
		ImageManager	: ImageManager,
		System		: System,
		Game		: Game
	};
})(window);
