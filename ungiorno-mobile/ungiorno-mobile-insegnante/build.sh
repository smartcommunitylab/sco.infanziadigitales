#!/bin/sh

ionic cordova build android --release
if [ -f ~/build/ugas-ins-unsigned.apk ]; then
  rm ~/build/ugas-ins-unsigned.apk
fi
mv platforms/android/build/outputs/apk/android-release-unsigned.apk ~/build/ugas-ins-unsigned.apk
if [ -f ~/build/ugas-ins.apk ]; then
  rm ~/build/ugas-ins.apk 
fi 
cd ~/build 
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ugas.keystore -storepass AQrEyMD1 ugas-ins-unsigned.apk ugas 
jarsigner -verify -certs -verbose ugas-ins-unsigned.apk 
~/tools/android-sdk-macosx/build-tools/22.0.1/zipalign -v 4 ugas-ins-unsigned.apk ugas-ins.apk
cd -
