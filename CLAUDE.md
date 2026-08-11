@AGENTS.md

## Repository boundary — this repo is PUBLIC

This is client work for a real legal practice, published publicly with the client's explicit consent. It is the single active repository with no private mirror. Pushes to `main` automatically deploy to production on Vercel.

### Never commit
- `.env`, `.env.local`, or any file containing active credentials or secrets
- Anything under `_source/` — raw client photos, original documents, or unprocessed assets
- Real client or customer personal data: names, email addresses, phone numbers, case details, contact form submissions, or database exports containing sensitive user data
- Screenshots of the admin interface displaying real contact submissions or personal details
- Internal client business material: pricing agreements, invoices, contract documents, or private correspondence

### Intentionally public, do not remove
- The practice's business contact email and public telephone numbers in `content/seed.json` — this represents public NAP (Name, Address, Phone) data displayed on the live website
- All application source code, including `src/app/admin/**` administrative routes and `src/lib/auth.ts` security utilities

### Before every commit
- Run `git status` — verify that no file from the "never commit" list is staged
- Ensure no secret or credential is hardcoded, even temporarily or in scratch files
- For any ambiguous or uncertain file: exclude it and ask for clarification rather than committing it. A secret pushed to a public repository is compromised and requires immediate credential rotation.
