// monaco-theme.js

export const logLanguage = {
  // Define the basic structure and tokens for your log language here
  defaultToken: '',
  tokenPostfix: '.log',

  // Define various tokens with CSS-like color rules
  tokenizer: {
    root: [
      [/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)/, 'custom-datetime'],
      // [06:20:22.283]
      [/(\d{2}:\d{2}:\d{2}\.\d{3})/, 'custom-datetime'],
      // [2024-08-30 06:20:23.411774]
      [/(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\.\d{6})/, 'custom-datetime'],
      // 2024-08-30T13:10:35.006254937+08:00 No user command
      [/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{9}\+\d{2}:\d{2})/, 'custom-datetime'],

      // 开头的数字颜色
      // [/^\d+/, 'custom-symbol'],
      [/[<=>]/, 'custom-symbol'],
      // 关键字颜色
      [/(File|Traceback|redis|db|export|echo)/, 'custom-keyword'],
      // 文件名颜色
      [/(\s)([a-zA-Z0-9_\-\.\/]+)(,)/, 'custom-symbol'],
      // 行号颜色
      [/(\d+)(:)/, 'custom-time'],
      // 字符串颜色
      [/"[^"]*"/, 'custom-string'],
      [/'[^']*'/, 'custom-string'],
      // library color
      [/(from|import|as)\s([a-zA-Z0-9_\-\.\/]+)/, 'custom-library'],
      // 含有ERROR的单词，无论大小写，
      // [/\b(?:\w*[eE][rR][rR][oO][rR]\w*)\b/, 'custom-error']
      [/\b(?:\w*(?:ERROR|Error|error|EXCEPTION|Exception|exception)\w*)\b/, 'custom-error']

    ],
  },
};

export const logTheme = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'custom-error', foreground: 'ff0000' },  // Red for errors
    { token: 'custom-warn', foreground: 'ffa500' },   // Orange for warnings
    { token: 'custom-info', foreground: '00ff00' },   // Green for info
    { token: 'custom-time', foreground: 'b0c4de' },   // LightSteelBlue for time
    { token: 'custom-datetime', foreground: '00dfa0' },// Aquamarine for datetime
    { token: 'custom-symbol', foreground: 'ff00ff' }, // Magenta for symbols
    { token: 'custom-keyword', foreground: 'ff4500' }, // OrangeRed for keywords
    { token: 'custom-string', foreground: '00ff00' },  // Green for strings ,with quotes
    { token: 'custom-library', foreground: '66D9EF' }, // lightblue for library
  ],
  colors: {
    'editor.foreground': '#F8F8F8',
  },
};