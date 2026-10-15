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

## Licence

GPL-3.0-or-later, like Wave Dude 2D (JJM Vleggaar, Huygens Optics). The simulation core is based on WaveSimulator2D by 0x23.
