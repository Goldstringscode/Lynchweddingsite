"use client"

export function printSection(mode: "print-ticket" | "print-invitation") {
  const body = document.body
  body.classList.add(mode)

  const cleanup = () => {
    body.classList.remove(mode)
    window.removeEventListener("afterprint", cleanup)
  }
  window.addEventListener("afterprint", cleanup)

  window.print()

  // Fallback for browsers that don't fire afterprint (mobile Safari)
  setTimeout(cleanup, 1000)
}