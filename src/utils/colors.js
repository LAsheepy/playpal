// 全局标签颜色配置
export const SPORT_COLORS = {
  '匹克球': '#3b82f6', // 蓝色
  '网球': '#10b981',    // 绿色  
  '羽毛球': '#f59e0b'   // 黄色
}

export const LEVEL_COLORS = {
  '初级': '#6b7280',    // 灰色
  '进阶': '#f97316',    // 橙色
  '专业': '#ef4444',    // 红色
  '2.0': '#6b7280',    // 灰色
  '2.5': '#6b7280',    // 灰色
  '3.0': '#f97316',    // 橙色
  '3.5': '#f97316',    // 橙色
  '4.0': '#ef4444',    // 红色
  '4.5': '#ef4444',    // 红色
  '5.0+': '#ef4444'    // 红色
}

export const LEVEL_TEXT_COLORS = {
  '初级': '#ffffff',    // 白色
  '进阶': '#ffffff',    // 白色
  '专业': '#ffffff',    // 白色
  '2.0': '#ffffff',     // 白色
  '2.5': '#ffffff',     // 白色
  '3.0': '#ffffff',     // 白色
  '3.5': '#ffffff',     // 白色
  '4.0': '#ffffff',     // 白色
  '4.5': '#ffffff',     // 白色
  '5.0+': '#ffffff'     // 白色
}

// 获取球种颜色
export const getSportColor = (sport) => {
  return SPORT_COLORS[sport] || '#6b7280'
}

// 获取水平颜色
export const getLevelColor = (level) => {
  return LEVEL_COLORS[level] || '#6b7280'
}

// 获取水平文字颜色
export const getLevelTextColor = (level) => {
  return LEVEL_TEXT_COLORS[level] || '#ffffff'
}