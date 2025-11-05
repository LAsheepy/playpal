export class AvatarGenerator {
  // 灰色调色板（Apple风格）
  static GRAY_PALETTE = [
    '#8e8e93', '#aeaeb2', '#c7c7cc', '#d1d1d6', 
    '#e5e5ea', '#f2f2f7', '#6d6d72', '#48484a'
  ];
  
  // 生成稳定的背景色（基于用户ID）
  static generateBackgroundColor(userId, nickname) {
    const seed = userId || this.hashString(nickname);
    const index = Math.abs(seed) % this.GRAY_PALETTE.length;
    return this.GRAY_PALETTE[index];
  }
  
  // 字符串哈希函数
  static hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; // 转换为32位整数
    }
    return hash;
  }
  
  // 提取显示字符
  static extractDisplayChar(nickname) {
    if (!nickname || nickname.trim().length === 0) {
      return '?';
    }
    
    // 提取第一个字符（支持中文）
    const firstChar = nickname.trim().charAt(0);
    
    // 如果是英文，转换为大写
    if (/[a-zA-Z]/.test(firstChar)) {
      return firstChar.toUpperCase();
    }
    
    return firstChar;
  }
  
  // 生成头像（主要方法）
  static generateAvatar(nickname, userId, size = 80) {
    const cacheKey = `${userId}-${nickname}-${size}`;
    
    // 检查缓存
    const cached = this.getCachedAvatar(cacheKey);
    if (cached) {
      return cached;
    }
    
    // 创建Canvas
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // 绘制圆形背景
    const bgColor = this.generateBackgroundColor(userId, nickname);
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = bgColor;
    ctx.fill();
    
    // 绘制文字
    const displayChar = this.extractDisplayChar(nickname);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${size * 0.4}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(displayChar, size / 2, size / 2);
    
    // 转换为Data URL
    const dataUrl = canvas.toDataURL('image/png');
    
    // 缓存结果
    this.cacheAvatar(cacheKey, dataUrl);
    
    return dataUrl;
  }
  
  // 缓存管理
  static getCachedAvatar(key) {
    try {
      return localStorage.getItem(`avatar_${key}`);
    } catch (e) {
      return null;
    }
  }
  
  static cacheAvatar(key, dataUrl) {
    try {
      localStorage.setItem(`avatar_${key}`, dataUrl);
    } catch (e) {
      // 缓存失败不影响功能
    }
  }
  
  // 简单版本：直接返回字符和颜色（用于CSS实现）
  static getSimpleAvatar(nickname, userId) {
    return {
      char: this.extractDisplayChar(nickname),
      color: this.generateBackgroundColor(userId, nickname)
    };
  }
}