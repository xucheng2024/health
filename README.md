# HealthOptix — site

Next.js (App Router) marketing site for HealthOptix.

## Commands

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run start    # production server after build
npm run lint
```

Deploy on [Vercel](https://vercel.com): connect the repo, leave **Root Directory** empty (app is at repository root).

## Zoho Invoice email

The internal quotations page can generate and email Zoho invoices when these server env vars are set:

```bash
ZOHO_CLIENT_ID=
ZOHO_CLIENT_SECRET=
ZOHO_REFRESH_TOKEN=
ZOHO_ORGANIZATION_ID=
```

Optional:

```bash
ZOHO_INVOICE_ADMIN_EMAIL=      # falls back to INTERNAL_SALES_EMAIL
ZOHO_INVOICE_PAYMENT_TERMS_DAYS=0
ZOHO_INVOICE_TAX_ID=           # only needed if quote tax should map to a Zoho tax
ZOHO_ACCOUNTS_URL=https://accounts.zoho.com
ZOHO_API_BASE_URL=https://www.zohoapis.com
```
