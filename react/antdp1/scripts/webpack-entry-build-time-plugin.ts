import * as fs from 'fs';
import * as path from 'path';
import { Compiler, Stats, compilation } from 'webpack';

/**
 * 插件配置选项
 */
interface EntryBuildTimePluginOptions {
  outputToConsole?: boolean;
  outputToFile?: boolean;
  filename?: string;
}

/**
 * Webpack 插件：跟踪入口构建时间
 */
class WebpackEntryBuildTimePlugin {
  private options: Required<EntryBuildTimePluginOptions>;
  private entryTimes: Record<string, number>;
  private startTime: number;
  private originalEntry: any;
  
  constructor(options: EntryBuildTimePluginOptions = {}) {
    this.options = {
      outputToConsole: true,
      outputToFile: true,
      filename: 'entry-build-times.json',
      ...options
    };
    
    this.entryTimes = {};
    this.startTime = Date.now();
    this.originalEntry = null;
  }
  
  apply(compiler: Compiler): void {
    // 编译开始
    compiler.hooks.compile.tap('WebpackEntryBuildTimePlugin', () => {
      this.startTime = Date.now();
      this.entryTimes = {};
    });
    
    // 处理入口点
    compiler.hooks.entryOption.tap('WebpackEntryBuildTimePlugin', (context, entry) => {
      this.originalEntry = entry;
    });
    
    // 编译完成，分析结果
    compiler.hooks.done.tap('WebpackEntryBuildTimePlugin', (stats: Stats) => {
      // 获取完整的编译时间
      const endTime = Date.now();
      const totalTime = endTime - this.startTime;
      
      // 收集入口点信息
      const entrypoints: any = stats.compilation.entrypoints;
      
      const result: {
        totalTime: number;
        entries: Record<string, {
          name: string;
          size: number;
          files: Array<{name: string; size: number}>;
          time: number;
        }>;
      } = {
        totalTime,
        entries: {}
      };
      
      // 处理每个入口点
      for (const [name, entrypoint] of entrypoints) {
        // 获取此入口点的所有块
        const chunks = entrypoint.chunks || [];
        
        // 计算入口点总大小
        let totalSize = 0;
        const files: Array<{name: string; size: number}> = [];
        
        chunks.forEach((chunk: any) => {
          if (chunk.files) {
            chunk.files.forEach((file: string) => {
              const filePath = path.join(stats.compilation.outputOptions.path, file);
              let fileSize = 0;
              
              try {
                if (fs.existsSync(filePath)) {
                  const stats = fs.statSync(filePath);
                  fileSize = stats.size;
                }
              } catch (e) {
                console.error(`Error getting size for ${filePath}:`, e);
              }
              
              totalSize += fileSize;
              files.push({
                name: file,
                size: fileSize
              });
            });
          }
        });
        
        // 提取页面名称 (针对 UmiJS)
        let pageName = name;
        if (name.startsWith('p__')) {
          pageName = '/' + name.replace('p__', '').replace(/__/g, '/');
        }
        
        result.entries[pageName] = {
          name,
          size: totalSize,
          files,
          // 由于 Webpack 并不跟踪每个入口点的单独构建时间，这里使用总时间作为估计
          time: totalTime
        };
      }
      
      // 输出结果
      if (this.options.outputToConsole) {
        this.outputResults(result);
      }
      
      // 保存到文件
      if (this.options.outputToFile) {
        const outputPath = path.join(
          compiler.outputPath || process.cwd(),
          this.options.filename
        );
        
        fs.writeFileSync(
          outputPath,
          JSON.stringify(result, null, 2)
        );
        
        if (this.options.outputToConsole) {
          console.log(`\nEntry build times saved to: ${outputPath}`);
        }
      }
    });
  }
  
  // 输出结果到控制台
  private outputResults(result: any): void {
    console.log('\n===== Entry Points Build Time Analysis =====');
    console.log(`Total build time: ${(result.totalTime / 1000).toFixed(2)}s`);
    
    // 按大小排序输出入口点
    const sortedEntries = Object.entries(result.entries)
      .sort((a: [string, any], b: [string, any]) => b[1].size - a[1].size);
    
    console.log('\nEntry points by size:');
    sortedEntries.forEach(([page, data]: [string, any], index: number) => {
      console.log(
        `${index+1}. ${page}: ${(data.size / 1024 / 1024).toFixed(2)}MB ` +
        `(${data.files.length} files)`
      );
    });
    
    // 输出最大的几个文件
    console.log('\nLargest files:');
    const allFiles: Array<{name: string; size: number; entry: string}> = [];
    
    Object.entries(result.entries).forEach(([entryName, entry]: [string, any]) => {
      entry.files.forEach((file: {name: string; size: number}) => {
        allFiles.push({
          name: file.name,
          size: file.size,
          entry: entryName
        });
      });
    });
    
    allFiles
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)
      .forEach((file, index) => {
        console.log(
          `${index+1}. ${file.name}: ${(file.size / 1024 / 1024).toFixed(2)}MB ` +
          `(from ${file.entry})`
        );
      });
  }
}

export default WebpackEntryBuildTimePlugin;