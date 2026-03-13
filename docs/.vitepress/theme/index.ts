import DefaultTheme from 'vitepress/theme'
import './custom.css'
import { onMounted } from 'vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router }) {
    // ClickStack/HyperDX init on client-side only
    if (typeof window !== 'undefined') {
      import('@hyperdx/browser').then((HyperDX) => {
        HyperDX.default.init({
          apiKey: 'H06oX4xamF3QHsFN0hJn',
          service: 'beppe-dotfiles-docs',
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
      })
    }
  },
}
