export const formatCurrency = (amount, locale = 'en-IN', currency = 'INR') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatDate = (dateString, options = {}) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  })
}

export const formatDateTime = (dateString, timeString) => {
  const date = new Date(`${dateString}T${timeString}`)
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const calculateROI = (revenue, cost) => {
  if (cost === 0) return 0
  return ((revenue - cost) / cost) * 100
}

export const calculateConversionRate = (converted, total) => {
  if (total === 0) return 0
  return (converted / total) * 100
}

export const generateId = (prefix = 'ID') => {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`
}

export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export const getInitials = (name) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const getStatusColor = (status) => {
  const colors = {
    active: 'green',
    planned: 'blue',
    completed: 'gray',
    paused: 'amber',
    new: 'blue',
    contacted: 'purple',
    qualified: 'cyan',
    converted: 'green',
    lost: 'red',
  }
  return colors[status] || 'gray'
}

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePhone = (phone) => {
  const re = /^\+?[\d\s-]{10,15}$/
  return re.test(phone)
}
