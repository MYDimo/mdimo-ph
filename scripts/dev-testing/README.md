# Dev testing rigs (not part of the site)

Helper scripts that drive a **real browser** to check animations, layout and forms.
They exist because the built-in browser pane in Claude sessions is usually hidden, which
freezes animation frames, so animation checks there pass falsely. Nothing here ships to the site.

Needs Node 22 (built-in `WebSocket`). Screenshots go to `scripts/dev-testing/shots/` (git-ignored).

- `cdp.mjs`: tiny Chrome DevTools Protocol driver. `launch()` starts headless Chrome
  (`HEADFUL=1` for a visible window, `BROWSER=<path>` for another Chromium, `DPR=2` for retina).
- `fx.mjs`: same idea for Firefox over WebDriver BiDi (`launchFx()`; slow first start).
- `sampler.js` + `sample-test.mjs <firefox|chrome> [url]`: logs the frosted header's real computed
  state every 40 ms across a theme switch.
- `screencast-test.mjs` + `castsheet.mjs <fromMs> <toMs> <name>`: records every frame of a theme
  switch and builds a contact sheet of the header strip.
- `lightbox-test.mjs`, `lightbox-close-test.mjs`: open/close the gallery lightbox and report each
  layer's visible corner radius.
- `filter-test.mjs [chrome|firefox]`: clicks the Moments filters and logs when the photo reveal masks last changed (should be right away, not after the glide).
- `form-test.mjs`: email validation cases, and what the inquiry form posts (fetch is stubbed; nothing is sent).
- `header-test.mjs`, `header-home-test.mjs`, `fx-header-test.mjs`, `stitch.mjs`: slow-motion header captures.

Typical run (production build preview):

    npm run build && npx astro preview --port 4400 &
    node scripts/dev-testing/lightbox-test.mjs
    node scripts/dev-testing/sample-test.mjs firefox

Clean up afterwards: `pkill -f "astro preview"; pkill -f remote-debugging-port`.
Limits: Firefox's screenshot API never draws `backdrop-filter`, and macOS screen capture is not
permitted for sessions, so judge blur from computed styles or ask the owner (who uses Firefox).
