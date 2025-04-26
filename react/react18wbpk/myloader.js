// 自定义loader：在每一个文件的末尾添加一行console.log('FILE PATH:', '文件路径')。
// loader开发文档： https://webpack.docschina.org/api/loaders/

module.exports = function(source) {
  const callback = this.async();
  const filePath = this.resourcePath;

  // 这将防止 loader 应用于 node_modules 中的文件
  if (/node_modules/.test(filePath)) {
    callback(null, source);
    return;
  }

  // 将文件路径打印的 console.log 添加到文件内容末尾
  const appendText = `\n\nconsole.log('FILE PATH:', '${filePath.replace(/\\/g, '\\\\')}');\n`;
  const newSource = source + appendText;

  callback(null, newSource);
};
