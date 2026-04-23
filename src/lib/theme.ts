export function initTheme() {
  const stored = localStorage.getItem('dinner-spinner-theme')
  if (stored === 'light') return
  if (stored === 'dark' || window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark')
  }
}

export function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark')
  localStorage.setItem('dinner-spinner-theme', isDark ? 'dark' : 'light')
  return isDark
}

export function isDarkMode() {
  return document.documentElement.classList.contains('dark')
}

// Initialize on load
initTheme()
