// Wave Dude 2D web - "How it works" library: how waves behave (reflection, refraction, diffraction,
// interference, standing waves, damping, Doppler).
// GPL-3.0-or-later.

import type { LearnCategory } from "../types";

export const category: LearnCategory = {
  id: "how-waves-behave",
  title: "How waves behave",
  icon: "🔀",
  blurb: "What waves do when they meet walls, gaps, new materials, each other and moving sources: reflection, refraction, diffraction, interference, resonance, damping and the Doppler effect.",
  pages: [
    // ------------------------------------------------------------------ reflection
    {
      id: "reflection-and-echoes",
      title: "Reflection and echoes",
      summary: "Why waves bounce off walls and mirrors, why the angle in equals the angle out, and how curved surfaces gather waves into one spot.",
      sections: [
        {
          level: "kids",
          html: `
<p>Throw a ball straight at a wall and it comes straight back. Throw it at a slant and it bounces off at the same slant the other way. Waves do the same thing. When a wave reaches something it cannot pass through, like a wall or a cliff, it turns round and comes back. This is called <b>reflection</b>.</p>
<p>When the wave is sound, the sound that comes back is an <b>echo</b>. Shout towards a big cliff or a tall building far away and, a moment later, you hear your own voice again. The further away the wall, the longer you wait, because the sound needs time to get there and back. In a small room the echo comes back so quickly that it mixes with your voice, so you do not hear it as a separate sound.</p>
<p>Light reflects too: that is what a mirror does. And a curved dish, like a satellite dish, can catch waves coming from far away and send them all to one spot, where they become strong.</p>
<figure class="diagram"><svg viewBox="0 0 320 200" role="img" aria-label="A clap sends rings towards a wall; reflected rings come back">
  <rect x="260" y="10" width="14" height="180" fill="currentColor" opacity="0.35"/>
  <circle cx="60" cy="100" r="6" fill="#fbbf24"/>
  <g fill="none" stroke="#60a5fa" stroke-width="2.5">
    <path d="M106 61.4 A60 60 0 0 1 106 138.6"/>
    <path d="M136.6 35.7 A100 100 0 0 1 136.6 164.3"/>
  </g>
  <g fill="none" stroke="#f87171" stroke-width="2.5" stroke-dasharray="7 4">
    <path d="M243.9 21.3 A230 230 0 0 0 243.9 178.7"/>
    <path d="M206.3 7.7 A270 270 0 0 0 206.3 192.3"/>
  </g>
  <text x="60" y="128" font-size="13" fill="currentColor" text-anchor="middle">clap</text>
  <text x="267" y="198" font-size="13" fill="currentColor" text-anchor="middle">wall</text>
  <text x="120" y="22" font-size="13" fill="#60a5fa">going out</text>
  <text x="170" y="196" font-size="13" fill="#f87171" text-anchor="end">echo coming back</text>
</svg><figcaption>Your clap spreads out as rings (blue). They bounce off the wall and come back as an echo (red).</figcaption></figure>
<div class="fact"><b>Fun fact:</b> Bats find insects in the dark by making very high squeaks – too high for you to hear – and listening for the echoes. Dolphins do the same with clicks under water.</div>
<div class="home"><b>Try it at home:</b> Put a little water in the bath or a baking tray. Tap the water near one end with your finger and watch the ripple travel to the side, bounce and come back.</div>`,
        },
        {
          level: "school",
          html: `
<p>Draw a line at right angles to the surface at the point where the wave hits it. This line is called the <b>normal</b>. The angle between the incoming ray (the direction the wave travels) and the normal is the <b>angle of incidence</b> i; the angle between the reflected ray and the normal is the <b>angle of reflection</b> r. The law of reflection says</p>
<p class="formula">angle of incidence = angle of reflection &nbsp;&nbsp; (i = r)</p>
<p>and the incoming ray, the reflected ray and the normal all lie in one flat plane. This holds for light on a mirror, sound on a wall and water waves on a harbour wall. The surface only has to be smooth compared with the wavelength. A rough surface scatters the wave in many directions (<i>diffuse reflection</i>), which is why you see yourself in a mirror but not in a sheet of paper.</p>
<figure class="diagram"><svg viewBox="0 0 320 200" role="img" aria-label="Ray reflecting from a mirror with equal angles">
  <line x1="40" y1="160" x2="280" y2="160" stroke="currentColor" stroke-width="4"/>
  <line x1="160" y1="30" x2="160" y2="160" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 4"/>
  <line x1="60" y1="60" x2="160" y2="160" stroke="#fbbf24" stroke-width="2.5"/>
  <line x1="160" y1="160" x2="260" y2="60" stroke="#fbbf24" stroke-width="2.5"/>
  <polygon points="118,118 107.4,114.4 114.4,107.4" fill="#fbbf24"/>
  <polygon points="208,112 204.4,122.6 197.4,115.6" fill="#fbbf24"/>
  <path d="M160 120 A40 40 0 0 0 131.7 131.7" fill="none" stroke="#60a5fa" stroke-width="2"/>
  <path d="M160 120 A40 40 0 0 1 188.3 131.7" fill="none" stroke="#f87171" stroke-width="2"/>
  <text x="136" y="112" font-size="13" fill="#60a5fa" text-anchor="middle">i</text>
  <text x="184" y="112" font-size="13" fill="#f87171" text-anchor="middle">r</text>
  <text x="166" y="40" font-size="12" fill="currentColor">normal</text>
  <text x="56" y="52" font-size="12" fill="currentColor">incoming ray</text>
  <text x="264" y="52" font-size="12" fill="currentColor" text-anchor="end">reflected ray</text>
  <text x="270" y="182" font-size="12" fill="currentColor" text-anchor="end">mirror or wall</text>
</svg><figcaption>The angle of incidence i equals the angle of reflection r, both measured from the normal.</figcaption></figure>
<h4>Echo sounding</h4>
<p>Sound travels at about v = 343 m/s in air at 20 °C. An echo goes to the wall <i>and back</i>, so if it arrives a time t after the sound was made, the distance d to the wall is</p>
<p class="formula">d = v · t / 2</p>
<p><b>Worked example.</b> You clap and hear the echo from a cliff t = 0.5 s later: d = 343 × 0.5 / 2 ≈ 86 m. As a rule of thumb our ears separate two sounds only if they arrive about 0.1 s apart, which needs a wall at least 343 × 0.1 / 2 ≈ 17 m away. Nearer walls give <i>reverberation</i> instead – the sound seems to linger. Ships measure the depth of the sea the same way (sonar). Sound in sea water travels at about 1500 m/s, so an echo after 2.0 s means a depth of about 1500 × 2.0 / 2 = 1500 m.</p>
<h4>Curved mirrors</h4>
<p>On a curved surface each small piece obeys i = r with its own normal. A <b>parabolic</b> dish turns waves arriving parallel to its axis into waves that all meet at one point, the <b>focus</b>. Run it backwards and a source at the focus makes a parallel beam: that is how a torch or a car headlight works.</p>`,
        },
        {
          level: "university",
          html: `
<h4>Why i = r: Huygens and Fermat</h4>
<p>Let a plane wavefront of width L along the surface meet the surface at angle θ<sub>i</sub>. Each point of the surface becomes a source of secondary wavelets as the front reaches it. While the far edge of the front still travels a distance v·Δt = L sin θ<sub>i</sub> to the surface, the wavelet from the first point grows to radius v·Δt in the same medium. The reflected front is the common tangent to all wavelets; the two right triangles formed share the hypotenuse L and have an equal side v·Δt, so they are congruent and θ<sub>r</sub> = θ<sub>i</sub>. Equivalently, by Fermat's principle the path source → mirror → observer is stationary (here a minimum) when the angles are equal, an argument Hero of Alexandria already gave for light in antiquity. In wave-vector language: the tangential component of k must be the same for the incident and reflected wave, and |k| is the same on both since the medium is the same.</p>
<h4>How much comes back, and with which sign</h4>
<p>At normal incidence on a boundary between media of acoustic impedance Z<sub>1</sub> and Z<sub>2</sub> (Z = ρc, density times sound speed) the pressure reflection and transmission coefficients are</p>
<p class="formula">r = (Z<sub>2</sub> − Z<sub>1</sub>) / (Z<sub>2</sub> + Z<sub>1</sub>), &nbsp;&nbsp; t = 2Z<sub>2</sub> / (Z<sub>2</sub> + Z<sub>1</sub>), &nbsp;&nbsp; T<sub>energy</sub> = 4Z<sub>1</sub>Z<sub>2</sub> / (Z<sub>1</sub> + Z<sub>2</sub>)²</p>
<p>Air (Z ≈ 413 Pa·s/m) to water (Z ≈ 1.48 × 10⁶ Pa·s/m) gives r ≈ 0.9994 and T<sub>energy</sub> ≈ 1.1 × 10⁻³: only about 0.1% of the sound energy gets into the water. On a string, a fixed end (displacement forced to zero) gives r = −1, so a crest returns as a trough; a free end gives r = +1. For light at normal incidence the Fresnel equations give r = (n<sub>1</sub> − n<sub>2</sub>)/(n<sub>1</sub> + n<sub>2</sub>) for the electric field, so glass of n = 1.5 in air reflects (0.5/2.5)² = 4% of the power at each surface.</p>
<h4>Curved mirrors</h4>
<p>A parabola y = x²/(4f) sends every ray parallel to its axis through the focus at distance f from the vertex: by the focus–directrix definition of the parabola, the path from a plane wavefront to the focus has the same length for every ray, so all contributions arrive in phase. A spherical mirror of radius R does this only for rays close to the axis, with f ≈ R/2; rays further out cross the axis nearer the mirror (spherical aberration). An ellipse images one focus onto the other exactly, which is used in whispering galleries and in lithotripters that focus shock waves onto kidney stones. In a wave picture the focus is never a point: it is a spot about a wavelength across, set by diffraction at the edge of the finite mirror.</p>
<h4>In the simulator</h4>
<p>A wall is a block of cells with damping d = 0, and glass is a jump in refractive index n. A step in n reflects with r = (n<sub>1</sub> − n<sub>2</sub>)/(n<sub>1</sub> + n<sub>2</sub>) like the optical case. A wall behaves roughly like a fixed end – the reflected wave comes back inverted – but, as the research section explains, it also swallows part of the wave. Because the model is 2D, the echo of a point source is weakened twice: by the wall and by cylindrical spreading (amplitude ∝ 1/√r).</p>`,
        },
        {
          level: "research",
          title: "Walls on a grid",
          html: `
<p>A d = 0 cell is not an ideal hard wall. With d = 0 the velocity term vanishes and the update inside the wall becomes u<sub>new</sub> = u + c²(K ∗ u): a diffusion step rather than a frozen value. An arriving wave therefore sees a lossy boundary that is close to, but not exactly, the Dirichlet condition u = 0. Measured in this app (a plane Gaussian pulse at normal incidence on a 40-cell wall, the incident and returning pulse read by a point probe 300 cells in front, in a scene tall enough that its edges play no part), the reflected pulse comes back with the inverted sign of a fixed end but only about 57% of the incident amplitude at λ ≈ 45 cells, 44% at λ ≈ 15 cells and 23% at λ ≈ 6 cells; the rest is absorbed within the first few wall cells. (Those figures include a few per cent lost to the beam's own spreading over the 600-cell round trip: the same set-up gives 0.17, 0.30 and 0.46 for index steps to n = 1.5, 2 and 3, against 0.20, 0.33 and 0.50 from the Fresnel formula.) Measure your own geometry with a point probe, as in the absorbing-edge experiment. For a near-perfect mirror, a large index step (r = −0.82 for n = 10 against n = 1) or total internal reflection works better than a wall.</p>
<p>Curved walls are staircases of square cells. When the wavelength spans many cells the staircase is invisible; for λ of a few cells the steps scatter and blur the focus of a parabolic mirror. The standard remedies in finite-difference time-domain (FDTD) work are finer grids, sub-cell (conformal) boundary treatments such as the Dey–Mittra method, and effective-medium averaging of the material at the boundary (Taflove and Hagness). Numerical dispersion also bends the picture slightly: at λ ≈ 6 cells the phase velocity is about 3% low, so measured echo times run a few per cent long compared with the long-wave speed 0.562/n cells per step.</p>`,
        },
      ],
      tryIt: [
        { experiment: "echoes", label: "Echoes and mirrors" },
        { experiment: "splash", label: "Splash! Making waves" },
      ],
      sources: [
        "R. P. Feynman, R. B. Leighton, M. Sands, The Feynman Lectures on Physics, Vol. I, ch. 26: Optics, the principle of least time — https://www.feynmanlectures.caltech.edu/I_26.html",
        "E. Hecht, Optics, 5th ed. (Pearson, 2017), ch. 4: The propagation of light",
        "L. E. Kinsler, A. R. Frey, A. B. Coppens, J. V. Sanders, Fundamentals of Acoustics, 4th ed. (Wiley, 2000), ch. 6: Reflection and transmission",
        "A. Taflove, S. C. Hagness, Computational Electrodynamics: The Finite-Difference Time-Domain Method, 3rd ed. (Artech House, 2005)",
      ],
    },

    // ------------------------------------------------------------------ refraction
    {
      id: "refraction",
      title: "Refraction: why waves bend",
      summary: "When a wave changes speed at a slant it changes direction: Snell's law, the refractive index, and why sea waves turn towards the beach.",
      sections: [
        {
          level: "kids",
          html: `
<p>Waves do not always travel at the same speed. Sound is faster in water than in air. Light is slower in glass than in air. And water waves are slower where the water is shallow.</p>
<p>When a wave goes from a fast place into a slow place at a slant, it <b>bends</b>. This is called <b>refraction</b>. Imagine a row of children walking side by side, arms linked, across a playground and into a sandpit at a slant. The child who reaches the sand first has to slow down, while the others are still walking fast on the hard ground. So the whole row swings round and walks off in a new direction.</p>
<p>That is why sea waves arrive almost straight on at the beach, even when they come from the side far out at sea. The end of each wave that reaches shallow water first slows down, and the wave turns to face the shore.</p>
<div class="home"><b>Try it at home:</b> Put a pencil in a glass of water and look at it from the side. The pencil seems to break at the water's surface. Light from the part under water bends as it leaves the water, so your eyes are tricked about where that part is.</div>
<div class="fact"><b>Fun fact:</b> A swimming pool always looks shallower than it really is. Looking straight down, it seems only about three-quarters as deep. The same bending of light is to blame.</div>`,
        },
        {
          level: "school",
          html: `
<p>The <b>refractive index</b> n of a material says how many times slower a wave travels in it than in a reference medium (for light: vacuum):</p>
<p class="formula">n = c / v</p>
<p>Here c is the speed in the reference medium (3.00 × 10⁸ m/s for light in vacuum) and v the speed in the material. Glass has n ≈ 1.5, water n ≈ 1.33. When a wave crosses into a new material its <b>frequency stays the same</b> (each crest that arrives makes one crest that leaves), so by v = f · λ the wavelength shrinks by the same factor: λ<sub>material</sub> = λ<sub>vacuum</sub> / n.</p>
<p>A ray bends <i>towards</i> the normal when it slows down and <i>away</i> from it when it speeds up. <b>Snell's law</b> gives the angles:</p>
<p class="formula">n<sub>1</sub> · sin θ<sub>1</sub> = n<sub>2</sub> · sin θ<sub>2</sub></p>
<p>θ<sub>1</sub> and θ<sub>2</sub> are the angles between the rays and the normal on each side; n<sub>1</sub> and n<sub>2</sub> are the refractive indices of the two materials.</p>
<figure class="diagram"><svg viewBox="0 0 320 220" role="img" aria-label="A ray bending towards the normal as it enters glass">
  <rect x="20" y="110" width="280" height="100" fill="#60a5fa" opacity="0.15"/>
  <line x1="20" y1="110" x2="300" y2="110" stroke="currentColor" stroke-width="2"/>
  <line x1="160" y1="20" x2="160" y2="205" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 4"/>
  <line x1="95.7" y1="33.4" x2="160" y2="110" stroke="#fbbf24" stroke-width="2.5"/>
  <line x1="160" y1="110" x2="202.9" y2="200.3" stroke="#fbbf24" stroke-width="2.5"/>
  <polygon points="131.1,75.5 120.9,71.0 128.5,64.6" fill="#fbbf24"/>
  <polygon points="185.7,164.2 176.9,157.3 185.9,153.1" fill="#fbbf24"/>
  <path d="M160 75 A35 35 0 0 0 137.5 83.2" fill="none" stroke="#f87171" stroke-width="2"/>
  <path d="M160 145 A35 35 0 0 0 175 141.6" fill="none" stroke="#34d399" stroke-width="2"/>
  <text x="140" y="68" font-size="13" fill="#f87171" text-anchor="end">θ₁ = 40°</text>
  <text x="182" y="160" font-size="13" fill="#34d399">θ₂ ≈ 25°</text>
  <text x="28" y="100" font-size="12" fill="currentColor">air, n₁ = 1.00 (fast)</text>
  <text x="28" y="200" font-size="12" fill="currentColor">glass, n₂ = 1.50 (slow)</text>
  <text x="166" y="30" font-size="12" fill="currentColor">normal</text>
</svg><figcaption>Entering a slower material, the ray bends towards the normal.</figcaption></figure>
<p><b>Worked example.</b> A beam in air (n<sub>1</sub> = 1.00) hits glass (n<sub>2</sub> = 1.50) at θ<sub>1</sub> = 40°. Then sin θ<sub>2</sub> = 1.00 × sin 40° / 1.50 = 0.643 / 1.50 = 0.429, so θ<sub>2</sub> ≈ 25.4°. Light with a wavelength of 600 nm in air has a wavelength of 400 nm inside the glass.</p>
<p>Going the other way, from slow to fast, the formula can ask for sin θ<sub>2</sub> &gt; 1. Then no ray gets out at all: <b>total internal reflection</b>. It starts at the critical angle given by sin θ<sub>c</sub> = n<sub>2</sub> / n<sub>1</sub>, which is about 42° from glass into air.</p>
<h4>Sea waves and sound</h4>
<p>In shallow water (depth h much less than the wavelength) the speed of a water wave depends only on the depth: v = √(g · h), with g = 9.8 m/s². At 10 m depth v ≈ 9.9 m/s; at 1 m depth v ≈ 3.1 m/s. The part of a crest over shallower water slows down, so the crests swing round until they are nearly parallel to the shore. Over an underwater ridge the crests bend inwards, which is why headlands get bigger waves than bays.</p>
<p>Sound refracts too. Sound is faster in warm air. On a calm evening the air near the ground is often cooler than the air above it, so sound heading upwards bends back down, and distant trains or traffic can sound surprisingly clear.</p>`,
        },
        {
          level: "university",
          html: `
<h4>Snell's law three ways</h4>
<p><b>Huygens.</b> A plane front of width L along the interface meets it at angle θ<sub>1</sub>. In time Δt the far end travels v<sub>1</sub>Δt = L sin θ<sub>1</sub> in medium 1, while the wavelet launched at the near end grows to radius v<sub>2</sub>Δt = L sin θ<sub>2</sub> in medium 2. Eliminating L and Δt gives sin θ<sub>1</sub>/v<sub>1</sub> = sin θ<sub>2</sub>/v<sub>2</sub>, that is n<sub>1</sub> sin θ<sub>1</sub> = n<sub>2</sub> sin θ<sub>2</sub>.</p>
<p><b>Phase matching.</b> The fields on both sides must vary in the same way along the interface at all times, so the tangential wavenumber is continuous: k<sub>1</sub> sin θ<sub>1</sub> = k<sub>2</sub> sin θ<sub>2</sub> with k = nω/c. This holds for any linear wave – light, sound, seismic or water waves – and it fixes the reflected angle at the same time.</p>
<p><b>Fermat.</b> The travel time from A (height a above the interface) to B (depth b below it, horizontal distance D), crossing at x, is</p>
<p class="formula">T(x) = √(a² + x²) / v<sub>1</sub> + √(b² + (D − x)²) / v<sub>2</sub></p>
<p>Setting dT/dx = 0 gives x / (v<sub>1</sub>√(a² + x²)) = (D − x) / (v<sub>2</sub>√(b² + (D − x)²)), which is again sin θ<sub>1</sub>/v<sub>1</sub> = sin θ<sub>2</sub>/v<sub>2</sub>.</p>
<h4>Beyond the critical angle</h4>
<p>If n<sub>1</sub> sin θ<sub>1</sub> &gt; n<sub>2</sub> the normal wavenumber in medium 2, k<sub>z</sub> = √(n<sub>2</sub>²k<sub>0</sub>² − k<sub>x</sub>²), becomes imaginary. The field there decays as e<sup>−κz</sup> with κ = k<sub>0</sub>√(n<sub>1</sub>² sin² θ<sub>1</sub> − n<sub>2</sub>²): an evanescent wave that carries no energy on average. Bring a second dense medium within a distance of order 1/κ and energy tunnels across (frustrated total internal reflection), the optical analogue of quantum tunnelling.</p>
<h4>Smoothly varying speed</h4>
<p>When n varies continuously, rays curve according to the ray equation</p>
<p class="formula">d/ds ( n · dr/ds ) = ∇n</p>
<p>where s is arc length along the ray: rays bend towards higher n (lower speed). Examples are mirages (hot air near a road has lower n, so rays from the sky curve up into your eye), the deep-ocean SOFAR channel (a minimum of sound speed several hundred metres to about a kilometre down that traps sound over thousands of kilometres) and shallow-water waves, where n ∝ 1/√h.</p>
<h4>History</h4>
<p>The sine law appears in a treatise on burning mirrors and lenses by Ibn Sahl (Baghdad, 984), as reconstructed by R. Rashed. Thomas Harriot found it in 1602 and Willebrord Snell in 1621, neither publishing; René Descartes published it in his <i>Dioptrique</i> of 1637.</p>`,
        },
        {
          level: "research",
          title: "Refraction on a grid",
          html: `
<p>Each cell in Wave Dude 2D carries c² = 1/n², applied outside the discrete Laplacian, so the model is u<sub>tt</sub> = c²(x)∇²u. For that equation u and its normal derivative are continuous across an interface, and Snell's law and the normal-incidence coefficient r = (n<sub>1</sub> − n<sub>2</sub>)/(n<sub>1</sub> + n<sub>2</sub>) follow exactly in the continuum limit. (Acoustics with varying density needs ρc²∇·(ρ⁻¹∇p), with different interface conditions; the simulator has no density.)</p>
<p>Two numerical effects make measured angles deviate from Snell's law:</p>
<ul>
<li><b>Numerical dispersion.</b> The grid phase velocity is about 1% low at 10 cells per wavelength, 3% at 6 and 7% at 4. Inside glass the wavelength shrinks by n, so the error is larger in the glass than outside, and the effective index ratio is slightly larger than the nominal one. At the default level 60 (λ ≈ 15 cells for n = 1), glass with n = 1.5 has λ ≈ 10 cells and n = 2.5 only λ ≈ 6 cells. Lower source levels or the 4th-order stencil reduce the effect.</li>
<li><b>Staircasing.</b> A slanted interface is a staircase of square cells. For λ ≫ 1 cell the steps average out, but they scatter weakly and smear the interface over about a cell. Sub-pixel averaging of the material (for example Farjadpour et al. 2006) is the usual cure in FDTD codes.</li>
</ul>
<p>A useful exercise: measure θ<sub>2</sub> against θ<sub>1</sub> in the refraction experiment for several source levels, fit an effective n, and compare the deviation with the dispersion relation 4 sin²(ω/2) = 1.264 c² sin²(k/2).</p>`,
        },
      ],
      tryIt: [
        { experiment: "refraction", label: "Bending waves: Snell's law" },
        { experiment: "total-internal-reflection", label: "Trapped light: total internal reflection" },
      ],
      sources: [
        "E. Hecht, Optics, 5th ed. (Pearson, 2017), ch. 4",
        "M. Born, E. Wolf, Principles of Optics, 7th ed. (Cambridge University Press, 1999), ch. 1 and 3",
        "R. P. Feynman et al., The Feynman Lectures on Physics, Vol. I, ch. 26 — https://www.feynmanlectures.caltech.edu/I_26.html",
        "R. Rashed, A pioneer in anaclastics: Ibn Sahl on burning mirrors and lenses, Isis 81, 464–491 (1990)",
        "Waves in shallow water, Introduction to Ocean Sciences (LibreTexts) — https://geo.libretexts.org/Courses/American_Meteorological_Society/Introduction_to_Ocean_Sciences_6e_(Segar)/09%3A_Waves/9.08%3A_Waves_in_Shallow_Water",
        "A. Farjadpour et al., Improving accuracy by subpixel smoothing in the finite-difference time domain, Optics Letters 31, 2972 (2006)",
      ],
    },

    // ------------------------------------------------------------------ diffraction
    {
      id: "diffraction",
      title: "Diffraction: spreading through gaps and round corners",
      summary: "Waves spread out behind gaps and edges, the more so the longer the wave compared with the gap – which is why you can hear round corners but not see round them.",
      sections: [
        {
          level: "kids",
          html: `
<p>Stand in the hall outside a friend's bedroom. You cannot see them through the wall, but you can hear their music through the open door, even when you are not standing in front of it. Why can sound get round the corner when light cannot?</p>
<p>When a wave squeezes through a gap or passes the edge of a wall, it spreads out into the space behind. This is called <b>diffraction</b>. How much it spreads depends on how long the waves are compared with the gap. The sounds of voices and music have long waves, often about as long as your arm or longer – not so different from the width of a doorway. So they spread out a lot after passing through it. Light waves are tiny, about a hundred times thinner than a hair. Light goes through a doorway in almost straight lines and makes sharp shadows.</p>
<p>You can see the same thing in a harbour: waves from the open sea come through the narrow entrance and spread out in rings inside.</p>
<figure class="diagram"><svg viewBox="0 0 320 200" role="img" aria-label="Straight waves pass a gap in a wall and spread out as rings">
  <rect x="150" y="0" width="10" height="80" fill="currentColor" opacity="0.45"/>
  <rect x="150" y="120" width="10" height="80" fill="currentColor" opacity="0.45"/>
  <g stroke="#60a5fa" stroke-width="2.5">
    <line x1="30" y1="20" x2="30" y2="180"/>
    <line x1="60" y1="20" x2="60" y2="180"/>
    <line x1="90" y1="20" x2="90" y2="180"/>
    <line x1="120" y1="20" x2="120" y2="180"/>
  </g>
  <g fill="none" stroke="#60a5fa" stroke-width="2.5">
    <path d="M167.8 71 A30 30 0 0 1 167.8 129"/>
    <path d="M175.5 42 A60 60 0 0 1 175.5 158"/>
    <path d="M183.3 13.1 A90 90 0 0 1 183.3 186.9"/>
    <path d="M191.1 -15.9 A120 120 0 0 1 191.1 215.9"/>
  </g>
  <text x="140" y="104" font-size="13" fill="#fbbf24" text-anchor="end">gap</text>
  <text x="75" y="196" font-size="12" fill="currentColor" text-anchor="middle">straight waves</text>
  <text x="300" y="104" font-size="12" fill="currentColor" text-anchor="end">spreading</text>
</svg><figcaption>Straight waves arrive at a narrow gap and spread out on the other side.</figcaption></figure>
<div class="fact"><b>Fun fact:</b> The word "diffraction" was invented by the Italian scientist Francesco Maria Grimaldi. His book about it came out in 1665, two years after he died.</div>
<div class="home"><b>Try it at home:</b> Play some music in one room and walk slowly along the hallway outside, away from the open door. Listen: the deep bass sounds reach you round the corner better than the high, tinkly sounds, because deep sounds have longer waves.</div>`,
        },
        {
          level: "school",
          html: `
<p>When straight (plane) waves pass through a gap of width a, the wave that comes out spreads into a fan. How much depends on the ratio of the wavelength λ to the gap a:</p>
<ul>
<li>gap much wider than λ: the wave goes through almost as a straight beam, with a little spreading at the edges;</li>
<li>gap about λ or narrower: the wave spreads almost into a half-circle, as if the gap were a new point source.</li>
</ul>
<p>Behind a single gap the beam is not even. There is a strong centre, and then directions where waves from different parts of the gap cancel. The first of these dark directions, at angle θ from straight ahead, is given by</p>
<p class="formula">a · sin θ = λ</p>
<p>where a is the width of the gap and λ the wavelength. Why? Split the gap into a top half and a bottom half. In this direction every point in the top half has a partner in the bottom half whose path is exactly λ/2 longer, so they cancel in pairs.</p>
<p><b>Worked example 1 (in the simulator).</b> With λ = 15 cells and a gap a = 50 cells: sin θ = 15 / 50 = 0.30, so θ ≈ 17°. Narrow the gap to 30 cells: sin θ = 0.50 and θ = 30°. A narrower gap gives a wider spread.</p>
<p><b>Worked example 2 (round corners).</b> A sound of 343 Hz has λ = v / f = 343 / 343 = 1.0 m. Through a 0.9 m doorway λ/a is more than 1: there is no dark direction at all, and the sound fills the space beyond. Green light, with λ = 550 nm = 5.5 × 10⁻⁷ m, through the same doorway gives sin θ ≈ 6 × 10⁻⁷, an angle far too small to notice. Light makes sharp shadows; sound does not.</p>
<p>Diffraction also limits how sharp a picture can be. A telescope, camera or eye with an opening of width D cannot separate details closer together than an angle of roughly λ / D.</p>`,
        },
        {
          level: "university",
          html: `
<h4>Huygens–Fresnel and the Fraunhofer limit</h4>
<p>Treat every point of the aperture as a secondary source. Far from the aperture – the Fraunhofer regime, Fresnel number N<sub>F</sub> = a²/(Lλ) ≪ 1 with L the distance to the screen – the field in direction θ is the Fourier transform of the aperture function. For a slit of width a lit by a plane wave at normal incidence:</p>
<p class="formula">E(θ) ∝ ∫<sub>−a/2</sub><sup>a/2</sup> e<sup>−iky sin θ</sup> dy = a · sin β / β, &nbsp;&nbsp; β = (ka/2) sin θ = (πa/λ) sin θ</p>
<p class="formula">I(θ) = I<sub>0</sub> · (sin β / β)²</p>
<p>The zeros lie at a sin θ = mλ (m = ±1, ±2, …), and the side lobes are weak: the first is 4.7% of the central peak. The central lobe has angular half-width λ/a – the reciprocal relation between aperture and beam angle behind antenna beamwidths, the diffraction limit (1.22 λ/D for a circular aperture in 3D) and the Fourier uncertainty relation for wave packets.</p>
<p>Closer in (N<sub>F</sub> ≳ 1) the Fresnel regime applies: the pattern looks like the geometric shadow with fringes at its edges, described by the Fresnel integrals (Cornu spiral).</p>
<h4>Two dimensions are different</h4>
<p>The simulator is 2D, so its "slit" is really an infinitely long slot and a point source is really a line source in 3D. The outgoing 2D Green's function is a Hankel function,</p>
<p class="formula">G(r) = (i/4) H<sub>0</sub><sup>(1)</sup>(kr) ≈ (i/4) √(2/(πkr)) e<sup>i(kr − π/4)</sup> &nbsp;&nbsp; (kr ≫ 1)</p>
<p>so amplitudes fall as 1/√r (cylindrical spreading) instead of 1/r. Angular patterns such as sinc² are unchanged.</p>
<h4>Edges and shadows</h4>
<p>Sommerfeld's exact solution (1896) for a perfectly conducting half-plane shows the field leaking smoothly into the geometric shadow, decaying with angle – the mathematical core of hearing round corners. Keller's geometrical theory of diffraction (1962) generalises this with "diffracted rays" launched from edges and tips, and is still the basis of many high-frequency scattering codes.</p>`,
        },
        {
          level: "research",
          title: "Diffraction in the model",
          html: `
<p>Slits in the simulator are gaps in a wall of d = 0 cells. Such a wall is lossy rather than perfectly hard (see Reflection and echoes), so the jaws obey neither the Dirichlet nor the Neumann condition of Sommerfeld's problem. Kirchhoff's approximation (undisturbed field in the aperture, zero on the screen) is itself mathematically inconsistent; the Rayleigh–Sommerfeld integrals repair the inconsistency but not the physics of a real screen. For a ≫ λ these differences only touch the edges and the far-field pattern converges to sinc². For a ≲ λ the transmission depends strongly on the edge physics: in the double-slit experiment, slits narrower than about half a wavelength let very little through. Bethe (1944) showed that small holes in thin perfectly conducting screens transmit far less than their area suggests; the 2D scalar analogue with lossy jaws is easy to measure here.</p>
<p>Practical points for quantitative work: wall thickness matters when it is comparable to λ (a deep slot acts as a short waveguide); numerical dispersion depends on wavelength and in general slightly on direction, so use λ ≥ 10 cells for checking a sin θ = λ; and the far field needs L ≫ a²/λ – for a = 50 and λ = 15 that is L ≫ 170 cells, which together with the absorbing edge sets the minimum scene size.</p>`,
        },
      ],
      tryIt: [
        { experiment: "single-slit", label: "One gap: how waves spread" },
        { experiment: "double-slit", label: "The double slit" },
      ],
      sources: [
        "R. P. Feynman et al., The Feynman Lectures on Physics, Vol. I, ch. 30: Diffraction — https://www.feynmanlectures.caltech.edu/I_30.html",
        "E. Hecht, Optics, 5th ed. (Pearson, 2017), ch. 10: Diffraction",
        "M. Born, E. Wolf, Principles of Optics, 7th ed. (Cambridge University Press, 1999), ch. 8 and 11",
        "A. Sommerfeld, Mathematische Theorie der Diffraction, Mathematische Annalen 47, 317–374 (1896)",
        "J. B. Keller, Geometrical theory of diffraction, J. Opt. Soc. Am. 52, 116–130 (1962)",
        "H. A. Bethe, Theory of diffraction by small holes, Physical Review 66, 163–182 (1944)",
        "F. M. Grimaldi, Physico-mathesis de lumine, coloribus, et iride (Bologna, 1665)",
      ],
    },

    // ------------------------------------------------------------------ interference
    {
      id: "interference-and-superposition",
      title: "Interference and superposition",
      summary: "Overlapping waves simply add: crest plus crest makes a bigger crest, crest plus trough cancels – giving fringes, beats and noise-cancelling headphones.",
      sections: [
        {
          level: "kids",
          html: `
<p>What happens when two waves meet? They do not crash into each other like balls. They pass straight through each other and carry on as if nothing had happened. But where they overlap, they <b>add up</b>.</p>
<p>If a hump from one wave meets a hump from the other, you get a bigger hump. If a hump meets a dip, they cancel out and the water stays flat for a moment. Scientists call this adding-up <b>superposition</b>, and the patterns it makes <b>interference</b>.</p>
<p>Drop two pebbles into a pond at the same time, a little apart. Each makes rings. Where the rings cross you can see lines where the water hardly moves, and lines where it jumps up and down a lot. In the simulator, two sources make exactly this pattern.</p>
<figure class="diagram"><svg viewBox="0 0 320 200" role="img" aria-label="Two sets of overlapping rings from two sources">
  <g fill="none" stroke="#60a5fa" stroke-width="1.8" opacity="0.8"><circle cx="125" cy="100" r="18"/><circle cx="125" cy="100" r="36"/><circle cx="125" cy="100" r="54"/><circle cx="125" cy="100" r="72"/><circle cx="125" cy="100" r="90"/><circle cx="125" cy="100" r="108"/><circle cx="125" cy="100" r="126"/><circle cx="125" cy="100" r="144"/></g>
  <g fill="none" stroke="#f87171" stroke-width="1.8" opacity="0.8"><circle cx="195" cy="100" r="18"/><circle cx="195" cy="100" r="36"/><circle cx="195" cy="100" r="54"/><circle cx="195" cy="100" r="72"/><circle cx="195" cy="100" r="90"/><circle cx="195" cy="100" r="108"/><circle cx="195" cy="100" r="126"/><circle cx="195" cy="100" r="144"/></g>
  <circle cx="125" cy="100" r="5" fill="#60a5fa"/>
  <circle cx="195" cy="100" r="5" fill="#f87171"/>
</svg><figcaption>Rings from two sources overlap. Where blue and red crests cross, the water rises extra high; halfway between, crests meet troughs and the water stays still.</figcaption></figure>
<p>Some headphones use this trick. A tiny microphone listens to the noise outside, and the headphones play the opposite sound – a dip wherever the noise has a hump. The two cancel, and you hear much less of the noise.</p>
<div class="fact"><b>Fun fact:</b> Two notes that are almost, but not quite, the same go "wah-wah-wah" when played together. Musicians listen for this wobble, called <b>beats</b>, when they tune: when the wobble stops, the notes match.</div>`,
        },
        {
          level: "school",
          html: `
<p><b>The principle of superposition:</b> when two or more waves overlap, the total displacement at each point is the sum of the separate displacements. For water ripples, ordinary sound and light this is extremely accurate.</p>
<figure class="diagram"><svg viewBox="0 0 340 210" role="img" aria-label="Two waves in step add up; two waves out of step cancel">
  <g fill="none" stroke-width="2.5">
    <path d="M20 40 Q36.25 12 52.5 40 T85 40 T117.5 40 T150 40" stroke="#60a5fa"/>
    <path d="M20 90 Q36.25 62 52.5 90 T85 90 T117.5 90 T150 90" stroke="#f87171"/>
    <path d="M20 155 Q36.25 99 52.5 155 T85 155 T117.5 155 T150 155" stroke="#34d399"/>
    <path d="M190 40 Q206.25 12 222.5 40 T255 40 T287.5 40 T320 40" stroke="#60a5fa"/>
    <path d="M190 90 Q206.25 118 222.5 90 T255 90 T287.5 90 T320 90" stroke="#f87171"/>
    <path d="M190 155 L320 155" stroke="#34d399"/>
  </g>
  <text x="85" y="70" font-size="14" fill="currentColor" text-anchor="middle">+</text>
  <text x="85" y="122" font-size="14" fill="currentColor" text-anchor="middle">=</text>
  <text x="255" y="70" font-size="14" fill="currentColor" text-anchor="middle">+</text>
  <text x="255" y="122" font-size="14" fill="currentColor" text-anchor="middle">=</text>
  <text x="85" y="202" font-size="12" fill="currentColor" text-anchor="middle">in step: constructive</text>
  <text x="255" y="202" font-size="12" fill="currentColor" text-anchor="middle">out of step: destructive</text>
</svg><figcaption>Crest meets crest: the sum is twice as tall. Crest meets trough: the sum is zero.</figcaption></figure>
<p>Two sources that vibrate in step (same frequency, same timing) each send out waves. At a point P the <b>path difference</b> Δ is the distance from source 2 minus the distance from source 1.</p>
<ul>
<li><b>Constructive</b> interference (loud, bright) when Δ = m · λ, with m = 0, 1, 2, … – crest meets crest.</li>
<li><b>Destructive</b> interference (quiet, dark) when Δ = (m + ½) · λ – crest meets trough.</li>
</ul>
<p>For two slits a distance d apart, far away from the slits the bright directions θ satisfy</p>
<p class="formula">d · sin θ = m · λ</p>
<p><b>Worked example.</b> With λ = 15 cells and slits d = 60 cells apart, the first bright fringe beside the centre has sin θ = 15 / 60 = 0.25, so θ ≈ 14.5°. On a screen L = 600 cells away the fringes are roughly L · λ / d = 600 × 15 / 60 = 150 cells apart.</p>
<p>No energy is destroyed in the dark fringes: it is moved into the bright ones. Averaged over the whole pattern you get just the sum of the two separate intensities. Thomas Young described his two-slit experiment with light to the Royal Society in 1803, and it convinced many that light is a wave.</p>
<h4>Beats</h4>
<p>Two waves with slightly different frequencies f<sub>1</sub> and f<sub>2</sub> drift in and out of step. The loudness rises and falls at the <b>beat frequency</b></p>
<p class="formula">f<sub>beat</sub> = | f<sub>1</sub> − f<sub>2</sub> |</p>
<p>Example: tuning forks of 440 Hz and 444 Hz give 4 beats per second.</p>
<h4>Noise cancelling</h4>
<p>Active noise control adds a second sound with the same shape as the noise but upside down (inverted), so the sum is close to zero. Paul Lueg patented the idea in the 1930s; electronics fast enough to make it practical came decades later. It works best on steady, low-pitched noise such as engine drone: the long wavelength means that small errors in timing or position still leave the two waves nearly opposite.</p>`,
        },
        {
          level: "university",
          html: `
<h4>Adding waves with phasors</h4>
<p>Write each monochromatic wave as the real part of A<sub>j</sub> e<sup>i(φ<sub>j</sub> − ωt)</sup>. For two waves meeting at a point with phase difference δ = kΔ + (φ<sub>2</sub> − φ<sub>1</sub>), the time-averaged intensity (I ∝ |A|²) is</p>
<p class="formula">I = I<sub>1</sub> + I<sub>2</sub> + 2√(I<sub>1</sub>I<sub>2</sub>) · cos δ</p>
<p>The last term is the interference term. It averages to zero over the pattern (or over a random relative phase), which is energy conservation. The fringe visibility V = (I<sub>max</sub> − I<sub>min</sub>)/(I<sub>max</sub> + I<sub>min</sub>) = 2√(I<sub>1</sub>I<sub>2</sub>)/(I<sub>1</sub> + I<sub>2</sub>) reaches 1 only for equal intensities.</p>
<h4>Many sources: gratings and arrays</h4>
<p>N equal sources spaced d apart with a phase step Δφ between neighbours give the array factor</p>
<p class="formula">|AF(θ)|² = [ sin(Nψ/2) / sin(ψ/2) ]², &nbsp;&nbsp; ψ = kd sin θ + Δφ</p>
<p>with principal maxima N² times a single source where ψ = 2πm, and N − 2 weak side lobes between neighbouring maxima. Changing Δφ steers the main lobe to sin θ<sub>0</sub> = −Δφ/(kd). Extra principal maxima ("grating lobes") enter the visible range when d ≥ λ even without steering, and for any d &gt; λ/2 when the beam is steered far enough. For a grating of slits of finite width the pattern is the array factor times the single-slit envelope – the convolution theorem at work.</p>
<h4>Beats</h4>
<p class="formula">cos ω<sub>1</sub>t + cos ω<sub>2</sub>t = 2 cos(½(ω<sub>1</sub> − ω<sub>2</sub>)t) · cos(½(ω<sub>1</sub> + ω<sub>2</sub>)t)</p>
<p>A carrier at the mean frequency under an envelope at half the difference frequency; the intensity envelope therefore repeats at |ω<sub>1</sub> − ω<sub>2</sub>|, which is f<sub>beat</sub> = |f<sub>1</sub> − f<sub>2</sub>|. A detector only sees beats if it responds faster than the beat period; an infinitely slow intensity meter reads I<sub>1</sub> + I<sub>2</sub>.</p>
<h4>Coherence</h4>
<p>Stable fringes need a fixed phase relation. A source of bandwidth Δf has a coherence time τ<sub>c</sub> ≈ 1/Δf and coherence length ℓ<sub>c</sub> = cτ<sub>c</sub>; fringes survive only for path differences below ℓ<sub>c</sub>. For sunlight ℓ<sub>c</sub> is of the order of a micrometre, while a frequency-stabilised laser can reach kilometres. The simulator's sources are perfect sinusoids, so its fringes never wash out unless the sources have different frequencies.</p>`,
        },
        {
          level: "research",
          title: "Superposition in the model, and its limits",
          html: `
<p>The update rule is linear in u, so for a fixed scene superposition holds to floating-point precision. One subtlety: a soft source cell is pulled towards its drive every step (u ← 0.9u + 0.1·drive), which also damps any other wave passing through that cell. Each source is therefore a weak scatterer for the waves of the others, and a two-source run differs slightly from the sum of two single-source runs. That is one reason the "detach" option exists: it fades a source out over 30 steps and then releases the cell.</p>
<p>Real waves are linear only at small amplitude: steep water waves, very loud sound (shock formation) and intense light (nonlinear optics, frequency doubling) all break superposition. The simulator contains no nonlinearity.</p>
<p>The intensity view is itself a filter: u² smoothed by two cascaded one-pole filters with time constant τ = TimeDecayFactor × 100 / (lowest source level) steps, about 17 steps for level 60 at the default factor 10. That removes the ripple at 2ω but follows slower changes. Two sources at levels 60 and 62 differ by Δω = 2/255 rad per step (frequency scale 2), a beat period of about 800 steps, so the fringe pattern visibly sweeps across the screen and a point probe shows the intensity pulsing. Raise the factor for a steadier picture of static fringes.</p>
<p>Active noise control in practice is adaptive filtering (typically the filtered-x LMS algorithm), predicting the noise at the ear from a reference microphone. In a diffuse sound field the zone of useful cancellation around the error microphone is only about a tenth of a wavelength across (Elliott and Nelson), which is why cancellation is easy at 100 Hz (λ ≈ 3.4 m) and hard at several kHz.</p>`,
        },
      ],
      tryIt: [
        { experiment: "splash", label: "Splash! Making waves" },
        { experiment: "double-slit", label: "The double slit" },
        { experiment: "phased-array", label: "Steering a beam with a phased array" },
      ],
      sources: [
        "R. P. Feynman et al., The Feynman Lectures on Physics, Vol. I, ch. 29: Interference — https://www.feynmanlectures.caltech.edu/I_29.html",
        "R. P. Feynman et al., The Feynman Lectures on Physics, Vol. I, ch. 48: Beats — https://www.feynmanlectures.caltech.edu/I_48.html",
        "E. Hecht, Optics, 5th ed. (Pearson, 2017), ch. 9: Interference, and ch. 12: Basics of coherence theory",
        "F. S. Crawford, Waves, Berkeley Physics Course Vol. 3 (McGraw-Hill, 1968)",
        "T. Young, Experiments and calculations relative to physical optics, Phil. Trans. R. Soc. 94, 1–16 (1804; read 1803)",
        "P. Lueg, Process of silencing sound oscillations, US patent 2,043,416 (1936)",
        "S. J. Elliott, P. A. Nelson, Active noise control, IEEE Signal Processing Magazine 10(4), 12–35 (1993)",
      ],
    },

    // ------------------------------------------------------------------ standing waves
    {
      id: "standing-waves-and-resonance",
      title: "Standing waves and resonance",
      summary: "Waves trapped between ends add up into patterns that stay in place; driving them at the right frequency builds up huge motions – from guitar strings to wobbly bridges.",
      sections: [
        {
          level: "kids",
          html: `
<p>Tie one end of a skipping rope to a door handle and shake the other end up and down. At most speeds the rope just wiggles messily. But at certain special speeds it suddenly swings in big, steady loops: one loop, or two loops, or three. The waves running along the rope and the waves bouncing back add up so that some points stand still and others swing a lot. This is a <b>standing wave</b> – a wave that seems to stay in one place.</p>
<p>A guitar string does this when you pluck it. Its ends are held still, so it can only swing in loops that fit exactly between the ends. A long, loose, heavy string gives a low note; a short, tight, thin string gives a high one.</p>
<p>Everything has its own favourite speeds of wobbling. Push a swing at just the right moment, again and again, and small pushes make it go very high. That is <b>resonance</b>.</p>
<figure class="diagram"><svg viewBox="0 0 340 200" role="img" aria-label="The first three standing waves on a string fixed at both ends">
  <g fill="none" stroke-width="2.5">
    <path d="M30 45 Q160 5 290 45" stroke="#60a5fa"/>
    <path d="M30 45 Q160 85 290 45" stroke="#60a5fa" stroke-dasharray="6 4"/>
    <path d="M30 105 Q95 65 160 105 T290 105" stroke="#f87171"/>
    <path d="M30 105 Q95 145 160 105 T290 105" stroke="#f87171" stroke-dasharray="6 4"/>
    <path d="M30 165 Q73.3 125 116.7 165 T203.3 165 T290 165" stroke="#34d399"/>
    <path d="M30 165 Q73.3 205 116.7 165 T203.3 165 T290 165" stroke="#34d399" stroke-dasharray="6 4"/>
  </g>
  <g fill="#fbbf24"><circle cx="30" cy="45" r="4"/><circle cx="290" cy="45" r="4"/><circle cx="30" cy="105" r="4"/><circle cx="160" cy="105" r="4"/><circle cx="290" cy="105" r="4"/><circle cx="30" cy="165" r="4"/><circle cx="116.7" cy="165" r="4"/><circle cx="203.3" cy="165" r="4"/><circle cx="290" cy="165" r="4"/></g>
  <text x="300" y="49" font-size="13" fill="currentColor">1 loop</text>
  <text x="300" y="109" font-size="13" fill="currentColor">2 loops</text>
  <text x="300" y="169" font-size="13" fill="currentColor">3 loops</text>
</svg><figcaption>The first three standing waves on a string held at both ends. Yellow dots never move (nodes); the loops swing between the solid and dashed shapes.</figcaption></figure>
<div class="home"><b>Try it at home:</b> Blow gently across the top of an empty bottle to make a hooting note. Pour in some water and blow again. Less air in the bottle gives a higher note.</div>
<div class="fact"><b>Fun fact:</b> In 1787 Ernst Chladni sprinkled sand on metal plates and played them with a violin bow. The sand bounced away from the parts that shook and gathered on the lines that stayed still, drawing beautiful patterns.</div>`,
        },
        {
          level: "school",
          html: `
<p>When a wave travels along a string to a fixed end and reflects, the incoming and reflected waves (same frequency, same size, opposite directions) add up. The result is a standing wave with</p>
<ul>
<li><b>nodes</b> – points that never move, half a wavelength apart, and</li>
<li><b>antinodes</b> – points of largest motion, halfway between the nodes.</li>
</ul>
<p>A string of length L fixed at both ends must have a node at each end, so a whole number of half-wavelengths has to fit: L = n · λ/2. With v = f · λ the allowed frequencies, called <b>harmonics</b>, are</p>
<p class="formula">f<sub>n</sub> = n · v / (2L), &nbsp;&nbsp; n = 1, 2, 3, …</p>
<p>where v is the speed of waves on the string. n = 1 is the <b>fundamental</b>; the others are whole-number multiples of it.</p>
<p><b>Worked example.</b> The open A string of a guitar is about L = 0.65 m long and sounds at f<sub>1</sub> = 110 Hz. The wave speed on it is v = 2 L f<sub>1</sub> = 2 × 0.65 × 110 ≈ 143 m/s. Pressing the string down at the 12th fret halves the vibrating length and doubles the frequency to 220 Hz – one octave higher.</p>
<h4>Pipes</h4>
<p>A flute or an organ pipe traps a sound wave. At an open end the air can move freely (an antinode of the air's motion); at a closed end it cannot (a node).</p>
<ul>
<li>Open at both ends: f<sub>n</sub> = n · v / (2L), all whole-number harmonics.</li>
<li>Closed at one end: f<sub>n</sub> = n · v / (4L) with n = 1, 3, 5, … only – just the odd harmonics, and the lowest note is an octave below an open pipe of the same length.</li>
</ul>
<p><b>Example.</b> A 0.50 m pipe with v = 343 m/s: open at both ends it sounds at 343 Hz; closed at one end at 172 Hz. Real pipes sound slightly lower because the standing wave reaches a little way out of each open end.</p>
<h4>Resonance</h4>
<p>Every object has natural frequencies – its standing-wave patterns. Drive it at one of them and each push adds to the motion, so the amplitude builds up until losses (damping) remove energy as fast as it is put in. Instruments rely on this; bridges can suffer from it: London's Millennium Bridge opened on 10 June 2000 and swayed sideways under the crowds, because people walking fell into step with the bridge's own sway. It was closed two days later, fitted with dampers, and reopened in 2002.</p>
<p class="aside">The 1940 collapse of the Tacoma Narrows Bridge is often quoted as resonance, but engineers explain it as aeroelastic flutter: the twisting deck changed the airflow so that the wind fed in energy on every cycle – a self-excited oscillation rather than a rhythmic push at a natural frequency.</p>`,
        },
        {
          level: "university",
          html: `
<h4>From travelling to standing waves</h4>
<p class="formula">y = A sin(kx − ωt) + A sin(kx + ωt) = 2A sin(kx) cos(ωt)</p>
<p>The space and time dependences separate: every point oscillates in phase (or in antiphase), with a fixed amplitude 2A|sin kx|. y(0) = 0 automatically; y(L) = 0 needs kL = nπ, so nodes are λ/2 apart. On a string v = √(T/μ) (tension T, mass per unit length μ), so</p>
<p class="formula">f<sub>n</sub> = (n / 2L) · √(T / μ)</p>
<p>– Mersenne's laws (1636): frequency ∝ 1/L, ∝ √T, ∝ 1/√μ.</p>
<h4>Modes in two dimensions</h4>
<p>For the 2D wave equation in a rectangle L<sub>x</sub> × L<sub>y</sub> with u = 0 on the boundary, the normal modes are u<sub>mn</sub> = sin(mπx/L<sub>x</sub>) sin(nπy/L<sub>y</sub>) cos(ω<sub>mn</sub>t) with</p>
<p class="formula">ω<sub>mn</sub> = cπ √( (m/L<sub>x</sub>)² + (n/L<sub>y</sub>)² ), &nbsp;&nbsp; m, n = 1, 2, 3, …</p>
<p>The nodal lines are where either sine vanishes. In a square, (m, n) and (n, m) share a frequency, and any combination of degenerate modes is also a mode – which is why nodal patterns can be diagonals and curves rather than a simple grid. Chladni's plates are not membranes: they obey the biharmonic plate equation (∂²w/∂t² ∝ −∇⁴w) with free edges, so their patterns differ. Sophie Germain won the Paris Academy's prize for a theory of vibrating plates in 1816, and Kirchhoff gave the correct free-edge conditions in 1850.</p>
<h4>A driven, damped resonator</h4>
<p>Each mode behaves like an oscillator ẍ + γẋ + ω<sub>0</sub>²x = F cos ωt. Its steady-state amplitude is</p>
<p class="formula">X(ω) = F / √( (ω<sub>0</sub>² − ω²)² + γ²ω² )</p>
<p>which peaks near ω<sub>0</sub> with a full width at half power Δω ≈ γ for light damping. The quality factor Q = ω<sub>0</sub>/γ ≈ 2π × (energy stored)/(energy lost per cycle). At resonance X = Q · F/ω<sub>0</sub>², Q times the static response, and after the drive stops the energy rings down as e<sup>−γt</sup>. A tuning fork has a high Q and rings for seconds; a drum skin damped by your hand has a low Q.</p>`,
        },
        {
          level: "research",
          title: "Cavities and modes in the simulator",
          html: `
<p>A box of walls with a source inside is a 2D resonator, and a reflecting wall facing a source already gives a partial standing wave in front of it. On the grid the axis dispersion relation 4 sin²(ω/2) = 1.264 c² sin²(k/2) replaces ω = 0.562 ck, so a mode with k = nπ/L sits slightly below its continuum frequency – by about 1% at 10 cells per wavelength. The grid's 90° symmetry keeps (m, n) and (n, m) degenerate in a square box, but accidental degeneracies with different directions of k, such as (1, 7) and (5, 5) with m² + n² = 50 in both, can split because the stencil is not perfectly isotropic.</p>
<p>The walls are lossy (see Reflection and echoes: at λ ≈ 15 cells a d = 0 wall returns well under half the amplitude), so a box of walls has a low Q and its modes ring down within a few bounces. For high Q, trap the wave by total internal reflection instead: a disc of high-index glass supports whispering-gallery modes that leak only by radiation from the curved surface.</p>
<p>To extract mode frequencies and Q factors from a probe signal, an FFT is limited to a resolution of 1/T for a record of length T. Harmonic inversion (filter diagonalisation, Mandelshtam and Taylor 1997), as implemented in the Harminv package used with the MEEP FDTD code, fits sums of decaying sinusoids and resolves far narrower lines from short records.</p>`,
        },
      ],
      tryIt: [
        { experiment: "splash", label: "Splash! Making waves" },
        { experiment: "wavelength", label: "How long is a wave?" },
      ],
      sources: [
        "D. Halliday, R. Resnick, J. Walker, Fundamentals of Physics (Wiley), chapters on waves and sound",
        "N. H. Fletcher, T. D. Rossing, The Physics of Musical Instruments, 2nd ed. (Springer, 1998)",
        "R. P. Feynman et al., The Feynman Lectures on Physics, Vol. I, ch. 49: Modes — https://www.feynmanlectures.caltech.edu/I_49.html",
        "E. F. F. Chladni, Entdeckungen über die Theorie des Klanges (Leipzig, 1787)",
        "P. Dallard et al., The London Millennium Footbridge, The Structural Engineer 79(22), 17–33 (2001)",
        "K. Y. Billah, R. H. Scanlan, Resonance, Tacoma Narrows bridge failure, and undergraduate physics textbooks, American Journal of Physics 59, 118–124 (1991)",
        "V. A. Mandelshtam, H. S. Taylor, Harmonic inversion of time signals and its applications, J. Chem. Phys. 107, 6756 (1997)",
      ],
    },

    // ------------------------------------------------------------------ damping
    {
      id: "absorption-and-damping",
      title: "Absorption and damping: why waves fade",
      summary: "Waves get weaker because they spread out and because materials turn their energy into heat – the physics behind quiet rooms, sound-proofing and absorbing edges.",
      sections: [
        {
          level: "kids",
          html: `
<p>Ring a bell and the sound slowly fades away. Drop a stone in a pond and the rings get smaller and smaller. Why don't waves go on for ever?</p>
<p>Two things happen. First, the wave <b>spreads out</b>: the same wiggle is shared out over a bigger and bigger ring, so each part of the ring gets a smaller share. Second, the wave <b>loses energy</b> as it goes. A little of its motion turns into heat every time it rubs and squishes the stuff it travels through. Scientists call this <b>damping</b> or <b>absorption</b>.</p>
<p>Soft, fluffy things like curtains, cushions and carpets are very good at soaking up sound. That is why an empty room with bare walls sounds echoey, and the same room full of furniture sounds quiet and "dead".</p>
<div class="home"><b>Try it at home:</b> Clap your hands once in the bathroom, then once in a bedroom with a bed and curtains. In which room does the clap ring on longer? Now try singing in both rooms.</div>
<div class="fact"><b>Fun fact:</b> Thunder from far away is a low rumble, while thunder from close by is a sharp crack. One reason is that air soaks up high sounds more than low ones, so by the time the sound of a distant storm reaches you, mostly the deep part is left.</div>`,
        },
        {
          level: "school",
          html: `
<p>The amplitude of a wave gets smaller with distance for two separate reasons:</p>
<ol>
<li><b>Spreading.</b> The energy is kept but shared over a growing area. From a small source in open air (3D), intensity falls as 1/r²: double the distance, a quarter of the intensity. On a water surface (2D) the energy spreads round a circle, so intensity falls as 1/r. The simulator is 2D, so its rings behave like ripples on water, not like sound in open air.</li>
<li><b>Absorption (damping).</b> Some energy turns into heat. In a uniform material the amplitude drops by the same <i>fraction</i> for every metre travelled – an exponential decay.</li>
</ol>
<figure class="diagram"><svg viewBox="0 0 320 160" role="img" aria-label="A wave whose amplitude shrinks exponentially">
  <line x1="20" y1="80" x2="305" y2="80" stroke="currentColor" stroke-width="1" opacity="0.6"/>
  <path d="M20 20 L40 32 L60 42 L80 49 L100 55 L120 60 L140 64 L160 67 L180 70 L200 72 L220 73 L240 75 L260 76 L280 77 L300 77" fill="none" stroke="#f87171" stroke-width="1.8" stroke-dasharray="6 4"/>
  <path d="M20 140 L40 128 L60 118 L80 111 L100 105 L120 100 L140 96 L160 93 L180 90 L200 88 L220 87 L240 85 L260 84 L280 83 L300 83" fill="none" stroke="#f87171" stroke-width="1.8" stroke-dasharray="6 4"/>
  <path d="M20 80 Q30 -27 40 80 Q50 166 60 80 Q70 11 80 80 Q90 135 100 80 Q110 36 120 80 Q130 115 140 80 Q150 52 160 80 Q170 103 180 80 Q190 62 200 80 Q210 95 220 80 Q230 68 240 80 Q250 89 260 80 Q270 73 280 80 Q290 86 300 80" fill="none" stroke="#60a5fa" stroke-width="2.5"/>
  <text x="120" y="24" font-size="12" fill="#f87171">amplitude envelope</text>
  <text x="300" y="155" font-size="12" fill="currentColor" text-anchor="end">distance (or time) →</text>
</svg><figcaption>A damped wave: each wavelength loses the same fraction of its amplitude, so the envelope (dashed) is an exponential curve.</figcaption></figure>
<p>Loudness is measured in <b>decibels</b> (dB). A drop in intensity by a factor of 10 is −10 dB, by a factor of 2 about −3 dB. Inverse-square spreading therefore costs about 6 dB for every doubling of distance.</p>
<p><b>Worked example.</b> At 20 °C, air absorbs a 1 kHz tone by about 5.6 dB per kilometre, but a 4 kHz tone by roughly 60 to 100 dB per kilometre, depending on humidity. Over 1 km the 1 kHz tone loses about 6 dB to absorption (a quarter of its intensity) on top of the spreading loss, while the 4 kHz tone loses at least 60 dB – a factor of a million. High notes from far away vanish first.</p>
<h4>Sound-proofing</h4>
<p>Two different jobs are often mixed up:</p>
<ul>
<li><b>Sound absorption</b> stops echoes <i>inside</i> a room. Soft, porous materials (foam, mineral wool, curtains) let the air move into tiny pores, where friction turns the sound into heat.</li>
<li><b>Sound insulation</b> stops sound getting <i>through</i> a wall into the next room. That needs mass and airtightness. For a single solid wall, the "mass law" says each doubling of mass per square metre (or of frequency) adds about 6 dB of insulation. Small gaps ruin it, because sound leaks round. Two layers separated by an air gap do better than one layer of the same total mass.</li>
</ul>
<p>So foam panels stuck on a thin door hardly stop your neighbour's music; they mainly make your own room less echoey.</p>`,
        },
        {
          level: "university",
          html: `
<h4>The damped wave equation</h4>
<p>A friction term proportional to velocity gives the telegraph equation</p>
<p class="formula">∂²u/∂t² + γ ∂u/∂t = c² ∇²u</p>
<p>A plane wave e<sup>i(kx − ωt)</sup> requires ω² + iγω = c²k². For a source at real frequency ω the wavenumber is complex, k = (ω/c)√(1 + iγ/ω) ≈ ω/c + iγ/(2c) when γ ≪ ω, so the amplitude decays as e<sup>−αx</sup> with α = γ/(2c), independent of frequency. A free disturbance with real k instead decays in time as e<sup>−γt/2</sup>.</p>
<p>Real media are not like this. In air, viscosity and heat conduction give the classical absorption α ∝ ω², and the relaxation of oxygen and nitrogen molecules (helped by water vapour) adds frequency-dependent contributions – which is why ISO 9613-1 tabulates air absorption against frequency, temperature and humidity. In sea water, relaxation of boric acid and magnesium sulfate dominates at low and middle frequencies, and absorption is small enough at low frequencies for sound to cross ocean basins.</p>
<h4>Reverberation</h4>
<p>In a room, sound bounces many times and each surface absorbs a fraction α<sub>i</sub> of what hits it. W. C. Sabine found around 1900 that the time for the sound level to fall by 60 dB is approximately</p>
<p class="formula">T<sub>60</sub> ≈ 0.161 · V / A, &nbsp;&nbsp; A = Σ α<sub>i</sub> S<sub>i</sub></p>
<p>with V the room volume in m³, S<sub>i</sub> the surface areas in m² and T<sub>60</sub> in seconds. A 200 m³ classroom with A = 40 m² has T<sub>60</sub> ≈ 0.8 s; doubling the absorption halves it.</p>
<h4>Absorbers reflect too</h4>
<p>A sudden change in damping is an impedance step, and impedance steps reflect. Good absorbers are therefore gradual: the wedges in an anechoic chamber taper from nothing to solid material, and a common rule is that they work down to the frequency at which the wedge length is about a quarter of a wavelength.</p>`,
        },
        {
          level: "research",
          title: "Damping and absorbing boundaries in the model",
          html: `
<p>The update u<sup>n+1</sup> = u<sup>n</sup> + d(u<sup>n</sup> − u<sup>n−1</sup>) + c²(K ∗ u)<sup>n</sup> multiplies the "velocity" u<sup>n</sup> − u<sup>n−1</sup> by d. For one Fourier mode with stencil eigenvalue −μ (μ ≥ 0) the amplification factors solve z² − (1 + d − c²μ)z + d = 0. When the roots are complex their product gives |z|² = d, so every oscillating mode decays by √d per step, independent of wavelength – a discrete telegraph equation with d ≈ 1 − γΔt. Example: d = 0.99 gives an amplitude e-folding time of −2/ln d ≈ 200 steps. The Sandbox absorber tool paints d = 0.75 (amplitude × 0.87 per step); a wall is d = 0.</p>
<p>Abrupt changes of d reflect. The scene border is therefore graded: the ring i cells from the edge gets d = √(i / thickness). Measured reflection of a plane pulse at level 60 (λ ≈ 15 cells): about 6% for a 16-cell edge, 2% for 64 cells and 1% for 128 cells. A thicker, smoother profile reflects less because the medium then changes little over one wavelength (a WKB argument); long waves and grazing incidence remain the hard cases.</p>
<p>This "sponge layer" is the simplest of several approaches. Alternatives are one-way absorbing boundary conditions (Engquist and Majda 1977; Mur 1981 for FDTD) and Berenger's perfectly matched layer (PML, 1994), which in the continuum is reflectionless at every angle and frequency and on a grid reaches far lower reflection than a sponge of the same thickness. A PML for this scheme would need auxiliary fields, for example the convolutional PML of Roden and Gedney (2000). The graded edge needs none and fits in the existing material texture, at the price of thickness. The absorbing-edge experiment measures the reflection coefficient against edge thickness and frequency.</p>`,
        },
      ],
      tryIt: [
        { experiment: "absorbing-edge", label: "How good is the absorbing edge?" },
        { experiment: "echoes", label: "Echoes and mirrors" },
      ],
      sources: [
        "L. E. Kinsler, A. R. Frey, A. B. Coppens, J. V. Sanders, Fundamentals of Acoustics, 4th ed. (Wiley, 2000), ch. 8 and 12",
        "J. O. Smith III, Air absorption, Physical Audio Signal Processing (CCRMA, Stanford) — https://ccrma.stanford.edu/~jos/pasp/Air_Absorption.html",
        "ISO 9613-1:1993, Acoustics – Attenuation of sound during propagation outdoors – Part 1: Calculation of the absorption of sound by the atmosphere",
        "W. C. Sabine, Collected Papers on Acoustics (Harvard University Press, 1922)",
        "J.-P. Berenger, A perfectly matched layer for the absorption of electromagnetic waves, J. Comput. Phys. 114, 185–200 (1994)",
        "B. Engquist, A. Majda, Absorbing boundary conditions for the numerical simulation of waves, Mathematics of Computation 31, 629–651 (1977)",
        "J. A. Roden, S. D. Gedney, Convolution PML (CPML), Microwave and Optical Technology Letters 27, 334–339 (2000)",
        "A. Taflove, S. C. Hagness, Computational Electrodynamics: The Finite-Difference Time-Domain Method, 3rd ed. (Artech House, 2005), ch. 6 and 7",
      ],
    },

    // ------------------------------------------------------------------ Doppler
    {
      id: "doppler-effect",
      title: "The Doppler effect",
      summary: "A moving source squashes its waves in front and stretches them behind: why a siren drops in pitch as it passes, how radar guns measure speed, and what redshift means. (Not in the simulator: its sources cannot move.)",
      sections: [
        {
          level: "kids",
          html: `
<p>Listen to an ambulance or a fire engine racing past with its siren on. As it comes towards you, the siren sounds high. The moment it passes, the sound suddenly drops lower. The siren itself has not changed at all. What changed is how its sound waves reach you.</p>
<p>Imagine a duck swimming across a pond, paddling and making ripples. In front of the duck the ripples get squashed together, because the duck keeps catching up with its own ripples. Behind the duck they get stretched out. Squashed sound waves sound higher; stretched ones sound lower. This is called the <b>Doppler effect</b>, after Christian Doppler, who worked out the idea in 1842.</p>
<figure class="diagram"><svg viewBox="0 0 340 260" role="img" aria-label="Rings from a moving source are bunched up in front and spread out behind">
  <g fill="none" stroke="#60a5fa" stroke-width="2">
    <circle cx="199" cy="120" r="22"/>
    <circle cx="188" cy="120" r="44"/>
    <circle cx="177" cy="120" r="66"/>
    <circle cx="166" cy="120" r="88"/>
    <circle cx="155" cy="120" r="110"/>
  </g>
  <circle cx="210" cy="120" r="6" fill="#fbbf24"/>
  <line x1="216" y1="120" x2="246" y2="120" stroke="#fbbf24" stroke-width="2.5"/>
  <polygon points="254,120 244,115 244,125" fill="#fbbf24"/>
  <text x="4" y="250" font-size="13" fill="#f87171">← stretched: lower pitch</text>
  <text x="336" y="250" font-size="13" fill="#34d399" text-anchor="end">squashed: higher pitch →</text>
</svg><figcaption>The source (yellow) moves to the right. Each ring was sent out from where the source was at that moment, so the rings crowd together in front and spread apart behind.</figcaption></figure>
<p class="aside">You cannot try this in Wave Dude 2D: its sources always stay in one place. The picture shows what a moving source would do.</p>
<div class="fact"><b>Fun fact:</b> In 1845 the Dutch scientist Christophorus Buys Ballot tested Doppler's idea with musicians playing a note on a moving train, while other musicians beside the track listened. They heard the note change pitch as the train passed, just as Doppler had predicted.</div>
<div class="home"><b>Try it at home:</b> With a grown-up, stand well back from a busy road and listen to the cars going by. The hum of each engine drops in pitch at the moment it passes you.</div>`,
        },
        {
          level: "school",
          html: `
<p>A source sends out crests at frequency f. If it moves towards you at speed v<sub>s</sub>, each new crest starts a little closer to you than the one before, so the crests arrive squeezed together: the wavelength in front is shorter and the frequency you hear is higher. Behind the source the opposite happens.</p>
<p>For sound with speed v in still air:</p>
<p class="formula">f′ = f · v / (v − v<sub>s</sub>) &nbsp;&nbsp; (source coming towards you)</p>
<p class="formula">f′ = f · v / (v + v<sub>s</sub>) &nbsp;&nbsp; (source going away)</p>
<p>Here f is the frequency the source makes, f′ the frequency you hear, v the speed of sound (about 343 m/s) and v<sub>s</sub> the speed of the source.</p>
<p><b>Worked example.</b> An ambulance siren at 700 Hz travels at 30 m/s (108 km/h). Coming towards you: f′ = 700 × 343 / (343 − 30) = 700 × 343 / 313 ≈ 767 Hz. Going away: f′ = 700 × 343 / 373 ≈ 644 Hz. As it passes, the pitch drops by about 120 Hz – about three semitones.</p>
<p>If you move instead of the source, the formula changes a little: f′ = f · (v + v<sub>o</sub>) / v for an observer moving towards the source at speed v<sub>o</sub>. For speeds much smaller than v both give nearly the same fractional change, Δf / f ≈ (speed) / v.</p>
<h4>Radar guns and weather radar</h4>
<p>A police radar gun sends microwaves (for example f = 24.15 GHz) at a car and measures the frequency of the reflection. The car acts first as a moving receiver and then as a moving source, so the shift is doubled: Δf ≈ 2 · v · f / c, with c = 3.00 × 10⁸ m/s the speed of light. For a car at v = 30 m/s: Δf = 2 × 30 × 24.15 × 10⁹ / (3.00 × 10⁸) ≈ 4800 Hz. Doppler weather radar uses the same idea with raindrops to map winds inside storms, and Doppler ultrasound measures how fast blood flows.</p>
<h4>Redshift</h4>
<p>Light from a galaxy that is moving away arrives with longer wavelengths – shifted towards the red end of the spectrum. Astronomers measure the <b>redshift</b> z = Δλ / λ. For speeds much smaller than light, z ≈ v / c. <b>Example:</b> a hydrogen line emitted at 656.3 nm is seen at 662.9 nm. Then z = 6.6 / 656.3 ≈ 0.010 and v ≈ 0.010 × 3.00 × 10⁵ km/s ≈ 3000 km/s.</p>`,
        },
        {
          level: "university",
          html: `
<h4>Sound: motion relative to the medium</h4>
<p>For a source moving with speed v<sub>s</sub> and an observer with speed v<sub>o</sub>, both measured relative to the air, and waves of speed v,</p>
<p class="formula">f′ = f · (v + v<sub>o</sub> cos θ<sub>o</sub>) / (v − v<sub>s</sub> cos θ<sub>s</sub>)</p>
<p>where θ<sub>o</sub> and θ<sub>s</sub> are the angles between each velocity and the line joining source and observer (for the source, at the moment of emission). Source and observer motion are not equivalent, because the medium defines a preferred frame. As v<sub>s</sub> → v the wavefronts pile up into a shock; for v<sub>s</sub> &gt; v they form a Mach cone of half-angle μ with sin μ = v / v<sub>s</sub> – the sonic boom, the V-shaped wake of a boat, and Cherenkov radiation for charged particles moving faster than light does in a medium.</p>
<h4>Light: relativistic Doppler effect</h4>
<p>Light needs no medium, and only the relative velocity matters. For recession along the line of sight with β = v/c,</p>
<p class="formula">f′ = f · √( (1 − β) / (1 + β) ), &nbsp;&nbsp; 1 + z = √( (1 + β) / (1 − β) )</p>
<p>There is also a second-order transverse shift caused by time dilation, first measured by Ives and Stilwell in 1938.</p>
<h4>Radar and ultrasound</h4>
<p>For a target moving at v along the beam, f′ = f (c + v)/(c − v) ≈ f (1 + 2v/c). At 24.15 GHz that is about 161 Hz per m/s (72 Hz per mile per hour). Medical Doppler ultrasound uses Δf = 2 f v cos θ / c with c ≈ 1540 m/s in soft tissue.</p>
<h4>Cosmological redshift</h4>
<p>Hubble's 1929 velocity–distance relation (derived theoretically by Lemaître in 1927) is often described as a Doppler effect. In general relativity, however, the redshift of distant galaxies is the stretching of wavelengths by the expansion of space while the light is travelling: 1 + z = a(t<sub>obs</sub>) / a(t<sub>emit</sub>), with a the cosmic scale factor. For z ≪ 1 this reduces to cz ≈ H<sub>0</sub>d and looks like a Doppler shift; at large z, converting z into a velocity with the special-relativistic Doppler formula gives the wrong answer (Davis and Lineweaver 2004).</p>`,
        },
        {
          level: "research",
          title: "Why the simulator has no Doppler effect",
          html: `
<p>Wave Dude 2D has no moving sources, no moving materials and no flowing medium. Every source is pinned to its cells for the whole run, so no Doppler shift appears anywhere in the simulator, and sound carried by wind (the convected wave equation) is not modelled either.</p>
<p>Adding motion is less trivial than it sounds:</p>
<ul>
<li><b>Sub-cell positions.</b> Hopping a source from cell to cell makes its position jump, which radiates spurious noise at the hop rate. Smooth motion needs the source term spread over neighbouring cells with weights that change continuously (bilinear, or a windowed-sinc kernel).</li>
<li><b>Soft sources disturb the field.</b> Each source cell is pulled towards its drive (u ← 0.9u + 0.1·drive), which also damps the cell. A moving soft source would drag a small absorbing spot through the field; an additive (transparent) source term avoids this.</li>
<li><b>Moving boundaries.</b> A wall that steps by a whole cell is an impulsive disturbance; moving mirrors need sub-cell or moving-mesh methods.</li>
<li><b>No sharp Huygens principle in 2D.</b> The 2D Green's function is non-zero everywhere inside the "light cone" (∝ 1/√(v²t² − r²)), so the field of a moving 2D source depends on its whole past path, not on a single retarded point as in 3D. Analytic comparisons must use the 2D solution.</li>
</ul>
<p>For theory, Morse and Ingard treat moving sources in acoustics in full; for the relativistic side, Jackson's <i>Classical Electrodynamics</i> derives the Liénard–Wiechert fields and the Doppler factor 1/(1 − β cos θ).</p>`,
        },
      ],
      tryIt: [
        { experiment: "doppler", label: "A moving source: the Doppler effect" },
        { experiment: "wavelength", label: "How long is a wave?" },
      ],
      sources: [
        "C. Doppler, Über das farbige Licht der Doppelsterne und einiger anderer Gestirne des Himmels (Prague, 1842)",
        "C. H. D. Buys Ballot, Akustische Versuche auf der Niederländischen Eisenbahn, Annalen der Physik und Chemie 66, 321–351 (1845)",
        "R. P. Feynman et al., The Feynman Lectures on Physics, Vol. I, ch. 34: Relativistic effects in radiation — https://www.feynmanlectures.caltech.edu/I_34.html",
        "E. Hubble, A relation between distance and radial velocity among extra-galactic nebulae, PNAS 15, 168–173 (1929)",
        "T. M. Davis, C. H. Lineweaver, Expanding confusion: common misconceptions of cosmological horizons and the superluminal expansion of the universe, Publ. Astron. Soc. Australia 21, 97–109 (2004)",
        "P. M. Morse, K. U. Ingard, Theoretical Acoustics (McGraw-Hill, 1968; Princeton University Press, 1986)",
        "J. D. Jackson, Classical Electrodynamics, 3rd ed. (Wiley, 1999)",
        "Police radar frequencies and Doppler shift per mph — https://hypertextbook.com/facts/2000/MaxLipkin.shtml",
      ],
    },
  ],
};
