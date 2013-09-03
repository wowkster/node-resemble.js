/*
Author: James Cryer
Company: Huddle
Last updated date: 23 Jul 2013
URL: https://github.com/Huddle/Resemble.js
*/

(function(_this){
	'use strict';

	_this['resemble'] = function( fileData ){

		var data = {};
		var images = [];
		var updateCallbackArray = [];

		var tolerance = { // between 0 and 255
			red: 16,
			green: 16,
			blue: 16,
			minBrightness: 16,
			maxBrightness: 240
		};

		var ignoreAntialiasing = false;
		var ignoreColors = false;

		var workersCount = 4;
		var worker = [
			new Worker("worker.js"),
			new Worker("worker.js"),
			new Worker("worker.js"),
			new Worker("worker.js")
		];

		function triggerDataUpdate(){
			var len = updateCallbackArray.length;
			var i;
			for(i=0;i<len;i++){
				if (typeof updateCallbackArray[i] === 'function'){
					updateCallbackArray[i](data);
				}
			}
		}

		function loop(x, y, callback){
			var i,j;

			for (i=0;i<x;i++){
				for (j=0;j<y;j++){
					callback(i, j);
				}
			}
		}

		function parseImage(sourceImageData, width, height){

			var pixleCount = 0;
			var redTotal = 0;
			var greenTotal = 0;
			var blueTotal = 0;
			var brightnessTotal = 0;

			loop(height, width, function(verticalPos, horizontalPos){
				var offset = (verticalPos*width + horizontalPos) * 4;
				var red = sourceImageData[offset];
				var green = sourceImageData[offset + 1];
				var blue = sourceImageData[offset + 2];
				var brightness = getBrightness(red,green,blue);

				pixleCount++;

				redTotal += red / 255 * 100;
				greenTotal += green / 255 * 100;
				blueTotal += blue / 255 * 100;
				brightnessTotal += brightness / 255 * 100;
			});

			data.red = Math.floor(redTotal / pixleCount);
			data.green = Math.floor(greenTotal / pixleCount);
			data.blue = Math.floor(blueTotal / pixleCount);
			data.brightness = Math.floor(brightnessTotal / pixleCount);

			triggerDataUpdate();
		}

		function getBrightness(r,g,b){
			return 0.3*r + 0.59*g + 0.11*b;
		}

		function loadImageData( fileData, callback ){
			var fileReader;
			var hiddenImage = new Image();

			hiddenImage.onload = function() {

				var hiddenCanvas =  document.createElement('canvas');
				var imageData;
				var width = hiddenImage.width;
				var height = hiddenImage.height;

				hiddenCanvas.width = width;
				hiddenCanvas.height = height;
				hiddenCanvas.getContext('2d').drawImage(hiddenImage, 0, 0, width, height);
				imageData = hiddenCanvas.getContext('2d').getImageData(0, 0, width, height);

				images.push(imageData);

				callback(imageData, width, height);
			};

			if (typeof fileData === 'string') {
				hiddenImage.src = fileData;
			} else {
				fileReader = new FileReader();
				fileReader.onload = function (event) {
					hiddenImage.src = event.target.result;
				};
				fileReader.readAsDataURL(fileData);
			}
		}

		function analyseImages(ctxt1, ctxt2, width, height, callback){

			var hiddenCanvas = document.createElement('canvas');

			hiddenCanvas.width = width;
			hiddenCanvas.height = height;

			var context = hiddenCanvas.getContext('2d');

			var time = Date.now();

			var skip;

			if( (width > 1200 || height > 1200) && ignoreAntialiasing){
				skip = 6;
			}

			var finished = 0;
			var putImageDataArr = [];
			var mismatchCount = 0;

			function whenDone(){

				if(finished < workersCount) { return; }

				data.misMatchPercentage = (mismatchCount / (height*width) * 100).toFixed(2);
				data.analysisTime = Date.now() - time;

				data.getImageDataUrl = function(text){
					var barHeight = 0;

					if(text){
						barHeight = addLabel(text,context,hiddenCanvas);
					}

					putImageDataArr.forEach(function(func){
						func(barHeight);
					});

					return hiddenCanvas.toDataURL("image/png");
				};

				callback();
			}

			function onWorkEnded(e) {

				var canvasData = e.data.result;
				var index = e.data.index;

				mismatchCount += e.data.mismatch;

				putImageDataArr.push(function(offset){
					var imgData = context.createImageData(e.data.width, e.data.height);
					imgData.data.set(canvasData);
					context.putImageData(imgData, 0, (height / workersCount * index)+offset);
				});

				finished++;

				whenDone();
			}

			launchWorkers(ctxt1, ctxt2, width, height, skip, onWorkEnded);
		}

		function launchWorkers(ctxt1, ctxt2, width, height, skip, onWorkEnded){
			var range = Math.floor(height/workersCount);
			var index = 0;
			var d1slice, d2slice;

 			var c = document.createElement('canvas');
			c.width = width;
			c.height = range;
			var rtCtxt = c.getContext('2d');

			for (; index < workersCount; index++) {

				worker[index].onmessage = onWorkEnded;

				d1slice =  ctxt1.getImageData(0, range*index, width, range+range*index).data;
				d2slice = ctxt2.getImageData(0, range*index, width, range+range*index).data;

				worker[index].postMessage(
					{
						height: Math.floor(height/workersCount),
						width: width,
						skip: skip,
						data1: d1slice,
						data2: d2slice,
						dataStub: rtCtxt.getImageData(0,0,width,range).data,
						index: index,
						settings : {
							tolerance: tolerance,
							ignoreAntialiasing: ignoreAntialiasing,
							ignoreColors: ignoreColors
						}
					}
				);
			}
		}

		function addLabel(text, context, hiddenCanvas){
			var textPadding = 2;

			context.font = '12px sans-serif';

			var textWidth = context.measureText(text).width + textPadding*2;
			var barHeight = 22;

			if(textWidth > hiddenCanvas.width){
				hiddenCanvas.width = textWidth;
			}

			hiddenCanvas.height += barHeight;

			context.fillStyle = "#666";
			context.fillRect(0,0,hiddenCanvas.width,barHeight -4);
			context.fillStyle = "#fff";
			context.fillRect(0,barHeight -4,hiddenCanvas.width, 4);

			context.fillStyle = "#fff";
			context.textBaseline = "top";
			context.font = '12px sans-serif';
			context.fillText(text, textPadding, 1);

			return barHeight;
		}

		function normalise(img, w, h){
			var c;
			var context;

			//if(img.height < h || img.width < w){
				c = document.createElement('canvas');
				c.width = w;
				c.height = h;
				context = c.getContext('2d');
				context.putImageData(img, 0, 0);
				return context;
			//}

			//return img;
		}

		function compare(one, two){

			function onceWeHaveBoth(){
				var width;
				var height;
				if(images.length === 2){
					width = images[0].width > images[1].width ? images[0].width : images[1].width;
					height = images[0].height > images[1].height ? images[0].height : images[1].height;

					if( (images[0].width === images[1].width) && (images[0].height === images[1].height) ){
						data.isSameDimensions = true;
					} else {
						data.isSameDimensions = false;
					}

					analyseImages(
						normalise(images[0],width, height),
						normalise(images[1],width, height),
						width,
						height,
						triggerDataUpdate
					);
				}
			}

			images = [];
			loadImageData(one, onceWeHaveBoth);
			loadImageData(two, onceWeHaveBoth);
		}

		function getCompareApi(param){

			var secondFileData,
				hasMethod = typeof param === 'function';

			if( !hasMethod ){
				// assume it's file data
				secondFileData = param;
			}

			var self = {
				ignoreNothing: function(){

					tolerance.red = 16;
					tolerance.green = 16;
					tolerance.blue = 16;
					tolerance.minBrightness = 16;
					tolerance.maxBrightness = 240;

					ignoreAntialiasing = false;
					ignoreColors = false;

					if(hasMethod) { param(); }
					return self;
				},
				ignoreAntialiasing: function(){

					tolerance.red = 32;
					tolerance.green = 32;
					tolerance.blue = 32;
					tolerance.minBrightness = 64;
					tolerance.maxBrightness = 96;

					ignoreAntialiasing = true;
					ignoreColors = false;

					if(hasMethod) { param(); }
					return self;
				},
				ignoreColors: function(){

					tolerance.minBrightness = 16;
					tolerance.maxBrightness = 240;

					ignoreAntialiasing = false;
					ignoreColors = true;

					if(hasMethod) { param(); }
					return self;
				},
				onComplete: function( callback ){

					updateCallbackArray.push(callback);

					var wrapper = function(){
						compare(fileData, secondFileData);
					};

					wrapper();

					return getCompareApi(wrapper);
				}
			};

			return self;
		}

		return {
			onComplete: function( callback ){
				updateCallbackArray.push(callback);
				loadImageData(fileData, function(imageData, width, height){
					parseImage(imageData.data, width, height);
				});
			},
			compareTo: function(secondFileData){
				return getCompareApi(secondFileData);
			}
		};

	};
}(this));