rm -rf tmp
mkdir tmp
adb pull sdcard/SixGame/log/ ~/Desktop/log/tmp
# cp bunzip.sh tmp/
python decode_mars_nocrypt_log_file.py tmp/log
