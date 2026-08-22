/**
 * lib/print.ts — print exactly ONE section of the page.
 *
 * Uses a hidden in-page <iframe> (NOT a popup window) to isolate the
 * content.  All stylesheets from the parent document are copied in so
 * Tailwind, custom fonts, and CSS variables render identically.
 *
 * This avoids the three failure modes we hit before:
 *   1. Popup blocker → "print window blocked" alert
 *   2. display:none → browser hasn't reflowed yet → still prints everything
 *   3. visibility:hidden → hidden elements still occupy layout space → blank pages
 */

export interface PrintSectionOptions {
  title?: string
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function printSection(selector: string, options: PrintSectionOptions = {}): void {
  const { title = document.title } = options

  const target = document.querySelector<HTMLElement>(selector)
  if (!target) {
    console.error('printSection: no element found for "' + selector + '"')
    return
  }

  // Deep clone so we don't disturb the live DOM
  const clone = target.cloneNode(true) as HTMLElement
  clone.querySelectorAll('.no-print').forEach(el => el.remove())

  // Collect all stylesheets from the parent document
  const styles: string[] = []
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      if (sheet.cssRules && sheet.cssRules.length > 0) {
        const cssText = Array.from(sheet.cssRules).map(r => r.cssText).join('\n')
        styles.push('<style>' + cssText + '</style>')
      }
    } catch {
      if (sheet.href) {
        styles.push('<link rel="stylesheet" href="' + escapeAttr(sheet.href) + '" crossorigin="anonymous">')
      }
    }
  }

  // Copy CSS custom properties from :root
  const rootProps: string[] = []
  if (document.documentElement) {
    const cs = getComputedStyle(document.documentElement)
    for (let i = 0; i < cs.length; i++) {
      const prop = cs[i]
      if (prop.startsWith('--')) {
        rootProps.push(prop + ': ' + cs.getPropertyValue(prop).trim() + ';')
      }
    }
  }

  const html = '<!DOCTYPE html>\n' +
    '<html lang="' + escapeAttr(document.documentElement.lang || 'en') + '">\n' +
    '<head>\n' +
    '  <meta charset="utf-8">\n' +
    '  <title>' + escapeAttr(title) + '</title>\n' +
    '  ' + styles.join('\n  ') + '\n' +
    '  <style>\n' +
    '    :root { ' + rootProps.join(' ') + ' }\n' +
    '    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }\n' +
    '    html, body { margin: 0; padding: 16px; width: 100%; box-sizing: border-box; }\n' +
    '    #__print_root__ { width: 100%; max-width: 900px; margin: 0 auto; }\n' +
    '    #__print_root__ svg { max-width: 100%; height: auto; }\n' +
    '    @page { margin: 12mm; }\n' +
    '  </style>\n' +
    '</head>\n' +
    '<body>\n' +
    '  <div id="__print_root__">' + clone.outerHTML + '</div>\n' +
    '</body>\n' +
    '</html>'

  // Create a hidden iframe — NOT a popup, so blockers don't interfere
  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.top = '0'
  iframe.style.left = '0'
  iframe.style.width = '1px'
  iframe.style.height = '1px'
  iframe.style.opacity = '0'
  iframe.style.pointerEvents = 'none'
  iframe.style.border = 'none'
  iframe.setAttribute('title', 'Print frame')
  document.body.appendChild(iframe)

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
  if (!iframeDoc) {
    document.body.removeChild(iframe)
    alert('Unable to generate print preview. Please try again.')
    return
  }

  iframeDoc.open()
  iframeDoc.write(html)
  iframeDoc.close()

  // Wait for fonts + layout, then print
  const doPrint = () => {
    try {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
    } catch { /* ignore */ }
  }

  const fontsReady = iframeDoc.fonts?.ready || Promise.resolve()
  Promise.resolve(fontsReady)
    .catch(() => undefined)
    .finally(() => {
      // Small delay so the layout engine paints
      setTimeout(doPrint, 100)
    })

  // Cleanup after print dialog closes
  const cleanup = () => {
    setTimeout(() => {
      if (iframe.parentNode) document.body.removeChild(iframe)
    }, 500)
    // Detach both listeners
    iframe.contentWindow?.removeEventListener('afterprint', cleanup)
    window.removeEventListener('afterprint', cleanup)
  }

  // Primary: listen on the iframe's own window (Chrome/Firefox)
  iframe.contentWindow?.addEventListener('afterprint', cleanup)
  // Fallback: some browsers fire afterprint on the parent window
  window.addEventListener('afterprint', cleanup)

  // Fallback cleanup for mobile Safari (doesn't always fire afterprint)
  setTimeout(cleanup, 120_000)
}

export default printSection