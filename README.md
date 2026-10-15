# Wave Dude 2D — web

The Wave Dude 2D wave simulator in the browser (WebGL2, no plug-ins), with guided experiments from Kids to Research level, a free Sandbox, and "How it works" chapters on the physics, the maths and the code.

## Working with the Windows app

- **Sandbox → Project → Open…** takes a `.zip` of a Windows project folder, the folder itself (*Open folder…*), or its `configuration.json` together with the scene image.
- **Save .zip** writes the same layout (`configuration.json`, `scene_images/`, …). Unzip it into the Windows projects folder to open it there. Settings this version does not use are kept unchanged; web-only source settings are stored in extra `web_*` keys.
- Composite sources keep their saved element lists. The Windows app's run-time re-randomizing of off-widths is not done here (each element keeps its first off-width); you get a note when a project uses it.
- A scene painted in the browser is saved as a new scene image (red = n × 100, so the glass tool stops at n = 2.55).
- Colour schemes made in the editor (*Display → Edit colour schemes*) are kept in the browser and can be downloaded as the same JSON files as `ColorSchemeList/`.
- **Video**: Sandbox → Video renders frame by frame to MP4 (H.264 when the browser can, otherwise VP9/AV1).

## Run it

```sh
npm install
npm run dev        # development server with hot reload
npm run build      # static site in dist/
npm run preview    # serve dist/ on http://localhost:4173
```

The built `dist/` folder is a plain static site: any web server can host it (it does not work from `file://`).

## Docker

```sh
docker compose up -d --build                    # http://localhost:8090 (bound to 127.0.0.1 only; WAVE_DUDE_PORT in .env changes it)
```

With a Cloudflare tunnel on the same machine:

1. In Cloudflare Zero Trust → Networks → Tunnels, create a tunnel and copy its token.
2. `cp .env.example .env` and paste the token as `CLOUDFLARE_TUNNEL_TOKEN`.
3. Add a public hostname for your domain with service `http://wave-dude:8080`.
4. `docker compose --profile tunnel up -d --build`

The image is nginx (unprivileged, port 8080) serving the build; `/healthz` answers `ok`.

## Layout

| Path | What |
|---|---|
| `src/core/` | Pure maths and data (no browser): `physics.ts` (dispersion relation, wavelength, velocities), `scene.ts` (cells, scene-image rules, damping edge), `sources.ts` (point/array/line/laser sources and moving sources), `optics.ts` (lenses, mirrors, prisms…), `shapes.ts` (walls, glass and absorbers as objects), `paint.ts` (brush, lines, boxes, graded absorbers), `spectrum.ts` (white light: the eight wavelengths, glass dispersion, CIE 1931 colours), `math.ts` (angles, averages, spectral peaks). Unit-tested. |
| `src/engine/` | The GPU: `shaders.ts` (sources pass, wave step, probes, 2D/3D display), `spectral.ts` (white light: eight wavelengths side by side, true-colour display), `gl.ts` (programs, textures) and `engine.ts` (textures, stepping, read-back) |
| `src/sim/` | One running simulation: frame loop, tools, probes, overlay |
| `src/view/` | Zoom/pan viewport with overlay (ruler, protractor, markers), graphs |
| `src/circuits/` | Computing with waves: bit switches, detectors, wave transistors, ready-made circuits, the sandbox's logic tools |
| `src/project/` | Opening and saving Windows projects (`project.ts`) and a small zip reader/writer (`zip.ts`) |
| `src/components/` | Reusable UI pieces |
| `src/app/` | The app shell (what the pages may use of the main window) |
| `src/features/experiments/` | The guided experiments: the page (`guide.ts`), the registry (`index.ts`), helpers for writing them (`helpers.ts`: wavelengths, sources, probes, objects, `look()`; `colour.ts`: white-light probes, spectrum bars; `particles.ts`: particles landing by Born's rule, the which-way detector) and the experiments themselves in `catalog/`, one file each named after its id — each a data object with steps, predictions and checks |
| `src/features/sandbox/` | The sandbox page, its logic panel and MP4 export (WebCodecs via [Mediabunny](https://mediabunny.dev), MPL-2.0, loaded only when recording) |
| `src/features/learn/` | The "How it works" library: categories in `content/*.ts`, each page with kids / school / university / research sections |
| `src/features/colors/` | The colour scheme editor |
| `src/styles/` | Stylesheets |
| `public/colorschemes/` | The colour schemes of the Windows app, unchanged |
| `scripts/` | `check-cycles.mjs`: fails on circular imports in `src/` (part of `npm run check`, with lint rules that keep each folder above to the layers below it) |
| `tests/e2e/` | Browser tests: headless Chrome drives the built site and checks the numbers (experiments, white light and colours, the which-way detector, sandbox objects, circuits, exposure, layout, 3D). `npm run build && npm run preview`, then `npm run e2e` (or `npm run e2e -- logic famous`); `E2E_BASE` sets the address, `E2E_PLAYWRIGHT_FROM` a folder whose `node_modules` has `playwright-core` |

Checks: `npm run check` (type-check, lint, unit tests); `npm run build` for the site.

In the browser console, `waveDude` is the running simulation (e.g. `waveDude.engine.step(1000)`).

## Adding an experiment

Write an `Experiment` (see `src/features/experiments/types.ts`) in `src/features/experiments/catalog/` and add it to `src/features/experiments/index.ts`. `setup` builds the scene with `Scene` drawing calls and sources; each step has HTML text and optionally a prediction question, the tools to offer, and a `task` whose `check` compares the learner's ruler/protractor measurement with `lam()` (the grid's own dispersion relation), so the expected values match what the simulation really does.

## Licence

GPL-3.0-or-later, like Wave Dude 2D (JJM Vleggaar, Huygens Optics). The simulation core is based on WaveSimulator2D by 0x23.
