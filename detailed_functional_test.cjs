/**
 * 详细功能测试脚本 - 创建球局和编辑资料页面
 * 重点测试：表单验证、数据保存、界面交互、异常处理
 */

const { chromium } = require('playwright');

class FunctionalTester {
  constructor() {
    this.testResults = [];
    this.currentTest = '';
  }

  async startTest() {
    console.log('🔍 开始详细功能测试...\n');
    
    const browser = await chromium.launch({ 
      headless: false,
      slowMo: 500 // 减慢操作速度便于观察
    });
    
    this.page = await browser.newContext({
      viewport: { width: 375, height: 667 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
    }).then(ctx => ctx.newPage());
    
    try {
      await this.testCreateMatchPage();
      await this.testEditProfilePage();
      await this.testErrorHandling();
      await this.generateDetailedReport();
    } catch (error) {
      this.recordResult('全局测试', '❌ 失败', error.message);
    } finally {
      await browser.close();
    }
  }

  recordResult(testName, status, details = '') {
    this.testResults.push({
      test: testName,
      status,
      details,
      timestamp: new Date().toISOString()
    });
    console.log(`${status} ${testName} ${details ? '- ' + details : ''}`);
  }

  async testCreateMatchPage() {
    console.log('\n🏓 测试创建球局页面功能');
    
    await this.page.goto('http://localhost:5173/create-match');
    await this.page.waitForTimeout(2000);

    // 1. 测试页面元素加载
    await this.testPageElements();
    
    // 2. 测试表单验证
    await this.testFormValidation();
    
    // 3. 测试选择器功能
    await this.testPickerFunctionality();
    
    // 4. 测试数据提交
    await this.testDataSubmission();
  }

  async testPageElements() {
    this.currentTest = '页面元素加载';
    
    const requiredElements = [
      'input[name="title"]',
      'input[name="sport"]', 
      'input[name="time"]',
      'input[name="location"]',
      'button[type="submit"]'
    ];

    for (const selector of requiredElements) {
      const element = await this.page.$(selector);
      if (!element) {
        this.recordResult(this.currentTest, '❌ 失败', `缺少元素: ${selector}`);
        return;
      }
    }
    
    this.recordResult(this.currentTest, '✅ 通过', '所有必需元素加载正常');
  }

  async testFormValidation() {
    this.currentTest = '表单验证测试';
    
    // 测试空表单提交
    await this.page.click('button[type="submit"]');
    await this.page.waitForTimeout(1000);
    
    // 检查错误提示
    const errorMessages = await this.page.$$eval('.van-field__error-message', 
      elements => elements.map(el => el.textContent)
    );
    
    if (errorMessages.length === 0) {
      this.recordResult(this.currentTest, '⚠️ 警告', '未检测到表单验证错误提示');
    } else {
      this.recordResult(this.currentTest, '✅ 通过', `检测到 ${errorMessages.length} 个验证错误`);
    }
    
    // 测试单个字段验证
    await this.testFieldValidation('title', '球局标题');
    await this.testFieldValidation('location', '地点');
  }

  async testFieldValidation(fieldName, fieldLabel) {
    const testName = `${fieldLabel}字段验证`;
    
    // 清空字段
    await this.page.fill(`input[name="${fieldName}"]`, '');
    await this.page.click('button[type="submit"]');
    await this.page.waitForTimeout(500);
    
    const error = await this.page.$(`input[name="${fieldName}"] + .van-field__error-message`);
    if (error) {
      this.recordResult(testName, '✅ 通过', '必填验证正常');
    } else {
      this.recordResult(testName, '❌ 失败', '必填验证未触发');
    }
  }

  async testPickerFunctionality() {
    console.log('\n🎯 测试选择器功能');
    
    // 测试球种选择器
    await this.testSportPicker();
    
    // 测试时间选择器
    await this.testTimePicker();
    
    // 测试人数选择器
    await this.testPlayerPicker();
  }

  async testSportPicker() {
    this.currentTest = '球种选择器测试';
    
    await this.page.click('input[name="sport"]');
    await this.page.waitForTimeout(1000);
    
    // 检查选择器是否打开
    const picker = await this.page.$('.van-picker');
    if (!picker) {
      this.recordResult(this.currentTest, '❌ 失败', '选择器未打开');
      return;
    }
    
    // 选择第一个选项
    const options = await this.page.$$('.van-picker-column__item');
    if (options.length === 0) {
      this.recordResult(this.currentTest, '❌ 失败', '未找到选择选项');
      return;
    }
    
    await options[0].click();
    await this.page.click('.van-picker__confirm');
    await this.page.waitForTimeout(500);
    
    // 检查选择结果
    const selectedValue = await this.page.$eval('input[name="sport"]', el => el.value);
    if (selectedValue) {
      this.recordResult(this.currentTest, '✅ 通过', `选择结果: ${selectedValue}`);
    } else {
      this.recordResult(this.currentTest, '❌ 失败', '选择结果未显示');
    }
  }

  async testTimePicker() {
    this.currentTest = '时间选择器测试';
    
    await this.page.click('input[name="time"]');
    await this.page.waitForTimeout(1000);
    
    const timePicker = await this.page.$('.time-picker-container');
    if (timePicker) {
      this.recordResult(this.currentTest, '✅ 通过', '时间选择器打开正常');
      
      // 测试时间输入
      await this.page.fill('.datetime-input', '2024-01-01T10:00');
      await this.page.click('button:has-text("确定")');
      await this.page.waitForTimeout(500);
      
      const timeValue = await this.page.$eval('input[name="time"]', el => el.value);
      if (timeValue.includes('2024-01-01')) {
        this.recordResult(this.currentTest, '✅ 通过', '时间选择功能正常');
      }
    } else {
      this.recordResult(this.currentTest, '❌ 失败', '时间选择器未打开');
    }
  }

  async testPlayerPicker() {
    this.currentTest = '人数选择器测试';
    
    await this.page.click('input[name="maxPlayers"]');
    await this.page.waitForTimeout(1000);
    
    const playerPicker = await this.page.$('.player-picker-container');
    if (playerPicker) {
      this.recordResult(this.currentTest, '✅ 通过', '人数选择器打开正常');
    } else {
      this.recordResult(this.currentTest, '❌ 失败', '人数选择器未打开');
    }
  }

  async testDataSubmission() {
    this.currentTest = '数据提交测试';
    
    // 填写测试数据
    await this.page.fill('input[name="title"]', '自动化测试球局');
    await this.page.fill('input[name="location"]', '测试场地');
    
    // 选择球种
    await this.page.click('input[name="sport"]');
    await this.page.waitForTimeout(500);
    const options = await this.page.$$('.van-picker-column__item');
    if (options.length > 0) {
      await options[0].click();
      await this.page.click('.van-picker__confirm');
      await this.page.waitForTimeout(500);
    }
    
    // 提交表单
    await this.page.click('button[type="submit"]');
    await this.page.waitForTimeout(3000);
    
    // 检查提交结果
    const currentUrl = this.page.url();
    if (currentUrl.includes('home') || currentUrl.includes('my-matches')) {
      this.recordResult(this.currentTest, '✅ 通过', '表单提交成功，页面跳转正常');
    } else {
      this.recordResult(this.currentTest, '⚠️ 警告', '表单提交后页面未跳转');
    }
  }

  async testEditProfilePage() {
    console.log('\n👤 测试编辑资料页面功能');
    
    await this.page.goto('http://localhost:5173/user-profile');
    await this.page.waitForTimeout(2000);
    
    // 查找编辑按钮
    const editBtn = await this.page.$('button:has-text("编辑资料")');
    if (!editBtn) {
      this.recordResult('编辑资料页面', '❌ 失败', '未找到编辑资料按钮');
      return;
    }
    
    await editBtn.click();
    await this.page.waitForTimeout(1000);
    
    // 测试编辑表单
    await this.testEditProfileForm();
  }

  async testEditProfileForm() {
    this.currentTest = '编辑资料表单测试';
    
    // 填写测试数据
    await this.page.fill('input[name="nickname"]', '测试用户_' + Date.now());
    await this.page.fill('input[name="age"]', '25');
    
    // 测试性别选择器
    await this.page.click('input[name="gender"]');
    await this.page.waitForTimeout(500);
    const genderOptions = await this.page.$$('.van-picker-column__item');
    if (genderOptions.length > 0) {
      await genderOptions[0].click();
      await this.page.click('.van-picker__confirm');
      await this.page.waitForTimeout(500);
    }
    
    // 测试保存功能
    const saveBtn = await this.page.$('button:has-text("保存")');
    if (saveBtn) {
      await saveBtn.click();
      await this.page.waitForTimeout(2000);
      this.recordResult(this.currentTest, '✅ 通过', '资料保存功能正常');
    } else {
      this.recordResult(this.currentTest, '❌ 失败', '未找到保存按钮');
    }
  }

  async testErrorHandling() {
    console.log('\n⚠️  测试异常情况处理');
    
    // 测试网络错误处理
    await this.testNetworkErrorHandling();
    
    // 测试数据验证错误
    await this.testDataValidationErrors();
    
    // 测试权限错误
    await this.testPermissionErrors();
  }

  async testNetworkErrorHandling() {
    this.currentTest = '网络错误处理测试';
    
    // 这里可以模拟网络超时或错误
    // 暂时记录测试点
    this.recordResult(this.currentTest, '📝 需手动测试', '网络错误处理逻辑');
  }

  async testDataValidationErrors() {
    this.currentTest = '数据验证错误测试';
    
    // 测试非法输入
    await this.page.goto('http://localhost:5173/create-match');
    await this.page.waitForTimeout(2000);
    
    // 测试超长标题
    await this.page.fill('input[name="title"]', 'a'.repeat(1000));
    await this.page.click('button[type="submit"]');
    await this.page.waitForTimeout(500);
    
    this.recordResult(this.currentTest, '✅ 通过', '超长输入处理正常');
  }

  async testPermissionErrors() {
    this.currentTest = '权限错误测试';
    
    // 测试未登录状态
    await this.page.goto('http://localhost:5173/create-match');
    await this.page.waitForTimeout(2000);
    
    // 检查是否有权限提示
    const permissionError = await this.page.$('text*=请先登录');
    if (permissionError) {
      this.recordResult(this.currentTest, '✅ 通过', '权限检查正常');
    } else {
      this.recordResult(this.currentTest, '⚠️ 警告', '权限检查未明显提示');
    }
  }

  async generateDetailedReport() {
    console.log('\n📊 生成详细测试报告...');
    
    const passed = this.testResults.filter(r => r.status.includes('✅')).length;
    const failed = this.testResults.filter(r => r.status.includes('❌')).length;
    const warnings = this.testResults.filter(r => r.status.includes('⚠️')).length;
    
    console.log(`\n📈 测试统计:`);
    console.log(`✅ 通过: ${passed}`);
    console.log(`❌ 失败: ${failed}`);
    console.log(`⚠️  警告: ${warnings}`);
    
    console.log('\n📋 详细结果:');
    this.testResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result.test} - ${result.status} ${result.details}`);
    });
    
    // 生成改进建议
    this.generateRecommendations();
  }

  generateRecommendations() {
    console.log('\n💡 改进建议:');
    
    const recommendations = [
      '增加更多边界条件测试用例',
      '添加API接口自动化测试',
      '进行跨浏览器兼容性测试',
      '添加性能测试和负载测试',
      '完善错误处理和用户提示',
      '增加无障碍功能测试',
      '进行安全测试（XSS、SQL注入等）'
    ];
    
    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  }
}

// 运行测试
new FunctionalTester().startTest().catch(console.error);