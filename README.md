# Vesperine — Pumpkin Spice Nº 31

> _The last October, bottled._

A cinematic, scroll-driven luxury microsite for a fictional pumpkin spice elixir —
a love story that ends with the first frost. Live at
**https://bsalizz.github.io/Pumpkin-Spice/** (English) and
**https://bsalizz.github.io/Pumpkin-Spice/hu/** (Hungarian).

## Experience

| Act     | What happens                                                                                                                            |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Hero    | A faceted crystal flacon of glowing elixir rises through falling maple leaves                                                           |
| Story   | Four pinned chapters — _October · Ember · Frost · Forever_ — re-grade the 3D world: amber, fire, blue frost (the pumpkin freezes), dusk |
| Elixir  | Seven spices orbit the flacon                                                                                                           |
| Ritual  | Warm. Pour. Remember. — hand-drawn line art draws itself on scroll                                                                      |
| Reserve | Rotating seal, live countdown to the 31 October release, share                                                                          |

Everything visual is generated — no stock assets:

- **3D models (Blender)** — the heirloom pumpkin (uneven lobes, twisted stem, curling
  tendril) and the star anise and cinnamon quills are built by
  [`blender/build_models.py`](blender/build_models.py) and exported as meshopt-compressed
  glTF with per-vertex tints. They load after first paint; procedural stand-ins share their
  shader programs, so the swap never stalls a frame.
- **Photography** — the story, elixir and ritual photographs were generated with a
  diffusion model (ComfyUI) and ship as responsive AVIF/WebP.
- **WebGL (three.js)** — lathe-built crystal flacon with a custom liquid shader and
  suspended gold flakes, ribbed gold stopper, canvas-drawn label, spices orbiting the
  flacon, a pumpkin that lerps into frost, GPU-instanced maple leaves, ember/snow particles, an fbm smoke backdrop,
  bloom + a chromatic/grain finishing pass. A scroll _Director_ blends scene keyframes
  anchored to `[data-scene]` elements, so the 3D choreography follows the DOM layout at
  every viewport size.
- **Motion (GSAP + ScrollTrigger + Lenis)** — preloader, split-text reveals, scrubbed
  words, velocity marquee, counters, magnetic/tilt pointer effects, custom cursor.
- **Sound** — an optional generative Web Audio score (pads, wind, bells) that follows the
  chapter mood. Off by default.
- **Adaptive quality** — three GPU tiers, dynamic pixel ratio, WebGL-loss fallback,
  `prefers-reduced-motion` respected throughout. The page is fully readable with
  JavaScript disabled.

## SEO

- Static HTML per locale, `hreflang` (incl. `x-default`), canonical URLs
- Open Graph / Twitter cards with 1200×630 images rendered from the real WebGL hero
- JSON-LD graph: `Organization`, `WebSite`, `WebPage`, `Product` + pre-order `Offer`,
  `FAQPage`
- XML sitemap with alternates, `robots.txt`, web app manifest, icon set, `noindex` 404
- **`scripts/seo-audit.mjs` runs after every build and fails it** on missing/invalid
  titles, descriptions, canonicals, hreflang, OG/Twitter tags, JSON-LD, broken internal
  links, sitemap or manifest problems.

## Development

Requires Node 24 (see `.nvmrc`).

```bash
npm ci
npm run dev        # http://localhost:4321/Pumpkin-Spice/
npm run verify     # format · lint · astro check · unit tests · build · SEO audit
```

| Script                 | Purpose                                                       |
| ---------------------- | ------------------------------------------------------------- |
| `npm run build`        | Static build to `dist/`, followed by the SEO audit            |
| `npm run test`         | Vitest unit tests (URLs, JSON-LD, release clock, i18n parity) |
| `npm run assets:icons` | Regenerate favicons/app icons from the emblem (sharp)         |
| `npm run assets:og`    | Re-render OG images from a running preview (Playwright)       |

The 3D models are rebuilt with Blender 5.2 (headless); point `LD_LIBRARY_PATH` at Blender's
`lib/` so the glTF exporter finds its bundled meshoptimizer:

```bash
LD_LIBRARY_PATH=<blender>/lib <blender>/blender --background --factory-startup \
  --python blender/build_models.py -- src/assets/models --preview /tmp/models.png
```

### Structure

```
blender/                 code-built 3D models (glTF export)
src/
  assets/                generated photographs and 3D models (hashed at build)
  config/site.ts         single source of truth: origin, base path, brand, price
  i18n/                  typed dictionaries (en, hu) — structure parity is tested
  lib/seo/               URL helpers, JSON-LD builder
  components/            layout, SEO head, UI primitives, page sections
  scripts/
    motion/              GSAP/Lenis choreography
    webgl/               three.js experience, director, post-processing, objects/
    audio/               generative ambient score
scripts/                 build-time tooling (SEO audit, asset generation)
tests/                   unit tests
```

## Deployment

`.github/workflows/deploy.yml` runs `npm run verify` on every push and pull request.
Pushes to `main` publish `dist/` to the `gh-pages` branch.

One-time setup by a repository admin: **Settings → Pages → Build and deployment →
Deploy from a branch → `gh-pages` / root**.

---

Vesperine is a fictional house. The October is real.
