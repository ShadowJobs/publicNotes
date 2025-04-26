/**
 * 增强版分析脚本，包括页面构建时间统计
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 设置环境变量
process.env.ANALYZE = '1';
process.env.TRACK_TIMES = '1';
process.env.NODE_OPTIONS = process.env.NODE_OPTIONS || '--max_old_space_size=8192';

console.log('Starting enhanced build analysis with page build times...');
console.time('Total build time');

try {
  // 执行 umi build
  execSync('umi build', { stdio: 'inherit' });
  
  console.timeEnd('Total build time');
  
  // 检查生成的报告文件
  const pageBuildTimesPath = path.resolve(process.cwd(), 'dist/page-build-times.json');
  const entryBuildTimesPath = path.resolve(process.cwd(), 'dist/entry-build-times.json');
  
  if (fs.existsSync(pageBuildTimesPath)) {
    console.log(`\nPage build times report generated at: ${pageBuildTimesPath}`);
  }
  
  if (fs.existsSync(entryBuildTimesPath)) {
    console.log(`\nEntry build times report generated at: ${entryBuildTimesPath}`);
  }
  
  console.log('\nAnalysis complete! Check the reports for detailed information.');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}