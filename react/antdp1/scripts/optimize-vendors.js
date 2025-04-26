// scripts/optimize-vendors.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 读取分析报告
let report;
try {
  report = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'vendors-analysis.json'), 'utf8')
  );
} catch (e) {
  console.error('Please run analyze-vendors.js first to generate the report');
  process.exit(1);
}

// 常见大型依赖的优化示例代码
const optimizationExamples = {
  'moment': `
// 1. 替换为 dayjs
npm uninstall moment
npm install dayjs

// 在代码中替换:
// 替换前:
import moment from 'moment'; 
const formattedDate = moment(date).format('YYYY-MM-DD');

// 替换后:
import dayjs from 'dayjs';
const formattedDate = dayjs(date).format('YYYY-MM-DD');

// 2. 如果必须使用 moment，使用 webpack 插件移除不必要的 locales
// webpack 配置:
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');

module.exports = {
  plugins: [
    // 只保留 'en', 'zh-cn' locale
    new MomentLocalesPlugin({
      localesToKeep: ['en', 'zh-cn'],
    }),
  ],
};
`,
  'lodash': `
// 1. 使用部分导入而非整个库
// 替换前:
import _ from 'lodash';
_.map(items, fn);

// 替换后:
import map from 'lodash/map';
map(items, fn);

// 2. 使用 babel 插件
// .babelrc 或 babel.config.js:
{
  "plugins": ["lodash"]
}

// 3. 使用 lodash-es
npm uninstall lodash
npm install lodash-es

import { map } from 'lodash-es';
`,
  'antd': `
// 1. 使用 babel-plugin-import 优化导入
// .babelrc 或 babel.config.js:
{
  "plugins": [
    ["import", { "libraryName": "antd", "style": true }]
  ]
}

// 使用:
// 替换前:
import { Button, DatePicker } from 'antd';

// 优化后 (自动转换为):
// import Button from 'antd/lib/button';
// import DatePicker from 'antd/lib/date-picker';

// 2. 懒加载不常用的 antd 组件
const ComplexTable = React.lazy(() => import('./components/ComplexTable'));

<Suspense fallback={<Spin />}>
  <ComplexTable />
</Suspense>
`,
  'echarts': `
// 1. 使用按需引入替代完整引入
// 替换前:
import * as echarts from 'echarts';

// 替换后:
import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  BarChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  CanvasRenderer
]);

// 2. 动态导入
const loadECharts = async () => {
  const echarts = await import('echarts/core');
  const { BarChart } = await import('echarts/charts');
  const { GridComponent, TooltipComponent } = await import('echarts/components');
  const { CanvasRenderer } = await import('echarts/renderers');
  
  echarts.use([
    BarChart,
    GridComponent,
    TooltipComponent,
    CanvasRenderer
  ]);
  
  return echarts;
};

// 当需要渲染图表时:
const echarts = await loadECharts();
`,
};

// 输出最大的依赖和优化建议
console.log('===== Vendors Bundle Optimization Guide =====\n');
console.log(`Total vendors size: ${report.totalSize}\n`);

const top5 = report.packages.slice(0, 5);
console.log('Top 5 largest dependencies:');
top5.forEach((pkg, i) => {
  console.log(`${i + 1}. ${pkg.name}: ${pkg.sizeInKB}`);
});

console.log('\n===== Detailed Optimization Examples =====\n');

// 为前5大依赖生成优化示例
top5.forEach(pkg => {
  console.log(`\n## Optimizing ${pkg.name} (${pkg.sizeInKB})\n`);
  
  // 检查是否有匹配的优化示例
  let example = null;
  for (const [key, code] of Object.entries(optimizationExamples)) {
    if (pkg.name.includes(key)) {
      example = code;
      break;
    }
  }
  
  if (example) {
    console.log('```javascript');
    console.log(example);
    console.log('```');
  } else {
    console.log('General optimization strategies:');
    console.log('1. Check if this dependency is necessary, or if a smaller alternative exists');
    console.log('2. Use dynamic imports to load it only when needed:');
    console.log('```javascript');
    console.log(`// Instead of importing at the top level
import { ${pkg.name} } from '${pkg.name}';

// Use dynamic import
const use${pkg.name.replace(/[^a-zA-Z0-9]/g, '')} = async () => {
  const module = await import('${pkg.name}');
  // Use the module...
  return module;
};`);
    console.log('```');
  }
});

// 整体优化建议
console.log('\n===== General Optimization Strategies =====\n');

console.log('1. Implement code splitting by route');
console.log('```javascript');
console.log(`// In UmiJS, configure route-based code splitting
// config/config.js or .umirc.js
export default {
  // ...
  dynamicImport: {
    loading: '@/components/Loading',
  },
};`);
console.log('```');

console.log('\n2. Use React.lazy and Suspense for component-level code splitting');
console.log('```javascript');
console.log(`import React, { Suspense } from 'react';

// Instead of immediate import
// import HeavyComponent from './HeavyComponent';

// Use lazy loading
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

function MyComponent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}`);
console.log('```');

console.log('\n3. Optimize imports using babel plugins');
console.log('```javascript');
console.log(`// .babelrc or babel.config.js
{
  "plugins": [
    ["import", { "libraryName": "antd", "style": true }],
    ["import", { "libraryName": "@ant-design/icons", "libraryDirectory": "es/icons", "camel2DashComponentName": false }, "ant-design-icons"],
    "lodash"
  ]
}`);
console.log('```');

console.log('\n4. Set up more granular vendor chunks in webpack config');
console.log('```javascript');
console.log(`// In UmiJS config
export default {
  // ...
  chainWebpack: (config) => {
    config.optimization.splitChunks({
      chunks: 'all',
      cacheGroups: {
        // 更细粒度的分组
        antd: {
          name: 'antd',
          test: /[\\/]node_modules[\\/]antd[\\/]/,
          priority: 20,
        },
        moment: {
          name: 'moment',
          test: /[\\/]node_modules[\\/]moment[\\/]/,
          priority: 20,
        },
        lodash: {
          name: 'lodash', 
          test: /[\\/]node_modules[\\/]lodash[\\/]/,
          priority: 20,
        },
        // ... 其他大型依赖 ...
        vendors: {
          name: 'vendors',
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
        },
      },
    });
  },
}`);
console.log('```');