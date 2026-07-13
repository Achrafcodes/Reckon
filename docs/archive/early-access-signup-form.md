# Archived: self-serve early-access signup form

Built, then not used. Access requests are now handled by direct contact
(a `mailto:` link — see `src/lib/contact.ts`) so the site owner can
manually vet and create accounts, rather than an automated "you'll get
an email at launch" list.

## What was removed

- `src/components/landing/EarlyAccessModal.tsx` — the modal component
  (email + optional first name, inline validation, success/error
  states). Deleted; recover from git history if needed
  (`git log --all --oneline -- src/components/landing/EarlyAccessModal.tsx`).
- All six call sites that opened it (landing navbar, final CTA, pricing
  card, onboarding steps, demo banner, demo header) now render a plain
  `mailto:` link instead (`ACCESS_MAILTO` from `src/lib/contact.ts`).

## What was kept

The backend is untouched and still fully functional — nothing was
deleted here, it's just unreferenced by the UI right now:

- `src/server/db/models/EarlyAccessSignup.ts` — Mongoose model, unique
  index on email.
- `src/schemas/early-access.ts` — Zod validation schema.
- `src/server/actions/early-access.ts` — `joinEarlyAccessAction`,
  rate-limited server action that writes to the collection above.

## Re-enabling the form later

If manual contact doesn't scale, restore `EarlyAccessModal.tsx` from
git history and swap the `mailto:` anchors back to it — the backend
pieces above need no changes, they were never touched.
