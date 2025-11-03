// Vercel构建测试脚本
const fs = require('fs');
const path = require('path');

console.log('=== Vercel构建环境测试 ===');

// 1. 检查Node.js和npm版本
console.log('Node.js版本:', process.version);
console.log('NPM版本:', process.env.npm_version || '需要运行npm --version');

// 2. 检查关键文件是否存在
const requiredFiles = [
  'package.json',
  'vite.config.js',
  'src/main.js',
  'src/App.vue'
];

console.log('\n=== 文件系统检查 ===');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${file}: ${exists ? '✅ 存在' : '❌ 缺失'}`);
});

// 3. 检查package.json配置
console.log('\n=== Package.json检查 ===');
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log('项目名称:', pkg.name);
  console.log('构建脚本:', pkg.scripts?.build || '未定义');
  console.log('依赖数量:', Object.keys(pkg.dependencies || {}).length);
  console.log('开发依赖数量:', Object.keys(pkg.devDependencies || {}).length);
} catch (error) {
  console.log('❌ 无法读取package.json:', error.message);
}

// 4. 检查Vercel配置
console.log('\n=== Vercel配置检查 ===');
try {
  if (fs.existsSync('vercel.json')) {
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    console.log('Vercel配置版本:', vercelConfig.version);
    console.log('构建命令:', vercelConfig.buildCommand);
    console.log('输出目录:', vercelConfig.outputDirectory);
  } else {
    console.log('❌ vercel.json文件不存在');
  }
} catch (error) {
  console.log('❌ 无法读取vercel.json:', error.message);
}

console.log('\n=== 测试完成 ===');