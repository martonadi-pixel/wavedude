// Wave Dude 2D web - "How it works" library: how the simulator computes (the numerical method).
// GPL-3.0-or-later. Every number about the simulator here follows src/engine/physics.ts, shaders.ts, engine.ts and scene.ts.

import type { LearnCategory } from "../types";

export const category: LearnCategory = {
  id: "how-it-computes",
  title: "How the simulator computes",
  icon: "🧮",
  blurb: "How a smooth wave becomes a grid of numbers updated step by step, and how we know the numbers can be trusted.",
  pages: [
    // ---------------------------------------------------------------------------------------- 1
    {
      id: "from-smooth-to-grid",
      title: "From smooth to grid: cells, steps and differences",
      summary: "Why a computer cuts space into cells and time into steps, and how the wave equation becomes one line of arithmetic.",
      sections: [
        {
          level: "kids",
          html: `
<p>Imagine a pond covered with thousands of tiny floats, packed in neat rows like the squares on a chessboard. Each float can only bob up or down.</p>
<p>Now give every float one simple rule: <b>look at your neighbours, and try to copy them</b>. If your neighbours are higher than you, move up a little. If they are lower, move down. And keep going the way you were already going, like a swing that keeps swinging.</p>
<p>Push one float down and let go. Its neighbours copy it, then <i>their</i> neighbours copy them, and a ring spreads out across the pond. That ring is a wave. Only the pattern moves; the floats stay put.</p>
<p>A computer cannot watch smooth water, so Wave Dude does exactly this. Every pixel of the scene picture is one float. Then it makes a <b>flip-book</b>: it works out where every float will be a moment later, draws that picture, and does it again, and again, many times a second. When the pictures flash by quickly, you see the waves move.</p>
<div class="home"><b>Try it at home:</b> Take a pad of sticky notes. Draw a dot near the bottom of the first page, and on each next page draw it a little higher. Flick through the pad with your thumb. The dot moves, even though each page is a still picture. That is how the simulator shows time passing: one still picture per step.</div>
<div class="fact"><b>Fun fact:</b> A full-HD scene has about two million floats. A fast graphics card can update billions of floats every second.</div>`,
        },
        {
          level: "school",
          html: `
<p>A real wave is smooth: there is a height at <i>every</i> point and at <i>every</i> instant. A computer can only store a list of numbers, so the simulator <b>samples</b> the wave:</p>
<ul>
<li><b>Space</b> is cut into square <b>cells</b>, one per pixel of the scene. Each cell stores one number <i>u</i>, the height of the wave there.</li>
<li><b>Time</b> is cut into <b>steps</b>. Each step, every cell gets a new value.</li>
</ul>
<p>So distances in Wave Dude are measured in <b>cells</b> and times in <b>steps</b>, not metres and seconds. A speed is in cells per step.</p>
<figure class="diagram"><svg viewBox="0 0 360 150" role="img" aria-label="A smooth wave sampled at evenly spaced cells">
<line x1="10" y1="75" x2="350" y2="75" stroke="currentColor" stroke-width="1" opacity="0.5"/>
<path d="M20,75 L25,66.2 L30,57.8 L35,50 L40,43.2 L45,37.6 L50,33.4 L55,30.9 L60,30 L65,30.9 L70,33.4 L75,37.6 L80,43.2 L85,50 L90,57.8 L95,66.2 L100,75 L105,83.8 L110,92.2 L115,100 L120,106.8 L125,112.4 L130,116.6 L135,119.1 L140,120 L145,119.1 L150,116.6 L155,112.4 L160,106.8 L165,100 L170,92.2 L175,83.8 L180,75 L185,66.2 L190,57.8 L195,50 L200,43.2 L205,37.6 L210,33.4 L215,30.9 L220,30 L225,30.9 L230,33.4 L235,37.6 L240,43.2 L245,50 L250,57.8 L255,66.2 L260,75 L265,83.8 L270,92.2 L275,100 L280,106.8 L285,112.4 L290,116.6 L295,119.1 L300,120 L305,119.1 L310,116.6 L315,112.4 L320,106.8 L325,100 L330,92.2 L335,83.8 L340,75" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.6"/>
<line x1="20" y1="75" x2="20" y2="75" stroke="#60a5fa" stroke-width="1.5"/><circle cx="20" cy="75" r="4" fill="#60a5fa"/><line x1="40" y1="75" x2="40" y2="43.2" stroke="#60a5fa" stroke-width="1.5"/><circle cx="40" cy="43.2" r="4" fill="#60a5fa"/><line x1="60" y1="75" x2="60" y2="30" stroke="#60a5fa" stroke-width="1.5"/><circle cx="60" cy="30" r="4" fill="#60a5fa"/><line x1="80" y1="75" x2="80" y2="43.2" stroke="#60a5fa" stroke-width="1.5"/><circle cx="80" cy="43.2" r="4" fill="#60a5fa"/><line x1="100" y1="75" x2="100" y2="75" stroke="#60a5fa" stroke-width="1.5"/><circle cx="100" cy="75" r="4" fill="#60a5fa"/><line x1="120" y1="75" x2="120" y2="106.8" stroke="#60a5fa" stroke-width="1.5"/><circle cx="120" cy="106.8" r="4" fill="#60a5fa"/><line x1="140" y1="75" x2="140" y2="120" stroke="#60a5fa" stroke-width="1.5"/><circle cx="140" cy="120" r="4" fill="#60a5fa"/><line x1="160" y1="75" x2="160" y2="106.8" stroke="#60a5fa" stroke-width="1.5"/><circle cx="160" cy="106.8" r="4" fill="#60a5fa"/><line x1="180" y1="75" x2="180" y2="75" stroke="#60a5fa" stroke-width="1.5"/><circle cx="180" cy="75" r="4" fill="#60a5fa"/><line x1="200" y1="75" x2="200" y2="43.2" stroke="#60a5fa" stroke-width="1.5"/><circle cx="200" cy="43.2" r="4" fill="#60a5fa"/><line x1="220" y1="75" x2="220" y2="30" stroke="#60a5fa" stroke-width="1.5"/><circle cx="220" cy="30" r="4" fill="#60a5fa"/><line x1="240" y1="75" x2="240" y2="43.2" stroke="#60a5fa" stroke-width="1.5"/><circle cx="240" cy="43.2" r="4" fill="#60a5fa"/><line x1="260" y1="75" x2="260" y2="75" stroke="#60a5fa" stroke-width="1.5"/><circle cx="260" cy="75" r="4" fill="#60a5fa"/><line x1="280" y1="75" x2="280" y2="106.8" stroke="#60a5fa" stroke-width="1.5"/><circle cx="280" cy="106.8" r="4" fill="#60a5fa"/><line x1="300" y1="75" x2="300" y2="120" stroke="#60a5fa" stroke-width="1.5"/><circle cx="300" cy="120" r="4" fill="#60a5fa"/><line x1="320" y1="75" x2="320" y2="106.8" stroke="#60a5fa" stroke-width="1.5"/><circle cx="320" cy="106.8" r="4" fill="#60a5fa"/><line x1="340" y1="75" x2="340" y2="75" stroke="#60a5fa" stroke-width="1.5"/><circle cx="340" cy="75" r="4" fill="#60a5fa"/>
<line x1="20" y1="135" x2="180" y2="135" stroke="#fbbf24" stroke-width="1.5"/>
<line x1="20" y1="130" x2="20" y2="140" stroke="#fbbf24" stroke-width="1.5"/><line x1="180" y1="130" x2="180" y2="140" stroke="#fbbf24" stroke-width="1.5"/>
<text x="100" y="128" font-size="12" fill="currentColor" text-anchor="middle">one wavelength = 8 cells</text>
<text x="350" y="20" font-size="12" fill="currentColor" text-anchor="end">dots: the numbers the computer keeps</text>
</svg><figcaption>The smooth curve is the real wave; the blue dots are the values stored in the cells. Here one wavelength is covered by 8 cells.</figcaption></figure>
<h4>Slopes become differences</h4>
<p>Physics talks about how fast things change. On a grid, “how fast” becomes “how much did it change in one step”:</p>
<p class="formula">velocity ≈ u<sub>now</sub> − u<sub>before</sub> &nbsp;&nbsp;(per step)</p>
<p>Here <i>u</i><sub>now</sub> is a cell's height this step and <i>u</i><sub>before</sub> its height one step earlier. For example, if a cell was at 0.15 last step and is at 0.20 now, it is moving up at about 0.05 per step.</p>
<p>The <b>acceleration</b> (how fast the velocity changes) comes from the neighbours: a cell lower than the cells around it is pulled up, one higher is pulled down. The simulator's whole rule is therefore:</p>
<p class="formula">new height = height now + velocity + pull from the neighbours</p>
<p>That is it. Applied to every cell, every step, this one line produces reflection, refraction, diffraction (waves bending around corners) and interference.</p>
<p class="aside">Speed check: in empty space (refractive index 1) a long wave moves about 0.56 cells per step. To cross a 1000-cell-wide scene it needs about 1000 ÷ 0.56 ≈ 1800 steps.</p>`,
        },
        {
          level: "university",
          html: `
<p>Write <i>u</i><sub>i,j</sub><sup>m</sup> for the field in cell (i, j) at step m. The simulator chooses its units so that the cell size and the time step are both 1: Δx = Δy = Δt = 1. All physical scale is then carried by the wave speed.</p>
<h4>The second time derivative</h4>
<p>Taylor-expand one step forward and one step back:</p>
<p class="formula">u<sup>m±1</sup> = u<sup>m</sup> ± u<sub>t</sub> + ½ u<sub>tt</sub> ± ⅙ u<sub>ttt</sub> + (1/24) u<sub>tttt</sub> + …</p>
<p>Adding the two cancels all odd terms:</p>
<p class="formula">u<sup>m+1</sup> − 2u<sup>m</sup> + u<sup>m−1</sup> = u<sub>tt</sub> + (1/12) u<sub>tttt</sub> + …</p>
<p>so the centred second difference approximates ∂²u/∂t² with an error of order Δt². Put it into the wave equation ∂²u/∂t² = c² L u, where L is a discrete Laplacian, and solve for the future:</p>
<p class="formula">u<sup>m+1</sup> = 2u<sup>m</sup> − u<sup>m−1</sup> + c² (L u)<sup>m</sup></p>
<p>Wave Dude writes 2u<sup>m</sup> − u<sup>m−1</sup> as u<sup>m</sup> + (u<sup>m</sup> − u<sup>m−1</sup>), i.e. position plus velocity, and multiplies the velocity by a damping factor d (1 = lossless, 0 = motion stops):</p>
<p class="formula">u<sup>m+1</sup> = u<sup>m</sup> + d · (u<sup>m</sup> − u<sup>m−1</sup>) + c² · (K ∗ u<sup>m</sup>), &nbsp; c² = 1/n²</p>
<p>K is a 3×3 kernel (next page). For smooth fields K ∗ u ≈ 0.316 ∇²u, so the PDE the grid approximates is</p>
<p class="formula">∂²u/∂t² = (0.316 / n²) ∇²u, &nbsp;&nbsp; v = √0.316 / n ≈ 0.562 / n cells per step</p>
<h4>Why two time levels</h4>
<p>The wave equation is second order in time: the state is not just the shape of the surface but also its velocity. The scheme stores the velocity implicitly as the difference of two consecutive fields, so it needs exactly two time levels, u<sup>m</sup> and u<sup>m−1</sup>. On the GPU both live in the same texel (red and green channels of an RGBA32F texture), and a step reads one texture and writes the other (“ping-pong”), so nothing has to be copied.</p>
<p>The update is <b>explicit</b>: each new value depends only on known old values in a 3×3 neighbourhood, so all cells can be computed independently and in parallel. That is what makes about 20 billion cell updates per second possible on a recent desktop GPU.</p>`,
        },
        {
          level: "research",
          title: "The scheme in context",
          html: `
<p>With d = 1 the update is the classical <b>leapfrog</b> (central-difference, Störmer–Verlet) scheme for a second-order equation. It is second-order accurate in time and, with the 3×3 kernel, second-order in space. It is time-reversible and, for linear problems, non-dissipative: below the stability limit every Fourier mode has amplification factor of modulus exactly 1, so the only error is in the <i>phase</i> (numerical dispersion), not the amplitude. That is a good property for wave problems, where artificial damping would hide interference.</p>
<p>Other common choices, and what they would change:</p>
<ul>
<li><b>Staggered first-order systems</b> (Yee 1966, the basis of FDTD in electromagnetics): u and its flux on interleaved grids. Equivalent to leapfrog with the 5-point Laplacian for the scalar case, but natural for vector fields and for PML boundaries.</li>
<li><b>Higher-order in space</b> (wider stencils, e.g. the app's optional 4th-order cross) reduce dispersion per cell at the cost of more memory reads and a tighter time-step limit.</li>
<li><b>Pseudo-spectral</b> methods compute ∇² with FFTs: essentially no spatial dispersion for resolved waves, but global communication and awkward boundaries.</li>
<li><b>Finite elements / discontinuous Galerkin</b> handle curved interfaces without staircasing, at much higher implementation cost.</li>
</ul>
<p>Wave Dude's choice (a 9-point explicit update in single precision) is the cheapest scheme that still gives qualitatively correct optics at ~10 cells per wavelength. Its limits are those of the model: two dimensions, a scalar field (no polarization), linear media, and a grid that represents interfaces as pixel staircases.</p>`,
        },
      ],
      tryIt: [
        { experiment: "wavelength", label: "How long is a wave?" },
        { experiment: "grid-dispersion", label: "Waves on a grid: numerical dispersion" },
      ],
      sources: [
        "R. J. LeVeque, Finite Difference Methods for Ordinary and Partial Differential Equations (SIAM, 2007)",
        "L. N. Trefethen, Finite Difference and Spectral Methods for Ordinary and Partial Differential Equations (unpublished text, 1996) — https://people.maths.ox.ac.uk/trefethen/pdetext.html",
        "A. Taflove and S. C. Hagness, Computational Electrodynamics: The Finite-Difference Time-Domain Method, 3rd ed. (Artech House, 2005)",
        "K. S. Yee, Numerical solution of initial boundary value problems involving Maxwell's equations in isotropic media, IEEE Trans. Antennas Propag. 14, 302–307 (1966)",
        "WaveSimulator2D by 0x23 — https://github.com/0x23/WaveSimulator2D",
      ],
    },
    // ---------------------------------------------------------------------------------------- 2
    {
      id: "the-stencil",
      title: "The stencil: how a cell feels its neighbours",
      summary: "The 3×3 kernel, what “0.316 ∇²” means, and the optional 4th-order cross.",
      sections: [
        {
          level: "kids",
          html: `
<p>Every float in the simulator has a little recipe for deciding how much to move. It looks at the eight floats around it, like the eight squares around a square on a chessboard.</p>
<ul>
<li>The four floats that touch its <b>sides</b> (front, back, left, right) are the most important. They count a lot.</li>
<li>The four floats at the <b>corners</b> are a bit further away. They count less, roughly one third as much.</li>
</ul>
<p>The float adds up what its neighbours are doing and compares it with itself. If it is sitting in a dip, lower than its neighbours, it gets pulled up. If it is sitting on a bump, it gets pulled down. If everything around is flat, nothing happens at all.</p>
<p>This little recipe, a pattern of numbers laid over a cell and its neighbours, is called a <b>stencil</b>, like the stencils you use to paint letters: you put the same shape down on every cell in turn.</p>
<div class="fact"><b>Fun fact:</b> Photo apps use almost the same neighbour-comparing trick to find the edges of things in a picture. A pixel that is very different from the pixels around it is probably on an edge.</div>`,
        },
        {
          level: "school",
          html: `
<p>The “pull from the neighbours” is a weighted sum called a <b>stencil</b> or <b>kernel</b>. Wave Dude uses this 3×3 kernel, taken from WaveSimulator2D by 0x23:</p>
<figure class="diagram"><svg viewBox="0 0 360 170" role="img" aria-label="The 3 by 3 kernel and the 4th-order cross stencil">
<g font-size="12" fill="currentColor" text-anchor="middle">
<rect x="20" y="20" width="40" height="40" fill="#c084fc" fill-opacity="0.25" stroke="currentColor"/><text x="40" y="44">0.066</text>
<rect x="60" y="20" width="40" height="40" fill="#60a5fa" fill-opacity="0.35" stroke="currentColor"/><text x="80" y="44">0.184</text>
<rect x="100" y="20" width="40" height="40" fill="#c084fc" fill-opacity="0.25" stroke="currentColor"/><text x="120" y="44">0.066</text>
<rect x="20" y="60" width="40" height="40" fill="#60a5fa" fill-opacity="0.35" stroke="currentColor"/><text x="40" y="84">0.184</text>
<rect x="60" y="60" width="40" height="40" fill="#f87171" fill-opacity="0.4" stroke="currentColor"/><text x="80" y="84">−1</text>
<rect x="100" y="60" width="40" height="40" fill="#60a5fa" fill-opacity="0.35" stroke="currentColor"/><text x="120" y="84">0.184</text>
<rect x="20" y="100" width="40" height="40" fill="#c084fc" fill-opacity="0.25" stroke="currentColor"/><text x="40" y="124">0.066</text>
<rect x="60" y="100" width="40" height="40" fill="#60a5fa" fill-opacity="0.35" stroke="currentColor"/><text x="80" y="124">0.184</text>
<rect x="100" y="100" width="40" height="40" fill="#c084fc" fill-opacity="0.25" stroke="currentColor"/><text x="120" y="124">0.066</text>
<text x="80" y="160">3×3 kernel</text>
<rect x="250" y="12" width="26" height="26" fill="#fbbf24" fill-opacity="0.25" stroke="currentColor"/><text x="263" y="29" font-size="10">−1/12</text>
<rect x="250" y="38" width="26" height="26" fill="#34d399" fill-opacity="0.3" stroke="currentColor"/><text x="263" y="55">4/3</text>
<rect x="198" y="64" width="26" height="26" fill="#fbbf24" fill-opacity="0.25" stroke="currentColor"/><text x="211" y="81" font-size="10">−1/12</text>
<rect x="224" y="64" width="26" height="26" fill="#34d399" fill-opacity="0.3" stroke="currentColor"/><text x="237" y="81">4/3</text>
<rect x="250" y="64" width="26" height="26" fill="#f87171" fill-opacity="0.4" stroke="currentColor"/><text x="263" y="81">−5</text>
<rect x="276" y="64" width="26" height="26" fill="#34d399" fill-opacity="0.3" stroke="currentColor"/><text x="289" y="81">4/3</text>
<rect x="302" y="64" width="26" height="26" fill="#fbbf24" fill-opacity="0.25" stroke="currentColor"/><text x="315" y="81" font-size="10">−1/12</text>
<rect x="250" y="90" width="26" height="26" fill="#34d399" fill-opacity="0.3" stroke="currentColor"/><text x="263" y="107">4/3</text>
<rect x="250" y="116" width="26" height="26" fill="#fbbf24" fill-opacity="0.25" stroke="currentColor"/><text x="263" y="133" font-size="10">−1/12</text>
<text x="263" y="160">4th-order cross</text>
</g></svg><figcaption>Left: the default 3×3 kernel (sides 0.184, corners 0.066, centre −1). Right: the optional 4th-order cross, two cells each way.</figcaption></figure>
<p>To use it, multiply each neighbour's height by the number in its square, multiply the cell's own height by −1, and add everything up. The weights add up to zero (4 × 0.184 + 4 × 0.066 − 1 = 0), so a perfectly flat surface feels no pull.</p>
<h4>A worked example</h4>
<p>A cell has height 0.20; all eight neighbours have 0.30; one step ago the cell was at 0.15. Refractive index n = 1, no damping.</p>
<ul>
<li>Pull: 4 × 0.184 × 0.30 + 4 × 0.066 × 0.30 − 0.20 = 0.2208 + 0.0792 − 0.20 = <b>0.10</b></li>
<li>Velocity: 0.20 − 0.15 = <b>0.05</b></li>
<li>New height: 0.20 + 0.05 + 0.10 = <b>0.35</b></li>
</ul>
<p>In glass with n = 1.5 the pull is multiplied by 1/n² = 0.444, giving 0.20 + 0.05 + 0.044 = 0.294: the cell reacts more slowly, which is exactly why waves are slower in glass.</p>
<h4>What “0.316 ∇²” means</h4>
<p>∇²u (the <b>Laplacian</b>) measures how curved the surface is. For gently curving waves this kernel gives <b>0.316 times</b> the true curvature. A wave's speed goes with the square root of that factor, so in empty space waves move at √0.316 ≈ <b>0.562 cells per step</b>, and at 0.562 / n in a material of index n (0.375 cells per step in glass with n = 1.5).</p>`,
        },
        {
          level: "university",
          html: `
<h4>Where 0.316 comes from</h4>
<p>Expand the neighbours of a smooth field (h = 1). Each pair of side neighbours along x gives u(x+1) + u(x−1) − 2u = u<sub>xx</sub> + u<sub>xxxx</sub>/12 + …, and the four corners sum to 4u + 2(u<sub>xx</sub> + u<sub>yy</sub>) + O(h⁴). With side weight a = 0.184 and corner weight b = 0.066 (and centre −4a − 4b = −1):</p>
<p class="formula">K ∗ u = (a + 2b) ∇²u + O(h⁴) = (0.184 + 0.132) ∇²u = 0.316 ∇²u + …</p>
<p>Equivalently, K = 0.316 × [[0.209, 0.582, 0.209], [0.582, −3.165, 0.582], [0.209, 0.582, 0.209]], a nine-point Laplacian scaled by 0.316.</p>
<h4>The symbol</h4>
<p>For a plane wave e<sup>i(k<sub>x</sub>x + k<sub>y</sub>y)</sup> the kernel multiplies by its <b>symbol</b></p>
<p class="formula">Λ(k) = −1 + 0.368 (cos k<sub>x</sub> + cos k<sub>y</sub>) + 0.264 cos k<sub>x</sub> cos k<sub>y</sub></p>
<p>Along an axis (k<sub>y</sub> = 0) this is −0.632 (1 − cos k) = −1.264 sin²(k/2) ≈ −0.316 k². Its most negative value is at the checkerboard mode k = (π, π): Λ = −1.472. Both numbers return on the stability and dispersion pages.</p>
<h4>Comparison with the textbook stencils</h4>
<table>
<tr><th>stencil</th><th>weights (side, corner, centre)</th><th>leading error</th></tr>
<tr><td>5-point</td><td>1, 0, −4</td><td>(1/12)(u<sub>xxxx</sub> + u<sub>yyyy</sub>): anisotropic</td></tr>
<tr><td>9-point “Mehrstellen”</td><td>4/6, 1/6, −20/6</td><td>∝ ∇⁴u: isotropic</td></tr>
<tr><td>Wave Dude 3×3 (÷ 0.316)</td><td>0.582, 0.209, −3.165</td><td>mildly anisotropic</td></tr>
</table>
<p>The O(h²) error term is (a/12 + b/6)(∂⁴<sub>x</sub> + ∂⁴<sub>y</sub>)u + b ∂²<sub>x</sub>∂²<sub>y</sub>u, which is a multiple of ∇⁴u only when b = a/4. Wave Dude's ratio b/a is 0.36, between the 5-point (0) and isotropic (0.25) ratios, so a little anisotropy remains (quantified on the dispersion page).</p>
<h4>The 4th-order cross</h4>
<p>The optional stencil uses the fourth-order central difference in each direction,</p>
<p class="formula">u<sub>xx</sub> ≈ [−u(x−2) + 16u(x−1) − 30u + 16u(x+1) − u(x+2)] / 12 + O(h⁴)</p>
<p>and the same in y, giving the cross (−1/12, 4/3, −5, 4/3, −1/12). Its symbol along an axis is (1/6) cos 2k − (8/3) cos k + 5/2 ≈ k², so on its own it approximates ∇²u with factor 1, not 0.316. Wave Dude multiplies the cross by 0.316, so both stencils give long waves the same speed and switching stencil only changes the grid's dispersion. (The Windows app does not scale it; there, switching makes long waves √(1/0.316) ≈ 1.78 times faster and, at a given source level, 1.78 times longer.) Both stencils read nine cells per update. In the outermost ring of cells the shader falls back to the 3×3 kernel (as the Windows OpenCL kernel does); one ring further in, the cross reaches past the edge and reads the zero border. Both lie deep inside the damping edge.</p>`,
        },
        {
          level: "research",
          title: "Designing stencils",
          html: `
<p>Finite-difference weights on any set of points can be generated systematically (Fornberg 1988). For wave problems the order of accuracy is not the only design goal:</p>
<ul>
<li><b>Isotropy</b>: stencils whose leading error is rotationally invariant (Patra &amp; Karttunen 2006) make a point source's ring round rather than slightly polygonal.</li>
<li><b>Dispersion-relation preservation</b>: Tam &amp; Webb (1993) chose weights to minimise the phase error over a band of wavenumbers rather than to maximise the formal order, a standard trick in computational aeroacoustics.</li>
<li><b>Cost</b>: on a GPU this kernel is limited by memory bandwidth, not arithmetic. The 3×3 kernel and the 4th-order cross both read nine state values per cell, but the cross needs sub-steps (next page), so in any scene containing empty space (N = 2) it costs about twice as much per simulated step.</li>
</ul>
<p>The 3×3 kernel's origin in WaveSimulator2D is pragmatic: a compact, nearly isotropic kernel that reproduces optics qualitatively well. The 0.316 normalisation is not a physical constant; it only rescales the speed, so the meaningful quantities in the app are ratios (n, cells per wavelength) rather than absolute speeds.</p>`,
        },
      ],
      tryIt: [{ experiment: "wavelength", label: "How long is a wave?" }],
      sources: [
        "B. Fornberg, Generation of finite difference formulas on arbitrarily spaced grids, Mathematics of Computation 51, 699–706 (1988)",
        "M. Patra and M. Karttunen, Stencils with isotropic discretization error for differential operators, Numer. Methods PDE 22, 936–953 (2006)",
        "C. K. W. Tam and J. C. Webb, Dispersion-relation-preserving finite difference schemes for computational acoustics, J. Comput. Phys. 107, 262–281 (1993)",
        "R. J. LeVeque, Finite Difference Methods for Ordinary and Partial Differential Equations (SIAM, 2007)",
        "WaveSimulator2D by 0x23 — https://github.com/0x23/WaveSimulator2D",
      ],
    },
    // ---------------------------------------------------------------------------------------- 3
    {
      id: "stability-cfl",
      title: "Stability and the CFL condition",
      summary: "Why a time step that is too large makes the simulation explode, and how the numbers of this kernel keep it safe.",
      sections: [
        {
          level: "kids",
          html: `
<p>Remember the floats copying their neighbours? There is a catch. Each float must copy <i>a little bit</i> each step, not too much.</p>
<p>Imagine a float sitting a tiny bit too high. Its neighbours pull it down. If it listens a little, it moves down a bit, and all is calm. But if it <b>overreacts</b>, it shoots down too far, past the middle. Now it is too low, so its neighbours pull it up, and it overreacts again, even further. Every step the wobble gets bigger. After a few dozen steps the numbers are enormous and the picture turns into a wild checkerboard. Computer people say the simulation has <b>blown up</b>.</p>
<p>The same thing happens in the flip-book if the pages are too far apart in time. Between two pages the wave would have to jump further than one float. But a float can only learn about its neighbours, one row per page, so the news cannot keep up.</p>
<p>Wave Dude is set up so that the floats never overreact: its waves move only about half a float per page. When you switch on the extra-accurate recipe, the simulator quietly slips in a few extra in-between pages to stay safe.</p>
<div class="fact"><b>Fun fact:</b> The loud howl you sometimes hear when a microphone gets too close to a loudspeaker is the same kind of runaway. The speaker plays a sound, the microphone hears it a bit louder, the speaker plays it louder still, round and round.</div>`,
        },
        {
          level: "school",
          html: `
<p>An explicit scheme like Wave Dude's only lets information travel a limited distance per step. With a 3×3 kernel, a cell only “hears” its direct neighbours, so news can spread at most <b>one cell per step</b> (sideways, or diagonally).</p>
<p>In 1928, Richard Courant, Kurt Friedrichs and Hans Lewy pointed out a simple rule, now called the <b>CFL condition</b>: the real wave must not travel further in one step than the grid can pass information. Otherwise the grid cannot possibly know what the real wave would do.</p>
<figure class="diagram"><svg viewBox="0 0 360 185" role="img" aria-label="Domain of dependence: grid cone wider than the physical cone">
<polygon points="180,30 60,150 300,150" fill="#60a5fa" fill-opacity="0.18" stroke="#60a5fa" stroke-width="1.5"/>
<polygon points="180,30 113,150 247,150" fill="#fbbf24" fill-opacity="0.3" stroke="#fbbf24" stroke-width="1.5"/>
<g fill="currentColor">
<circle cx="180" cy="30" r="4"/>
<circle cx="150" cy="60" r="2.5"/><circle cx="180" cy="60" r="2.5"/><circle cx="210" cy="60" r="2.5"/>
<circle cx="120" cy="90" r="2.5"/><circle cx="150" cy="90" r="2.5"/><circle cx="180" cy="90" r="2.5"/><circle cx="210" cy="90" r="2.5"/><circle cx="240" cy="90" r="2.5"/>
<circle cx="90" cy="120" r="2.5"/><circle cx="120" cy="120" r="2.5"/><circle cx="150" cy="120" r="2.5"/><circle cx="180" cy="120" r="2.5"/><circle cx="210" cy="120" r="2.5"/><circle cx="240" cy="120" r="2.5"/><circle cx="270" cy="120" r="2.5"/>
<circle cx="60" cy="150" r="2.5"/><circle cx="90" cy="150" r="2.5"/><circle cx="120" cy="150" r="2.5"/><circle cx="150" cy="150" r="2.5"/><circle cx="180" cy="150" r="2.5"/><circle cx="210" cy="150" r="2.5"/><circle cx="240" cy="150" r="2.5"/><circle cx="270" cy="150" r="2.5"/><circle cx="300" cy="150" r="2.5"/>
</g>
<g font-size="12" fill="currentColor">
<text x="190" y="26">one cell, now</text>
<text x="10" y="175">cells →</text>
<text x="20" y="40">steps</text><text x="20" y="54">back ↓</text>
<text x="250" y="175" fill="#60a5fa">grid: 1 cell/step</text>
<text x="96" y="175" fill="#fbbf24">wave: 0.56</text>
</g></svg><figcaption>Which cells, four steps back, can influence the cell at the top. The grid's cone (blue) is wider than the real wave's cone (yellow), so the CFL condition is met.</figcaption></figure>
<p>In Wave Dude the wave moves 0.562 cells per step in empty space, and slower in glass. That is well inside one cell per step. In practice the exact safe limit comes from a more detailed calculation, and the worst case is the fastest-changing pattern possible on a grid: a <b>checkerboard</b> of cells alternately up (+) and down (−).</p>
<h4>A worked example</h4>
<p>Put the 3×3 kernel on a checkerboard cell of height +1: its four side neighbours are −1, its four corners +1, so the pull is 4 × 0.184 × (−1) + 4 × 0.066 × (+1) − 1 = −1.472. Multiplied by c² = 1/n², this pull must not be bigger than the cell can handle. The calculation on the next level shows the limit is c² × 1.472 ≤ 4, i.e. c² ≤ 2.72.</p>
<ul>
<li>In Wave Dude n is at least 0.9, so c² is at most 1/0.81 = 1.23: safe, with more than a factor 2 to spare.</li>
<li>If someone used c² = 3, the checkerboard would grow by a factor of about 1.9 every step: about × 570 after 10 steps and × 300 000 after 20.</li>
</ul>`,
        },
        {
          level: "university",
          html: `
<h4>Von Neumann analysis</h4>
<p>Insert one Fourier mode u<sup>m</sup> = g<sup>m</sup> e<sup>i(k<sub>x</sub>x + k<sub>y</sub>y)</sup> into the update u<sup>m+1</sup> = u<sup>m</sup> + d(u<sup>m</sup> − u<sup>m−1</sup>) + c² K ∗ u<sup>m</sup>. With Λ(k) the kernel's symbol:</p>
<p class="formula">g² − (1 + d + c²Λ) g + d = 0</p>
<p>Without damping (d = 1) this is g + 1/g = 2 + c²Λ. The two roots have product 1; they lie on the unit circle (a stable, purely oscillating mode) when |2 + c²Λ| ≤ 2, i.e.</p>
<p class="formula">−4 ≤ c² Λ(k) ≤ 0 &nbsp; for all k</p>
<p>Λ ≤ 0 everywhere and Λ<sub>min</sub> = Λ(π, π) = −1.472, so the 3×3 scheme is stable for <b>c² ≤ 4 / 1.472 ≈ 2.72</b>. In terms of the Courant number ν = vΔt/Δx with v = √(0.316 c²), the limit is ν ≤ 0.927. The app's material range n ∈ [0.9, 10] gives c² ≤ 1.235, i.e. ν ≤ 0.62. (The plain 5-point Laplacian with leapfrog in 2D allows ν ≤ 1/√2 ≈ 0.71.)</p>
<p>With damping, the product of the roots is d, so for oscillating modes |g| = √d: the amplitude falls by √d per step, exactly. With d = 0 (a fully absorbing cell) the update becomes u<sup>m+1</sup> = u<sup>m</sup> + c² K ∗ u<sup>m</sup>, which is an explicit <i>diffusion</i> step; it is stable for c² ≤ 2 / 1.472 ≈ 1.36, again satisfied for n ≥ 0.9.</p>
<h4>Sub-steps for the 4th-order cross</h4>
<p>The scaled cross has symbol 0.316 Σ<sub>x,y</sub> [(1/6) cos 2k − (8/3) cos k + 5/2], whose largest magnitude is 0.316 × 2 × 16/3 = 0.316 × 32/3 ≈ <b>3.37</b> at (π, π). That is just inside the theoretical limit c² · 3.37 ≤ 4 for c² = 1, but outside it for the fastest material allowed (n = 0.9, c² = 1.23), and with no margin to spare. The engine therefore splits each step into N sub-steps with c²/N² and damping d<sup>1/N</sup> (so the per-step amplitude loss is unchanged):</p>
<p class="formula">N = ⌈ √(c²<sub>max</sub> · 0.316 · (32/3) / 2) ⌉</p>
<p>This keeps (c²/N²) · 3.37 ≤ 2, half the theoretical limit of 4, a deliberate safety margin. For n = 1 (c² = 1) N = 2; if the scene's fastest material has n = 1.5, N = 1. (The Windows app uses the unscaled cross and N = ⌈√(c²<sub>max</sub> · (32/3) / 2)⌉, so N = 3 for n = 1.) Sources are applied on the first sub-step only and the intensity filter on the last, so one “step” still means the same thing for sources, probes and the display.</p>`,
        },
        {
          level: "research",
          title: "Background and caveats",
          html: `
<p>The CFL paper (Courant, Friedrichs &amp; Lewy, Math. Ann. 100, 1928) used the domain-of-dependence argument to prove convergence of difference schemes; the condition it gives is <i>necessary</i>, not sufficient. The Fourier (von Neumann) method used above was developed in the 1940s and is the standard sharp test for linear constant-coefficient schemes; the Lax equivalence theorem (Lax &amp; Richtmyer 1956) then guarantees that a consistent, stable linear scheme converges.</p>
<p>Caveats for this code:</p>
<ul>
<li><b>Variable coefficients.</b> c² and d vary from cell to cell. Von Neumann analysis is applied to “frozen” coefficients; for smoothly varying media this is reliable, and the large margin (c² ≤ 1.235 vs 2.72) covers sharp interfaces in practice.</li>
<li><b>The non-conservative form</b> c²(x) ∇²u is used (not ∇·(c²∇u)), which is the right form for this scalar equation with constant “stiffness” and variable “mass”, and has a simple discrete energy.</li>
<li><b>Sources</b> act as a relaxation term (u ← 0.9u + 0.1 × drive) that pulls a cell towards a bounded signal; in practice it does not affect stability.</li>
<li><b>Single precision</b>: the GPU stores RGBA32F. Leapfrog does not amplify round-off below the limit, but over very long runs round-off accumulates as a slow random walk in phase.</li>
</ul>
<p>Trefethen's notes give an especially clear treatment of stability regions and of why “stable but dispersive” is the typical behaviour of leapfrog schemes.</p>`,
        },
      ],
      tryIt: [{ experiment: "grid-dispersion", label: "Waves on a grid: numerical dispersion" }],
      sources: [
        "R. Courant, K. Friedrichs and H. Lewy, Über die partiellen Differenzengleichungen der mathematischen Physik, Mathematische Annalen 100, 32–74 (1928); English translation in IBM Journal of Research and Development 11, 215–234 (1967)",
        "P. D. Lax and R. D. Richtmyer, Survey of the stability of linear finite difference equations, Comm. Pure Appl. Math. 9, 267–293 (1956)",
        "L. N. Trefethen, Finite Difference and Spectral Methods for Ordinary and Partial Differential Equations (1996) — https://people.maths.ox.ac.uk/trefethen/pdetext.html",
        "R. J. LeVeque, Finite Difference Methods for Ordinary and Partial Differential Equations (SIAM, 2007), chapters 9–10",
        "A. Taflove and S. C. Hagness, Computational Electrodynamics, 3rd ed. (Artech House, 2005), chapter 4",
      ],
    },
    // ---------------------------------------------------------------------------------------- 4
    {
      id: "numerical-dispersion",
      title: "Numerical dispersion and anisotropy",
      summary: "Short waves travel a little too slowly on a grid, slightly differently in different directions; how large the error is and how to keep it small.",
      sections: [
        {
          level: "kids",
          html: `
<p>Try drawing a smooth circle using only whole squares on squared paper. With big squares it looks lumpy, more like a staircase. With tiny squares it looks almost perfectly round.</p>
<p>Waves on the simulator's grid have the same problem. A long wave is made of many floats, so it looks smooth and behaves just like a real wave. A very short wave is made of only a few floats. It is lumpy, and lumpy waves get a little bit confused: they travel <b>slightly too slowly</b>, and a tiny bit differently along the slanting directions than straight across.</p>
<p>For the waves you usually make in Wave Dude, the difference is too small to see. But for the very fastest wave makers (the highest frequency settings), each wave is only three or four floats long, and they lag behind by several percent.</p>
<p>Scientists have a simple rule: <b>use at least about ten floats for every wave</b>. Then the grid's waves are almost exactly like real ones.</p>
<div class="home"><b>Try it at home:</b> On squared paper, colour in the squares that a circle passes through: first a circle 4 squares across, then one 20 squares across. Which one looks rounder? That is why the simulator likes long waves.</div>`,
        },
        {
          level: "school",
          html: `
<p>The important number is how many <b>cells per wavelength</b> a wave has. Long waves (many cells per wavelength) travel at the expected speed, 0.562 / n cells per step. Short waves travel slower. This is <b>numerical dispersion</b>: on the grid, the speed depends on the wavelength, even in empty space where real light has one speed for all colours.</p>
<figure class="diagram"><svg viewBox="0 0 360 200" role="img" aria-label="Bar chart: phase velocity error versus cells per wavelength">
<line x1="30" y1="160" x2="340" y2="160" stroke="currentColor"/>
<rect x="45" y="157.2" width="40" height="2.8" fill="#34d399"/>
<rect x="105" y="148.6" width="40" height="11.4" fill="#34d399"/>
<rect x="165" y="128" width="40" height="32" fill="#fbbf24"/>
<rect x="225" y="85.9" width="40" height="74.1" fill="#f87171"/>
<rect x="285" y="23.7" width="40" height="136.3" fill="#f87171"/>
<g font-size="12" fill="currentColor" text-anchor="middle">
<text x="65" y="150">0.3%</text><text x="125" y="142">1.1%</text><text x="185" y="122">3.2%</text><text x="245" y="80">7.4%</text><text x="305" y="18">13.6%</text>
<text x="65" y="176">20</text><text x="125" y="176">10</text><text x="185" y="176">6</text><text x="245" y="176">4</text><text x="305" y="176">3</text>
<text x="185" y="194">cells per wavelength</text>
</g>
<text x="34" y="40" font-size="12" fill="currentColor">how much too slow</text>
</svg><figcaption>How much slower than the long-wave speed a wave moves along the grid axes (empty space, 3×3 kernel), from the scheme's exact dispersion relation.</figcaption></figure>
<p><b>Rule of thumb:</b> keep at least <b>10 cells per wavelength</b> (error about 1%) when speeds or angles matter.</p>
<h4>A worked example</h4>
<p>A source at level 40 makes waves of λ ≈ 22.5 cells in empty space: about 22 cells per wavelength, so the error is only about 0.25%. At level 220 the continuum formula predicts λ = 4.09 cells, but the grid actually gives 3.75 cells. Since the frequency is fixed by the source, v = f · λ is then about 3.75 / 4.09 ≈ 0.92 of the long-wave speed: about <b>8% too slow</b>.</p>
<p>In glass the same source makes a shorter wave (n = 1.5 shrinks λ by 1.5), so it has fewer cells per wavelength and a larger error. And the error is slightly larger along the diagonals than along the grid axes, so a ring from a high-frequency point source is very slightly out of round. That direction-dependence is called <b>anisotropy</b>.</p>`,
        },
        {
          level: "university",
          html: `
<h4>The exact dispersion relation</h4>
<p>For a mode e<sup>i(k·x − ωt)</sup> (k in radians per cell, ω in radians per step) the undamped scheme gives g = e<sup>−iω</sup> and g + 1/g = 2 cos ω = 2 + c²Λ(k):</p>
<p class="formula">4 sin²(ω/2) = −c² Λ(k<sub>x</sub>, k<sub>y</sub>)</p>
<p>Along an axis, Λ = −1.264 sin²(k/2), so</p>
<p class="formula">4 sin²(ω/2) = 1.264 c² sin²(k/2)</p>
<p>For small ω and k both sines can be replaced by their arguments: ω = √0.316 · c k = 0.562 c k, the continuum. Expanding one order further, the phase velocity is</p>
<p class="formula">v<sub>p</sub> / v ≈ 1 − (k²/24)(1 − ν²), &nbsp; ν = 0.562 c</p>
<p>a second-order error in k that the temporal error partly cancels (the factor 1 − ν²). In n = 1, ν = 0.562 and at 10 cells per wavelength (k = 0.628) this gives −1.1%.</p>
<figure class="diagram"><svg viewBox="0 0 360 215" role="img" aria-label="Dispersion relation: frequency against wavenumber for the continuum and the grid">
<line x1="40" y1="190" x2="345" y2="190" stroke="currentColor"/><line x1="40" y1="190" x2="40" y2="20" stroke="currentColor"/>
<path d="M40,190 L50,184.8 L60,179.5 L70,174.3 L80,169.1 L90,163.8 L100,158.6 L110,153.4 L120,148.1 L130,142.9 L140,137.7 L150,132.5 L160,127.2 L170,122 L180,116.8 L190,111.5 L200,106.3 L210,101.1 L220,95.8 L230,90.6 L240,85.4 L250,80.1 L260,74.9 L270,69.7 L280,64.4 L290,59.2 L300,54 L310,48.8 L320,43.5 L330,38.3 L340,33.1" fill="none" stroke="#60a5fa" stroke-width="2" stroke-dasharray="5 4"/>
<path d="M40,190 L50,184.8 L60,179.5 L70,174.3 L80,169.2 L90,164 L100,159 L110,153.9 L120,149 L130,144.1 L140,139.3 L150,134.7 L160,130.1 L170,125.7 L180,121.4 L190,117.3 L200,113.4 L210,109.6 L220,106.1 L230,102.7 L240,99.6 L250,96.7 L260,94.1 L270,91.8 L280,89.7 L290,88 L300,86.5 L310,85.4 L320,84.5 L330,84 L340,83.9" fill="none" stroke="#f87171" stroke-width="2"/>
<line x1="40" y1="113.3" x2="200" y2="113.3" stroke="#fbbf24" stroke-width="1.2" stroke-dasharray="3 3"/>
<line x1="186.6" y1="113.3" x2="186.6" y2="190" stroke="#60a5fa" stroke-width="1" stroke-dasharray="2 3"/>
<line x1="200" y1="113.3" x2="200" y2="190" stroke="#f87171" stroke-width="1" stroke-dasharray="2 3"/>
<g font-size="12" fill="currentColor">
<text x="200" y="208" text-anchor="middle">wavenumber k (rad/cell)</text>
<text x="340" y="204" text-anchor="end">π</text>
<text x="44" y="16">ω (rad/step)</text>
<text x="230" y="60" fill="#60a5fa">continuum</text>
<text x="270" y="100" fill="#f87171">grid</text>
<text x="46" y="108" fill="#fbbf24">level 220</text>
</g></svg><figcaption>For a fixed source frequency (yellow), the grid curve (red) needs a larger k, i.e. a shorter wavelength, than the continuum line (blue). At k = π the grid curve is flat: group velocity zero.</figcaption></figure>
<h4>Phase-velocity errors</h4>
<p>Computed from the full 2D relation (n = 1; negative = too slow):</p>
<table>
<tr><th>cells / λ</th><th>3×3, axis</th><th>3×3, diagonal</th><th>4th order (N = 2), axis</th><th>4th order, diagonal</th></tr>
<tr><td>20</td><td>−0.28%</td><td>−0.33%</td><td>+0.03%</td><td>+0.03%</td></tr>
<tr><td>10</td><td>−1.1%</td><td>−1.3%</td><td>+0.05%</td><td>+0.11%</td></tr>
<tr><td>6</td><td>−3.2%</td><td>−3.7%</td><td>−0.25%</td><td>+0.20%</td></tr>
<tr><td>4</td><td>−7.4%</td><td>−8.3%</td><td>−2.0%</td><td>+0.05%</td></tr>
<tr><td>3</td><td>−13.6%</td><td>−14.4%</td><td>−6.4%</td><td>−0.8%</td></tr>
</table>
<p>The 3×3 kernel is close to isotropic: axis and diagonal differ by under 1% even at 4 cells per wavelength. (For comparison, the 5-point Laplacian at the same Courant number is equally slow along the axes but only −0.3% slow along the diagonal at 10 cells per wavelength.) In n = 1.5 the 3×3 error at 10 cells per wavelength is −1.4%, because ν is smaller and the temporal error cancels less.</p>
<p>The <b>group velocity</b> v<sub>g</sub> = dω/dk falls faster than v<sub>p</sub> and reaches zero at k = π: the shortest wave the grid can hold (2 cells, a checkerboard) does not travel at all.</p>`,
        },
        {
          level: "research",
          title: "Consequences and cut-offs",
          html: `
<ul>
<li><b>Accumulated phase error.</b> A relative phase-velocity error ε gives a phase lag of ε wavelengths per wavelength travelled. At 10 cells per wavelength (ε ≈ 1.1%) a wave that crosses 50 wavelengths lags by about half a wavelength: interference fringes far from the source shift visibly. Long propagation distances need more cells per wavelength, or a higher-order scheme.</li>
<li><b>Pulse spreading.</b> Because v<sub>g</sub> depends on k, a short pulse spreads and develops a trailing ripple of high-k components; the grid-dispersion experiment shows a Gaussian packet arriving late at the predicted v<sub>g</sub>.</li>
<li><b>Cut-off.</b> Along an axis the largest representable ω is 2 arcsin(√(1.264 c²)/2). For n = 1 that is 1.19 rad/step (level ≈ 304), so every source level up to 255 propagates. For n = 1.5 it drops to level ≈ 196: above it a wave cannot travel along the grid axes inside the glass (the diagonal limit, from Λ = −1.472, is a little higher). Such cut-offs are pure grid artefacts.</li>
<li><b>Refraction is affected too.</b> Snell's law follows from matching the tangential wavenumber at an interface, so it holds on the grid with the <i>grid</i> wavelengths; the effective index is λ<sub>1</sub>/λ<sub>2</sub>, which differs from n by the difference of the two dispersion errors.</li>
</ul>
<p>Dispersion analysis of this kind is standard in FDTD (Taflove &amp; Hagness ch. 4) and seismic modelling; optimised stencils (Tam &amp; Webb 1993) trade formal order for a smaller error over a target band.</p>`,
        },
      ],
      tryIt: [
        { experiment: "grid-dispersion", label: "Waves on a grid: numerical dispersion" },
        { experiment: "wavelength", label: "How long is a wave?" },
      ],
      sources: [
        "L. N. Trefethen, Group velocity in finite difference schemes, SIAM Review 24, 113–136 (1982)",
        "A. Taflove and S. C. Hagness, Computational Electrodynamics, 3rd ed. (Artech House, 2005), chapter 4: numerical dispersion and stability",
        "C. K. W. Tam and J. C. Webb, Dispersion-relation-preserving finite difference schemes for computational acoustics, J. Comput. Phys. 107, 262–281 (1993)",
        "R. J. LeVeque, Finite Difference Methods for Ordinary and Partial Differential Equations (SIAM, 2007)",
      ],
    },
    // ---------------------------------------------------------------------------------------- 5
    {
      id: "absorbing-boundaries",
      title: "Boundaries and absorbing layers",
      summary: "How the simulator makes waves leave the picture instead of bouncing back, how well it works, and what researchers use instead.",
      sections: [
        {
          level: "kids",
          html: `
<p>The simulator's pond has an edge. If the edge were a hard wall, every wave would bounce straight back, and soon the whole picture would be a jumble of echoes. We want waves to leave, as if the pond went on for ever.</p>
<p>Think of the sea. When a wave hits a <b>harbour wall</b>, it bounces back. When it rolls up a <b>gentle sandy beach</b>, it slowly runs out of energy and fades away, with hardly any echo.</p>
<p>So Wave Dude gives its pond a gentle beach all around the edge. Near the border the floats are sitting in something like thick honey that gets thicker and thicker the closer you get to the edge. A wave entering this zone slows down its wobbling bit by bit until nothing is left.</p>
<p>The secret is <b>gradual</b>. If the honey started suddenly, the wave would bounce off the honey itself, just like off a wall. A wider beach, where the honey gets thicker more slowly, swallows waves even better.</p>
<div class="fact"><b>Fun fact:</b> Rooms built for testing microphones and radio antennas, called anechoic chambers, are lined with foam or absorber shaped into pointy wedges. The points make the change from air to absorber gradual, so sound or radio waves are swallowed instead of echoing.</div>`,
        },
        {
          level: "school",
          html: `
<p>Beyond the last cell the simulator treats the field as zero. On its own, that would be a fixed edge, like the clamped end of a skipping rope: a wave would reflect completely, upside down.</p>
<p>To stop this, the outer ring of the scene gets a <b>damping edge</b>, by default 64 cells thick. The damping factor d (1 = no damping, 0 = motion stopped) for the ring i cells from the border is</p>
<p class="formula">d = √(i / thickness)</p>
<figure class="diagram"><svg viewBox="0 0 360 185" role="img" aria-label="Damping factor rising as a square root from the border into the scene">
<rect x="40" y="25" width="240" height="120" fill="#c084fc" fill-opacity="0.12"/>
<line x1="40" y1="140" x2="345" y2="140" stroke="currentColor"/><line x1="40" y1="140" x2="40" y2="20" stroke="currentColor"/>
<path d="M40,140 L40.2,137.3 L40.6,134.5 L41.4,131.8 L42.4,129 L43.8,126.3 L45.4,123.5 L47.4,120.8 L49.6,118 L52.2,115.3 L55,112.5 L58.2,109.8 L61.6,107 L65.4,104.3 L69.4,101.5 L73.8,98.8 L78.4,96 L83.4,93.3 L88.6,90.5 L94.2,87.8 L100,85 L106.2,82.3 L112.6,79.5 L119.4,76.8 L126.4,74 L133.8,71.3 L141.4,68.5 L149.4,65.8 L157.6,63 L166.2,60.3 L175,57.5 L184.2,54.8 L193.6,52 L203.4,49.3 L213.4,46.5 L223.8,43.8 L234.4,41 L245.4,38.3 L256.6,35.5 L268.2,32.8 L280,30" fill="none" stroke="#34d399" stroke-width="2.5"/>
<line x1="280" y1="30" x2="345" y2="30" stroke="#34d399" stroke-width="2.5"/>
<line x1="280" y1="25" x2="280" y2="145" stroke="currentColor" stroke-dasharray="3 3" opacity="0.6"/>
<g font-size="12" fill="currentColor">
<text x="32" y="34" text-anchor="end">1</text><text x="32" y="144" text-anchor="end">0</text>
<text x="14" y="90">d</text>
<text x="40" y="158">border</text>
<text x="280" y="158" text-anchor="middle">thickness</text>
<text x="150" y="178" text-anchor="middle">distance from the border (cells) →</text>
<text x="292" y="50">scene</text>
<text x="120" y="60" fill="#c084fc">damping edge</text>
</g></svg><figcaption>The damping factor rises smoothly from 0 at the border to 1 at the inner side of the edge. The square root makes it change slowly where the wave enters.</figcaption></figure>
<h4>How well does it work?</h4>
<p>The <b>reflection coefficient</b> R is the echo's amplitude divided by the incoming amplitude. Measured with a straight pulse at level 60 (λ ≈ 15 cells):</p>
<table>
<tr><th>edge thickness</th><th>in wavelengths</th><th>R (amplitude)</th><th>energy reflected</th></tr>
<tr><td>16 cells</td><td>≈ 1.1 λ</td><td>≈ 6%</td><td>≈ 0.4%</td></tr>
<tr><td>64 cells</td><td>≈ 4.3 λ</td><td>≈ 2%</td><td>≈ 0.04%</td></tr>
<tr><td>128 cells</td><td>≈ 8.5 λ</td><td>≈ 1%</td><td>≈ 0.01%</td></tr>
</table>
<p>Energy goes with amplitude squared: 6% amplitude is 0.06² = 0.0036, i.e. 0.36% of the energy. What matters is thickness <b>compared with the wavelength</b>: long waves (low levels) see a more sudden edge and reflect more.</p>`,
        },
        {
          level: "university",
          html: `
<p>In the layer the update is u<sup>m+1</sup> = u<sup>m</sup> + d(u<sup>m</sup> − u<sup>m−1</sup>) + c² K ∗ u<sup>m</sup>. Writing d = 1 − γ, it approximates the damped wave equation</p>
<p class="formula">∂²u/∂t² + γ ∂u/∂t = 0.316 c² ∇²u</p>
<p>and, as the stability analysis showed, an oscillating mode loses amplitude by exactly √d per step. For example d = 0.99 halves the amplitude in about 138 steps; d = 0.9 in about 13.</p>
<h4>Why a graded profile, and why it still reflects</h4>
<p>Any change of γ over a distance short compared with λ acts as an impedance step and reflects. A profile that changes slowly on the scale of λ reflects little (a WKB-type argument), but it must also absorb enough on the way in and back out. The engine's profile d = √(i/T) has γ = 1 − √(1 − s) ≈ s/2 just inside the inner boundary (s = distance into the layer / T), so γ starts from zero with a finite slope and grows to γ = 1 (no inertia at all) in the outermost ring; beyond that ring the field is held at zero. The measured R falls roughly as the layer thickness in wavelengths grows, but slowly: from ≈ 6% at 1.1 λ to ≈ 1% at 8.5 λ. Such “sponge” layers have three known weaknesses:</p>
<ul>
<li>reflection depends on the <b>frequency</b> (thickness/λ);</li>
<li>it depends on the <b>angle</b>: near grazing incidence the wave travels a long way parallel to the layer and sees a more abrupt change per wavelength along its path;</li>
<li><b>corners</b> and evanescent fields are handled poorly.</li>
</ul>
<h4>Walls inside the scene</h4>
<p>A wall painted with full absorption (d = 0) turns the update into u<sup>m+1</sup> = u<sup>m</sup> + c² K ∗ u<sup>m</sup>: no inertia, just diffusion. The abrupt change from d = 1 to d = 0 is a strong impedance mismatch, so walls reflect most of the incoming wave, which is what a slit or a mirror in the app needs. A graded absorber painted by hand behaves like the edge.</p>`,
        },
        {
          level: "research",
          title: "Perfectly matched layers",
          html: `
<p>Absorbing boundaries are a classic problem. The main families are:</p>
<ul>
<li><b>Absorbing boundary conditions</b> (Engquist &amp; Majda 1977; Mur 1981 for FDTD): one-way wave equations applied at the last cell, exact only at chosen angles.</li>
<li><b>Sponge / damping layers</b> (e.g. Cerjan et al. 1985 in seismics): what Wave Dude uses. Simple, robust, never perfect.</li>
<li><b>Perfectly matched layers</b> (Bérenger 1994): an absorbing layer whose wave impedance matches the interior <i>exactly</i>, for every angle and frequency, in the continuum. Bérenger split the fields into components; the modern view is complex coordinate stretching (Chew &amp; Weedon 1994), x → x + (i/ω)∫σ(x′)dx′, which turns propagating waves into exponentially decaying ones without any reflection at the interface.</li>
</ul>
<p>After discretisation a PML is no longer perfect, but with a polynomial σ-profile 10–20 cells thick it typically reflects orders of magnitude less than a sponge of the same thickness. Its weak spots are evanescent and near-grazing waves, which led to the complex-frequency-shifted (CFS) and convolutional PML (Roden &amp; Gedney 2000). For the second-order scalar wave equation used here, a PML needs auxiliary fields (memory variables) in the layer; on the GPU they could live in spare texture channels. Implementing one and comparing its reflection coefficient with the absorbing-edge experiment would be a worthwhile project for this code base.</p>`,
        },
      ],
      tryIt: [{ experiment: "absorbing-edge", label: "How good is the absorbing edge?" }],
      sources: [
        "J.-P. Bérenger, A perfectly matched layer for the absorption of electromagnetic waves, J. Comput. Phys. 114, 185–200 (1994)",
        "W. C. Chew and W. H. Weedon, A 3D perfectly matched medium from modified Maxwell's equations with stretched coordinates, Microwave Opt. Technol. Lett. 7, 599–604 (1994)",
        "B. Engquist and A. Majda, Absorbing boundary conditions for the numerical simulation of waves, Mathematics of Computation 31, 629–651 (1977)",
        "C. Cerjan, D. Kosloff, R. Kosloff and M. Reshef, A nonreflecting boundary condition for discrete acoustic and elastic wave equations, Geophysics 50, 705–708 (1985)",
        "J. A. Roden and S. D. Gedney, Convolution PML (CPML): an efficient FDTD implementation of the CFS-PML for arbitrary media, Microwave Opt. Technol. Lett. 27, 334–339 (2000)",
        "S. G. Johnson, Notes on Perfectly Matched Layers (PMLs) — https://arxiv.org/abs/2108.05348",
        "A. Taflove and S. C. Hagness, Computational Electrodynamics, 3rd ed. (Artech House, 2005), chapters 6–7",
      ],
    },
    // ---------------------------------------------------------------------------------------- 6
    {
      id: "sources-and-materials",
      title: "Sources and materials in the update",
      summary: "How wave makers nudge their cells, and how refractive index, absorbers and walls enter the one-line update.",
      sections: [
        {
          level: "kids",
          html: `
<p>How does the simulator make waves in the first place? Picture a gentle hand holding one float. Every moment, the hand <b>nudges</b> the float a little towards where it wants it to be: up, then down, then up again, in a steady rhythm. The neighbours copy the float, and waves ripple away.</p>
<p>Why only a nudge, and not a firm grip? If the hand gripped the float tightly, waves coming back from a mirror would crash into that hand as if it were a little post, and bounce off. A gentle hand lets most of the passing waves slide through.</p>
<p>The materials are just different kinds of floats:</p>
<ul>
<li><b>Glass</b>: the floats are a bit lazy. They copy their neighbours more slowly, so waves travel slower in glass. That slowing is what bends waves in a lens.</li>
<li><b>Absorber</b>: the floats sit in honey. Their wobbles die away.</li>
<li><b>Wall</b>: the floats are stuck in thick mud and cannot swing at all, so waves bounce off.</li>
</ul>
<div class="home"><b>Try it at home:</b> In a full bath or a sink, dip one finger in and out gently and steadily: neat rings spread out. Now hold a flat plastic lid upright in the water and move it back and forth: you get straight waves, like Wave Dude's line source.</div>`,
        },
        {
          level: "school",
          html: `
<h4>Sources</h4>
<p>Before each step, every source cell is pulled 10% of the way towards the value the wave maker wants:</p>
<p class="formula">u ← 0.9 · u + 0.1 · A · sin(φ + ω · t)</p>
<p>A is the amplitude, φ the starting phase, t the step number and ω the angular frequency in radians per step. A source's frequency <b>level</b> (1 to 255) sets ω = level / 255 (with the default frequency scale of 2). One oscillation takes 2π / ω ≈ 1602 / level steps.</p>
<figure class="diagram"><svg viewBox="0 0 360 110" role="img" aria-label="A source cell is moved 10 percent of the way towards the drive value">
<line x1="30" y1="60" x2="330" y2="60" stroke="currentColor"/>
<circle cx="80" cy="60" r="6" fill="#f87171"/><circle cx="280" cy="60" r="6" fill="#60a5fa"/><circle cx="100" cy="60" r="6" fill="#34d399"/>
<path d="M80,40 L100,40" stroke="#34d399" stroke-width="2"/><path d="M95,36 L100,40 L95,44" fill="none" stroke="#34d399" stroke-width="2"/>
<g font-size="12" fill="currentColor" text-anchor="middle">
<text x="80" y="88">u now</text><text x="280" y="88">drive A·sin(φ + ωt)</text><text x="112" y="30">new u: 10% of the way</text>
</g></svg><figcaption>A “soft” source does not set its cell; it moves it one tenth of the way towards the drive value each step.</figcaption></figure>
<p><b>Worked example.</b> Level 40: ω = 40/255 ≈ 0.157 rad per step, so one period is 2π / 0.157 ≈ 40 steps. The long-wave speed in empty space is 0.562 cells per step, so the wavelength is λ = v × period ≈ 0.562 × 40.1 ≈ 22.5 cells. In glass (n = 1.5) the speed is 0.375 cells per step, so λ ≈ 15 cells.</p>
<h4>Materials</h4>
<ul>
<li><b>Refractive index n</b> (0.9 to 10): the pull from the neighbours is multiplied by c² = 1/n². Larger n, slower waves.</li>
<li><b>Damping d</b> (1 = none, 0 = stops motion): multiplies the velocity term. Absorbers have d between 0 and 1, walls d = 0.</li>
</ul>
<p>In a scene image, red = n × 100 (so 100 is empty space, 150 glass), blue = 255 × (1 − d), and green &gt; 0 marks a source whose level is the green value.</p>`,
        },
        {
          level: "university",
          html: `
<h4>Hard, soft and relaxation sources</h4>
<p>In FDTD terminology a <b>hard source</b> overwrites the field, u = f(t): simple, but the source cell becomes a fixed boundary that scatters every wave coming back to it. An additive <b>soft source</b> adds f(t) to the update and is transparent. Wave Dude's source (from WaveSimulator2D) is soft in the sense that it never overwrites the cell, but rather than adding a term it <b>relaxes</b> the cell towards the drive: each step, before the update, u ← 0.9u + 0.1 f(t). (In the shader this is applied whenever a source cell is read, so the cell and its neighbours all see the relaxed value.) The source only partly pins its cell, so incoming waves are scattered weakly. A consequence is that the radiated amplitude is not exactly A: it depends on the frequency and on how many neighbouring cells are sources (a line source radiates a plane wave of different amplitude from a point source with the same A).</p>
<p>Envelopes, all in units of the source's own cycles: the drive is multiplied by a <b>Gaussian</b> (centred in the “on” span, σ = on/6) or a smoothed <b>square</b>, the product of two arctan steps with a width of 0.35 cycles, repeating after on + off cycles. <b>Detach</b> fades the drive linearly to zero over 30 steps and then stops relaxing the cell, so later waves pass the source position unaffected. With the 4th-order stencil, sources act once per step (on the first sub-step).</p>
<h4>Materials as coefficients</h4>
<p>The material texture holds c² = 1/n² and d per cell, so the update solves</p>
<p class="formula">∂²u/∂t² + γ(x) ∂u/∂t = (0.316 / n(x)²) ∇²u</p>
<p>Dividing by c², this is the 2D Helmholtz-type equation of a field with u and ∂u/∂n continuous across an interface, the same conditions as the electric field of TE (s-polarised) light in a non-magnetic medium. So at normal incidence the amplitude reflection is r = (n₁ − n₂)/(n₁ + n₂): from n = 1 into n = 1.5, r = −0.2, i.e. 4% of the intensity, as for real glass. Each cell has one n, so a curved lens surface is a pixel <b>staircase</b>; at ~10 cells per wavelength it acts like a slightly rough surface and scatters weakly.</p>`,
        },
        {
          level: "research",
          title: "Limits and better sources",
          html: `
<ul>
<li><b>Total-field / scattered-field (TF/SF)</b> injection (Taflove &amp; Hagness ch. 5) launches a clean plane wave of known amplitude through a closed surface, with no source cells in the way. It would make reflection and transmission measurements easier to normalise than the relaxation line source.</li>
<li><b>Dimensionality.</b> A point source in 2D is a line source in 3D: its amplitude falls as 1/√r (cylindrical spreading, Hankel-function far field), not 1/r. Intensity patterns are those of slits and cylinders, not pinholes and spheres.</li>
<li><b>Material model.</b> n is real, frequency-independent and isotropic (no material dispersion, birefringence or nonlinearity); damping is a velocity friction, not a complex index with the right frequency dependence. Polarisation does not exist in a scalar model, so Brewster's angle and p-polarised Fresnel coefficients are outside its reach.</li>
<li><b>Subpixel smoothing</b> of ε at interfaces (e.g. Farjadpour et al. 2006) restores second-order accuracy for curved boundaries; the staircase scheme is first-order there.</li>
</ul>`,
        },
      ],
      tryIt: [
        { experiment: "splash", label: "Splash! Making waves" },
        { experiment: "wavelength", label: "How long is a wave?" },
        { experiment: "refraction", label: "Bending waves: Snell's law" },
      ],
      sources: [
        "A. Taflove and S. C. Hagness, Computational Electrodynamics, 3rd ed. (Artech House, 2005), chapter 5: sources, hard and soft",
        "E. Hecht, Optics, 5th ed. (Pearson, 2017), chapter 4: the Fresnel equations",
        "A. Farjadpour et al., Improving accuracy by subpixel smoothing in the finite-difference time domain, Optics Letters 31, 2972–2974 (2006)",
        "WaveSimulator2D by 0x23 — https://github.com/0x23/WaveSimulator2D",
      ],
    },
    // ---------------------------------------------------------------------------------------- 7
    {
      id: "measuring-intensity",
      title: "Measuring intensity",
      summary: "How the simulator turns a fast-swinging field into a steady picture of where the energy goes: a two-stage running average of u².",
      sections: [
        {
          level: "kids",
          html: `
<p>In the Field view you see crests and troughs racing along, flickering red and blue. That is great for watching waves move, but it is hard to see where the waves are <b>strong</b> and where they cancel out.</p>
<p>So the simulator can show a second picture, the <b>intensity</b>. Every float keeps a little memory of how big its wobbles have been lately. A float that has been swinging wildly glows brightly. A float that has stayed still stays dark. Because it is a memory, the picture is calm and steady, even though the floats are still moving up and down all the time.</p>
<p>It is a bit like a long-exposure photo of a fairground at night: the moving lights turn into smooth glowing stripes that show where the lights have been.</p>
<p>The memory takes a little while to fill up. When you start a new scene, the bright patterns grow in over a few wave-swings, and if you change something, the old picture fades out slowly.</p>
<div class="home"><b>Try it at home:</b> Hold a ruler flat on a table with most of it sticking out over the edge, and twang the free end. It moves too fast to follow, but you see a blurry fan: wide at the tip, narrow near the table. That blur is an intensity picture: it shows how far each part swings, not where it is right now.</div>`,
        },
        {
          level: "school",
          html: `
<p>The energy carried by a wave goes with the <b>square</b> of its amplitude. Squaring also makes troughs count as much as crests: u = −0.5 and u = +0.5 both give u² = 0.25. For a steady wave u = A sin(ωt), the average of u² over time is A²/2.</p>
<p>The simulator needs that average without storing a long history for two million cells. It uses a <b>running average</b>: each step, each cell keeps most of its old average and mixes in a little of the new u²:</p>
<p class="formula">s ← α · s + (1 − α) · u²</p>
<p>α (alpha) is a number just below 1. The averaging time is τ = 10 × 100 / (lowest source level) steps (with the default setting 10), and α = e<sup>−1/τ</sup>.</p>
<p><b>Worked example.</b> With one source at level 40: τ = 1000 / 40 = 25 steps, α = e<sup>−1/25</sup> ≈ 0.961. Each step the average keeps 96.1% of its old value and takes 3.9% of the new u². One wave period at level 40 is about 40 steps, so the average spans a bit more than half a period. Doing it once leaves a visible flicker, so the simulator does it <b>twice in a row</b> and shows the mean of the two averages.</p>
<figure class="diagram"><svg viewBox="0 0 360 200" role="img" aria-label="Field, its square, and the smoothed intensity rising over time">
<line x1="30" y1="55" x2="350" y2="55" stroke="currentColor" opacity="0.4"/>
<line x1="30" y1="175" x2="350" y2="175" stroke="currentColor"/>
<path d="M30,55 L32.7,45.7 L35.3,37.4 L38,30.8 L40.7,26.5 L43.3,25 L46,26.4 L48.7,30.7 L51.3,37.3 L54,45.6 L56.7,54.9 L59.3,64.1 L62,72.5 L64.7,79.2 L67.3,83.5 L70,85 L72.7,83.6 L75.3,79.4 L78,72.8 L80.7,64.5 L83.3,55.3 L86,46 L88.7,37.6 L91.3,30.9 L94,26.6 L96.7,25 L99.3,26.4 L102,30.5 L104.7,37.1 L107.3,45.4 L110,54.6 L112.7,63.9 L115.3,72.3 L118,79 L120.7,83.4 L123.3,85 L126,83.7 L128.7,79.6 L131.3,73 L134,64.8 L136.7,55.5 L139.3,46.2 L142,37.8 L144.7,31.1 L147.3,26.7 L150,25 L152.7,26.3 L155.3,30.4 L158,36.9 L160.7,45.1 L163.3,54.3 L166,63.6 L168.7,72.1 L171.3,78.9 L174,83.3 L176.7,85 L179.3,83.7 L182,79.7 L184.7,73.2 L187.3,65 L190,55.8 L192.7,46.5 L195.3,38 L198,31.2 L200.7,26.7 L203.3,25 L206,26.2 L208.7,30.2 L211.3,36.7 L214,44.9 L216.7,54.1 L219.3,63.4 L222,71.9 L224.7,78.7 L227.3,83.2 L230,85 L232.7,83.8 L235.3,79.8 L238,73.4 L240.7,65.2 L243.3,56 L246,46.7 L248.7,38.2 L251.3,31.4 L254,26.8 L256.7,25 L259.3,26.1 L262,30.1 L264.7,36.5 L267.3,44.6 L270,53.8 L272.7,63.1 L275.3,71.7 L278,78.5 L280.7,83.1 L283.3,85 L286,83.9 L288.7,80 L291.3,73.6 L294,65.5 L296.7,56.3 L299.3,47 L302,38.5 L304.7,31.5 L307.3,26.9 L310,25 L312.7,26.1 L315.3,29.9 L318,36.2 L320.7,44.4 L323.3,53.6 L326,62.9 L328.7,71.4 L331.3,78.4 L334,83 L336.7,85 L339.3,84 L342,80.1 L344.7,73.9 L347.3,65.7 L350,56.6" fill="none" stroke="#60a5fa" stroke-width="1.5"/>
<path d="M30,175 L32.7,169.3 L35.3,154.3 L38,135.8 L40.7,120.8 L43.3,115 L46,120.6 L48.7,135.6 L51.3,154.1 L54,169.1 L56.7,175 L59.3,169.4 L62,154.6 L64.7,136.1 L67.3,120.9 L70,115 L72.7,120.5 L75.3,135.3 L78,153.8 L80.7,169 L83.3,175 L86,169.6 L88.7,154.8 L91.3,136.3 L94,121.1 L96.7,115 L99.3,120.3 L102,135.1 L104.7,153.6 L107.3,168.8 L110,175 L112.7,169.7 L115.3,155.1 L118,136.6 L120.7,121.3 L123.3,115 L126,120.2 L128.7,134.8 L131.3,153.3 L134,168.7 L136.7,175 L139.3,169.9 L142,155.3 L144.7,136.8 L147.3,121.4 L150,115 L152.7,120 L155.3,134.6 L158,153.1 L160.7,168.5 L163.3,175 L166,170 L168.7,155.5 L171.3,137.1 L174,121.6 L176.7,115 L179.3,119.9 L182,134.3 L184.7,152.8 L187.3,168.3 L190,175 L192.7,170.2 L195.3,155.8 L198,137.3 L200.7,121.7 L203.3,115 L206,119.8 L208.7,134.1 L211.3,152.6 L214,168.2 L216.7,174.9 L219.3,170.3 L222,156 L224.7,137.6 L227.3,121.9 L230,115.1 L232.7,119.6 L235.3,133.8 L238,152.3 L240.7,168 L243.3,174.9 L246,170.4 L248.7,156.3 L251.3,137.8 L254,122.1 L256.7,115.1 L259.3,119.5 L262,133.6 L264.7,152.1 L267.3,167.8 L270,174.9 L272.7,170.6 L275.3,156.5 L278,138.1 L280.7,122.2 L283.3,115.1 L286,119.3 L288.7,133.4 L291.3,151.8 L294,167.7 L296.7,174.9 L299.3,170.7 L302,156.8 L304.7,138.3 L307.3,122.4 L310,115.1 L312.7,119.2 L315.3,133.1 L318,151.6 L320.7,167.5 L323.3,174.9 L326,170.9 L328.7,157 L331.3,138.6 L334,122.6 L336.7,115.1 L339.3,119.1 L342,132.9 L344.7,151.3 L347.3,167.3 L350,174.8" fill="none" stroke="#fbbf24" stroke-width="1.2" opacity="0.8"/>
<path d="M30,175 L32.7,174.9 L35.3,174.2 L38,172.8 L40.7,170.7 L43.3,168.4 L46,166.2 L48.7,164.5 L51.3,163.7 L54,163.5 L56.7,163.7 L59.3,163.9 L62,163.5 L64.7,162.5 L67.3,160.8 L70,158.8 L72.7,156.9 L75.3,155.6 L78,155.1 L80.7,155.3 L83.3,155.9 L86,156.4 L88.7,156.4 L91.3,155.6 L94,154.3 L96.7,152.6 L99.3,151 L102,150 L104.7,149.8 L107.3,150.2 L110,151.1 L112.7,151.8 L115.3,152.1 L118,151.6 L120.7,150.4 L123.3,149 L126,147.6 L128.7,146.8 L131.3,146.7 L134,147.3 L136.7,148.3 L139.3,149.2 L142,149.6 L144.7,149.3 L147.3,148.3 L150,147 L152.7,145.7 L155.3,145 L158,145 L160.7,145.7 L163.3,146.8 L166,147.8 L168.7,148.3 L171.3,148.1 L174,147.2 L176.7,145.9 L179.3,144.7 L182,144 L184.7,144.1 L187.3,144.9 L190,146 L192.7,147.1 L195.3,147.6 L198,147.5 L200.7,146.6 L203.3,145.4 L206,144.2 L208.7,143.6 L211.3,143.7 L214,144.4 L216.7,145.6 L219.3,146.7 L222,147.3 L224.7,147.1 L227.3,146.3 L230,145.1 L232.7,143.9 L235.3,143.3 L238,143.4 L240.7,144.2 L243.3,145.4 L246,146.5 L248.7,147.1 L251.3,147 L254,146.2 L256.7,145 L259.3,143.8 L262,143.2 L264.7,143.3 L267.3,144.1 L270,145.3 L272.7,146.4 L275.3,147 L278,146.9 L280.7,146.1 L283.3,144.9 L286,143.8 L288.7,143.1 L291.3,143.2 L294,144 L296.7,145.2 L299.3,146.3 L302,147 L304.7,146.9 L307.3,146.1 L310,144.9 L312.7,143.7 L315.3,143.1 L318,143.2 L320.7,144 L323.3,145.2 L326,146.3 L328.7,146.9 L331.3,146.9 L334,146.1 L336.7,144.9 L339.3,143.7 L342,143.1 L344.7,143.2 L347.3,143.9 L350,145.1" fill="none" stroke="#f87171" stroke-width="2.5"/>
<line x1="30" y1="145" x2="350" y2="145" stroke="currentColor" stroke-dasharray="3 3" opacity="0.5"/>
<g font-size="12" fill="currentColor">
<text x="34" y="18" fill="#60a5fa">field u</text>
<text x="300" y="108" fill="#fbbf24">u²</text>
<text x="230" y="140" fill="#f87171">intensity I</text>
<text x="352" y="142" text-anchor="end">A²/2</text>
<text x="190" y="194" text-anchor="middle">steps (level 40, 240 steps shown) →</text>
</g></svg><figcaption>Blue: the field at one cell. Yellow: u². Red: the displayed intensity, which settles near the average A²/2 after about two periods.</figcaption></figure>`,
        },
        {
          level: "university",
          html: `
<h4>The filter</h4>
<p>Per cell, every step (on the last sub-step if there are several):</p>
<p class="formula">s₁ ← α s₁ + (1 − α) u² &nbsp;&nbsp; s₂ ← α s₂ + (1 − α) s₁ &nbsp;&nbsp; I = (s₁ + s₂) / 2</p>
<p>with α = e<sup>−1/τ</sup>, τ = TimeDecayFactor × 100 / (lowest source level) steps (minimum 1; TimeDecayFactor defaults to 10). Each stage is a one-pole low-pass, H(z) = (1 − α)/(1 − α z<sup>−1</sup>); the cascade is a critically damped two-pole filter. s₁ and s₂ are the blue and alpha channels of the state texture, so the filter costs no extra memory traffic.</p>
<h4>Ripple and lag</h4>
<p>For u = A sin ωt, u² = (A²/2)(1 − cos 2ωt): a DC part plus a ripple at 2ω. A one-pole stage passes the ripple with |H| ≈ 1/√(1 + (2ωτ)²). Since τ is scaled by the slowest source, 2ωτ for that source is fixed: ω = level/255 and τ = 1000/level give 2ωτ = 2000/255 ≈ 7.8 at the default setting. Simulated with the engine's numbers:</p>
<table>
<tr><th>quantity</th><th>s₁</th><th>s₂</th><th>I (shown)</th></tr>
<tr><td>residual ripple, relative to A²/2</td><td>±13%</td><td>±1.6%</td><td>±6.5%</td></tr>
<tr><td>time to reach 90% of A²/2</td><td>≈ 1.3 periods</td><td>—</td><td>≈ 1.8 periods</td></tr>
</table>
<p>The mean of the two stages is a compromise: smoother than s₁, quicker than s₂. Doubling TimeDecayFactor roughly halves the ripple of each stage but doubles the lag. Faster sources in the same scene are filtered more strongly, because τ is set by the slowest.</p>
<h4>Display and probes</h4>
<p>The intensity view shows √I × brightness through a 255-entry colour table, so brightness follows amplitude rather than energy, which makes weak fringes visible. Probes read I × intensityScale; the integrating line probe adds this value up once per step, which is useful for comparing total power through a slit or a lens aperture.</p>`,
        },
        {
          level: "research",
          title: "What the intensity is, and is not",
          html: `
<ul>
<li><b>Mean square, not power flux.</b> The conserved energy of the scalar wave equation has a kinetic part ½(∂u/∂t)²/c² and a potential part ½|∇u|², and the energy flux is −(∂u/∂t)∇u. For a travelling wave of fixed frequency the time-averaged flux is proportional to n⟨u²⟩, just as the irradiance of light is proportional to n⟨E²⟩. The same power therefore shows up as a ⟨u²⟩ that is 1/n smaller inside glass; compare brightness across materials only after multiplying by n.</li>
<li><b>Standing waves.</b> ⟨u²⟩ varies over half-wavelength scales in a standing wave, while energy density does not. Bright and dark fringes in front of a mirror are real features of ⟨u²⟩, not of the energy.</li>
<li><b>Several frequencies.</b> Two sources at different frequencies beat; the filter suppresses the beat only when its period is much shorter than τ. Slowly beating sources therefore appear to flicker in the intensity view.</li>
<li><b>Transients.</b> Because the filter has memory, quantitative readings should wait several τ after the field has reached steady state (the experiments do this with fixed run lengths).</li>
</ul>
<p>Exponential (one-pole) averaging is the standard “leaky integrator” of signal processing; any DSP text covers its frequency response.</p>`,
        },
      ],
      tryIt: [
        { experiment: "double-slit", label: "The double slit" },
        { experiment: "absorbing-edge", label: "How good is the absorbing edge?" },
      ],
      sources: [
        "A. V. Oppenheim and R. W. Schafer, Discrete-Time Signal Processing, 3rd ed. (Pearson, 2010): first-order recursive filters",
        "E. Hecht, Optics, 5th ed. (Pearson, 2017), chapter 3: irradiance as the time average of the squared field",
        "R. P. Feynman, R. B. Leighton and M. Sands, The Feynman Lectures on Physics, Vol. I, chapter 29 (Interference) — https://www.feynmanlectures.caltech.edu/I_29.html",
      ],
    },
    // ---------------------------------------------------------------------------------------- 8
    {
      id: "checking-against-theory",
      title: "Checking a simulation against theory",
      summary: "How the experiments compare what you measure with what the grid's own equations predict, and how researchers test a simulator.",
      sections: [
        {
          level: "kids",
          html: `
<p>How do we know the simulator is telling the truth? Scientists do not just trust a computer. They <b>test</b> it, the same way you might test a new ruler against one you already trust.</p>
<p>Here is the recipe:</p>
<ol>
<li><b>Predict.</b> Before running, work out with maths how long the waves should be.</li>
<li><b>Measure.</b> Run the simulation and measure the waves with the ruler tool. Measure across several waves and divide, so a small slip of your hand matters less.</li>
<li><b>Compare.</b> If the two numbers agree, good. If they do not, either the measurement, the maths or the simulator has a mistake, and finding out which is real science.</li>
</ol>
<p>Wave Dude's experiments do this with you. When you type in your measurement, the app compares it with its own prediction and tells you how close you were.</p>
<p>The clever part: the prediction already knows that the simulator is a grid of floats, so it even predicts the tiny slowing-down of very short waves.</p>
<div class="home"><b>Try it at home:</b> Test your kitchen scale. A litre of water has a mass of very nearly one kilogram. Weigh an empty jug, pour in exactly one litre from a measuring jug, and weigh again. Does the scale say about 1000 grams more? That is checking a measuring tool against something you already know.</div>`,
        },
        {
          level: "school",
          html: `
<figure class="diagram"><svg viewBox="0 0 360 120" role="img" aria-label="Predict, measure, compare cycle">
<g font-size="13" fill="currentColor" text-anchor="middle">
<rect x="10" y="35" width="95" height="44" rx="8" fill="#60a5fa" fill-opacity="0.2" stroke="#60a5fa"/><text x="57" y="55">predict</text><text x="57" y="70" font-size="11">from the grid</text>
<rect x="133" y="35" width="95" height="44" rx="8" fill="#fbbf24" fill-opacity="0.2" stroke="#fbbf24"/><text x="180" y="55">measure</text><text x="180" y="70" font-size="11">ruler, probes</text>
<rect x="256" y="35" width="95" height="44" rx="8" fill="#34d399" fill-opacity="0.2" stroke="#34d399"/><text x="303" y="55">compare</text><text x="303" y="70" font-size="11">% difference</text>
</g>
<g stroke="currentColor" stroke-width="1.5" fill="none">
<path d="M105,57 L131,57"/><path d="M125,52 L131,57 L125,62"/>
<path d="M228,57 L254,57"/><path d="M248,52 L254,57 L248,62"/>
<path d="M303,79 C303,110 57,110 57,81"/><path d="M52,87 L57,81 L62,87"/>
</g>
<text x="180" y="116" font-size="11" fill="currentColor" text-anchor="middle">disagree? find out why</text>
</svg><figcaption>Every experiment in the app follows this loop.</figcaption></figure>
<p>In the experiment “How long is a wave?” you measure λ with the ruler. The app's prediction uses the source's frequency and the grid's own wave behaviour, and accepts your answer if it is within 12%.</p>
<p><b>Worked example.</b> At level 40 the predicted wavelength is 22.5 cells. Suppose your ruler spans 5 wavelengths and reads 112 cells. Then λ = 112 ÷ 5 = 22.4 cells: 0.4% off. Measuring across 5 waves divides your hand's error by 5.</p>
<p>Then the speed: f = ω / 2π = 0.157 / 6.283 ≈ 0.025 waves per step, and</p>
<p class="formula">v = f · λ = 0.025 × 22.4 ≈ 0.56 cells per step</p>
<p>which matches the long-wave speed 0.562 cells per step. Try a very high level and the measured v comes out a few percent lower, as the dispersion page predicts. That is not a measuring mistake: it is the grid.</p>
<p>When a result does not fit, check the usual suspects in order: was the ruler drawn from crest to crest (not crest to trough)? Did you count gaps rather than crests? Was the wave still settling, or was it close to the source, where the wave fronts are not yet straight? Only after those would you suspect the simulator itself, and then the next step is a careful test with many more cells per wavelength.</p>`,
        },
        {
          level: "university",
          html: `
<h4>Predicting with the scheme, not the continuum</h4>
<p>The app's experiments predict wavelengths from the exact discrete relation 4 sin²(ω/2) = 1.264 c² sin²(k/2), solved for k by bisection (src/engine/physics.ts, <code>wavelength()</code>), rather than from λ = 2π · 0.562 c / ω. The two agree within 0.25% at level 40 but differ by 8% at level 220, more than a careful ruler measurement. Using the scheme's own relation separates two questions: “did the student measure well?” and “does the grid approximate the continuum?”.</p>
<h4>What each experiment checks</h4>
<ul>
<li><b>How long is a wave?</b> λ against the discrete prediction (12% tolerance), then v = fλ.</li>
<li><b>Snell's law</b>: the predicted refraction angle uses sin θ₂ = sin θ₁ · λ(n)/λ(1), the ratio of grid wavelengths in the two media, which is what phase matching along the interface gives on the grid.</li>
<li><b>Waves on a grid</b>: λ at level 30 and level 220 within 6%, with the continuum and scheme values printed side by side; then a Gaussian packet whose arrival at a second probe is marked at the long-wave speed and at the scheme's group velocity v<sub>g</sub> = dω/dk.</li>
<li><b>How good is the absorbing edge?</b> A pulse from a line source (which detaches after the pulse so the echo can pass), recorded at a probe; R = A<sub>echo</sub> / A<sub>in</sub> in % and in dB, against thickness and frequency.</li>
</ul>
<h4>A convergence check you can do</h4>
<p>Second-order accuracy means the phase error should scale as (cells per wavelength)<sup>−2</sup>. From the table on the dispersion page: −1.14% at 10 cells per wavelength and −0.28% at 20, a ratio of 4.07, as expected. In the app you change the resolution by changing the source level, since the cell size is fixed.</p>`,
        },
        {
          level: "research",
          title: "Verification and validation",
          html: `
<p>Computational science separates <b>verification</b> (does the code solve its equations correctly?) from <b>validation</b> (are they the right equations for the real system?).</p>
<ul>
<li><b>Verification</b> tools: comparison with exact discrete solutions (as above), convergence studies under grid refinement, Richardson extrapolation to estimate the continuum limit, and the method of manufactured solutions, in which a chosen smooth u is inserted into the PDE to produce a source term and the code must reproduce u at the predicted order.</li>
<li><b>Analytic benchmarks</b> available in 2D: the cylindrical outgoing wave of a point source (Hankel function H₀<sup>(1)</sup>(kr), amplitude ∝ 1/√r far away; two point probes at r and 4r should differ by a factor 2 in amplitude), Fresnel reflection at a flat interface (r = (n₁ − n₂)/(n₁ + n₂) for this scalar model), and the Fraunhofer pattern of a slit far from it.</li>
<li><b>Validation</b> for this app is mostly qualitative: a 2D scalar model reproduces interference, diffraction, refraction and total internal reflection of real light and of shallow-water waves, but not polarisation, 3D spreading, material dispersion or nonlinearity. Quantitative agreement with an experiment would need those effects to be negligible, or to be added to the model.</li>
</ul>
<p>Good practice for anyone extending the code: keep the prediction functions next to the engine (as physics.ts does), test them against long runs, and report results in cells per wavelength so that grid effects stay visible.</p>`,
        },
      ],
      tryIt: [
        { experiment: "wavelength", label: "How long is a wave?" },
        { experiment: "grid-dispersion", label: "Waves on a grid: numerical dispersion" },
        { experiment: "absorbing-edge", label: "How good is the absorbing edge?" },
        { experiment: "refraction", label: "Bending waves: Snell's law" },
      ],
      sources: [
        "W. L. Oberkampf and C. J. Roy, Verification and Validation in Scientific Computing (Cambridge University Press, 2010)",
        "P. J. Roache, Code verification by the method of manufactured solutions, J. Fluids Eng. 124, 4–10 (2002)",
        "R. J. LeVeque, Finite Difference Methods for Ordinary and Partial Differential Equations (SIAM, 2007), appendix on measuring errors and convergence",
        "L. N. Trefethen, Group velocity in finite difference schemes, SIAM Review 24, 113–136 (1982)",
      ],
    },
  ],
};
