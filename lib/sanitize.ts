/**
 * Reusable field sanitization for API route handlers.
 *
 * Prevents mass-assignment vulnerabilities by whitelisting only
 * the fields each endpoint is allowed to write. Optional type
 * validators reject malformed payloads before they reach the DB.
 *
 * @example
 *   // Only allow `check_in` (must be boolean)
 *   const result = sanitizeFields(body, {
 *     check_in: { type: 'boolean', required: false },
 *   })
 *   if (result.error) return NextResponse.json({ error: result.error }, { status: 400 })
 *   // → result.data = { check_in: true | false }
 */

type AllowedType = 'string' | 'number' | 'boolean' | 'string-or-null' | 'number-or-null';

interface FieldRule {
  /** Expected JavaScript type. Accepts `'string-or-null'` and `'number-or-null'` for optional nullable fields. */
  type: AllowedType;
  /** If `true`, the field MUST be present in the body (defaults to `false`). */
  required?: boolean;
}

type Schema = Record<string, FieldRule>;

interface SanitizeResult {
  data: Record<string, unknown> | null;
  error: string | null;
}

// ------------------------------------------------------------------ helpers
function checkType(value: unknown, type: AllowedType): boolean {
  switch (type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && !Number.isNaN(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'string-or-null':
      return typeof value === 'string' || value === null || value === undefined;
    case 'number-or-null':
      return (typeof value === 'number' && !Number.isNaN(value)) || value === null || value === undefined;
    default:
      return false;
  }
}

// ------------------------------------------------------------------ public API

/**
 * Validate and sanitize an incoming request body against a schema.
 *
 * - Drops any field NOT listed in `schema` (whitelist approach).
 * - Returns an error string for type mismatches or missing required fields.
 * - Never mutates the original `body`.
 */
export function sanitizeFields(body: Record<string, unknown>, schema: Schema): SanitizeResult {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { data: null, error: 'Request body must be a JSON object' };
  }

  const cleaned: Record<string, unknown> = {};

  for (const [field, rule] of Object.entries(schema)) {
    const value = body[field];

    // --- required check ---
    if (rule.required && (value === undefined || value === null)) {
      return { data: null, error: `"${field}" is required` };
    }

    // --- skip absent optional fields ---
    if (value === undefined) {
      continue;
    }

    // --- type check ---
    if (!checkType(value, rule.type)) {
      const expected = rule.type.replace('-or-null', ' | null');
      return { data: null, error: `"${field}" must be of type ${expected}, got ${typeof value}` };
    }

    cleaned[field] = value;
  }

  return { data: cleaned, error: null };
}

// ------------------------------------------------------------------ schema presets

/**
 * Fields that can be updated via `PATCH /api/rsvp/[id]`.
 * Currently only the check-in toggle, but easily extended.
 */
export const rsvpPatchSchema: Schema = {
  check_in: { type: 'boolean', required: false },
  // Future: is_attending: { type: 'boolean', required: false },
  // Future: meal_choice: { type: 'string-or-null', required: false },
  // Future: dietary: { type: 'string-or-null', required: false },
};

/**
 * Fields that can be created via `POST /api/vendors`.
 */
export const vendorCreateSchema: Schema = {
  name: { type: 'string', required: true },
  category: { type: 'string', required: true },
  contact: { type: 'string-or-null', required: false },
  phone: { type: 'string-or-null', required: false },
  email: { type: 'string-or-null', required: false },
  fee: { type: 'number-or-null', required: false },
  status: { type: 'string', required: false },
  notes: { type: 'string-or-null', required: false },
};

/**
 * Fields that can be created via `POST /api/invoices`.
 */
export const invoiceCreateSchema: Schema = {
  vendor: { type: 'string', required: true },
  amount: { type: 'number', required: true },
  due_date: { type: 'string', required: true },
  status: { type: 'string', required: false },
  notes: { type: 'string-or-null', required: false },
};