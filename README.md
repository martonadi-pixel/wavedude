# Wave Dude 2D for the web

An interactive 2D wave simulator that runs in the browser (WebGL2, nothing to install). Draw a scene, add wave sources, glass, mirrors and walls, and watch the waves move, bend, interfere and diffract. It comes with guided experiments for every level, from kids to researchers, a free sandbox, and "How it works" pages on the physics, the maths and the code.

**Status:** not online yet. It will be hosted soon; until then you can run it yourself (see below).

## Where it comes from

This project is a port of other people's work to the web:

- **Wave Dude 2D** by JJM Vleggaar ([Huygens Optics](https://www.patreon.com/c/huygens_optics)): the original simulator for Windows (VB.NET, OpenCL), released under GPL-3.0. This project aims to bring its code, its ideas and its experiments to the browser, so anyone can use it without installing anything.
- **[WaveSimulator2D](https://github.com/0x23/WaveSimulator2D)** by 0x23: the Python/CuPy wave simulator that the core of Wave Dude 2D (the wave step, the scene rules, the field and intensity pictures) is based on.
- The colour schemes come from Wave Dude 2D, which sampled most of them from [matplotlib](https://matplotlib.org/) and [seaborn](https://seaborn.pydata.org/) colour maps and two from WaveSimulator2D.
- Video export uses [Mediabunny](https://mediabunny.dev) (MPL-2.0).

All credit for the original ideas goes to them.

## Made with AI, not verified

The code of this web version was written with AI (Claude, by Anthropic). It has **not** been reviewed or verified by people, so expect bugs, and check numbers and explanations before relying on them.

It is meant for people to play with, learn from and improve. Issues and pull requests are welcome.

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

GPL-3.0-or-later, like Wave Dude 2D: see [LICENSE](LICENSE). Keep it open source: you may use, study, change and share it, and if you share a changed version, share its source under the same licence.
