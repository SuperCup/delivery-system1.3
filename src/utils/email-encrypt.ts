/**
 * 邮箱加密工具函数
 */

/**
 * 加密邮箱显示
 * 规则：显示前3位字符，@符号前用*代替，保留@及后面的域名
 * 例如：277458535@qq.com -> 277***@qq.com
 */
export function encryptEmail(email: string): string {
  if (!email || !email.includes('@')) {
    return email
  }

  const [localPart, domain] = email.split('@')
  
  if (localPart.length <= 3) {
    // 如果@前部分长度小于等于3，全部用*代替
    return `${'*'.repeat(localPart.length)}@${domain}`
  }

  // 显示前3位，其余用*代替
  const visiblePart = localPart.substring(0, 3)
  const hiddenPart = '*'.repeat(localPart.length - 3)
  
  return `${visiblePart}${hiddenPart}@${domain}`
}

