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
| `src/engine/shaders.ts` | All GPU code: the wave step, probes, display |
| `src/engine/engine.ts` | Textures, stepping, probes, read-back |
| `src/engine/physics.ts` | Dispersion relation, wavelength, group velocity (used by the experiment checks) |
| `src/engine/optics.ts` | Optical elements (lenses, ball lens, prism, mirrors, beam splitter, GRIN lens) drawn over the scene's base layer, and the laser housing |
| `src/engine/scene.ts`, `sources.ts` | Scene cells (scene-image rules of the Windows app) and object sources (arrays, randomizing, lines) |
| `src/project/` | Opening and saving Windows projects (`project.ts`) and a small zip reader/writer (`zip.ts`) |
| `src/view/video.ts` | MP4 export with WebCodecs ([Mediabunny](https://mediabunny.dev), MPL-2.0, loaded only when recording) |
| `src/ui/colors.ts` | The colour scheme editor |
| `src/sim.ts` | One running simulation: frame loop, tools, probes |
| `src/view/` | Zoom/pan viewport with overlay (ruler, protractor, markers), graphs |
| `src/experiments/` | The 15 guided experiments — each is a data object with steps, predictions and checks (`famous.ts`: Arago, Michelson, Bragg/Davisson–Germer, Compton, thin films) |
| `src/learn/` | The "How it works" library: 7 categories in `content/*.ts`, each page with kids / school / university / research sections |
| `public/colorschemes/` | The colour schemes of the Windows app, unchanged |

In the browser console, `waveDude` is the running simulation (e.g. `waveDude.engine.step(1000)`).

## Adding an experiment

Write an `Experiment` (see `src/experiments/types.ts`) and add it to `src/experiments/index.ts`. `setup` builds the scene with `Scene` drawing calls and sources; each step has HTML text and optionally a prediction question, the tools to offer, and a `task` whose `check` compares the learner's ruler/protractor measurement with `lam()` (the grid's own dispersion relation), so the expected values match what the simulation really does.

## Licence

GPL-3.0-or-later, like Wave Dude 2D (JJM Vleggaar, Huygens Optics). The simulation core is based on WaveSimulator2D by 0x23.
