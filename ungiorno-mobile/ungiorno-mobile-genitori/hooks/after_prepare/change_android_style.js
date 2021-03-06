#!/usr/bin/env node

var fs = require("fs");
var et = require('elementtree');
var rootdir = process.argv[2];
console.log(rootdir);
fs.open(rootdir + '/platforms/android/AndroidManifest.xml', 'r+',
    function (err, fd) {
        if (err) {
            exitError(err);
        }
        fs.stat(rootdir + '/platforms/android/AndroidManifest.xml', getStats);

        function getStats(error, stats) {
            if (error) {
                exitError(error);
            }
            var buffer = new Buffer(stats.size);
            fs.read(fd, buffer, 0, buffer.length, null, fileRead);
        }

        function fileRead(error, bytes, buf) {
            var data = buf.toString("utf8", 0, buf.length);
            var androidXML = et.parse(data);
            var root = androidXML.getroot();
            var activityTag = root.find("application/activity");
            activityTag.attrib["android:theme"] = "@style/AppTheme";
            var outputBuffer = new Buffer(et.tostring(root), "utf-8");
            console.log(outputBuffer.toString());
            fs.closeSync(fd);
            fs.open(rootdir + '/platforms/android/AndroidManifest.xml', 'w', writeFile);

            function writeFile(error, fd) {
                if (error) {
                    exitError(error);
                }
                fs.write(fd, outputBuffer, 0, outputBuffer.length, 0, function (errw, written, str) {
                    if (errw) {
                        exitError(errw);
                    }
                    console.log('file written');
                    fs.close(fd);
                });
            }

        }
    });

function exitError(error) {
    console.log(error);
    process.exit(0);
}


//if (!fs.existsSync(rootdir + '/platforms/android/res/values-v21/')) {
//    fs.mkdirSync(rootdir + '/platforms/android/res/values-v21/');
//}
fs.writeFile(rootdir + '/platforms/android/res/values/styles.xml', '<resources><style name="AppTheme" parent="android:Theme.Holo.Light"></style></resources>');
//fs.writeFile(rootdir + '/platforms/android/res/values-v21/styles.xml', '<resources><style name="AppTheme" parent="android:Theme.Material.Light"></style></resources>');
