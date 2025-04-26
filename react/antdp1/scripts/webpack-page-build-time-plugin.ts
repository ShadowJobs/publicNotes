import * as fs from 'fs';
import * as path from 'path';
import { Compiler, Compilation, Module, Stats } from 'webpack';

/**
 * 插件配置选项
 */
interface PageBuildTimePluginOptions {
  outputToConsole?: boolean;
  outputToFile?: boolean;
  filename?: string;
  trackNodeModules?: boolean;
}

/**
 * 模块构建时间数据
 */
interface ModuleBuildData {
  time: number;
  count: number;
  size: number;
}

/**
 * 模块输出信息
 */
interface ModuleOutput {
  path: string;
  buildTime: number;
  buildCount: number;
  size: number;
}

/**
 * 页面输出信息
 */
interface PageOutput {
  modules: ModuleOutput[];
  totalTime: number;
  totalSize: number;
  moduleCount: number;
}

/**
 * 分析结果输出
 */
interface OutputResult {
  pages: {
    [page: string]: PageOutput;
  };
  summary: {
    totalTime: number;
    totalSize: number;
    totalModules: number;
  };
}

/**
 * Webpack 插件：跟踪页面构建时间
 */
class WebpackPageBuildTimePlugin {
  private options: Required<PageBuildTimePluginOptions>;
  private buildTimes: { [key: string]: ModuleBuildData };
  private startTimes: { [key: string]: number };
  private isWatching: boolean;

  constructor(options: PageBuildTimePluginOptions = {}) {
    this.options = {
      outputToConsole: true,
      outputToFile: true,
      filename: 'page-build-times.json',
      trackNodeModules: false,
      ...options
    };
    
    this.buildTimes = {};
    this.startTimes = {};
    this.isWatching = false;
  }

  apply(compiler: Compiler): void {
    // 获取 UmiJS 的路由信息
    const routesMapping = this.getRoutesMapping(compiler);
    
    // 编译开始
    compiler.hooks.compile.tap('WebpackPageBuildTimePlugin', () => {
      this.startTimes = {};
    });

    // 记录模块构建开始时间
    compiler.hooks.compilation.tap('WebpackPageBuildTimePlugin', (compilation: Compilation) => {
      compilation.hooks.buildModule.tap('WebpackPageBuildTimePlugin', (module: any) => {
        const name = this.getModuleName(module);
        if (name && !this.startTimes[name]) {
          this.startTimes[name] = Date.now();
        }
      });
      
      // 模块构建完成时记录时间
      compilation.hooks.succeedModule.tap('WebpackPageBuildTimePlugin', (module: any) => {
        const name = this.getModuleName(module);
        if (name && this.startTimes[name]) {
          const buildTime = Date.now() - this.startTimes[name];
          
          if (!this.buildTimes[name]) {
            this.buildTimes[name] = {
              time: buildTime,
              count: 1,
              size: this.getModuleSize(module)
            };
          } else {
            this.buildTimes[name].time += buildTime;
            this.buildTimes[name].count += 1;
            this.buildTimes[name].size = this.getModuleSize(module);
          }
        }
      });
    });

    // 处理 watch 模式
    compiler.hooks.watchRun.tap('WebpackPageBuildTimePlugin', () => {
      this.isWatching = true;
    });

    // 构建完成，输出报告
    compiler.hooks.done.tap('WebpackPageBuildTimePlugin', (stats: Stats) => {
      // 输出页面构建时间报告
      this.outputPageBuildTimes(stats, routesMapping);
      
      // 将数据写入文件
      if (this.options.outputToFile) {
        const outputPath = path.join(
          compiler.outputPath || process.cwd(),
          this.options.filename
        );
        
        fs.writeFileSync(
          outputPath,
          JSON.stringify(this.processDataForOutput(routesMapping, stats), null, 2)
        );
        
        if (this.options.outputToConsole) {
          console.log(`\nPage build times saved to: ${outputPath}`);
        }
      }
    });
  }
  
  // 获取 UmiJS 的路由和页面映射关系
  private getRoutesMapping(compiler: Compiler): Record<string, string> {
    try {
      // 尝试获取 UmiJS 的路由配置
      const possibleRoutesPaths = [
        path.join(process.cwd(), 'src/.umi/core/routes.ts'),
        path.join(process.cwd(), 'src/.umi/core/route.ts'),
        path.join(process.cwd(), '.umi/core/routes.ts'),
        path.join(process.cwd(), '.umi/core/route.ts'),
        // UmiJS v4 可能的路径
        path.join(process.cwd(), '.umi/umi.ts'),
        path.join(process.cwd(), '.umi/exports.ts')
      ];
      
      let routesContent = '';
      for (const routePath of possibleRoutesPaths) {
        if (fs.existsSync(routePath)) {
          routesContent = fs.readFileSync(routePath, 'utf-8');
          break;
        }
      }
      
      if (!routesContent) {
        return {};
      }
      
      // 解析路由配置中的组件路径映射
      const componentRegex = /component:\s*(?:require$$['"]([^'"]+)['"]$$|['"]([^'"]+)['"]\)|async\s*(?:$$$$\s*=>|function\s*$$$$\s*{(?:\s*return)?\s*)(?:require$$['"]([^'"]+)['"]$$|await import$$['"]([^'"]+)['"]$$))/g;
      const pathRegex = /path:\s*['"]([^'"]+)['"]/g;
      
      const routes: Record<string, string> = {};
      let componentMatch: RegExpExecArray | null;
      let pathMatch: RegExpExecArray | null;
      
      while ((componentMatch = componentRegex.exec(routesContent)) !== null) {
        const component = componentMatch[1] || componentMatch[2] || componentMatch[3] || componentMatch[4];
        
        // 重置 pathRegex 的 lastIndex 以便从当前位置附近查找 path
        pathRegex.lastIndex = Math.max(0, componentMatch.index - 100);
        
        while ((pathMatch = pathRegex.exec(routesContent)) !== null) {
          // 只考虑在组件之前的最近的路径
          if (pathMatch.index > componentMatch.index) break;
          if (componentMatch.index - pathMatch.index < 200) { // 假设路径和组件声明在相近的位置
            const path = pathMatch[1];
            routes[path] = component;
            break;
          }
        }
      }
      
      return routes;
    } catch (e) {
      console.error('Error parsing UmiJS routes:', e);
      return {};
    }
  }
  
