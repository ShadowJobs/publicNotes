echo startBuild
/Applications/CocosCreator.app/Contents/MacOS/CocosCreator --path ~/work/creator/ppx --build

cp /Users/linying/work/creator/Framework/build-templates/web-mobile/index.html /Users/linying/work/creator/ppx/build/web-mobile/index.html
touch /Users/linying/work/creator/ppx/build/web-mobile/config.json
echo '{"gameId": 112, "version": "0.0.62"}' > /Users/linying/work/creator/ppx/build/web-mobile/config.json

adb push /Users/linying/work/creator/ppx/build/web-mobile/src /sdcard/SoGame/.gr/112_0.0.61/
adb shell am force-stop com.kwai.sogame
adb shell am start -n com.kwai.sogame/com.kwai.sogame.combus.launch.SogameMainActivity
echo success