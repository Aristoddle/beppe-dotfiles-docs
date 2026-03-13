import DefaultTheme from 'vitepress/theme'
import './custom.css'
import { onMounted } from 'vue'
import {
  trackPageView,
  trackScrollDepth,
  trackCodeCopy,
  trackSidebarClick,
  trackOutboundClick,
  trackTimeOnPage,
} from './analytics'

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router }) {
    // ClickStack/HyperDX init on client-side only
    if (typeof window !== 'undefined') {
      import('@hyperdx/browser').then((HyperDX) => {
        HyperDX.default.init({
          apiKey: 'H06oX4xamF3QHsFN0hJn',
          service: 'beppe-dotfiles-docs',
          url: 'https://collector.exos-demo.com',
          consoleCapture: true,
          advancedNetworkCapture: true,
          // Session replay captures DOM interactions for playback
          disableReplay: false,
          // Don't mask text — this is a public docs site, nothing sensitive
          maskAllText: false,
          maskAllInputs: false,
        })

        // Restore user identity from localStorage if previously "logged in"
        const savedUser = localStorage.getItem('beppe-docs-user')
        if (savedUser) {
          const user = JSON.parse(savedUser)
          HyperDX.default.setGlobalAttributes({
            userId: user.id,
            userEmail: user.email,
            userName: user.name,
          })
        }

        // --- Page view tracking ---
        trackPageView(window.location.pathname)
        router.onAfterRouteChanged = (to: string) => {
          trackPageView(to)
        }

        // --- Time on page tracking ---
        let pageEntryTime = Date.now()
        let currentPage = window.location.pathname

        router.onBeforeRouteChange = (to: string) => {
          const seconds = Math.round((Date.now() - pageEntryTime) / 1000)
          if (seconds > 0) {
            trackTimeOnPage(currentPage, seconds)
          }
          pageEntryTime = Date.now()
          currentPage = to
        }

        // --- Scroll depth tracking (after DOM ready) ---
        const setupScrollTracking = () => {
          const thresholds = [0.25, 0.5, 0.75, 1.0]
          const reported = new Set<number>()

          const sentinel = document.createElement('div')
          sentinel.style.cssText = 'position:absolute;width:1px;height:1px;pointer-events:none;'

          const updateSentinels = () => {
            reported.clear()
            const contentEl = document.querySelector('.VPDoc .vp-doc') || document.body
            if (!contentEl.contains(sentinel)) {
              contentEl.appendChild(sentinel)
            }
          }

          const observer = new IntersectionObserver(
            (entries) => {
              // Use scroll position directly for reliable depth calculation
              const scrollTop = window.scrollY || document.documentElement.scrollTop
              const docHeight = Math.max(
                document.documentElement.scrollHeight - window.innerHeight,
                1,
              )
              const ratio = Math.min(scrollTop / docHeight, 1)

              for (const threshold of thresholds) {
                if (ratio >= threshold && !reported.has(threshold)) {
                  reported.add(threshold)
                  trackScrollDepth(window.location.pathname, threshold * 100)
                }
              }
            },
            { threshold: [0, 0.25, 0.5, 0.75, 1.0] },
          )

          // Track scroll via scroll event as primary method
          let scrollTick = false
          window.addEventListener('scroll', () => {
            if (scrollTick) return
            scrollTick = true
            requestAnimationFrame(() => {
              const scrollTop = window.scrollY || document.documentElement.scrollTop
              const docHeight = Math.max(
                document.documentElement.scrollHeight - window.innerHeight,
                1,
              )
              const ratio = Math.min(scrollTop / docHeight, 1)

              for (const threshold of thresholds) {
                if (ratio >= threshold && !reported.has(threshold)) {
                  reported.add(threshold)
                  trackScrollDepth(window.location.pathname, threshold * 100)
                }
              }
              scrollTick = false
            })
          })

          // Reset on route change
          const origAfterRoute = router.onAfterRouteChanged
          router.onAfterRouteChanged = (to: string) => {
            if (typeof origAfterRoute === 'function') origAfterRoute(to)
            updateSentinels()
          }

          updateSentinels()
        }

        // --- Code copy tracking ---
        const setupCodeCopyTracking = () => {
          document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement
            // VitePress code group copy button
            const copyBtn = target.closest('.vp-code-group button, button.copy')
            if (copyBtn) {
              const codeBlock = copyBtn.closest('.vp-code-group, div[class*="language-"]')
              const langClass = codeBlock
                ?.querySelector('pre')
                ?.className.match(/language-(\w+)/)
              const language = langClass ? langClass[1] : 'unknown'
              trackCodeCopy(language, window.location.pathname)
            }
          })

          // Also capture copy events on pre elements
          document.addEventListener('copy', (e) => {
            const selection = window.getSelection()
            if (selection && selection.anchorNode) {
              const pre = (selection.anchorNode as HTMLElement).closest
                ? (selection.anchorNode as HTMLElement).closest('pre')
                : (selection.anchorNode.parentElement as HTMLElement)?.closest('pre')
              if (pre) {
                const langClass = pre.className.match(/language-(\w+)/)
                const language = langClass ? langClass[1] : 'unknown'
                trackCodeCopy(language, window.location.pathname)
              }
            }
          })
        }

        // --- Sidebar click tracking ---
        const setupSidebarTracking = () => {
          document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement
            const sidebarLink = target.closest('.VPSidebar a, .VPSidebarItem a') as HTMLAnchorElement
            if (sidebarLink) {
              const section =
                sidebarLink.closest('.VPSidebarItem.level-0')?.querySelector('.text')
                  ?.textContent || 'unknown'
              const item = sidebarLink.textContent?.trim() || 'unknown'
              trackSidebarClick(section, item)
            }
          })
        }

        // --- Outbound link tracking ---
        const setupOutboundTracking = () => {
          document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement
            const link = target.closest('a[href^="http"]') as HTMLAnchorElement
            if (link && link.href && !link.href.startsWith(window.location.origin)) {
              trackOutboundClick(link.href, link.textContent?.trim() || '')
            }
          })
        }

        // --- Initialize all DOM-dependent tracking ---
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => {
            setupScrollTracking()
            setupCodeCopyTracking()
            setupSidebarTracking()
            setupOutboundTracking()
          })
        } else {
          setupScrollTracking()
          setupCodeCopyTracking()
          setupSidebarTracking()
          setupOutboundTracking()
        }
      })
    }
  },
}
