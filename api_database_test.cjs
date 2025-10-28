/**
 * API和数据库测试脚本
 * 测试创建球局和编辑资料页面的数据保存逻辑
 */

const axios = require('axios');

class ApiDatabaseTester {
  constructor() {
    this.baseURL = 'http://localhost:5173';
    this.testResults = [];
  }

  async runAllTests() {
    console.log('🔧 开始API和数据库测试...\n');
    
    try {
      // 1. 测试API端点可用性
      await this.testApiEndpoints();
      
      // 2. 测试数据验证逻辑
      await this.testDataValidation();
      
      // 3. 测试数据库操作
      await this.testDatabaseOperations();
      
      // 4. 测试错误处理
      await this.testErrorHandling();
      
      // 5. 生成测试报告
      await this.generateApiTestReport();
      
    } catch (error) {
      console.error('测试执行失败:', error);
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

  async testApiEndpoints() {
    console.log('🌐 测试API端点可用性');
    
    const endpoints = [
      { name: '获取球局列表', path: '/api/matches', method: 'GET' },
      { name: '创建球局', path: '/api/matches', method: 'POST' },
      { name: '获取用户资料', path: '/api/user/profile', method: 'GET' },
      { name: '更新用户资料', path: '/api/user/profile', method: 'PUT' }
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios({
          method: endpoint.method.toLowerCase(),
          url: `${this.baseURL}${endpoint.path}`,
          timeout: 5000
        });
        
        this.recordResult(endpoint.name, '✅ 通过', `状态码: ${response.status}`);
      } catch (error) {
        if (error.response) {
          this.recordResult(endpoint.name, '⚠️ 警告', `状态码: ${error.response.status}`);
        } else if (error.code === 'ECONNREFUSED') {
          this.recordResult(endpoint.name, '❌ 失败', 'API服务未启动');
        } else {
          this.recordResult(endpoint.name, '❌ 失败', error.message);
        }
      }
    }
  }

  async testDataValidation() {
    console.log('\n📋 测试数据验证逻辑');
    
    // 测试创建球局数据验证
    const invalidMatchData = [
      { title: '', sport: '匹克球', time: '2024-01-01T10:00', location: '测试场地' },
      { title: '测试球局', sport: '', time: '2024-01-01T10:00', location: '测试场地' },
      { title: '测试球局', sport: '匹克球', time: '', location: '测试场地' },
      { title: '测试球局', sport: '匹克球', time: '2024-01-01T10:00', location: '' }
    ];
    
    for (let i = 0; i < invalidMatchData.length; i++) {
      const data = invalidMatchData[i];
      try {
        await axios.post(`${this.baseURL}/api/matches`, data);
        this.recordResult(`数据验证测试${i + 1}`, '❌ 失败', '无效数据被接受');
      } catch (error) {
        if (error.response && error.response.status === 400) {
          this.recordResult(`数据验证测试${i + 1}`, '✅ 通过', '数据验证正常');
        } else {
          this.recordResult(`数据验证测试${i + 1}`, '⚠️ 警告', error.message);
        }
      }
    }
  }

  async testDatabaseOperations() {
    console.log('\n💾 测试数据库操作');
    
    // 测试创建球局
    const matchData = {
      title: '自动化测试球局',
      sport: '匹克球',
      time: '2024-01-01T10:00',
      location: '测试场地',
      maxPlayers: 4,
      description: '这是自动化测试创建的球局'
    };
    
    try {
      const createResponse = await axios.post(`${this.baseURL}/api/matches`, matchData);
      
      if (createResponse.status === 201) {
        this.recordResult('创建球局操作', '✅ 通过', '球局创建成功');
        
        // 验证数据是否正确保存
        const matchId = createResponse.data.id;
        const getResponse = await axios.get(`${this.baseURL}/api/matches/${matchId}`);
        
        if (getResponse.data.title === matchData.title) {
          this.recordResult('数据保存验证', '✅ 通过', '数据正确保存到数据库');
        } else {
          this.recordResult('数据保存验证', '❌ 失败', '保存的数据不匹配');
        }
      }
    } catch (error) {
      this.recordResult('创建球局操作', '❌ 失败', error.message);
    }
    
    // 测试更新用户资料
    const profileData = {
      nickname: '测试用户_' + Date.now(),
      gender: '男',
      age: 25,
      pickleballLevel: '中级',
      tennisLevel: '初级',
      badmintonLevel: '高级'
    };
    
    try {
      const updateResponse = await axios.put(`${this.baseURL}/api/user/profile`, profileData);
      
      if (updateResponse.status === 200) {
        this.recordResult('更新用户资料', '✅ 通过', '用户资料更新成功');
        
        // 验证资料是否正确更新
        const getProfileResponse = await axios.get(`${this.baseURL}/api/user/profile`);
        
        if (getProfileResponse.data.nickname === profileData.nickname) {
          this.recordResult('资料更新验证', '✅ 通过', '用户资料正确更新');
        }
      }
    } catch (error) {
      this.recordResult('更新用户资料', '❌ 失败', error.message);
    }
  }

  async testErrorHandling() {
    console.log('\n⚠️  测试错误处理机制');
    
    // 测试不存在的端点
    try {
      await axios.get(`${this.baseURL}/api/nonexistent`);
      this.recordResult('404错误处理', '❌ 失败', '不存在的端点未返回404');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        this.recordResult('404错误处理', '✅ 通过', '404错误处理正常');
      }
    }
    
    // 测试服务器错误
    try {
      await axios.get(`${this.baseURL}/api/error-test`);
      this.recordResult('500错误处理', '❌ 失败', '服务器错误未正确处理');
    } catch (error) {
      if (error.response && error.response.status === 500) {
        this.recordResult('500错误处理', '✅ 通过', '服务器错误处理正常');
      }
    }
    
    // 测试超时处理
    try {
      await axios.get(`${this.baseURL}/api/slow-endpoint`, { timeout: 1000 });
      this.recordResult('超时处理', '❌ 失败', '超时未正确处理');
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        this.recordResult('超时处理', '✅ 通过', '超时处理正常');
      }
    }
  }

  async generateApiTestReport() {
    console.log('\n📊 生成API测试报告...');
    
    const passed = this.testResults.filter(r => r.status.includes('✅')).length;
    const failed = this.testResults.filter(r => r.status.includes('❌')).length;
    const warnings = this.testResults.filter(r => r.status.includes('⚠️')).length;
    
    console.log(`\n📈 API测试统计:`);
    console.log(`✅ 通过: ${passed}`);
    console.log(`❌ 失败: ${failed}`);
    console.log(`⚠️  警告: ${warnings}`);
    
    console.log('\n📋 API测试详细结果:');
    this.testResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result.test} - ${result.status} ${result.details}`);
    });
    
    // 生成API测试建议
    this.generateApiRecommendations();
  }

  generateApiRecommendations() {
    console.log('\n💡 API测试改进建议:');
    
    const recommendations = [
      '增加更多API端点测试覆盖率',
      '添加API性能测试',
      '进行API安全测试',
      '添加API文档验证',
      '进行负载测试和压力测试',
      '添加API版本兼容性测试',
      '完善API错误码和错误信息'
    ];
    
    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  }
}

// 运行API测试
new ApiDatabaseTester().runAllTests().catch(console.error);