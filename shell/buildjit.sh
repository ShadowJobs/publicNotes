LUAJIT=./luajitSrc
DEVDIR=`xcode-select -print-path`/Platforms
IOSVER=iPhoneOS9.2.sdk
SIMVER=iPhoneSimulator9.2.sdk
IOSDIR=$DEVDIR/iPhoneOS.platform/Developer
SIMDIR=$DEVDIR/iPhoneSimulator.platform/Developer
IOSBIN=$DEVDIR/../usr/bin/
SIMBIN=$SIMDIR/usr/bin/

IOSBIN=/usr/bin/
SIMBIN=/usr/bin/

BUILD_DIR=$LUAJIT/build

rm -rf $BUILD_DIR
mkdir -p $BUILD_DIR
rm *.a 1>/dev/null 2>/dev/null

echo =================================================
echo ARMV7 Architecture
ISDKF="-arch armv7 -isysroot $IOSDIR/SDKs/$IOSVER"
make -j -C $LUAJIT HOST_CC="gcc -m32 " CROSS=$IOSBIN TARGET_FLAGS="$ISDKF" TARGET=armv7 TARGET_SYS=iOS clean
make -j -C $LUAJIT HOST_CC="gcc -m32 " CROSS=$IOSBIN TARGET_FLAGS="$ISDKF" TARGET=armv7 TARGET_SYS=iOS 
mv $LUAJIT/src/libluajit.a $BUILD_DIR/libluajitA7.a

echo =================================================
echo ARM64 Architecture
ISDKF="-arch arm64 -isysroot $IOSDIR/SDKs/$IOSVER"
make -j -C $LUAJIT HOST_CC="gcc " CROSS=$IOSBIN TARGET_FLAGS="$ISDKF" TARGET=arm64 TARGET_SYS=iOS clean
make -j -C $LUAJIT HOST_CC="gcc " CROSS=$IOSBIN TARGET_FLAGS="$ISDKF" TARGET=arm64 TARGET_SYS=iOS 
mv $LUAJIT/src/libluajit.a $BUILD_DIR/libluajit64bit.a

echo =================================================
echo IOS Simulator Architecture
ISDKF="-arch x86_64 -isysroot $SIMDIR/SDKs/$SIMVER -miphoneos-version-min=6.1"
make -j -C $LUAJIT HOST_CFLAGS="-arch x86_64" HOST_LDFLAGS="-arch x86_64" TARGET_SYS=iOS TARGET=x86_64 clean
make -j -C $LUAJIT HOST_CFLAGS="-arch x86_64" HOST_LDFLAGS="-arch x86_64" TARGET_SYS=iOS TARGET=x86_64 amalg CROSS=$SIMBIN TARGET_FLAGS="$ISDKF"


mv $LUAJIT/src/libluajit.a $BUILD_DIR/libluajitx86_64.a

libtool -o $BUILD_DIR/libluajit21.a $BUILD_DIR/*.a 2> /dev/null


mkdir -p $BUILD_DIR/Headers
cp $LUAJIT/src/lua.h $BUILD_DIR/Headers
cp $LUAJIT/src/lauxlib.h $BUILD_DIR/Headers
cp $LUAJIT/src/lualib.h $BUILD_DIR/Headers
cp $LUAJIT/src/luajit.h $BUILD_DIR/Headers
cp $LUAJIT/src/lua.hpp $BUILD_DIR/Headers
cp $LUAJIT/src/luaconf.h $BUILD_DIR/Headers

mv $BUILD_DIR/libluajit21.a ../lib/ios

