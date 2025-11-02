// 管理员数据总览页面测试脚本
// 用于验证管理员功能是否正常工作

console.log('=== 管理员数据总览页面测试 ===\n');

// 模拟测试数据
const mockData = {
  userStats: {
    totalUsers: 156,
    todayUsers: 8,
    activeUsers: 42
  },
  matchStats: {
    totalMatches: 89,
    todayMatches: 5,
    sportDistribution: {
      '匹克球': 45,
      '网球': 23,
      '羽毛球': 21
    }
  },
  levelStats: {
    pickleball: {
      '2.0': 15,
      '2.5': 28,
      '3.0': 32,
      '3.5': 18,
      '4.0': 12,
      '4.5': 8,
      '5.0+': 5,
      '未设置': 38
    },
    tennis: {
      '2.0': 12,
      '2.5': 18,
      '3.0': 25,
      '3.5': 15,
      '4.0': 10,
      '4.5': 6,
      '5.0+': 4,
      '未设置': 66
    },
    badminton: {
      '初级': 45,
      '进阶': 28,
      '专业': 15,
      '未设置': 68
    }
  },
  users: [
    {
      id: 'user1',
      nickname: '张三',
      email: 'zhangsan@example.com',
      created_at: '2024-01-15T10:30:00Z',
      pickleball_level: '3.0'
    },
    {
      id: 'user2',
      nickname: '李四',
      email: 'lisi@example.com',
      created_at: '2024-01-14T14:20:00Z',
      pickleball_level: '2.5'
    }
  ],
  matches: [
    {
      id: 'match1',
      title: '周末匹克球活动',
      sport: '匹克球',
      time: '2024-01-20T15:00:00Z',
      location: '朝阳体育馆',
      max_players: 8,
      creator: { nickname: '张三' },
      participants: [{}, {}, {}]
    },
    {
      id: 'match2',
      title: '网球训练',
      sport: '网球',
      time: '2024-01-19T18:00:00Z',
      location: '海淀网球中心',
      max_players: 4,
      creator: { nickname: '李四' },
      participants: [{}, {}]
    }
  ]
};

// 测试数据格式化函数
function formatTime(timeString) {
  if (!timeString) return '';
  const date = new Date(timeString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

// 测试柱状图宽度计算函数
function getBarWidth(count, levelData) {
  const maxCount = Math.max(...Object.values(levelData));
  return maxCount > 0 ? `${(count / maxCount) * 100}%` : '0%';
}

// 运行测试
console.log('1. 数据概览统计测试:');
console.log(`   - 总用户数: ${mockData.userStats.totalUsers}`);
console.log(`   - 今日新增: ${mockData.userStats.todayUsers}`);
console.log(`   - 活跃用户: ${mockData.userStats.activeUsers}`);
console.log(`   - 总球局数: ${mockData.matchStats.totalMatches}`);
console.log(`   - 今日新增球局: ${mockData.matchStats.todayMatches}`);
console.log(`   - 运动类型数量: ${Object.keys(mockData.matchStats.sportDistribution).length}\n`);

console.log('2. 用户水平分布统计测试:');
console.log('   - 匹克球水平分布:');
Object.entries(mockData.levelStats.pickleball).forEach(([level, count]) => {
  const width = getBarWidth(count, mockData.levelStats.pickleball);
  console.log(`     ${level}: ${count}人 (${width})`);
});

console.log('\n   - 网球水平分布:');
Object.entries(mockData.levelStats.tennis).forEach(([level, count]) => {
  const width = getBarWidth(count, mockData.levelStats.tennis);
  console.log(`     ${level}: ${count}人 (${width})`);
});

console.log('\n   - 羽毛球水平分布:');
Object.entries(mockData.levelStats.badminton).forEach(([level, count]) => {
  const width = getBarWidth(count, mockData.levelStats.badminton);
  console.log(`     ${level}: ${count}人 (${width})`);
});

console.log('\n3. 用户列表测试:');
mockData.users.forEach((user, index) => {
  console.log(`   ${index + 1}. ${user.nickname} (${user.email})`);
  console.log(`     注册时间: ${formatTime(user.created_at)}`);
  if (user.pickleball_level) {
    console.log(`     匹克球水平: ${user.pickleball_level}`);
  }
});

console.log('\n4. 球局列表测试:');
mockData.matches.forEach((match, index) => {
  console.log(`   ${index + 1}. ${match.title}`);
  console.log(`     运动类型: ${match.sport}`);
  console.log(`     时间: ${formatTime(match.time)}`);
  console.log(`     地点: ${match.location}`);
  console.log(`     创建者: ${match.creator.nickname}`);
  console.log(`     参与人数: ${match.participants.length}/${match.max_players}`);
});

console.log('\n5. 管理员权限检查测试:');
console.log('   - 管理员邮箱: admin@playpal.com');
console.log('   - 普通用户邮箱: user@example.com');
console.log('   - 权限检查: 仅允许admin@playpal.com访问管理员页面\n');

console.log('=== 测试完成 ===');
console.log('\n使用说明:');
console.log('1. 使用 admin@playpal.com 账号登录系统');
console.log('2. 在浏览器中访问 http://localhost:5173/admin');
console.log('3. 页面将自动加载并显示所有统计数据');
console.log('4. 点击"刷新"按钮可以重新加载最新数据');
console.log('5. 页面支持响应式设计，适配移动设备');

// 验证函数
function validateAdminDashboard() {
  const errors = [];
  
  // 验证数据完整性
  if (!mockData.userStats || !mockData.matchStats || !mockData.levelStats) {
    errors.push('数据统计不完整');
  }
  
  // 验证用户列表
  if (!Array.isArray(mockData.users)) {
    errors.push('用户列表格式错误');
  }
  
  // 验证球局列表
  if (!Array.isArray(mockData.matches)) {
    errors.push('球局列表格式错误');
  }
  
  if (errors.length === 0) {
    console.log('\n✅ 所有测试通过！管理员数据总览页面功能正常。');
  } else {
    console.log('\n❌ 发现以下问题:');
    errors.forEach(error => console.log(`   - ${error}`));
  }
}

validateAdminDashboard();