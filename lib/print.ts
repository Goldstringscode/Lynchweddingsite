/**
 * lib/print.ts — print exactly one section of the page.
 *
 * Instead of popup windows (broken by blockers) or visibility CSS (elements
 * still occupy layout space), we temporarily hide every <section>, <header>,
 * and <footer> except the one that contains `selector`.  After the print
 * dialog closes all hidden elements are restored.
 */

export interface PrintSectionOptions {
  title?: string  // unused – kept for API compatibility
  extraCss?: string
}

export function printSection(
  selector: string,
  _options: PrintSectionOptions = {}
): void {
  const target = document.querySelector<HTMLElement>(selector)
  if (!target) {
    console.error(`printSection: no element found for "${selector}"`)
    return
  }

  // Walk up to find the enclosing <section> (or the target itself if it's a section)
  let section: HTMLElement | null = target.closest('section')
  if (!section) {
    // Fallback: use the target itself
    section = target
  }

  // Collect everything we'll hide: all <section>, <header>, <footer>
  const toHide: HTMLElement[] = []
  const selectors = ['section', 'header', 'footer']
  for (const sel of selectors) {
    document.querySelectorAll(sel).forEach((el) => {
      if (el !== section && !section!.contains(el) && el instanceof HTMLElement) {
        toHide.push(el)
      }
    })
  }

  // Save original display values
  const originals = toHide.map((el) => el.style.display)

  // Hide everything except the target section
  toHide.forEach((el) => { el.style.display = 'none' })

  // Make the target section fill the page
  const origPosition = section.style.position
  const origTop = section.style.top
  const origLeft = section.style.left
  const origWidth = section.style.width
  const origMargin = section.style.margin

  section.style.position = 'static'
  section.style.top = 'auto'
  section.style.left = 'auto'
  section.style.width = '100%'
  section.style.margin = '0 auto'
  section.style.display = 'block'

  // Strip .no-print children inside the section
  const noPrintEls = section.querySelectorAll('.no-print')
  const noPrintOriginals: string[] = []
  noPrintEls.forEach((el) => {
    if (el instanceof HTMLElement) {
      noPrintOriginals.push(el.style.display)
      el.style.display = 'none'
    }
  })

  // Print
  const cleanup = () => {
    // Restore hidden elements
    toHide.forEach((el, i) => { el.style.display = originals[i] })
    // Restore section positioning
    section!.style.position = origPosition
    section!.style.top = origTop
    section!.style.left = origLeft
    section!.style.width = origWidth
    section!.style.margin = origMargin
    section!.style.display = ''
    // Restore .no-print children
    noPrintEls.forEach((el, i) => {
      if (el instanceof HTMLElement) el.style.display = noPrintOriginals[i]
    })
    window.removeEventListener('afterprint', cleanup)
  }

  window.addEventListener('afterprint', cleanup)
  window.print()

  // Fallback for browsers that don't fire afterprint
  setTimeout(cleanup, 2000)
}

export default printSection