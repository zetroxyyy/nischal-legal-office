@AGENTS.md

## Repository notes

This repo is public with the client's explicit consent, and it is the only repo — there is no private mirror. Pushes to `main` auto-deploy to production on Vercel, so treat `main` as the live site.

Everything in `content/seed.json` and `public/images/` is client-approved published content — the practice name, advocate name, address, phone numbers, email, and all photography. It appears on the live website by design. Do not remove or redact any of it.

The only thing that must never be committed is a real credential: `.env`, `.env.local`, or a hardcoded key. These are already gitignored and none has ever been committed. Keep it that way.
