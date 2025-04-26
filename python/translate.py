import argparse
import json
from googletrans import Translator
from baiduTranslate import baiduTranslate
def main():
    # 创建一个命令行参数解析器
    parser = argparse.ArgumentParser(description='Translate Chinese words to other languages.')
    parser.add_argument('-f', '--file', help='The file that contains Chinese words to translate.')
    parser.add_argument('-l', '--language', default='en', help='The target language to translate to.')
    parser.add_argument('-t', '--translator', default='google', help='The translator to use. Options are "google" and "baidu".')
    args = parser.parse_args()

    try:
        with open(args.file, 'r') as f:
            chinese_words = f.read().strip('[]\n').split(',')
            chinese_words = [w.strip(' "\n') for w in chinese_words]
    except:
        print(f"{args.file} not exist")
        chinese_words = ["你好", "我是", "程序员"]

    translation_dict = {}

    if args.translator == 'google':
        translator = Translator()
        translate_func = lambda word: translator.translate(word, dest=args.language).text
        for word in chinese_words:
            translation_dict[word] = translate_func(word)
            print(translation_dict[word])
    elif args.translator == 'baidu':
        chinese_words="\n".join(chinese_words)
        result = baiduTranslate(chinese_words,to_lang=args.language)
        translation_dict={item['src']:item['dst'] for item in result['trans_result']}

    with open('./translation.json', 'w') as f:
        json.dump(translation_dict, f, ensure_ascii=False, indent=2)

if __name__ == '__main__':
    main()
