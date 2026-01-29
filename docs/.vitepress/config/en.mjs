import { defineConfig } from 'vitepress'

export const en = defineConfig({
  lang: "en-US",
  description: "MySpeed is a self-hosted speedtest analysis software that stores the speed of your internet for up to 30 days.",
  themeConfig: {
    nav: [
      { text: 'Frequently Asked Questions', link: 'faq' },
      {
        text: 'Setup',
        items: [
          { text: 'Linux', link: 'setup/linux' },
          { text: 'Windows', link: 'setup/windows' }
        ]
      },
      {
        text: 'Guides',
        items: [
          { text: 'Configuring a Reverse Proxy', link: 'guides/reverse-proxy' },
          { text: 'Setting up HTTPS', link: 'guides/https' },
          { text: 'Statistics & Charts', link: 'guides/statistics' },
          { text: 'Home Assistant', link: 'guides/homeassistant' }
        ]
      },
      { text: 'Troubleshooting', link: 'troubleshooting' },
      {
        text: 'Instructions',
        items: [
          { text: 'The Interface', link: 'instructions/main' },
          { text: 'Settings', link: 'instructions/settings' }
        ]
      }
    ]
  },
})
