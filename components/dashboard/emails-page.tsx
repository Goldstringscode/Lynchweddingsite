"use client"

import { useState } from "react"
import { TemplateGallery } from "./template-gallery"
import { EmailBuilder } from "./email-builder"
import type { EmailTemplate } from "@/lib/email-types"
import { BLANK_TEMPLATE } from "@/lib/email-types"

export function EmailsPage() {
  const [editing, setEditing] = useState<EmailTemplate | null>(null)

  if (editing) {
    return (
      <EmailBuilder
        template={editing}
        onBack={() => setEditing(null)}
        onSent={() => setEditing(null)}
      />
    )
  }

  return (
    <TemplateGallery
      onSelect={(template) => setEditing(template)}
      onBlank={() => setEditing(BLANK_TEMPLATE)}
    />
  )
}