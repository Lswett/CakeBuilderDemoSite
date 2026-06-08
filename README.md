# CakeBuilder Demo

Mobile-first static prototype for a premium custom cake builder demo.

## What is included

- Separate homepage, builder, checkout, and profile pages
- Guided cake design questionnaire with a 3D preview and preset decoration rules
- Live mock pricing in USD
- Estimated preparation time based on tiers, decorations, and complexity
- Mock checkout flow and fake request confirmation
- Mock user/profile area with test customer data
- No backend, payments, accounts, or third-party checkout

## Run locally

From this folder:

```powershell
python -m http.server 5173
```

Then open:

```text
http://localhost:5173
```

## Docker

```powershell
docker build -t cakebuilder-demo .
docker run --rm -p 8080:80 cakebuilder-demo
```

Then open:

```text
http://localhost:8080
```

## Free hosting

This is a static site, so it can be hosted on platforms such as Netlify, Vercel,
Cloudflare Pages, GitHub Pages, or Render static hosting. Use the project folder
as the publish directory.
