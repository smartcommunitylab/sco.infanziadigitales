#!/bin/sh

ionic cordova build android --release
if [ -f ~/build/ugas-gen-unsigned.apk ]; then
  rm ~/build/ugas-gen-unsigned.apk
fi
mv platforms/android/build/outputs/apk/android-release-unsigned.apk ~/build/ugas-gen-unsigned.apk
if [ -f ~/build/ugas-gen.apk ]; then
  rm ~/build/ugas-gen.apk 
fi 
cd ~/build 
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ugas.keystore -storepass AQrEyMD1 ugas-gen-unsigned.apk ugas 
jarsigner -verify -certs -verbose ugas-gen-unsigned.apk 
~/tools/android-sdk-macosx/build-tools/22.0.1/zipalign -v 4 ugas-gen-unsigned.apk ugas-gen.apk
cd -