  // 获取模块名称，主要关注页面相关模块
  private getModuleName(module: any): string | null {
    // 对于 UmiJS，我们关心 src/pages 下的文件
    if (!module.resource) return null;
    
    // 忽略 node_modules 中的文件，除非明确要跟踪
    if (module.resource.includes('node_modules') && !this.options.trackNodeModules) {
      return null;
    }
    
    // 主要关注页面文件
    if (module.resource.includes('/pages/') || module.resource.includes('\\pages\\')) {
      return module.resource;
    }
    
    return null;
  }
  
  // 获取模块大小
  private getModuleSize(module: any): number {
    if (!module.size) return 0;
    return typeof module.size === 'function' ? module.size() : module.size;
  }
  
  // 处理数据以便输出
  private processDataForOutput(routesMapping: Record<string, string>, stats: Stats): OutputResult {
    const output: OutputResult = {
      pages: {},
      summary: {
        totalTime: 0,
        totalSize: 0,
        totalModules: 0,
      }
    };
    
    // 处理每个页面的构建时间
    const pagePathMapping: Record<string, string> = {};
    Object.entries(routesMapping).forEach(([route, component]) => {
      // 将组件路径转换为实际文件路径
      let filePath = component;
      
      // 处理常见的 UmiJS 组件路径格式
      if (filePath.startsWith('@/')) {
        filePath = filePath.replace('@/', 'src/');
      }
      
      // 添加可能的扩展名
      const possibleExtensions = ['.tsx', '.ts', '.jsx', '.js'];
      for (const ext of possibleExtensions) {
        const fullPath = filePath + ext;
        for (const modulePath of Object.keys(this.buildTimes)) {
          if (modulePath.endsWith(fullPath) || 
              modulePath.includes(`${filePath}/index${ext}`)) {
            pagePathMapping[modulePath] = route;
            break;
          }
        }
      }
    });
    
    // 汇总每个页面的构建时间
    for (const [modulePath, data] of Object.entries(this.buildTimes)) {
      // 尝试找到对应的路由
      let pageName = 'unknown';
      let isPage = false;
      
      for (const [path, route] of Object.entries(pagePathMapping)) {
        if (modulePath.includes(path)) {
          pageName = route;
          isPage = true;
          break;
        }
      }
      
      // 如果不是明确的页面，但包含 pages 目录，尝试推断页面名
      if (!isPage && (modulePath.includes('/pages/') || modulePath.includes('\\pages\\'))) {
        const parts = modulePath.split(/[\/\\]pages[\/\\]/);
        if (parts.length > 1) {
          const relativePath = parts[1];
          if (relativePath) {
            pageName = `/${relativePath.split('.')[0].replace(/[\/\\]index$/, '')}`;
          }
          isPage = true;
        }
      }
      
      // 只关注页面相关模块
      if (isPage) {
        if (!output.pages[pageName]) {
          output.pages[pageName] = {
            modules: [],
            totalTime: 0,
            totalSize: 0,
            moduleCount: 0,
          };
        }
        
        output.pages[pageName].modules.push({
          path: modulePath,
          buildTime: data.time,
          buildCount: data.count,
          size: data.size,
        });
        
        output.pages[pageName].totalTime += data.time;
        output.pages[pageName].totalSize += data.size;
        output.pages[pageName].moduleCount += 1;
        
        output.summary.totalTime += data.time;
        output.summary.totalSize += data.size;
        output.summary.totalModules += 1;
      }
    }
    
    // 按总构建时间排序页面
    const sortedPages: Record<string, PageOutput> = {};
    Object.keys(output.pages)
      .sort((a, b) => output.pages[b].totalTime - output.pages[a].totalTime)
      .forEach(key => {
        sortedPages[key] = output.pages[key];
      });
    
    output.pages = sortedPages;
    return output;
  }
  
  // 输出页面构建时间报告
  private outputPageBuildTimes(stats: Stats, routesMapping: Record<string, string>): void {
    if (!this.options.outputToConsole) return;
    
    const data = this.processDataForOutput(routesMapping, stats);
    
    console.log('\n===== Page Build Time Analysis =====');
    
    // 页面构建时间排序输出
    console.log('\nPages by build time:');
    Object.entries(data.pages).forEach(([page, info], index) => {
      console.log(`${index+1}. ${page}: ${(info.totalTime / 1000).toFixed(2)}s (${(info.totalSize / 1024).toFixed(2)}KB, ${info.moduleCount} modules)`);
    });
    
    // 总结信息
    console.log(`\nTotal build time for pages: ${(data.summary.totalTime / 1000).toFixed(2)}s`);
    console.log(`Total size: ${(data.summary.totalSize / 1024).toFixed(2)}KB`);
    console.log(`Total modules: ${data.summary.totalModules}`);
    
    // 增量构建信息
    if (this.isWatching) {
      console.log('\nNote: Times shown are for incremental build in watch mode');
    }
  }
}

export default WebpackPageBuildTimePlugin;