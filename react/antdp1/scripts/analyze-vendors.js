const fs = require('fs');
const path = require('path');

// 读取 stats 文件
const stats = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'dist/stats.json'), 'utf8')
);

// 找到 vendors chunk
const vendorsChunk = stats.chunks.find(chunk => 
  chunk.names && chunk.names.includes('vendors')
);

if (!vendorsChunk) {
  console.error('vendors chunk not found!');
  process.exit(1);
}

// 获取 vendors chunk 中的所有模块
const vendorModules = [];

// 递归获取所有模块和子模块
function collectModules(modules, moduleIds) {
  for (const id of moduleIds) {
    const module = modules.find(m => m.id === id);
    if (module) {
      vendorModules.push(module);
      if (module.modules) {
        collectModules(modules, module.modules.map(m => m.id));
      }
    }
  }
}

// 收集 vendors chunk 中的所有模块
collectModules(stats.modules, vendorsChunk.modules.map(m => m.id));

// 按照依赖包分组
const packageSizes = {};
vendorModules.forEach(module => {
  // 提取包名
  const match = module.name.match(/node_modules[\\/]((?:@[^/\\]+[\\/][^/\\]+)|[^/\\]+)/);
  if (match) {
    const packageName = match[1].replace(/\\/g, '/');
    if (!packageSizes[packageName]) {
      packageSizes[packageName] = {
        size: 0,
        modules: []
      };
    }
    packageSizes[packageName].size += module.size;
    packageSizes[packageName].modules.push({
      name: module.name,
      size: module.size
    });
  }
});

// 按大小排序
const sortedPackages = Object.entries(packageSizes)
  .sort(([, a], [, b]) => b.size - a.size)
  .map(([name, data]) => ({
    name,
    size: data.size,
    sizeInKB: (data.size / 1024).toFixed(2) + 'KB',
    moduleCount: data.modules.length,
    // 只保留最大的5个模块
    largestModules: data.modules
      .sort((a, b) => b.size - a.size)
      .slice(0, 5)
      .map(m => ({
        name: m.name.replace(/^.*node_modules[\\/]/, ''),
        size: (m.size / 1024).toFixed(2) + 'KB'
      }))
  }));

// 输出结果
console.log('===== Vendors Bundle Analysis =====\n');
console.log(`Total vendors size: ${(vendorsChunk.size / 1024 / 1024).toFixed(2)}MB\n`);
console.log('Top 20 largest dependencies:');
sortedPackages.slice(0, 20).forEach((pkg, index) => {
  console.log(`${index + 1}. ${pkg.name}: ${pkg.sizeInKB} (${pkg.moduleCount} modules)`);
  console.log('   Largest modules:');
  pkg.largestModules.forEach(m => {
    console.log(`   - ${m.name}: ${m.size}`);
  });
  console.log('');
});

// 生成优化建议
console.log('\n===== Optimization Suggestions =====\n');

// 检查潜在的重复依赖
const possibleDuplicates = new Set();
stats.modules.forEach(module => {
  if (module.name.includes('node_modules')) {
    const versionMatch = module.name.match(/node_modules[\\/]([^/\\]+)(?:[\\/]v\d+)?[\\/]/g);
    if (versionMatch && versionMatch.length > 1) {
      possibleDuplicates.add(module.name);
    }
  }
});

if (possibleDuplicates.size > 0) {
  console.log('Possible duplicate dependencies detected:');
  Array.from(possibleDuplicates).slice(0, 10).forEach(name => {
    console.log(`- ${name}`);
  });
  console.log('\nSuggestion: Run "npm dedupe" to try to consolidate versions.\n');
}

// 针对大型依赖的建议
console.log('Suggestions for top dependencies:');

const commonOptimizations = {
  'moment': [
    'Replace with lighter alternatives like "dayjs" or "date-fns"',
    'Use "moment-locales-webpack-plugin" to remove unnecessary locales'
  ],
  'lodash-es': [
    'Import specific functions instead of the entire library',
    'Consider using "babel-plugin-lodash" for tree-shaking'
  ],
  'antd': [
    'Use "babel-plugin-import" for automatic code splitting',
    'Only import needed components'
  ],
  '@ant-design': [
    'Use "babel-plugin-import" for automatic code splitting'
  ],
  'echarts': [
    'Use "echarts/core" and import only needed chart types and components'
  ],
  'xlsx': [
    'Consider using "xlsx-js-style" or other alternatives',
    'Load this library dynamically only when needed'
  ],
  'core-js': [
    'Review your Babel configuration to avoid unnecessarily polyfilling features'
  ]
};

sortedPackages.slice(0, 10).forEach(pkg => {
  console.log(`\nFor ${pkg.name} (${pkg.sizeInKB}):`);
  
  // 获取包的基本名称（去除scope）
  const baseName = pkg.name.replace(/^@[^/]+\//, '');
  
  // 查找匹配的优化建议
  let suggestions = null;
  for (const [key, tips] of Object.entries(commonOptimizations)) {
    if (pkg.name.includes(key)) {
      suggestions = tips;
      break;
    }
  }
  
  if (suggestions) {
    suggestions.forEach((tip, i) => console.log(`${i + 1}. ${tip}`));
  } else {
    console.log('- Consider using dynamic import for this dependency if not needed immediately');
    console.log('- Check if there are smaller alternative packages available');
  }
});

// 写入完整报告到文件
const outputReport = {
  totalSize: (vendorsChunk.size / 1024 / 1024).toFixed(2) + 'MB',
  packages: sortedPackages
};

fs.writeFileSync(
  path.join(process.cwd(), 'vendors-analysis.json'),
  JSON.stringify(outputReport, null, 2)
);

console.log('\nDetailed analysis saved to vendors-analysis.json');