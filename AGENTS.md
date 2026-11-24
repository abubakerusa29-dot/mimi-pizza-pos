<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep menu imagery in a browser-safe product ID map separate from pricing data, so visual changes cannot change billing.
- Render invoice previews from the current cart using an auto-height thermal slip and a client-rendered CODE128 barcode; printer integration stays separate from preview rendering.
- This web app is the public site only (`/`, `/track`, `/reviews`); every old POS/admin path is a redirect-only route to `/`. Why: the POS moved to a desktop app that syncs with the same backend, which must stay unchanged.
- Public reviews are read only through the public_reviews() function (hides phone and hidden reviews); owner moderates at /customer-reviews. Why: customer phone numbers must never be public.
