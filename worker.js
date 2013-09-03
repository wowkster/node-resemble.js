/* globals self, parseData, importScripts */

var tolerance;
var ignoreAntialiasing;
var ignoreColors;
var index ;
importScripts('workerHelpers.js');

self.onmessage = function (e) {

    tolerance = e.data.settings.tolerance;
    ignoreAntialiasing = e.data.settings.ignoreAntialiasing;
    ignoreColors = e.data.settings.ignoreColors;
index = e.data.index;
    var ret = parseData(e.data.height, e.data.width, e.data.skip, e.data.data1, e.data.data2, e.data.dataStub);

    self.postMessage({
        width: e.data.width,
        height: e.data.height,
        result: ret.data,
        index: e.data.index,
        mismatch: ret.mismatch
    });
};