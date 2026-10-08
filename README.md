# IQRA Model School

A responsive school website for kindergarten, nursery and primary education in Akure, Ondo State. Brand details, admissions year, address and phone numbers come from the supplied school posters. Green colours follow the pupils' real uniforms.

The website includes learning-stage tabs, an accessible admissions dialog that prepares a WhatsApp message, a school-photo gallery, call links, directions, SEO metadata, sitemap and a privacy notice. Forms do not store personal data, and no database or paid hosting is required.

## Run locally

Install Node.js 22 or later. There are no packages to install.

```powershell
npm run dev
```

Open http://127.0.0.1:4173. You can also open `src/index.html` directly to view and interact with the website.

```powershell
npm run check
npm run build
npm run preview
```

## Free GitHub Pages hosting

1. Use the public repository `Dot-KT/iqramodelschoolakr`, with `main` as the default branch.
2. Upload this project's source, including the `.github` folder, `src` and `scripts`. Do not upload `.qa`, ZIP files or credentials.
3. In repository **Settings → Pages → Build and deployment**, choose **GitHub Actions** as the source.
4. Push to `main`, or run **Actions → Deploy school website to GitHub Pages → Run workflow**.
5. Wait for both build and deployment to succeed. The initial URL should be `https://dot-kt.github.io/iqramodelschoolakr/`; confirm the actual URL in the deployment result.

For a new empty repository, run these from the project folder after authenticating Git on this computer:

```powershell
git init -b main
git add .
git commit -m "Build IQRA Model School website"
git remote add origin https://github.com/Dot-KT/iqramodelschoolakr.git
git push -u origin main
```

If the repository already contains a README or other work, clone it first and copy the website source into that checkout. Do not force-push over existing work.

If GitHub Actions cannot be enabled, the generated `dist` folder is also a complete static site. Its contents can be published from a dedicated branch with Pages configured to deploy from that branch's root.

## Connect iqramodelschoolakr.com.ng

Save the custom domain in **Settings → Pages → Custom domain** before updating DNS. A `CNAME` file alone does not configure a domain when publishing with GitHub Actions.

The domain was observed to use `ns1.wghservers.com` / `ns2.wghservers.com`, with an existing apex A record of `131.153.148.82`. Confirm the current records in the DNS dashboard. Replace the existing web-hosting A record with:

| Type | Host | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | Dot-KT.github.io |

Keep unrelated MX, TXT and mail records. The authoritative nameservers do not need to change. If `www` already has a conflicting A or CNAME record, update that website record to the value above. Enable **Enforce HTTPS** once GitHub issues the certificate. DNS changes can take up to 24 hours.

GitHub recommends verifying domain ownership in account **Settings → Pages** using its unique TXT challenge. Get that value from GitHub; do not invent it.

Official references: [Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site), [domain verification](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages).

## Images and content

- Local school photos and posters are supplied by the school. The crest is displayed using a crop of the original admissions poster; replace it with a separate logo asset when available.
- The poster supplies the school address, phone numbers, government-approved status, Quran memorisation programme, computer learning and admissions for 2026/2027. Admission availability should be confirmed with the school.
- Two external illustrative Pexels photographs are clearly labelled as learning inspiration: [reading, Marta Wave](https://www.pexels.com/photo/focused-black-kids-reading-book-6437505/) and [drawing, Ketut Subiyanto](https://www.pexels.com/photo/inspired-black-kid-painting-on-paper-at-home-4544904/). [Pexels license](https://www.pexels.com/license/). If unavailable, styled text panels replace them. School photos remain local and work without external services.
- General learning-stage descriptions are proposed website copy, not a verified detailed curriculum. No fees, staff names, testimonials or school statistics are invented.
- Phone numbers are transcribed from the school poster. WhatsApp availability for the first number needs confirmation from the school; the website never claims a message has been sent.
- Fonts use Google Fonts with local fallback fonts. The website remains usable if external font or image requests fail.

## Deployment status

Local implementation, source checks, production build and real Chrome desktop/mobile interaction checks passed. The source is saved here; no deployment has succeeded yet.

The public repository `Dot-KT/iqramodelschoolakr` exists and currently has only its initial README. The connected GitHub app installation belongs to `vitestack-hq`, not `Dot-KT`. It can read the personal public repository but the attempted image upload was rejected with HTTP 403, “Resource not accessible by integration.” No website files were committed remotely.

Reconnect/configure the GitHub integration for the `Dot-KT` personal account and grant it access to `iqramodelschoolakr`. Then upload the source and choose GitHub Actions in the repository's Pages settings. The domain's DNS account is also required for the records above. Never paste tokens or passwords into chat.
