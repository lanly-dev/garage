import { chromium } from 'playwright-chromium'
import { compileFile } from 'pug'
import { injectScript } from './inject'

const ID = 'MEDIA_SESSION_CONTROLLER'

;(async () => {
  const browser = await chromium.launch({ headless: false, devtools: true })
  const context = await browser.newContext()
  await context.exposeBinding('setup', setupFn)
  await context.addInitScript({ content: 'window.setup()' })
  await context.addInitScript(injectScript)
  const page = await context.newPage()
  await page.goto('https://www.soundcloud.com')
})()

async function setupFn(source) {
  const { page } = source
  const html = compileFile('inject.pug')()
  await page.addStyleTag({ path: 'inject.css' })
  await page.evaluate(
    ({ html, ID }) => {
      window.addEventListener('DOMContentLoaded', () => {
        // console.log('Loaded!')
        if (document.body && !document.getElementById(ID)) {
          const div = document.createElement('div')
          div.innerHTML = html
          console.log(html)
          div.classList.add('playback-bar')
          div.setAttribute('id', ID)
          document.body.appendChild(div)
        }
      })
    },
    { html, ID }
  )
}
