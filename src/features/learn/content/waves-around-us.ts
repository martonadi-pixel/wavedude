// Wave Dude 2D web - "How it works" library, category "Waves around us": the everyday introduction.
// GPL-3.0-or-later.

import type { LearnCategory } from "../types";

export const category: LearnCategory = {
  id: "waves-around-us",
  title: "Waves around us",
  icon: "🌊",
  blurb: "What a wave is, the many kinds you meet every day, and the handful of words and numbers that describe them all.",
  pages: [
    // ------------------------------------------------------------------ 1
    {
      id: "what-is-a-wave",
      title: "What is a wave?",
      summary: "A wave carries energy from place to place while the stuff it travels through mostly stays where it is.",
      sections: [
        {
          level: "kids",
          html: `
<p>Drop a pebble into a pond. Rings of ripples spread out, wider and wider. But here is a puzzle: does the water itself rush across the pond? No. If a leaf is floating on the water, it just bobs up and down as the ripples pass under it. The leaf stays in nearly the same place.</p>
<p>So what is moving? It is the <b>shape</b>, the bump. Each bit of water pushes and pulls on the bit next to it, and that one pushes on the next. The bump gets handed along, like a ball passed from hand to hand down a long line of people. Nobody walks away, but the ball still travels.</p>
<p>That travelling bump is a <b>wave</b>. A wave carries <b>energy</b>, the power to move things, from one place to another. That is how a wave from far out at sea can knock you over on the beach.</p>
<figure class="diagram"><svg viewBox="0 0 400 170" role="img" aria-label="A leaf on a wave bobs up and down while the wave travels to the right">
<path d="M20 100 Q50 50 80 100 T140 100 T200 100 T260 100 T320 100 T380 100" fill="none" stroke="#60a5fa" stroke-width="3"/>
<ellipse cx="50" cy="70" rx="14" ry="5" fill="#34d399"/>
<path d="M50 58 V28 M44 34 L50 26 L56 34 M50 82 V128 M44 122 L50 130 L56 122" fill="none" stroke="#f87171" stroke-width="2"/>
<text x="62" y="38" font-size="13" fill="currentColor">the leaf only bobs</text>
<path d="M190 150 H350 M342 144 L352 150 L342 156" fill="none" stroke="currentColor" stroke-width="2"/>
<text x="190" y="140" font-size="13" fill="currentColor">the wave travels on</text>
</svg><figcaption>The water goes up and down; the wave goes along.</figcaption></figure>
<div class="home"><b>Try it at home:</b> float a small piece of paper in a full bath or a big bowl of water. Tap the water gently with a finger at one end. Watch the paper: the ripples go past it, but it only rocks up and down.</div>`,
        },
        {
          level: "school",
          html: `
<p>A <b>wave</b> is a disturbance that travels, carrying <b>energy</b> from one place to another without carrying the material along with it. The material a wave travels through is called the <b>medium</b>: water for ripples, air for sound, rock for earthquakes.</p>
<p>Every part of the medium <b>oscillates</b> (moves back and forth) about its resting position. It moves because its neighbours pull or push on it, and in turn it pulls or pushes on the next neighbours. That chain of nudges is how the disturbance travels.</p>
<ul>
<li>A single disturbance, like one flick of a rope, is a <b>pulse</b>.</li>
<li>A source that keeps vibrating, like a loudspeaker playing a note, makes a <b>continuous</b> (periodic) wave.</li>
</ul>
<h4>Worked example: the stadium wave</h4>
<p>In a stadium "Mexican wave", each person stands up and sits down again, but the wave races round the stands. Measurements of real crowds (Farkas, Helbing and Vicsek, <i>Nature</i>, 2002) found it moves at about <b>12 metres per second</b> (about 20 seats per second) and is about 6–12 m wide.</p>
<p>Suppose a ring of seats is 500 m long. The time for the wave to go round once is</p>
<p class="formula">time = distance ÷ speed = 500 m ÷ 12 m/s ≈ 42 s</p>
<p>How long is each person on their feet? The wave is about 12 m wide and moves 12 m each second, so each person is up for about 1 second. In those 42 seconds the wave travels 500 m, yet nobody moves more than about a metre. Energy and the pattern travel; people do not.</p>
<p class="aside">In Wave Dude 2D the medium is a grid of cells. Each cell holds one number, the "height" u, and each step every cell is nudged by its neighbours. Nothing ever moves from cell to cell except the pattern.</p>`,
        },
        {
          level: "university",
          html: `
<p>The simplest model of a mechanical wave is a stretched string with tension T (newtons) and mass per unit length μ (kg/m). Take a short piece of length Δx with small transverse displacement u(x, t). The vertical component of tension on each end is T ∂u/∂x (for small slopes), so the net force is T [∂u/∂x(x+Δx) − ∂u/∂x(x)] ≈ T ∂²u/∂x² Δx. Newton's second law gives</p>
<p class="formula">μ ∂²u/∂t² = T ∂²u/∂x² &nbsp;⇒&nbsp; ∂²u/∂t² = v² ∂²u/∂x², &nbsp; v = √(T/μ)</p>
<p>d'Alembert's general solution is u(x, t) = f(x − vt) + g(x + vt): any shape f moves to the right at speed v without changing, and any shape g moves to the left. The medium only moves transversely; what travels is the shape, and with it energy. The energy per unit length is</p>
<p class="formula">e = ½ μ (∂u/∂t)² + ½ T (∂u/∂x)²</p>
<p>(kinetic plus stretching energy), and the power flowing to the right is P = −T (∂u/∂x)(∂u/∂t). For a right-moving wave f(x − vt) this is P = v e: energy is carried at the wave speed.</p>
<p>The equation is <b>linear</b>, so solutions add (superposition). In two dimensions it becomes ∂²u/∂t² = v² ∇²u with ∇² = ∂²/∂x² + ∂²/∂y², which is what Wave Dude 2D solves on a grid. The grid is itself a lattice of coupled oscillators: each cell is accelerated by the difference between its neighbours and itself, just as each bead on a beaded string is.</p>
<p><b>"The water stays" is an approximation.</b> In a deep-water surface wave each water parcel moves in a nearly closed circle whose radius falls off as A e<sup>kz</sup> with depth (z ≤ 0). The orbits do not quite close: to second order in amplitude there is a slow net drift in the direction of travel, the <b>Stokes drift</b>, of size about ω k A² at the surface. For small waves it is tiny compared with the wave speed, which is why the floating leaf seems to stay put.</p>`,
        },
        {
          level: "research",
          title: "What counts as a wave?",
          html: `
<p>There is no single definition. Whitham (<i>Linear and Nonlinear Waves</i>, 1974) separates two broad classes: <b>hyperbolic</b> waves, governed by equations like the wave equation with a finite signal speed, and <b>dispersive</b> waves, defined by solutions of the form cos(k·x − ω(k)t) with a non-trivial dispersion relation ω(k). Many systems (water waves, the grid in this simulator) are both.</p>
<p>Some "waves" are not of either kind in the linear sense. The stadium wave, nerve impulses and chemical waves in the Belousov–Zhabotinsky reaction are waves in <b>excitable media</b>: each element has a threshold, fires, and then has a refractory period. Such waves do not superpose; two colliding fronts annihilate instead of passing through each other, and the energy comes from the medium rather than from the source. Farkas, Helbing and Vicsek modelled the stadium wave with exactly this kind of model.</p>
<p>A detail that matters for a 2D simulator: Huygens' principle in its strong form (a sharp pulse stays a sharp shell) holds for the wave equation only in odd space dimensions of three or more. In 2D the Green's function is</p>
<p class="formula">G(r, t) = H(t − r/c) / (2π c √(c²t² − r²))</p>
<p>so a short pulse from a point leaves a decaying tail behind its leading ring. In Wave Dude 2D a single click of a pulsed source therefore produces a ring followed by a faint wake; this is correct 2D physics, not a numerical artefact, but it is <i>not</i> what a point source in 3D does.</p>`,
        },
      ],
      tryIt: [{ experiment: "splash", label: "Splash! Making waves" }],
      sources: [
        "I. Farkas, D. Helbing, T. Vicsek, Mexican waves in an excitable medium, Nature 419, 131–132 (2002) — https://arxiv.org/abs/cond-mat/0210073",
        "F. S. Crawford, Waves (Berkeley Physics Course vol. 3, McGraw-Hill, 1968)",
        "R. P. Feynman, R. B. Leighton, M. Sands, The Feynman Lectures on Physics, vol. I ch. 47–51 — https://www.feynmanlectures.caltech.edu/",
        "G. B. Whitham, Linear and Nonlinear Waves (Wiley, 1974)",
      ],
    },

    // ------------------------------------------------------------------ 2
    {
      id: "kinds-of-waves",
      title: "Kinds of waves",
      summary: "Water, sound, earthquake, radio and light waves: some need a material to travel through, some can cross empty space.",
      sections: [
        {
          level: "kids",
          html: `
<p>Waves are everywhere. Here are some you meet every day:</p>
<ul>
<li><b>Water waves</b>: ripples in a puddle, big waves at the beach.</li>
<li><b>Sound</b>: when you talk, the air wiggles, and those wiggles travel to someone's ear.</li>
<li><b>Light</b>: the light from a lamp or the Sun is a wave too.</li>
<li><b>Radio</b>: invisible waves carry music, phone calls and Wi-Fi.</li>
<li><b>Earthquake waves</b>: when rock deep underground suddenly slips, waves shake the ground.</li>
</ul>
<p>Water waves, sound and earthquake waves all need <b>stuff</b> to travel through: water, air or rock. Light and radio waves are different. They can cross <b>completely empty space</b>. That is how sunlight reaches us across space, where there is no air at all.</p>
<figure class="diagram"><svg viewBox="0 0 400 160" role="img" aria-label="Sound travels through air; light crosses empty space from the Sun to the Earth">
<text x="12" y="20" font-size="13" fill="currentColor">Sound needs air</text>
<rect x="12" y="60" width="18" height="40" fill="currentColor"/>
<g fill="#60a5fa"><circle cx="45" cy="70" r="2"/><circle cx="52" cy="90" r="2"/><circle cx="60" cy="75" r="2"/><circle cx="75" cy="85" r="2"/><circle cx="92" cy="65" r="2"/><circle cx="98" cy="95" r="2"/><circle cx="115" cy="78" r="2"/><circle cx="130" cy="90" r="2"/><circle cx="140" cy="68" r="2"/><circle cx="155" cy="82" r="2"/></g>
<path d="M40 60 Q48 80 40 100 M60 55 Q70 80 60 105 M80 50 Q92 80 80 110" fill="none" stroke="#fbbf24" stroke-width="2"/>
<text x="12" y="130" font-size="12" fill="currentColor">speaker → air → ear</text>
<text x="215" y="20" font-size="13" fill="currentColor">Light crosses empty space</text>
<circle cx="235" cy="80" r="18" fill="#fbbf24"/>
<path d="M258 80 Q266 70 274 80 T290 80 T306 80 T322 80 T338 80 T354 80" fill="none" stroke="#fbbf24" stroke-width="2"/>
<circle cx="372" cy="80" r="10" fill="#60a5fa"/>
<text x="215" y="130" font-size="12" fill="currentColor">Sun → 8 minutes → Earth</text>
</svg><figcaption>Sound is passed along by air; light needs nothing at all.</figcaption></figure>
<div class="fact"><b>Fun fact:</b> sound is slow compared with light. In a thunderstorm you see the lightning at once, but the thunder takes about 3 seconds to travel each kilometre. Count the seconds between flash and bang and divide by 3: that is roughly how many kilometres away the storm is.</div>`,
        },
        {
          level: "school",
          html: `
<p>Waves come in two big families:</p>
<ul>
<li><b>Mechanical waves</b> are vibrations of a material (the medium): water waves, sound, waves on a string, seismic (earthquake) waves. With no medium there is no wave; a bell ringing inside a jar fades almost to silence as the air is pumped out.</li>
<li><b>Electromagnetic (EM) waves</b> are travelling patterns of electric and magnetic fields: radio, microwaves, infrared, visible light, ultraviolet, X-rays and gamma rays. They need no medium and all travel at the same speed in a vacuum, <b>c = 299 792 458 m/s</b> (about 300 000 km per second).</li>
</ul>
<h4>How fast?</h4>
<table>
<tr><th>Wave</th><th>Travelling through</th><th>Typical speed</th></tr>
<tr><td>Sound</td><td>air at 20 °C</td><td>343 m/s</td></tr>
<tr><td>Sound</td><td>fresh water at 20 °C</td><td>about 1 480 m/s</td></tr>
<tr><td>Sound</td><td>sea water</td><td>about 1 500–1 520 m/s</td></tr>
<tr><td>Sound</td><td>steel</td><td>about 5 800–6 000 m/s</td></tr>
<tr><td>Earthquake P wave</td><td>Earth's crust</td><td>about 6 km/s</td></tr>
<tr><td>Earthquake S wave</td><td>Earth's crust</td><td>about 3.5 km/s</td></tr>
<tr><td>Tsunami</td><td>ocean 4 km deep</td><td>about 200 m/s (≈ 700 km/h)</td></tr>
<tr><td>Light</td><td>vacuum</td><td>299 792 458 m/s</td></tr>
<tr><td>Light</td><td>water / glass</td><td>about 225 000 / 200 000 km/s</td></tr>
</table>
<p>Sound is faster in water and much faster in steel than in air, because those materials are far stiffer for their density. Light, on the other hand, is slower in water and glass than in a vacuum: the ratio c / (speed in the material) is the <b>refractive index</b> n, about 1.33 for water and 1.5 for glass.</p>
<h4>Worked example: how far away was the earthquake?</h4>
<p>P waves arrive first, S waves later. A seismometer records the S wave 10 s after the P wave. If the distance is d, then d / 3.5 − d / 6 = 10 (distances in km, speeds in km/s), so d × 0.119 = 10 and <b>d ≈ 84 km</b>. As a rule of thumb, every second of S−P delay means about 8 km of distance.</p>`,
        },
        {
          level: "university",
          html: `
<p>Every wave speed comes from a balance between a <b>restoring stiffness</b> and an <b>inertia</b>, v = √(stiffness / inertia):</p>
<table>
<tr><th>System</th><th>Speed</th><th>Symbols</th></tr>
<tr><td>String</td><td>√(T / μ)</td><td>tension, mass per length</td></tr>
<tr><td>Sound in a fluid</td><td>√(K / ρ)</td><td>bulk modulus, density</td></tr>
<tr><td>Sound in an ideal gas</td><td>√(γ R T / M)</td><td>adiabatic index, gas constant, temperature, molar mass</td></tr>
<tr><td>Elastic solid, P wave</td><td>√((K + 4G/3) / ρ)</td><td>G = shear modulus</td></tr>
<tr><td>Elastic solid, S wave</td><td>√(G / ρ)</td><td></td></tr>
<tr><td>Thin rod (longitudinal)</td><td>√(E / ρ)</td><td>Young's modulus</td></tr>
<tr><td>Light in matter</td><td>c / n, &nbsp; c = 1/√(μ₀ ε₀)</td><td>n = √(ε<sub>r</sub> μ<sub>r</sub>)</td></tr>
</table>
<p>Checks: for air, γ = 1.4, M = 0.029 kg/mol, T = 293 K gives √(1.4 × 8.314 × 293 / 0.029) ≈ 343 m/s. For water, K ≈ 2.2 GPa, ρ ≈ 998 kg/m³ gives ≈ 1 485 m/s. For steel, E ≈ 200 GPa, ρ ≈ 7 850 kg/m³ gives ≈ 5 050 m/s in a thin rod; in bulk steel the P-wave modulus K + 4G/3 is larger than E, which is why bulk values near 5 900 m/s are quoted.</p>
<p>Because fluids have G = 0, S waves cannot cross a liquid. The S-wave "shadow" on the far side of the Earth from an earthquake is the classic evidence that the outer core is liquid; Inge Lehmann's 1936 analysis of P waves revealed the solid inner core inside it.</p>
<p>Water surface waves are <b>dispersive</b>: their dispersion relation is ω² = g k tanh(k h) for depth h. In shallow water (k h ≪ 1) every wavelength travels at √(g h), which is why a tsunami over 4 000 m of ocean moves at about √(9.81 × 4000) ≈ 198 m/s. In deep water (k h ≫ 1) the phase speed is √(g / k) = g T / 2π: a swell with a 10 s period has λ = g T² / 2π ≈ 156 m and moves at about 15.6 m/s.</p>
<p>EM waves were predicted by Maxwell (published 1865) and produced and detected in the laboratory by Hertz in 1887–88. Infrared (Herschel, 1800), ultraviolet (Ritter, 1801), X-rays (Röntgen, 1895) and gamma rays (Villard, 1900) were all found to be the same phenomenon at different wavelengths.</p>`,
        },
        {
          level: "research",
          title: "One equation, many waves",
          html: `
<p>The scalar equation Wave Dude 2D solves, ∂²u/∂t² = c(x)² ∇²u, describes several physical systems, but not all equally well:</p>
<ul>
<li><b>Light, 2D, field out of the plane.</b> For a structure uniform along z with the electric field along z, Maxwell's equations reduce exactly to ∇²E<sub>z</sub> = (n²/c₀²) ∂²E<sub>z</sub>/∂t². This is the simulator's equation, including at interfaces. The other polarisation (H<sub>z</sub>) obeys ∇·(n⁻² ∇H<sub>z</sub>) = c₀⁻² ∂²H<sub>z</sub>/∂t² instead, which the simulator does not model.</li>
<li><b>Sound.</b> Linear acoustics with varying density gives ∇·(ρ⁻¹ ∇p) = (1/(ρc²)) ∂²p/∂t². The simulator's form corresponds to constant density and varying compressibility; reflection at real interfaces depends on the impedance ρc, not only on c.</li>
<li><b>Shallow water.</b> The linearised equation is ∂²η/∂t² = ∇·(g h ∇η), again a divergence form. Smooth depth changes are well represented; abrupt steps are not exactly.</li>
<li><b>Elastic solids</b> need a vector equation with two speeds and mode conversion between P and S at interfaces, which a scalar model cannot represent.</li>
</ul>
<p>Other wave families are further from the model: quantum matter waves obey the Schrödinger equation (first order in time, strongly dispersive), and gravitational waves, first detected directly by LIGO on 14 September 2015, are tensor waves in spacetime. Plasma waves, internal waves in the ocean and Rossby waves in the atmosphere all have dispersion relations quite unlike ω = c k.</p>`,
        },
      ],
      tryIt: [
        { experiment: "splash", label: "Splash! Making waves" },
        { experiment: "echoes", label: "Echoes and mirrors" },
      ],
      sources: [
        "HyperPhysics, Speed of sound in various media — http://hyperphysics.phy-astr.gsu.edu/hbase/Sound/souspe2.html",
        "NOAA, Tsunami propagation — https://www.noaa.gov/jetstream/tsunamis/tsunami-propagation",
        "USGS Earthquake Hazards Program, Seismic waves — https://www.usgs.gov/programs/earthquake-hazards",
        "NASA Imagine the Universe, History of the electromagnetic spectrum — https://imagine.gsfc.nasa.gov/science/toolbox/history_multiwavelength1.html",
        "D. Halliday, R. Resnick, J. Walker, Fundamentals of Physics (Wiley), chapters on sound and EM waves",
        "A. Taflove, S. C. Hagness, Computational Electrodynamics: The FDTD Method (Artech House, 3rd ed. 2005), 2D TM/TE reduction",
        "B. P. Abbott et al. (LIGO/Virgo), Observation of gravitational waves from a binary black hole merger, Phys. Rev. Lett. 116, 061102 (2016)",
      ],
    },

    // ------------------------------------------------------------------ 3
    {
      id: "describing-a-wave",
      title: "Describing a wave",
      summary: "Amplitude, wavelength, frequency, period and speed, and the simple rule v = f · λ that links them.",
      sections: [
        {
          level: "kids",
          html: `
<p>Scientists use a few words to describe any wave. Here they are with a rope or water in mind:</p>
<ul>
<li><b>Crest</b>: the top of a bump. <b>Trough</b>: the bottom of a dip.</li>
<li><b>Amplitude</b>: how tall the wave is, from the calm, flat level up to a crest. A gentle ripple has a small amplitude; a big storm wave has a large one.</li>
<li><b>Wavelength</b>: how far it is from one crest to the next crest.</li>
<li><b>Frequency</b>: how many crests go past you every second. Think of a swing: a little swing on short ropes goes back and forth quickly (high frequency); a big swing on long ropes goes slowly (low frequency).</li>
<li><b>Speed</b>: how fast a crest travels along.</li>
</ul>
<figure class="diagram"><svg viewBox="0 0 400 180" role="img" aria-label="A wave with the wavelength marked from crest to crest and the amplitude from the middle line to a crest">
<path d="M20 110 H380" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" fill="none"/>
<path d="M20 110 Q50 30 80 110 T140 110 T200 110 T260 110 T320 110 T380 110" fill="none" stroke="#60a5fa" stroke-width="3"/>
<path d="M50 40 H170 M58 34 L50 40 L58 46 M162 34 L170 40 L162 46" fill="none" stroke="#f87171" stroke-width="2"/>
<text x="72" y="28" font-size="13" fill="currentColor">wavelength</text>
<path d="M290 110 V70 M284 78 L290 70 L296 78" fill="none" stroke="#34d399" stroke-width="2"/>
<text x="298" y="95" font-size="13" fill="currentColor">amplitude</text>
<text x="40" y="62" font-size="12" fill="currentColor">crest</text>
<text x="96" y="168" font-size="12" fill="currentColor">trough</text>
</svg><figcaption>Wavelength is measured from crest to crest; amplitude from the calm level to a crest.</figcaption></figure>
<div class="home"><b>Try it at home:</b> tie one end of a skipping rope to a chair and shake the other end up and down. Shake slowly, then quickly. When you shake faster (higher frequency), the bumps get closer together (shorter wavelength).</div>`,
        },
        {
          level: "school",
          html: `
<p>Five quantities describe a regular (periodic) wave:</p>
<ul>
<li><b>Amplitude A</b>: the largest displacement from the rest position (metres for a water wave, pascals for sound pressure).</li>
<li><b>Wavelength λ</b> (Greek "lambda"): the distance between two neighbouring crests, in metres (m).</li>
<li><b>Frequency f</b>: the number of complete waves passing a point each second, in hertz (Hz). 1 Hz = 1 per second.</li>
<li><b>Period T</b>: the time for one complete wave to pass, in seconds. T = 1 / f.</li>
<li><b>Wave speed v</b>: how fast the crests travel, in m/s.</li>
</ul>
<p>In one period T, a crest moves forward exactly one wavelength. So speed = distance ÷ time = λ ÷ T, which gives the <b>wave equation</b> you will use most:</p>
<p class="formula">v = f · λ</p>
<p>In words: wave speed (m/s) = frequency (Hz) × wavelength (m).</p>
<h4>Worked examples</h4>
<ol>
<li>The note A above middle C has f = 440 Hz. In air, v = 343 m/s, so λ = v / f = 343 / 440 ≈ <b>0.78 m</b>. Its period is T = 1 / 440 s ≈ 2.3 ms.</li>
<li>An FM radio station broadcasts at 100 MHz = 100 000 000 Hz. Radio waves travel at 3.0 × 10⁸ m/s, so λ = 3.0 × 10⁸ / 1.0 × 10⁸ = <b>3.0 m</b>.</li>
<li>Waves in a pond have crests 0.20 m apart and 3 crests pass a stick each second. v = 3 Hz × 0.20 m = <b>0.6 m/s</b>.</li>
</ol>
<h4>The same in Wave Dude 2D</h4>
<p>The simulator measures distance in <b>cells</b> and time in <b>steps</b>. In empty space (n = 1) long waves travel at about 0.562 cells per step. A source at frequency level 60 has a period of about 27 steps, so f ≈ 1/27 per step and λ = v / f ≈ 0.562 × 27 ≈ <b>15 cells</b>. Measure it yourself with the ruler.</p>`,
        },
        {
          level: "university",
          html: `
<p>A sinusoidal plane wave travelling in direction k̂ is written</p>
<p class="formula">u(<b>r</b>, t) = A cos(<b>k</b> · <b>r</b> − ω t + φ) = Re[ A e<sup>iφ</sup> e<sup>i(<b>k</b>·<b>r</b> − ωt)</sup> ]</p>
<p>with wave number k = |<b>k</b>| = 2π/λ (rad/m), angular frequency ω = 2πf (rad/s) and phase φ. The complex amplitude A e<sup>iφ</sup> (a phasor) is what you add when waves of the same frequency superpose. Surfaces of constant phase move at the <b>phase velocity</b></p>
<p class="formula">v<sub>p</sub> = ω / k = f λ</p>
<p>The link between ω and k for a given medium is its <b>dispersion relation</b>. Substituting a plane wave into ∂²u/∂t² = c² ∇²u gives ω² = c² k²: every frequency travels at c, the medium is <b>non-dispersive</b>, and pulses keep their shape. When ω(k) is not linear, a group of waves (a wave packet) travels at the <b>group velocity</b></p>
<p class="formula">v<sub>g</sub> = dω / dk</p>
<p>which is the speed at which energy and information travel. For deep-water gravity waves, ω = √(g k), so v<sub>g</sub> = ½ v<sub>p</sub>: individual crests run forward through a group and vanish at its front. For capillary ripples (ω² = σ k³/ρ) v<sub>g</sub> = 1.5 v<sub>p</sub>.</p>
<p>The simulator's grid is mildly dispersive. Its exact dispersion relation along a grid axis is</p>
<p class="formula">4 sin²(ω/2) = 1.264 c² sin²(k/2), &nbsp; c² = 1/n²</p>
<p>in units of cells and steps. For small k this becomes ω ≈ 0.562 c k, so long waves travel at 0.562/n cells per step. A source at level L drives ω = L/255 rad per step, giving a period T = 2π·255/L ≈ 1602/L steps and, for long waves, λ ≈ 0.562 · 1602 / (n L) ≈ 900 / (n L) cells. At shorter wavelengths the phase velocity falls below 0.562/n: about 1% low at 10 cells per wavelength, 3% at 6, 7% at 4.</p>`,
        },
        {
          level: "research",
          title: "Resolution limits on the grid",
          html: `
<p>Two limits follow from the discrete dispersion relation. First, sampling: no wave shorter than 2 cells can exist, and phase errors grow quickly below about 6–8 cells per wavelength. At the highest source level (255, ω = 1 rad/step) in vacuum, solving 4 sin²(0.5) = 1.264 sin²(k/2) gives k ≈ 2.04 rad/cell, λ ≈ 3.1 cells, and a phase velocity about 13% below the long-wave value.</p>
<p>Second, a <b>cut-off</b>. The right-hand side cannot exceed 1.264 c² along an axis (1.472 c² along a diagonal), so for a given n there is a highest frequency that can propagate at all. For n = 1.5 (c² ≈ 0.444) the axial limit is ω = 2 arcsin(√(1.264 · 0.444)/2) ≈ 0.77 rad/step, roughly level 196; along the diagonal it is about level 212. Above that, a source inside such glass produces only an evanescent, non-propagating field. In practice, keep source levels low enough that the shortest wavelength in the densest material spans at least about 8 cells.</p>
<p>To measure f and λ in a run, place a point probe and read the period from its trace, and use a line probe or the ruler across several crests. Comparing measured λ with 900/(nL) shows the dispersion error directly; the grid-dispersion experiment does this systematically. The optional 4th-order stencil reduces the error at a given resolution, at the cost of sub-steps.</p>`,
        },
      ],
      tryIt: [
        { experiment: "wavelength", label: "How long is a wave?" },
        { experiment: "grid-dispersion", label: "Waves on a grid: numerical dispersion" },
      ],
      sources: [
        "F. S. Crawford, Waves (Berkeley Physics Course vol. 3, McGraw-Hill, 1968), ch. 4–6 on dispersion and group velocity",
        "R. P. Feynman et al., The Feynman Lectures on Physics, vol. I ch. 48 (Beats) — https://www.feynmanlectures.caltech.edu/I_48.html",
        "L. N. Trefethen, Group velocity in finite difference schemes, SIAM Review 24, 113–136 (1982)",
        "D. Halliday, R. Resnick, J. Walker, Fundamentals of Physics (Wiley), ch. on waves",
      ],
    },

    // ------------------------------------------------------------------ 4
    {
      id: "transverse-and-longitudinal",
      title: "Transverse and longitudinal waves",
      summary: "Waves that shake sideways, like a rope or a stadium wave, and waves that squash and stretch, like sound and a slinky.",
      sections: [
        {
          level: "kids",
          html: `
<p>There are two main ways a wave can wiggle.</p>
<p><b>Side-to-side waves.</b> Lay a slinky or a rope on the floor and flick one end sideways. A bump runs along it, but each bit of the rope moves sideways, across the direction the bump travels. A stadium wave is like this too: people stand up and sit down, while the wave runs around the stadium. Scientists call these <b>transverse</b> waves.</p>
<p><b>Push-and-pull waves.</b> Now push the end of the slinky forwards and pull it back. A squashed-up part runs along the slinky, followed by a stretched-out part. Each coil moves back and forth along the same line the wave travels. These are <b>longitudinal</b> waves. Sound is this kind: air gets squashed and stretched as the sound passes.</p>
<figure class="diagram"><svg viewBox="0 0 400 190" role="img" aria-label="Top: a rope wave moving sideways. Bottom: a slinky with squashed and stretched parts">
<text x="20" y="18" font-size="13" fill="currentColor">Transverse: moves across</text>
<path d="M30 60 Q60 25 90 60 T150 60 T210 60 T270 60 T330 60" fill="none" stroke="#60a5fa" stroke-width="3"/>
<path d="M60 42 V22 M55 28 L60 20 L65 28 M60 70 V92 M55 86 L60 94 L65 86" fill="none" stroke="#f87171" stroke-width="2"/>
<text x="20" y="112" font-size="13" fill="currentColor">Longitudinal: squash and stretch</text>
<path d="M30.0 120V150 M41.5 120V150 M52.4 120V150 M62.3 120V150 M70.8 120V150 M78.1 120V150 M84.2 120V150 M89.7 120V150 M95.2 120V150 M101.2 120V150 M108.2 120V150 M116.6 120V150 M126.3 120V150 M137.2 120V150 M148.6 120V150 M160.2 120V150 M171.2 120V150 M181.2 120V150 M189.9 120V150 M197.3 120V150 M203.5 120V150 M209.0 120V150 M214.5 120V150 M220.4 120V150 M227.3 120V150 M235.6 120V150 M245.1 120V150 M255.8 120V150 M267.3 120V150 M278.8 120V150 M289.9 120V150 M300.1 120V150 M309.0 120V150 M316.5 120V150 M322.8 120V150 M328.4 120V150 M333.8 120V150 M339.7 120V150 M346.5 120V150 M354.5 120V150 M363.9 120V150" fill="none" stroke="#c084fc" stroke-width="2"/>
<text x="68" y="168" font-size="12" fill="currentColor">squashed</text>
<text x="128" y="182" font-size="12" fill="currentColor">stretched</text>
<path d="M240 172 H360 M352 166 L362 172 L352 178" fill="none" stroke="currentColor" stroke-width="2"/>
<text x="250" y="166" font-size="12" fill="currentColor">wave travels</text>
</svg><figcaption>Rope: the bits move across. Slinky: the coils move along.</figcaption></figure>
<div class="home"><b>Try it at home:</b> with a friend holding the other end of a slinky on a smooth floor, try both: flick it sideways, then give it a sharp push. Which kind of wave travels faster along your slinky?</div>`,
        },
        {
          level: "school",
          html: `
<p>Waves are classified by how the medium moves compared with the direction the wave travels:</p>
<ul>
<li><b>Transverse</b>: the oscillation is <b>perpendicular</b> (at right angles) to the direction of travel. Examples: waves on a string, a stadium wave, S waves in earthquakes, and all electromagnetic waves, including light, where the electric and magnetic fields point across the direction of travel.</li>
<li><b>Longitudinal</b>: the oscillation is <b>parallel</b> to the direction of travel. The medium bunches up in <b>compressions</b> and spreads out in <b>rarefactions</b>. Examples: sound in air and water, P waves in earthquakes, push waves on a slinky.</li>
</ul>
<p>For a longitudinal wave, the wavelength is the distance from one compression to the next.</p>
<p><b>Water surface waves are both.</b> A floating ball moves up and down <i>and</i> forwards and backwards, tracing a circle in deep water.</p>
<p><b>Liquids and gases carry only longitudinal waves</b> (apart from surface waves), because they cannot spring back when you try to shear them sideways. Solids carry both. In earthquakes the longitudinal P ("primary") waves are faster and arrive first; the transverse S ("secondary") waves arrive later and cannot pass through the Earth's liquid outer core.</p>
<h4>Worked example</h4>
<p>A loudspeaker plays a 170 Hz note in air (v = 343 m/s). The distance between neighbouring compressions is λ = v / f = 343 / 170 ≈ <b>2.0 m</b>. A compression and the next rarefaction are half a wavelength apart, about 1.0 m.</p>
<p class="aside">Wave Dude 2D stores one number u per cell. In 3D view it looks like a rubber sheet going up and down, which is a transverse picture. The same number can just as well stand for air pressure in a sound wave, which is longitudinal. What the simulator cannot show is the direction of a sideways wiggle, so it has no polarisation.</p>`,
        },
        {
          level: "university",
          html: `
<p>Transverse waves have <b>polarisation</b>: for propagation along z, the displacement (or field) can point along x, along y, or any combination, and these two independent states can be combined with a phase difference to give linear, circular or elliptical polarisation. A longitudinal wave has a single state; there is nothing to polarise.</p>
<p>In an isotropic elastic solid the displacement field <b>s</b> obeys the Navier equation</p>
<p class="formula">ρ ∂²<b>s</b>/∂t² = (K + G/3) ∇(∇·<b>s</b>) + G ∇²<b>s</b></p>
<p>Taking the divergence gives a wave equation for the dilatation ∇·<b>s</b> with speed v<sub>P</sub> = √((K + 4G/3)/ρ); taking the curl gives one for the rotation ∇×<b>s</b> with v<sub>S</sub> = √(G/ρ). Because K &gt; 0, v<sub>P</sub>/v<sub>S</sub> = √(K/G + 4/3) is always greater than √(4/3); for a typical rock (Poisson's ratio ≈ 0.25) it is √3 ≈ 1.73. Shear waves come in two polarisations, SH (horizontal) and SV (vertical).</p>
<p>Surface waves mix both motions. In deep water, parcels move on circles of radius A e<sup>kz</sup>; in shallow water the orbits flatten into horizontal ellipses. Rayleigh waves on the surface of a solid make particles trace ellipses that turn <i>backwards</i> (retrograde) at the surface.</p>
<p>Electromagnetic waves in free space are strictly transverse: from Gauss's law ∇·<b>E</b> = 0, a plane wave must have <b>k</b>·<b>E</b> = 0. Sound in an inviscid fluid is strictly longitudinal: the velocity field is irrotational, <b>v</b> = ∇φ, and the pressure p obeys the scalar wave equation.</p>
<p>That last point is why a <b>scalar</b> wave equation, like the one in Wave Dude 2D, is the natural model for sound pressure, and also for a membrane's out-of-plane displacement, but cannot describe the two polarisations of light or the two speeds of a solid.</p>`,
        },
        {
          level: "research",
          title: "What polarisation the simulator corresponds to",
          html: `
<p>For a 2D structure (invariant along z) Maxwell's equations split into two independent sets. With <b>E</b> = E<sub>z</sub> ẑ the field satisfies ∇²E<sub>z</sub> = (n²/c₀²) ∂²E<sub>z</sub>/∂t² exactly, with E<sub>z</sub> and its normal derivative continuous at interfaces (non-magnetic media). That is precisely the simulator's equation and interface behaviour. The electric field is perpendicular to the plane of incidence, so the simulator reproduces the Fresnel coefficients for <b>s-polarised</b> light, for example r = (n₁ − n₂)/(n₁ + n₂) at normal incidence and no Brewster angle.</p>
<p>The other set (H<sub>z</sub>, p-polarisation) has a Brewster angle and different reflectances at oblique incidence; it is not modelled. Note that the labels "TE" and "TM" for these two sets are used in opposite senses in the waveguide and photonic-crystal literature, so it is safest to name the field component.</p>
<p>For elastic waves the scalar model lacks mode conversion (P to S and back at interfaces), Rayleigh and Love surface waves, and shear-wave splitting in anisotropic rock. A vector elastic solver (e.g. staggered-grid finite differences, Virieux 1986) would be needed.</p>`,
        },
      ],
      tryIt: [{ experiment: "splash", label: "Splash! Making waves" }],
      sources: [
        "E. Hecht, Optics (Pearson, 5th ed. 2017), ch. 4 and 8 (Fresnel equations, polarisation)",
        "K. Aki, P. G. Richards, Quantitative Seismology (University Science Books, 2nd ed. 2002)",
        "USGS, Seismic waves (Earthquake Hazards Program) — https://www.usgs.gov/programs/earthquake-hazards",
        "J. Virieux, P-SV wave propagation in heterogeneous media: velocity-stress finite-difference method, Geophysics 51, 889–901 (1986)",
        "J. D. Joannopoulos et al., Photonic Crystals: Molding the Flow of Light (Princeton, 2nd ed. 2008), ch. 3 on 2D polarisations",
      ],
    },

    // ------------------------------------------------------------------ 5
    {
      id: "energy-loudness-brightness",
      title: "Energy, loudness and brightness",
      summary: "Bigger waves carry much more energy; why sounds fade with distance, and how decibels measure loudness.",
      sections: [
        {
          level: "kids",
          html: `
<p>A whisper and a shout are both sound waves. The shout is a <b>bigger</b> wave: the air is pushed and pulled harder. Bigger waves carry more energy, and they carry a lot more than you might guess. Make a wave twice as tall and it carries <b>four times</b> as much energy.</p>
<p>For sound, more energy means <b>louder</b>. For light, more energy means <b>brighter</b>.</p>
<p>Waves also get weaker as they travel. Think of a ripple ring on a pond. As the ring grows, the same energy is shared out around a longer and longer circle, so each bit of the ring gets less. That is why a friend shouting from far away sounds quieter than one standing next to you, and why a torch looks dimmer from across a field.</p>
<figure class="diagram"><svg viewBox="0 0 400 150" role="img" aria-label="A small wave labelled quiet or dim and a big wave labelled loud or bright">
<path d="M20 50 Q42 30 65 50 T110 50 T155 50" fill="none" stroke="#60a5fa" stroke-width="3"/>
<text x="40" y="95" font-size="13" fill="currentColor">small wave:</text>
<text x="40" y="112" font-size="13" fill="currentColor">quiet, dim</text>
<path d="M215 50 Q237 10 260 50 T305 50 T350 50" fill="none" stroke="#f87171" stroke-width="3"/>
<text x="235" y="115" font-size="13" fill="currentColor">big wave:</text>
<text x="235" y="132" font-size="13" fill="currentColor">loud, bright</text>
</svg><figcaption>Twice as tall carries four times the energy.</figcaption></figure>
<div class="fact"><b>Fun fact:</b> your ears can hear an enormous range. The loudest sounds you can bear carry about a million million times more energy each second than the faintest sound you can just hear.</div>`,
        },
        {
          level: "school",
          html: `
<p>The <b>intensity</b> I of a wave is the power it carries through each square metre facing it, in watts per square metre (W/m²). For a given kind of wave and frequency, intensity is proportional to the <b>square</b> of the amplitude:</p>
<p class="formula">I ∝ A²</p>
<p>Double the amplitude, and the intensity becomes 2² = 4 times as large. Triple it: 9 times.</p>
<h4>Spreading out</h4>
<p>A small source sends its power P out in all directions, spread over a sphere of area 4πr². So intensity falls with distance r as</p>
<p class="formula">I = P / (4π r²)</p>
<p>This is the <b>inverse-square law</b>: twice as far away, a quarter of the intensity.</p>
<figure class="diagram"><svg viewBox="0 0 400 170" role="img" aria-label="Waves from a source spread over larger circles at larger distances">
<circle cx="40" cy="85" r="6" fill="#fbbf24"/>
<path d="M90 45 A60 60 0 0 1 90 125" fill="none" stroke="#60a5fa" stroke-width="3"/>
<path d="M160 15 A130 130 0 0 1 160 155" fill="none" stroke="#60a5fa" stroke-width="1.5"/>
<text x="62" y="160" font-size="12" fill="currentColor">distance r</text>
<text x="170" y="40" font-size="12" fill="currentColor">distance 2r: same energy,</text>
<text x="170" y="56" font-size="12" fill="currentColor">bigger surface, weaker wave</text>
</svg><figcaption>The same energy is shared over a larger area as the wave spreads.</figcaption></figure>
<h4>Decibels</h4>
<p>Our ears respond to a huge range of intensities, so loudness is measured on a logarithmic scale, the <b>sound level</b> in decibels (dB):</p>
<p class="formula">L = 10 × log₁₀(I / I₀), &nbsp; I₀ = 10⁻¹² W/m²</p>
<p>Here I₀ is roughly the quietest sound a young person can hear at 1 000 Hz (0 dB). Every +10 dB means 10 times the intensity.</p>
<table>
<tr><th>Sound</th><th>Level</th></tr>
<tr><td>Threshold of hearing</td><td>0 dB</td></tr>
<tr><td>Normal conversation</td><td>about 60 dB</td></tr>
<tr><td>Safe long-term average (NIDCD)</td><td>70 dBA or below</td></tr>
<tr><td>Risk of damage after a few hours</td><td>85 dBA</td></tr>
<tr><td>Headphones at maximum volume</td><td>up to about 110 dBA</td></tr>
<tr><td>Fireworks</td><td>140–160 dBA</td></tr>
</table>
<p><b>Worked example:</b> conversation is 60 dB, so I = I₀ × 10<sup>6</sup> = 10⁻⁶ W/m². A sound at 90 dB is 30 dB higher: 10 × 10 × 10 = 1 000 times the intensity.</p>`,
        },
        {
          level: "university",
          html: `
<p>For a mechanical wave with displacement amplitude A and angular frequency ω, the time-averaged energy density is proportional to ω² A² and the intensity is energy density times propagation speed. Specific cases:</p>
<ul>
<li>String: average power P = ½ μ ω² A² v.</li>
<li>Sound: I = p₀² / (2 ρ c) = p<sub>rms</sub>² / (ρ c), with p₀ the pressure amplitude and ρc the characteristic impedance (≈ 413 Pa·s/m for air at 20 °C).</li>
<li>EM wave in vacuum: I = ½ c ε₀ E₀².</li>
</ul>
<p>Checks: at I₀ = 10⁻¹² W/m², p<sub>rms</sub> = √(10⁻¹² × 413) ≈ 2.0 × 10⁻⁵ Pa, which is why the sound-pressure reference is p₀ = 20 μPa and L<sub>p</sub> = 20 log₁₀(p<sub>rms</sub>/p₀). For sunlight at Earth (about 1 361 W/m², integrated over the whole spectrum) the equivalent field amplitude is √(2I/(cε₀)) ≈ 1 kV/m.</p>
<h4>Spreading in 3D and in 2D</h4>
<p>Energy conservation fixes the geometric decay. A point source in 3D spreads over 4πr², so I ∝ r⁻² and A ∝ r⁻¹: doubling distance costs 6 dB. In 2D the wave front is a circle of length 2πr, so I ∝ r⁻¹ and A ∝ r<sup>−1/2</sup>: doubling distance costs only 3 dB. A 2D point source is equivalent to an infinitely long line source in 3D, such as a long busy road. <b>Wave Dude 2D is a 2D model</b>, so circular waves fade more slowly than real sound or light from a small source.</p>
<h4>Adding sources</h4>
<p>Two equal incoherent sources add intensities: +3 dB. Two coherent sources in phase add amplitudes: at points where they arrive together the amplitude doubles and the intensity quadruples (+6 dB), while elsewhere they cancel. Total power is conserved; interference only redistributes it. The intensity screen in the double-slit experiment shows exactly this.</p>
<h4>Perception</h4>
<p>Perceived loudness is not proportional to intensity. A rule of thumb from psychoacoustics is that a 10 dB increase sounds roughly twice as loud, and sensitivity depends strongly on frequency (the equal-loudness contours of ISO 226). Perceived brightness similarly depends on wavelength through the eye's luminosity function, which peaks near 555 nm in daylight.</p>`,
        },
        {
          level: "research",
          title: "Energy in the simulator",
          html: `
<p>Without damping, the leapfrog-type update conserves a discrete energy (a kinetic term built from u<sup>n+1</sup> − u<sup>n</sup> plus a potential term built from the stencil), as long as the stability condition holds. Waves therefore lose energy only through geometric spreading, damping cells, the absorbing edge and the soft sources (which can also absorb). Numerical dispersion changes the phase but not the conserved energy.</p>
<p>The <b>Intensity</b> view estimates the time average of u². It runs two cascaded one-pole low-pass filters, s₁ ← α s₁ + (1−α) u² and s₂ ← α s₂ + (1−α) s₁, with α = e<sup>−1/τ</sup> and τ = TimeDecayFactor × 100 / (lowest source level) steps, and displays √((s₁ + s₂)/2). For a steady sinusoid u = A cos ωt the filters converge to A²/2, with a residual ripple at 2ω that the cascade suppresses. The square root means the colour scale tracks amplitude, which keeps weak side lobes visible.</p>
<p>Because the field is scalar and dimensionless, "intensity" here is relative: u² is proportional to the energy density of the physical system u stands for. Comparisons within one run (for example the ratio between two probe readings, or a reflection coefficient measured with the integrated-intensity probe) are meaningful; absolute W/m² are not, unless you choose a physical scale for u, the cell size and the time step.</p>`,
        },
      ],
      tryIt: [
        { experiment: "splash", label: "Splash! Making waves" },
        { experiment: "double-slit", label: "The double slit" },
      ],
      sources: [
        "NIDCD (NIH), How loud is too loud? — https://www.nidcd.nih.gov/health/how-loud-too-loud",
        "HyperPhysics, Sound intensity and decibels — http://hyperphysics.phy-astr.gsu.edu/hbase/Sound/intens.html",
        "D. Halliday, R. Resnick, J. Walker, Fundamentals of Physics (Wiley), ch. on sound waves",
        "ISO 226:2003, Acoustics — Normal equal-loudness-level contours",
        "J. C. Strikwerda, Finite Difference Schemes and Partial Differential Equations (SIAM, 2nd ed. 2004), energy method for the wave equation",
      ],
    },

    // ------------------------------------------------------------------ 6
    {
      id: "sound-and-light-spectrum",
      title: "Spectra of sound and light",
      summary: "From infrasound to ultrasound and from radio to gamma rays, with real frequencies and wavelengths.",
      sections: [
        {
          level: "kids",
          html: `
<p>Sound waves come in many frequencies. Low frequencies are deep sounds, like a big drum. High frequencies are squeaky sounds, like a whistle. Your ears hear only a middle part of all the sounds there are.</p>
<ul>
<li>Sounds too <b>deep</b> for you to hear are called <b>infrasound</b>. Elephants talk to each other with deep rumbles that partly lie in this range.</li>
<li>Sounds too <b>high</b> for you to hear are called <b>ultrasound</b>. Dogs can hear some of them, which is why a dog whistle seems silent to you. Bats shout in ultrasound and listen to the echoes to find insects in the dark.</li>
</ul>
<p>Light is the same. The colours of the rainbow are the only part your eyes can see. Beyond red there is <b>infrared</b>, which you feel as warmth. Beyond violet there is <b>ultraviolet</b>, which gives you sunburn. Further out are <b>radio waves</b> and <b>microwaves</b> on one side and <b>X-rays</b> and <b>gamma rays</b> on the other. They are all the same kind of wave, just with different wavelengths.</p>
<figure class="diagram"><svg viewBox="0 0 400 140" role="img" aria-label="The light spectrum from radio to gamma rays, with the small visible band shown in colour">
<rect x="10" y="40" width="380" height="30" fill="none" stroke="currentColor" stroke-width="1.5"/>
<path d="M75 40 V70 M135 40 V70 M180 40 V70 M205 40 V70 M255 40 V70 M315 40 V70" stroke="currentColor" stroke-width="1"/>
<rect x="180" y="40" width="5" height="30" fill="#f87171"/>
<rect x="185" y="40" width="5" height="30" fill="#fbbf24"/>
<rect x="190" y="40" width="5" height="30" fill="#34d399"/>
<rect x="195" y="40" width="5" height="30" fill="#60a5fa"/>
<rect x="200" y="40" width="5" height="30" fill="#c084fc"/>
<text x="22" y="60" font-size="12" fill="currentColor">radio</text>
<text x="80" y="60" font-size="12" fill="currentColor">micro</text>
<text x="139" y="60" font-size="12" fill="currentColor">infra</text>
<text x="215" y="60" font-size="12" fill="currentColor">ultra</text>
<text x="267" y="60" font-size="12" fill="currentColor">X-ray</text>
<text x="327" y="60" font-size="12" fill="currentColor">gamma</text>
<path d="M192 75 V95" stroke="currentColor" stroke-width="1"/>
<text x="150" y="110" font-size="12" fill="currentColor">the colours you can see</text>
<text x="10" y="28" font-size="12" fill="currentColor">long waves</text>
<text x="300" y="28" font-size="12" fill="currentColor">short waves</text>
</svg><figcaption>Visible light is a very thin slice of all the light there is.</figcaption></figure>
<div class="fact"><b>Fun fact:</b> a microwave oven and Wi-Fi both use radio-like waves about 12 cm long, roughly the length of your hand.</div>`,
        },
        {
          level: "school",
          html: `
<h4>The sound spectrum</h4>
<p>Healthy young people hear from about <b>20 Hz to 20 000 Hz</b> (20 kHz); the top limit falls with age. Using λ = v / f with v = 343 m/s in air:</p>
<table>
<tr><th>Range</th><th>Frequency</th><th>Wavelength in air</th><th>Examples</th></tr>
<tr><td>Infrasound</td><td>below 20 Hz</td><td>longer than 17 m</td><td>elephant rumbles, volcanoes, large explosions</td></tr>
<tr><td>Audible</td><td>20 Hz – 20 kHz</td><td>17 m – 1.7 cm</td><td>piano: 27.5 Hz (lowest A) to 4 186 Hz (top C); concert A 440 Hz</td></tr>
<tr><td>Ultrasound</td><td>above 20 kHz</td><td>shorter than 1.7 cm</td><td>dogs hear up to about 45 kHz; bat calls mostly 20–120 kHz; medical scans about 2–18 MHz</td></tr>
</table>
<h4>The electromagnetic spectrum</h4>
<p>All EM waves travel at c ≈ 3.0 × 10⁸ m/s in vacuum, so λ = c / f. Approximate band limits (from NASA):</p>
<table>
<tr><th>Band</th><th>Wavelength</th><th>Frequency</th><th>Everyday example</th></tr>
<tr><td>Radio</td><td>longer than 10 cm</td><td>below 3 GHz</td><td>AM radio ~1 MHz (λ ≈ 300 m); FM 88–108 MHz (λ ≈ 3 m)</td></tr>
<tr><td>Microwave</td><td>1 mm – 10 cm</td><td>3–300 GHz</td><td>5 GHz Wi-Fi (λ = 6 cm); radar</td></tr>
<tr><td>Infrared</td><td>700 nm – 1 mm</td><td>300 GHz – 430 THz</td><td>heat from warm objects; TV remotes</td></tr>
<tr><td>Visible</td><td>about 400 – 700 nm</td><td>430 – 750 THz</td><td>red ≈ 650 nm, green ≈ 530 nm, violet ≈ 410 nm</td></tr>
<tr><td>Ultraviolet</td><td>10 – 400 nm</td><td>750 THz – 30 PHz</td><td>sunburn; fluorescent lamps</td></tr>
<tr><td>X-rays</td><td>0.01 – 10 nm</td><td>3 × 10¹⁶ – 3 × 10¹⁹ Hz</td><td>medical imaging</td></tr>
<tr><td>Gamma rays</td><td>shorter than 0.01 nm</td><td>above 3 × 10¹⁹ Hz</td><td>radioactive decay; cancer treatment</td></tr>
</table>
<p class="aside">The band edges are conventions, not sharp physical boundaries; 380 nm or 390 nm and 750 nm are also often quoted as the limits of visible light.</p>
<p><b>Worked example:</b> household Wi-Fi at 2.4 GHz: λ = 3.0 × 10⁸ / 2.4 × 10⁹ = <b>0.125 m</b> = 12.5 cm. Green light at 550 nm: f = 3.0 × 10⁸ / 5.5 × 10⁻⁷ ≈ <b>5.5 × 10¹⁴ Hz</b>.</p>`,
        },
        {
          level: "university",
          html: `
<p>Each EM photon carries energy E = h f = h c / λ; with h c ≈ 1 240 eV·nm, green light at 550 nm gives about 2.25 eV per photon, a 2.45 GHz microwave photon about 10 μeV, and a 0.01 nm X-ray about 124 keV. Photon energies above roughly 10 eV (far UV and beyond) can ionise atoms and molecules, which is why ultraviolet, X-rays and gamma rays are biologically hazardous while radio waves are not, at the same intensity.</p>
<p>The atmosphere is transparent only in "windows": the visible and near infrared, parts of the thermal infrared, and radio from about a centimetre to tens of metres. Ozone absorbs UV below about 300 nm, and X-rays and gamma rays are stopped high in the atmosphere, so X-ray and gamma-ray astronomy is done from space.</p>
<p>How a wave interacts with matter depends on λ compared with the size of the objects it meets. Particles much smaller than λ scatter with intensity ∝ λ⁻⁴ (Rayleigh scattering): blue light at 450 nm scatters (700/450)⁴ ≈ 6 times more strongly than red at 700 nm, which is why the clear sky is blue. Sound behaves analogously: a 100 Hz wave (λ ≈ 3.4 m) bends round a person easily, whereas 10 kHz (λ ≈ 3.4 cm) casts a noticeable acoustic shadow, which the brain uses to locate high-pitched sounds.</p>
<p>Absorption of sound in air grows roughly as f² at audio frequencies, so distant thunder sounds like a low rumble while a nearby strike cracks. At the other extreme, infrasound can travel thousands of kilometres; the International Monitoring System of the Comprehensive Nuclear-Test-Ban Treaty includes a global network of infrasound stations.</p>
<p>Ultrasound imaging trades depth for detail: higher frequency means shorter λ (in soft tissue, v ≈ 1 540 m/s, so λ ≈ 0.3 mm at 5 MHz) and finer resolution, but attenuation also rises with frequency, so deep organs are scanned at lower frequencies than superficial ones.</p>`,
        },
        {
          level: "research",
          title: "Putting metres on the grid",
          html: `
<p>The simulator has no built-in physical scale. Choosing a cell size Δx and requiring the long-wave grid speed 0.562 Δx/Δt to equal the physical speed fixes Δt. With about 15 cells per wavelength (level 60 in n = 1, low dispersion):</p>
<table>
<tr><th>Physical wave</th><th>λ</th><th>Δx</th><th>Δt</th><th>1920-cell scene</th></tr>
<tr><td>1 kHz sound in air</td><td>34.3 cm</td><td>≈ 2.3 cm</td><td>≈ 38 μs</td><td>≈ 44 m</td></tr>
<tr><td>Green light, 550 nm</td><td>550 nm</td><td>≈ 37 nm</td><td>≈ 0.07 fs</td><td>≈ 70 μm</td></tr>
<tr><td>2.4 GHz Wi-Fi</td><td>12.5 cm</td><td>≈ 8.3 mm</td><td>≈ 16 ps</td><td>≈ 16 m</td></tr>
<tr><td>10 s ocean swell (deep)</td><td>156 m</td><td>≈ 10 m</td><td>(dispersive: not a good match)</td><td>≈ 20 km</td></tr>
</table>
<p>Because the wave equation has no intrinsic length scale, a simulation of light passing a 70 μm lens is the same computation as sound passing a 44 m wall with the same shape in wavelengths. This scale invariance is why one scalar simulator can illustrate optics, acoustics and radio alike. It also marks the limits: real materials are dispersive (BK7 glass has n ≈ 1.522 at 486 nm and ≈ 1.514 at 656 nm), absorbing in a frequency-dependent way, and 3D. Deep-water waves are strongly dispersive (ω² = g k), so the simulator reproduces their refraction and diffraction only for a single frequency at a time, with an effective n chosen per depth.</p>`,
        },
      ],
      tryIt: [
        { experiment: "wavelength", label: "How long is a wave?" },
        { experiment: "echoes", label: "Echoes and mirrors" },
      ],
      sources: [
        "NASA Imagine the Universe, Wavelength, frequency and energy chart — https://imagine.gsfc.nasa.gov/science/toolbox/spectrum_chart.html",
        "NASA Science, Tour of the Electromagnetic Spectrum — https://science.nasa.gov/ems/",
        "HyperPhysics, Ultrasonic sound — http://hyperphysics.phy-astr.gsu.edu/hbase/Sound/usound.html",
        "K. B. Payne, W. R. Langbauer, E. M. Thomas, Infrasonic calls of the Asian elephant, Behavioral Ecology and Sociobiology 18, 297–301 (1986)",
        "CTBTO, Infrasound monitoring — https://www.ctbto.org/our-work/monitoring-technologies/infrasound-monitoring",
        "E. Hecht, Optics (Pearson, 5th ed. 2017), ch. 3 (Rayleigh scattering, dispersion)",
        "SCHOTT, N-BK7 optical glass data sheet — https://www.schott.com/",
      ],
    },
  ],
};
