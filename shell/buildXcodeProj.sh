project_path="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
params=$@
echo "begin" > ~/cody.log
rm -f /User/playcrab/web/master-deploy/package/*.ipa
if test "$params" == "up";then
params="asset config script frontend up"
fi
if test "$params" == "all";then
params="asset config script frontend"
fi 
mtl_path=$project_path/../../../mtool
cd $mtl_path
echo "update mtl"
git pull
cd $project_path
#update C
if echo "$params" | grep -w "frontend"; then
echo "update C++ code"
git pull
fi
cd ../../svn
if echo "$params" | grep -w "config"; then
svn update .
updated=1
echo "update config"
mtl cfg
fi
if echo "$params" | grep -w "asset"; then
if ! test "$updated" == "1"; then
    svn update .
    echo "update svn"
fi
echo "mtl res and ccs"
mtl res
mtl ccs -p -c
fi
#update script
if echo "$params" | grep -w "script"; then
echo "update script"
cd Resources/script
git pull
fi

cd $project_path
if echo "$params" | grep -w "up"; then
exit 1
fi

echo "mtl luac"
mtl luac


echo "start build"
build_path=${project_path}/build
project_name=$(ls | grep xcodeproj | awk -F.xcodeproj '{print $1}')
project_infoplist_path=${project_path}/${project_name}/ios/Info.plist
bundleShortVersion=$(/usr/libexec/PlistBuddy -c "print CFBundleShortVersionString" ${project_infoplist_path})
bundleVersion=$(/usr/libexec/PlistBuddy -c "print CFBundleVersion" ${project_infoplist_path})
bundlePrefix=$(/usr/libexec/PlistBuddy -c "print CFBundleIdentifier" `find . -name "Info.plist"` | awk -F$ '{print $1}')
cd $project_path
echo clean start ...
if  [ -d ${build_path} ];then
rm -rf ${build_path}
echo clean build_path success.
fi
#清理工程
xcodebuild clean || exit
xcodebuild  -configuration Release \
-target ${project_name} \
# -scheme ${project_name} \
ONLY_ACTIVE_ARCH=NO \
TARGETED_DEVICE_FAMILY=1,2 \
DEPLOYMENT_LOCATION=YES \
CONFIGURATION_BUILD_DIR=${project_path}/build/Release-iphoneos  || exit
if [ -d ./ipa-build ];then
rm -rf ipa-build
fi
cd $build_path
mkdir -p ipa-build/Payload
cp -r ./Release-iphoneos/*.app ./ipa-build/Payload/
cd ipa-build
echo "sign with enterprise certification"
# exit 1
#方法2：用xcrun
# xcrun -sdk iphoneos PackageApplication -v $build_path/Release-iphoneos/大掌门2.app \
# -o /Users/playcrab/web/master-deploy/package/${project_name}.ipa \
xcrun -sdk iphoneos PackageApplication -v ./Payload/dzm2.app \
-o ${build_path}/ipa-build/${project_name}.ipa \
--embed "/Users/playcrab/Downloads/playcrab_master_demo.mobileprovision" \
--sign "iPhone Distribution: Tianjin Yiqu Technology Inc."
echo "sign success"
echo ${build_path}/ipa-build/${project_name}.ipa

cd ~/Desktop
cp -r ${build_path}/ipa-build/${project_name}.ipa  $(pwd)
cd ${build_path}/ipa-build
rm -rf Payload

cp ~/Desktop/${project_name}.ipa /Users/playcrab/web/master-deploy/package/
#cd ~/Desktop
# cp /Users/playcrab/web/master-deploy/package/${project_name}.ipa ~/Desktop/
# #cd ${build_path}/ipa-build
# #rm -rf Payload
# if  [ -d ${build_path} ];then
# rm -rf ${build_path}
# fi
