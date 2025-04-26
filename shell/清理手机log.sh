
if [[ $1 == ks ]]
then
	ksDir=`adb shell ls sdcard/SGame/.ge/`
    adb shell rm -rf sdcard/SGame/.ge/${ksDir}/Scripts
elif [[ $1 == 77 ]]
then
	ksDir=`adb shell ls sdcard/EGame/.ge/`
    adb shell rm -rf sdcard/EGame/.ge/${ksDir}/Scripts
fi