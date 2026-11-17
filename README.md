# Osama Shahid — Portfolio

Senior Data Engineer portfolio. Interactive 3D data-stream hero (Three.js), buttery smooth scrolling (Lenis + GSAP ScrollTrigger), custom cursor, magnetic buttons, animated counters.

**Live:** https://osamazaidi.com

## Projects featured

- **sparklens** — https://sparklens.osamazaidi.com — client-side Spark event-log visualizer
- **sql-rag** — https://sql-rag.osamazaidi.com — natural-language to SQL studio
- **pharma-rag** — https://pharma-rag.osamazaidi.com — pharmaceutical Q&A over DailyMed drug labels
- **ps5-booking** — real-time slot booking platform
- **privatewire-vpn** — personal WireGuard VPN (Kotlin client + server provisioning)

## Structure

- `index.html` — page structure + content
- `css/style.css` — dark theme, glass cards, timeline, marquee
- `js/main.js` — smooth scroll, reveals, counters, cursor, nav
- `js/hero3d.js` — Three.js particle stream background (ES module)
- `assets/photo.jpg` — profile photo (compressed for web)
- `assets/Osama_Shahid_Resume.pdf` — current one-page CV

## Deploy

Static site, no build step. This repo is connected to the `osama-shahid-portfolio` Vercel project — every push to `main` auto-deploys to production at osamazaidi.com.
