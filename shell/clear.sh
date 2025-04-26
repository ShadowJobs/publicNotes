
if [[ $1 == ks ]]
then
	ksDir=`adb shell ls sdcard/gifshow/liying/.ge/`
    adb shell rm -rf sdcard/gifshow/liying/.ge/${ksDir}/Scripts
elif [[ $1 == 66 ]]
then
	ksDir=`adb shell ls sdcard/SixGame/.ge/`
    adb shell rm -rf sdcard/SixGame/.ge/${ksDir}/Scripts

elif [[ $1 == liying ]]
then
	ksDir=`adb shell ls sdcard/liying/.ge/`
    adb shell rm -rf sdcard/liying/.ge/${ksDir}/Scripts
elif [[ $1 == log ]]
then
	adb shell rm -rf sdcard/gifshow/.debug/liying
fi
# adb shell rm -rf sdcard/gifshow/liying/.gr/${pkgdir}/Images