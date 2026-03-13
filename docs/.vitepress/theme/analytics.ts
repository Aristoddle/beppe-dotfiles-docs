import HyperDX from '@hyperdx/browser'

export function trackSearch(query: string, resultCount: number = 0) {
  HyperDX.default.addAction('Search-Query', { query, resultCount: String(resultCount) })
}

export function trackCodeCopy(language: string, page: string) {
  HyperDX.default.addAction('Code-Copy', { language, page })
}

export function trackScrollDepth(page: string, depth: number) {
  HyperDX.default.addAction('Scroll-Depth', { page, depth: String(depth) })
}

export function trackSidebarClick(section: string, item: string) {
  HyperDX.default.addAction('Sidebar-Click', { section, item })
}

export function trackOutboundClick(url: string, text: string) {
  HyperDX.default.addAction('Outbound-Click', { url, text })
}

export function trackTimeOnPage(page: string, seconds: number) {
  HyperDX.default.addAction('Time-On-Page', { page, seconds: String(seconds) })
}

export function trackPageView(page: string) {
  HyperDX.default.addAction('Page-View', { page, timestamp: new Date().toISOString() })
}
