// 创建球局功能测试脚本
const { chromium } = require('playwright');

async function testCreateMatchFunctionality() {
  console.log('🚀 开始测试创建球局功能...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 1. 打开应用
    console.log('📱 打开应用...');
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);
    
    // 2. 检查登录状态，如果未登录则先登录
    console.log('🔐 检查登录状态...');
    const loginButton = page.locator('text=登录');
    if (await loginButton.isVisible()) {
      console.log('👤 需要登录，执行登录流程...');
      await loginButton.click();
      await page.waitForTimeout(1000);
      
      // 使用测试账号登录
      await page.fill('input[type="email"]', 'test@playpal.com');
      await page.fill('input[type="password"]', 'test123456');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    }
    
    // 3. 导航到创建球局页面
    console.log('📍 导航到创建球局页面...');
    await page.click('text=创建球局');
    await page.waitForTimeout(2000);
    
    // 4. 测试球种选择功能
    console.log('🏓 测试球种选择功能...');
    await page.click('text=请选择球种');
    await page.waitForTimeout(1000);
    
    // 选择匹克球
    await page.click('.van-picker-column >> text=匹克球');
    await page.click('button:has-text("确定")');
    await page.waitForTimeout(1000);
    
    // 验证球种选择
    const sportField = page.locator('input[name="sport"]');
    const sportValue = await sportField.inputValue();
    console.log(`✅ 球种选择: ${sportValue}`);
    
    // 5. 测试时间选择功能
    console.log('⏰ 测试时间选择功能...');
    await page.click('text=请选择时间');
    await page.waitForTimeout(1000);
    
    // 选择未来时间（明天同一时间）
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const timeString = tomorrow.toISOString().slice(0, 16);
    
    await page.fill('input[type="datetime-local"]', timeString);
    await page.click('button:has-text("确定")');
    await page.waitForTimeout(1000);
    
    // 验证时间选择
    const timeField = page.locator('input[name="time"]');
    const timeValue = await timeField.inputValue();
    console.log(`✅ 时间选择: ${timeValue}`);
    
    // 6. 测试人数上限设置功能
    console.log('👥 测试人数上限设置功能...');
    await page.click('text=请选择人数上限');
    await page.waitForTimeout(1000);
    
    // 设置人数为6人
    await page.click('.van-stepper__plus');
    await page.click('.van-stepper__plus');
    await page.click('button:has-text("确定")');
    await page.waitForTimeout(1000);
    
    // 验证人数选择
    const playerField = page.locator('input[name="maxPlayers"]');
    const playerValue = await playerField.inputValue();
    console.log(`✅ 人数上限: ${playerValue}`);
    
    // 7. 填写其他必填字段
    console.log('📝 填写其他必填字段...');
    await page.fill('input[name="title"]', '测试球局 - 功能验证');
    await page.fill('input[name="location"]', '测试场地 - 体育馆A');
    await page.fill('textarea', '这是一个功能测试球局，用于验证创建球局的完整流程');
    
    // 8. 提交表单
    console.log('📤 提交创建球局表单...');
    await page.click('button:has-text("创建球局")');
    await page.waitForTimeout(3000);
    
    // 9. 验证提交结果
    const successToast = page.locator('.van-toast--success');
    if (await successToast.isVisible()) {
      console.log('🎉 创建球局成功！');
      
      // 检查是否跳转到球局详情页
      const currentUrl = page.url();
      if (currentUrl.includes('/match/')) {
        console.log('✅ 成功跳转到球局详情页面');
      } else {
        console.log('⚠️ 未跳转到球局详情页面，当前URL:', currentUrl);
      }
    } else {
      console.log('❌ 创建球局失败，请检查错误信息');
      
      // 检查错误提示
      const errorToast = page.locator('.van-toast--fail');
      if (await errorToast.isVisible()) {
        const errorText = await errorToast.textContent();
        console.log(`❌ 错误信息: ${errorText}`);
      }
    }
    
    // 10. 测试边界情况
    console.log('\n🔬 测试边界情况...');
    
    // 测试空标题
    await page.goto('http://localhost:5173/create-match');
    await page.waitForTimeout(2000);
    
    await page.click('text=请选择球种');
    await page.click('.van-picker-column >> text=网球');
    await page.click('button:has-text("确定")');
    
    await page.click('text=请选择时间');
    await page.fill('input[type="datetime-local"]', timeString);
    await page.click('button:has-text("确定")');
    
    await page.click('text=请选择人数上限');
    await page.click('button:has-text("确定")');
    
    await page.fill('input[name="location"]', '测试场地');
    
    // 提交空标题的表单
    await page.click('button:has-text("创建球局")');
    await page.waitForTimeout(2000);
    
    const validationToast = page.locator('.van-toast');
    if (await validationToast.isVisible()) {
      console.log('✅ 表单验证正常工作');
    }
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error);
  } finally {
    await browser.close();
    console.log('\n🏁 测试完成');
  }
}

// 运行测试
testCreateMatchFunctionality().catch(console.error);