/**
 * lib/print.ts — DOM-isolation print helper.
 *
 * Clones the target element into a brand-new window that contains ONLY that
 * element plus every stylesheet from the parent document, guaranteeing that
 * nothing else appears in the print output.
 */
function collectStyles(): string {
  const parts: string[] = []

  for (const sheet of Array.from(document.styleSheets)) {
    let inlined = false
    try {
      if (sheet.cssRules && sheet.cssRules.length > 0) {
        const cssText = Array.from(sheet.cssRules)
          .map((rule) => rule.cssText)
          .join("\n")
        parts.push(`<style>${cssText}</style>`)
        inlined = true
      }
    } catch {
      inlined = false
    }

    if (!inlined && sheet.href) {
      parts.push(
        `<link rel="stylesheet" href="${escapeAttr(sheet.href)}" crossorigin="anonymous">`
      )
    }
  }

  // Also copy any <link rel="stylesheet"> nodes directly from DOM
  const linkNodes = document.querySelectorAll<HTMLLinkElement>(
    'link[rel="stylesheet"], link[as="style"]'
  )
  for (const link of Array.from(linkNodes)) {
    if (link.href) {
      parts.push(
        `<link rel="stylesheet" href="${escapeAttr(link.href)}" crossorigin="anonymous">`
      )
    }
  }

  // Copy font preconnects/preloads so custom fonts resolve fast
  const fontLinks = document.querySelectorAll<HTMLLinkElement>(
    'link[rel="preconnect"], link[rel="preload"][as="font"], link[rel="dns-prefetch"]'
  )
  for (const link of Array.from(fontLinks)) {
    parts.push(link.outerHTML)
  }

  return parts.join("\n")
}

/** Copy CSS custom properties from :root and <body> into the print window. */
function collectRootCustomProps(): string {
  const blocks: string[] = []

  for (const { selector, el } of [
    { selector: "html", el: document.documentElement },
    { selector: "body", el: document.body },
  ]) {
    if (!el) continue
    const computed = getComputedStyle(el)
    const decls: string[] = []

    for (let i = 0; i < computed.length; i++) {
      const prop = computed[i]
      if (prop.startsWith("--")) {
        const value = computed.getPropertyValue(prop)
        if (value) decls.push(`${prop}: ${value.trim()};`)
      }
    }

    const fontFamily = computed.getPropertyValue("font-family")
    if (fontFamily) decls.push(`font-family: ${fontFamily};`)
    const colorScheme = computed.getPropertyValue("color-scheme")
    if (colorScheme) decls.push(`color-scheme: ${colorScheme};`)

    if (decls.length > 0) {
      blocks.push(`${selector} { ${decls.join(" ")} }`)
    }
  }

  return blocks.join("\n")
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function captureAnchorStyles(el: HTMLElement): string {
  const computed = getComputedStyle(el)
  return `background-color:${computed.backgroundColor};color:${computed.color};`
}

export interface PrintSectionOptions {
  title?: string
  extraCss?: string
}

/**
 * Clone `selector` into a new window, replicate all styles, and print it.
 * Falls back to a plain `window.print()` if a popup blocker prevents the new
 * window from opening.
 */
export function printSection(
  selector: string,
  options: PrintSectionOptions = {}
): void {
  const { title = document.title, extraCss = "" } = options

  const target = document.querySelector<HTMLElement>(selector)
  if (!target) {
    console.error(`printSection: no element found for selector "${selector}"`)
    return
  }

  // Deep clone the target
  const clone = target.cloneNode(true) as HTMLElement
  // Strip all .no-print elements from the clone so buttons don't appear in printout
  clone.querySelectorAll(".no-print").forEach((el) => el.remove())
  clone.style.position = "static"
  clone.style.margin = "0 auto"
  clone.style.top = "auto"
  clone.style.left = "auto"

  const styles = collectStyles()
  const rootProps = collectRootCustomProps()
  const anchorStyles = captureAnchorStyles(target)

  const printReset = `
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100%;
      background: transparent;
    }
    body {
      display: block;
      padding: 16px !important;
      box-sizing: border-box;
      ${anchorStyles}
    }
    #__print_root__ {
      width: 100%;
      max-width: 900px;
      margin: 0 auto;
    }
    #__print_root__ svg {
      max-width: 100%;
      height: auto;
      shape-rendering: crispEdges;
    }
    @page {
      margin: 12mm;
    }
    ${rootProps}
    ${extraCss}
  `

  // Open the new window
  const printWindow = window.open("", "_blank", "width=900,height=1200")

  if (!printWindow || printWindow.closed) {
    alert(
      "Your browser blocked the print window.\n\n" +
        "Please allow pop-ups for this site and try again for a clean ticket printout."
    )
    window.print()
    return
  }

  const html = `<!DOCTYPE html>
<html lang="${escapeAttr(document.documentElement.lang || "en")}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeAttr(title)}</title>
  ${styles}
  <style>${printReset}</style>
</head>
<body class="${escapeAttr(document.body.className)}">
  <div id="__print_root__">${clone.outerHTML}</div>
</body>
</html>`

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()

  const triggerPrint = () => {
    if ((printWindow as any).__printed__) return
    ;(printWindow as any).__printed__ = true

    printWindow.focus()

    const doPrint = () => {
      try {
        printWindow.print()
      } catch { /* ignore */ }
    }

    const fontsReady =
      printWindow.document.fonts && printWindow.document.fonts.ready
        ? printWindow.document.fonts.ready
        : Promise.resolve()

    Promise.resolve(fontsReady)
      .catch(() => undefined)
      .finally(() => {
        printWindow.setTimeout(doPrint, 60)
      })
  }

  const cleanup = () => {
    printWindow.setTimeout(() => {
      if (!printWindow.closed) printWindow.close()
    }, 300)
  }

  printWindow.onafterprint = cleanup

  if (printWindow.document.readyState === "complete") {
    triggerPrint()
  } else {
    printWindow.onload = triggerPrint
    printWindow.setTimeout(triggerPrint, 800)
  }

  // Mobile Safari safety net — close window after 60s if still open
  window.setTimeout(() => {
    if (!printWindow.closed) {
      try { printWindow.close() } catch { /* ignore */ }
    }
  }, 60_000)
}

export default printSection