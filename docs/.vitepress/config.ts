import { defineConfig } from 'vitepress'

const base =
  process.env.BASE_URL?.endsWith('/') ? process.env.BASE_URL : (process.env.BASE_URL ? `${process.env.BASE_URL}/` : '/beppe-system-bootstrap/')

export default defineConfig({
  title: 'Beppe System Bootstrap',
  description: 'Zero‑friction dotfiles with agents, secrets, and a modern CLI stack.',
  lang: 'en-US',
  base,
  head: [
    ['meta', { name: 'robots', content: 'noindex,nofollow' }],
    ['meta', { name: 'theme-color', content: '#111827' }]
  ],
  srcExclude: ['**/MULTI_PROJECT_SETUP.md'],
  lastUpdated: true,
  cleanUrls: true,
  themeConfig: {
    logo: '/favicon.ico',
    siteTitle: 'Beppe Dotfiles',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Quickstart', link: '/QUICKSTART' },
      { text: 'Setup', link: '/SETUP' },
      { text: 'Agents', link: '/CLAUDE_CODE_AGENTS_SKILLS' },
      { text: 'Troubleshooting', link: '/TROUBLESHOOTING' },
      {
        text: 'Version',
        items: [
          { text: 'bazzite', link: '/beppe-system-bootstrap/versions/bazzite/' },
          { text: 'main', link: '/beppe-system-bootstrap/versions/main/' }
        ]
      }
    ],
    sidebar: [
      {
        text: 'Onboarding',
        items: [
          { text: 'Landing', link: '/' },
          { text: 'Quickstart', link: '/QUICKSTART' },
          { text: 'Setup', link: '/SETUP' },
          { text: 'ChezMoi Guide', link: '/CHEZMOI_GUIDE' },
          { text: 'Using Bazzite', link: '/USING_BAZZITE' }
        ]
      },
      {
        text: 'Agents & Automation',
        items: [
          { text: 'Agents & Skills', link: '/CLAUDE_CODE_AGENTS_SKILLS' },
          { text: 'LLM Guide', link: '/LLM_GUIDE' },
          { text: 'Parallel Orchestration', link: '/PARALLEL_AGENT_ORCHESTRATION' }
        ]
      },
      {
        text: 'Architecture & Standards',
        items: [
          { text: 'Architecture', link: '/ARCHITECTURE' },
          { text: 'Dotfiles Standards', link: '/DOTFILES_STANDARDS' },
          { text: 'Platform Differences', link: '/PLATFORM_DIFFERENCES' }
        ]
      },
      {
        text: 'Ops & Troubleshooting',
        items: [
          { text: 'Troubleshooting', link: '/TROUBLESHOOTING' },
          { text: 'Recovery Quick Reference', link: '/RECOVERY_QUICK_REFERENCE' },
          { text: 'SSH Auth', link: '/SSH_AUTH' }
        ]
      },
      {
        text: 'Updates',
        items: [
          { text: 'Latest', link: '/updates/LATEST' },
          { text: 'Core Toolchain (2025-11-18)', link: '/updates/2025-11-18-core-toolchain' }
        ]
      }
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/Aristoddle/beppe-system-bootstrap' }],
    outline: [2, 3]
  }
})
