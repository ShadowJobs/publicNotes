const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 运行 npm list 命令查找 lodash 依赖
console.log('Finding packages that depend on lodash...');
try {
  const output = execSync('npm list lodash --parseable --all', { encoding: 'utf8' });
  const dependencies = output
    .trim()
    .split('\n')
    .filter(line => line.includes('node_modules/lodash'))
    .map(line => {
      // 提取路径中的依赖关系
      const parts = line
        .split('node_modules/')
        .filter(Boolean)
        .map(part => part.split('/')[0]);
      
      // 最后一个总是 lodash 自己
      return parts.length > 1 ? parts.slice(0, -1) : [];
    });
  
  // 构建依赖树
  const depTree = {};
  dependencies.forEach(depChain => {
    if (depChain.length > 0) {
      const directDep = depChain[0];
      if (!depTree[directDep]) {
        depTree[directDep] = [];
      }
      
      if (depChain.length > 1) {
        depTree[directDep].push(depChain.slice(1));
      }
    }
  });
  
  console.log('\n=== Packages that depend on lodash ===\n');
  Object.keys(depTree).sort().forEach(pkg => {
    console.log(`- ${pkg}`);
    if (depTree[pkg].length > 0) {
      console.log('  Via:');
      depTree[pkg].forEach(chain => {
        console.log(`  - ${chain.join(' -> ')}`);
      });
    }
  });
  
  // 保存结果到文件
  fs.writeFileSync(
    path.resolve(__dirname, '../lodash-dependencies.json'),
    JSON.stringify(depTree, null, 2)
  );
  console.log('\nResults saved to lodash-dependencies.json');
  
} catch (error) {
  console.error('Error executing npm list:', error.message);
}

// 分析 package.json 中的 dependencies 和 devDependencies
console.log('\nAnalyzing package.json...');
const packageJson = require('../package.json');

// 检查是否仍有 lodash 依赖
if (packageJson.dependencies && packageJson.dependencies.lodash) {
  console.log('\nWARNING: lodash is still listed in dependencies');
} else if (packageJson.devDependencies && packageJson.devDependencies.lodash) {
  console.log('\nWARNING: lodash is still listed in devDependencies');
} else {
  console.log('\nGood: No direct lodash dependency in package.json');
}

// 检查第三方包内部使用的 lodash 模块
console.log('\nChecking third-party package internals...');

// 找出可能大量使用 lodash 的第三方包
const nodeModulesDir = path.resolve(__dirname, '../node_modules');
let packagesToCheck = [];

try {
  const dirs = fs.readdirSync(nodeModulesDir);
  // 检查 @scope 包
  dirs.forEach(dir => {
    const fullPath = path.join(nodeModulesDir, dir);
    if (dir.startsWith('@') && fs.statSync(fullPath).isDirectory()) {
      const scopedPackages = fs.readdirSync(fullPath);
      scopedPackages.forEach(pkg => {
        packagesToCheck.push(`${dir}/${pkg}`);
      });
    } else {
      packagesToCheck.push(dir);
    }
  });
  
  // 分析包内部的 lodash 使用情况
  const lodashUsage = {};
  
  packagesToCheck.forEach(pkg => {
    const pkgPath = path.join(nodeModulesDir, pkg);
    
    if (!fs.existsSync(pkgPath) || !fs.statSync(pkgPath).isDirectory()) {
      return;
    }
    
    // 检查是否引用了 lodash
    const packageJsonPath = path.join(pkgPath, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      return;
    }
    
    try {
      const pkgJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const hasDependency = pkgJson.dependencies && pkgJson.dependencies.lodash;
      const hasPeerDependency = pkgJson.peerDependencies && pkgJson.peerDependencies.lodash;
      
      if (hasDependency || hasPeerDependency) {
        // 检查包内部的 lodash 使用情况
        const files = glob.sync(`${pkgPath}/**/*.@(js|jsx|ts|tsx)`, { ignore: `${pkgPath}/node_modules/**` });
        
        let lodashImportCount = 0;
        files.forEach(file => {
          try {
            const content = fs.readFileSync(file, 'utf8');
            if (content.includes("require('lodash')") || 
                content.includes('require("lodash")') ||
                content.match(/import\s+(?:\{[^}]*\}|_)\s+from\s+['"]lodash['"]/)) {
              lodashImportCount++;
            }
          } catch (e) {
            // 忽略读取错误
          }
        });
        
        if (lodashImportCount > 0) {
          lodashUsage[pkg] = {
            dependency: hasDependency,
            peerDependency: hasPeerDependency,
            importCount: lodashImportCount
          };
        }
      }
    } catch (e) {
      // 忽略 JSON 解析错误
    }
  });
  
  console.log('\n=== Third-party packages using lodash ===\n');
  Object.keys(lodashUsage).sort().forEach(pkg => {
    console.log(`- ${pkg}:`);
    console.log(`  - Listed as dependency: ${lodashUsage[pkg].dependency ? 'Yes' : 'No'}`);
    console.log(`  - Listed as peer dependency: ${lodashUsage[pkg].peerDependency ? 'Yes' : 'No'}`);
    console.log(`  - Import/require count: ${lodashUsage[pkg].importCount}`);
  });
  
} catch (error) {
  console.error('Error analyzing node_modules:', error.message);
}