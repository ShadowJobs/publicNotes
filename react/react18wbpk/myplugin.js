// 本插件的作用：在每个输出的 js 文件末尾添加一个console.log，内容是文件名
// 插件开发文档：https://webpack.docschina.org/contribute/writing-a-plugin/
class AppendFilepathPlugin {
  apply(compiler) {
    // 挂载到 emit 钩子上
    compiler.hooks.emit.tapAsync('AppendFilepathPlugin', (compilation, callback) => {
      // 遍历所有即将输出的 assets
      Object.keys(compilation.assets).forEach((filename) => {
        if (filename.endsWith('.js')) {
          // 获取原始的 asset 源内容
          const source = compilation.assets[filename].source();

          // 在源内容末尾添加文件路径注释
          const appendText = `\n\n console.log("${filename}")`;
          const newSource = source + appendText;

          // 更新 asset 的源内容
          compilation.assets[filename] = {
            source: () => newSource,
            size: () => newSource.length
          };
        }
      });

      // 继续 webpack 构建流程
      callback();
    });
  }
}

module.exports = AppendFilepathPlugin;
