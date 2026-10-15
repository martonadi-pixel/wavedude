// Wave Dude 2D web - "How it works" library: the maths of waves (sine waves, superposition, the wave equation,
// Huygens' principle, reflection and refraction, interference and diffraction, energy and intensity).
// GPL-3.0-or-later.

import type { LearnCategory } from "../types";

export const category: LearnCategory = {
  id: "maths-of-waves",
  title: "The maths of waves",
  icon: "📐",
  blurb:
    "Sine waves, the wave equation, Huygens' principle and the formulas for reflection, refraction, interference and energy, from the first idea to the derivation.",
  pages: [
    // ------------------------------------------------------------------ 1
    {
      id: "sine-waves",
      title: "Sine waves, period and phase",
      summary: "The simplest repeating wave, the turning wheel that draws it, and what period, frequency and phase mean.",
      sections: [
        {
          level: "kids",
          html: `
<p>A wave is a pattern that repeats. Think of a swing: forward, back, forward, back, and every swing takes the same time. Or a cork bobbing in the bath: up, down, up, down.</p>
<p>Now imagine a dot painted on the rim of a turning wheel. Watch only how high the dot is. It rises, falls and rises again, smoothly, over and over. If you drew its height on a long strip of paper while sliding the paper along, you would draw a smooth wiggly line. That line is called a <b>sine wave</b>. It is the simplest wave there is.</p>
<figure class="diagram"><svg viewBox="0 0 400 160" role="img" aria-label="A sine wave with crest, trough and wavelength labelled">
<line x1="10" y1="70" x2="390" y2="70" stroke="currentColor" stroke-dasharray="4 4" opacity="0.5"/>
<path d="M20.0,70.0 L23.0,66.5 L26.0,63.0 L29.0,59.6 L32.0,56.4 L35.0,53.3 L38.0,50.5 L41.0,48.0 L44.0,45.7 L47.0,43.8 L50.0,42.3 L53.0,41.1 L56.0,40.4 L59.0,40.0 L62.0,40.1 L65.0,40.6 L68.0,41.5 L71.0,42.8 L74.0,44.4 L77.0,46.4 L80.0,48.8 L83.0,51.4 L86.0,54.3 L89.0,57.4 L92.0,60.7 L95.0,64.1 L98.0,67.6 L101.0,71.2 L104.0,74.7 L107.0,78.1 L110.0,81.5 L113.0,84.7 L116.0,87.6 L119.0,90.4 L122.0,92.8 L125.0,94.9 L128.0,96.7 L131.0,98.1 L134.0,99.2 L137.0,99.8 L140.0,100.0 L143.0,99.8 L146.0,99.2 L149.0,98.1 L152.0,96.7 L155.0,94.9 L158.0,92.8 L161.0,90.4 L164.0,87.6 L167.0,84.7 L170.0,81.5 L173.0,78.1 L176.0,74.7 L179.0,71.2 L182.0,67.6 L185.0,64.1 L188.0,60.7 L191.0,57.4 L194.0,54.3 L197.0,51.4 L200.0,48.8 L203.0,46.4 L206.0,44.4 L209.0,42.8 L212.0,41.5 L215.0,40.6 L218.0,40.1 L221.0,40.0 L224.0,40.4 L227.0,41.1 L230.0,42.3 L233.0,43.8 L236.0,45.7 L239.0,48.0 L242.0,50.5 L245.0,53.3 L248.0,56.4 L251.0,59.6 L254.0,63.0 L257.0,66.5 L260.0,70.0 L263.0,73.5 L266.0,77.0 L269.0,80.4 L272.0,83.6 L275.0,86.7 L278.0,89.5 L281.0,92.0 L284.0,94.3 L287.0,96.2 L290.0,97.7 L293.0,98.9 L296.0,99.6 L299.0,100.0 L302.0,99.9 L305.0,99.4 L308.0,98.5 L311.0,97.2 L314.0,95.6 L317.0,93.6 L320.0,91.2 L323.0,88.6 L326.0,85.7 L329.0,82.6 L332.0,79.3 L335.0,75.9 L338.0,72.4 L341.0,68.8 L344.0,65.3 L347.0,61.9 L350.0,58.5 L353.0,55.3 L356.0,52.4 L359.0,49.6 L362.0,47.2 L365.0,45.1 L368.0,43.3 L371.0,41.9 L374.0,40.8 L377.0,40.2 L380.0,40.0" fill="none" stroke="#60a5fa" stroke-width="3"/>
<text x="60" y="30" font-size="13" fill="currentColor" text-anchor="middle">crest</text>
<text x="220" y="30" font-size="13" fill="currentColor" text-anchor="middle">crest</text>
<text x="94" y="112" font-size="13" fill="currentColor" text-anchor="end">trough</text>
<line x1="140" y1="104" x2="140" y2="132" stroke="currentColor"/>
<line x1="300" y1="104" x2="300" y2="132" stroke="currentColor"/>
<line x1="140" y1="125" x2="300" y2="125" stroke="#f87171" stroke-width="2"/>
<text x="220" y="150" font-size="13" fill="currentColor" text-anchor="middle">one wavelength</text>
</svg><figcaption>A sine wave. The tops are crests, the bottoms are troughs, and the distance from one trough to the next (or one crest to the next) is one wavelength.</figcaption></figure>
<p>A few words help. The <b>crest</b> is the top, the <b>trough</b> is the bottom, and the <b>wavelength</b> is how long one repeat is. How tall the wave is, measured from the middle, is its <b>amplitude</b>.</p>
<p>The <b>phase</b> tells you how far round the wheel the dot has gone: just starting, a quarter of the way round, halfway round. Two swings that go forward at the same moment are "in step". If one goes forward while the other comes back, they are half a turn "out of step".</p>
<div class="home"><b>Try it at home:</b> Lay a long sheet of paper on a table and rest a felt pen on it. Move the pen steadily up and down the page while a friend slowly pulls the paper sideways. You have drawn a wave. If your friend pulls faster, the waves come out longer.</div>`,
        },
        {
          level: "school",
          html: `
<p>A sine wave is described by a few numbers:</p>
<ul>
<li><b>Amplitude A</b>: the height of a crest above the middle line.</li>
<li><b>Wavelength λ</b> (the Greek letter "lambda"): the distance from one crest to the next, in metres (in Wave Dude: cells).</li>
<li><b>Period T</b>: the time for one complete oscillation at a fixed point, in seconds (in Wave Dude: steps).</li>
<li><b>Frequency f = 1 / T</b>: the number of oscillations per second, in hertz (Hz).</li>
</ul>
<p>In one period the wave moves forward exactly one wavelength, so its speed is</p>
<p class="formula">v = λ / T = f · λ</p>
<h4>The wheel picture</h4>
<p>A point going round a circle of radius A at a steady rate has a height A · sin φ, where φ is the angle it has turned through. One full turn (360°) takes one period. Plot the height against time and you get the sine wave. The angle φ is the <b>phase</b>: it says how far through its cycle the oscillation is. A quarter of a cycle is 90°, half a cycle is 180°.</p>
<figure class="diagram"><svg viewBox="0 0 400 170" role="img" aria-label="A point on a circle projected across to draw a sine wave">
<defs><marker id="mw-ar-sine" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<circle cx="70" cy="80" r="40" fill="none" stroke="currentColor"/>
<line x1="25" y1="80" x2="115" y2="80" stroke="currentColor" opacity="0.5"/>
<line x1="140" y1="80" x2="388" y2="80" stroke="currentColor" opacity="0.5"/>
<line x1="70" y1="80" x2="90" y2="45.4" stroke="#fbbf24" stroke-width="2"/>
<path d="M85,80 A15,15 0 0 0 77.5,67" fill="none" stroke="#fbbf24"/>
<text x="92" y="74" font-size="13" fill="currentColor">φ</text>
<path d="M140.0,80.0 L143.0,76.9 L146.0,73.7 L149.0,70.7 L152.0,67.6 L155.0,64.7 L158.0,61.8 L161.0,59.1 L164.0,56.5 L167.0,54.0 L170.0,51.7 L173.0,49.6 L176.0,47.6 L179.0,45.9 L182.0,44.4 L185.0,43.0 L188.0,42.0 L191.0,41.1 L194.0,40.5 L197.0,40.1 L200.0,40.0 L203.0,40.1 L206.0,40.5 L209.0,41.1 L212.0,42.0 L215.0,43.0 L218.0,44.4 L221.0,45.9 L224.0,47.6 L227.0,49.6 L230.0,51.7 L233.0,54.0 L236.0,56.5 L239.0,59.1 L242.0,61.8 L245.0,64.7 L248.0,67.6 L251.0,70.7 L254.0,73.7 L257.0,76.9 L260.0,80.0 L263.0,83.1 L266.0,86.3 L269.0,89.3 L272.0,92.4 L275.0,95.3 L278.0,98.2 L281.0,100.9 L284.0,103.5 L287.0,106.0 L290.0,108.3 L293.0,110.4 L296.0,112.4 L299.0,114.1 L302.0,115.6 L305.0,117.0 L308.0,118.0 L311.0,118.9 L314.0,119.5 L317.0,119.9 L320.0,120.0 L323.0,119.9 L326.0,119.5 L329.0,118.9 L332.0,118.0 L335.0,117.0 L338.0,115.6 L341.0,114.1 L344.0,112.4 L347.0,110.4 L350.0,108.3 L353.0,106.0 L356.0,103.5 L359.0,100.9 L362.0,98.2 L365.0,95.3 L368.0,92.4 L371.0,89.3 L374.0,86.3 L377.0,83.1 L380.0,80.0" fill="none" stroke="#60a5fa" stroke-width="2.5"/>
<line x1="90" y1="45.4" x2="180" y2="45.4" stroke="currentColor" stroke-dasharray="3 3"/>
<circle cx="90" cy="45.4" r="4" fill="#f87171"/>
<circle cx="180" cy="45.4" r="4" fill="#f87171"/>
<line x1="200" y1="80" x2="200" y2="42" stroke="#34d399" stroke-width="2" marker-end="url(#mw-ar-sine)"/>
<text x="206" y="66" font-size="13" fill="currentColor">A</text>
<line x1="140" y1="140" x2="380" y2="140" stroke="currentColor" marker-start="url(#mw-ar-sine)" marker-end="url(#mw-ar-sine)"/>
<text x="260" y="160" font-size="12" fill="currentColor" text-anchor="middle">one period = one full turn (360°)</text>
</svg><figcaption>A point turning round a circle (left) traces out a sine wave (right). The angle φ it has turned through is the phase; one full turn is one period.</figcaption></figure>
<p>Two waves with a phase difference of 0° are <b>in phase</b> (crests together). With 180° they are in <b>antiphase</b> (crest meets trough).</p>
<h4>Worked examples</h4>
<p>Ripples on a pond: f = 2 Hz and λ = 0.5 m, so v = 2 × 0.5 = 1 m/s.</p>
<p>Wave Dude: a source at frequency level 60 turns through 60/255 ≈ 0.235 radians per step (a full turn is 2π ≈ 6.28 radians), so its period is T ≈ 6.28 / 0.235 ≈ 26.7 steps. In empty space (n = 1) waves travel about 0.562 cells per step, so λ ≈ 0.562 × 26.7 ≈ 15 cells. A handy rule of thumb is λ ≈ 900 / (level × n) cells. You can check it with the ruler in the "How long is a wave?" experiment.</p>`,
        },
        {
          level: "university",
          html: `
<p>A travelling sinusoid in one dimension is</p>
<p class="formula">u(x, t) = A cos(kx − ωt + φ)</p>
<p>with wavenumber k = 2π/λ (rad m<sup>−1</sup>), angular frequency ω = 2πf (rad s<sup>−1</sup>) and phase constant φ. A point of constant phase moves at the <b>phase velocity</b> v<sub>p</sub> = ω/k = fλ. In two dimensions the plane wave is u = A cos(<b>k</b>·<b>r</b> − ωt + φ): the wavefronts are straight lines perpendicular to the wave vector <b>k</b>, and |<b>k</b>| = 2π/λ.</p>
<h4>Complex notation</h4>
<p>Because cos θ = Re e<sup>iθ</sup>, we write u = Re[U e<sup>i(kx − ωt)</sup>] with the complex amplitude U = A e<sup>iφ</sup>: its modulus is the amplitude and its argument the phase. Derivatives become multiplications, ∂/∂t → −iω and ∂/∂x → ik, and since taking the real part commutes with every linear operation, we can calculate with exponentials and take Re at the end. (Physicists usually write e<sup>−iωt</sup>, engineers e<sup>+jωt</sup>; the physics is identical, only the signs of phases flip.)</p>
<h4>Why sines?</h4>
<p>Sinusoids are eigenfunctions of every linear, time-invariant system: d²/dt² e<sup>−iωt</sup> = −ω² e<sup>−iωt</sup>. Feed a sinusoid of frequency ω into a linear medium whose properties do not change in time, and everything downstream oscillates at the same ω; only amplitudes and phases change. By Fourier's theorem any reasonable signal is a superposition of sinusoids,</p>
<p class="formula">u(t) = (1/2π) ∫ Û(ω) e<sup>−iωt</sup> dω, &nbsp;&nbsp; Û(ω) = ∫ u(t) e<sup>iωt</sup> dt</p>
<p>so solving a linear problem one frequency at a time solves it for every signal. Inserting a plane wave into a wave equation gives the <b>dispersion relation</b> ω(k), the medium's fingerprint. For the ideal wave equation it is ω = c|<b>k</b>|; for Wave Dude's long waves ω ≈ 0.562 |<b>k</b>| / n, with k in radians per cell and ω in radians per step.</p>
<p>Wave Dude's steady sources produce continuous-wave fields at a single frequency, ω = level/255 rad per step. Its pulsed sources multiply the sinusoid by an envelope, and by the Fourier picture they therefore contain a band of frequencies whose width is roughly the inverse of the pulse duration.</p>`,
        },
        {
          level: "research",
          title: "Sinusoids on a grid",
          html: `
<p>On the grid both time and space are sampled, and that changes the sinusoid's story in two ways.</p>
<p><b>Sampling.</b> Sampled once per step, a sinusoid is unambiguous only for ω &lt; π rad per step (the Nyquist limit). Wave Dude's highest level, 255, gives ω = 1 rad per step, about 6.3 steps per period, safely inside. In space, wavenumbers are only defined modulo 2π per cell, but accuracy is lost long before that limit.</p>
<p><b>Exact discrete dispersion.</b> Inserting u = e<sup>i(kx − ωt)</sup> into the update rule gives, along a grid axis, 4 sin²(ω/2) = 1.264 c² sin²(k/2) with c² = 1/n². Solving for k at a given source level gives the wavelength the grid actually produces (n = 1):</p>
<table>
<tr><th>level</th><th>ω (rad/step)</th><th>period (steps)</th><th>λ, long-wave formula (cells)</th><th>λ, exact on grid (cells)</th></tr>
<tr><td>15</td><td>0.059</td><td>106.8</td><td>60.0</td><td>60.0</td></tr>
<tr><td>60</td><td>0.235</td><td>26.7</td><td>15.0</td><td>14.9</td></tr>
<tr><td>120</td><td>0.471</td><td>13.4</td><td>7.5</td><td>7.35</td></tr>
<tr><td>200</td><td>0.784</td><td>8.0</td><td>4.5</td><td>4.2</td></tr>
<tr><td>255</td><td>1.000</td><td>6.3</td><td>3.5</td><td>3.1</td></tr>
</table>
<p>At high levels the waves come out shorter (slower) than the continuum formula predicts. The error grows with n, because a higher index means fewer cells per wavelength: in n = 1.5, level 120 is already about 6.5% short, and along the grid axes the relation has no real solution at all above ω = 2 arcsin(0.562/n), about level 196 for n = 1.5. There the grid cannot carry a propagating wave in that direction. Keep at least 10 cells per wavelength in the densest material when accuracy matters; the "Waves on a grid" experiment shows the effect directly.</p>`,
        },
      ],
      tryIt: [
        { experiment: "wavelength", label: "How long is a wave?" },
        { experiment: "splash", label: "Splash! Making waves" },
      ],
      sources: [
        "R. P. Feynman, R. B. Leighton, M. Sands, The Feynman Lectures on Physics, Vol. I, ch. 21 \"The Harmonic Oscillator\" — https://www.feynmanlectures.caltech.edu/I_21.html",
        "F. S. Crawford, Waves (Berkeley Physics Course Vol. 3, McGraw-Hill, 1968)",
        "E. Hecht, Optics, 5th ed. (Pearson, 2017), ch. 2 \"Wave Motion\"",
        "L. N. Trefethen, Finite Difference and Spectral Methods for Ordinary and Partial Differential Equations (1996) — https://people.maths.ox.ac.uk/trefethen/pdetext.html",
      ],
    },
    // ------------------------------------------------------------------ 2
    {
      id: "adding-waves",
      title: "Adding waves: superposition, phasors and beats",
      summary: "Waves that meet simply add up, which gives interference, standing waves and beats.",
      sections: [
        {
          level: "kids",
          html: `
<p>What happens when two waves meet? Something wonderfully simple: they <b>add up</b>. Where a crest meets a crest, you get a crest twice as tall. Where a crest meets a trough, the up and the down cancel, and the water stays flat for a moment.</p>
<figure class="diagram"><svg viewBox="0 0 400 140" role="img" aria-label="Two equal waves add to a bigger wave; a wave and an upside-down wave cancel">
<path d="M20.0,35.0 L22.5,31.3 L25.0,27.9 L27.5,25.3 L30.0,23.6 L32.5,23.0 L35.0,23.6 L37.5,25.3 L40.0,27.9 L42.5,31.3 L45.0,35.0 L47.5,38.7 L50.0,42.1 L52.5,44.7 L55.0,46.4 L57.5,47.0 L60.0,46.4 L62.5,44.7 L65.0,42.1 L67.5,38.7 L70.0,35.0 L72.5,31.3 L75.0,27.9 L77.5,25.3 L80.0,23.6 L82.5,23.0 L85.0,23.6 L87.5,25.3 L90.0,27.9 L92.5,31.3 L95.0,35.0 L97.5,38.7 L100.0,42.1 L102.5,44.7 L105.0,46.4 L107.5,47.0 L110.0,46.4 L112.5,44.7 L115.0,42.1 L117.5,38.7 L120.0,35.0" fill="none" stroke="#60a5fa" stroke-width="2.5"/>
<text x="135" y="40" font-size="14" fill="currentColor" text-anchor="middle">+</text>
<path d="M150.0,35.0 L152.5,31.3 L155.0,27.9 L157.5,25.3 L160.0,23.6 L162.5,23.0 L165.0,23.6 L167.5,25.3 L170.0,27.9 L172.5,31.3 L175.0,35.0 L177.5,38.7 L180.0,42.1 L182.5,44.7 L185.0,46.4 L187.5,47.0 L190.0,46.4 L192.5,44.7 L195.0,42.1 L197.5,38.7 L200.0,35.0 L202.5,31.3 L205.0,27.9 L207.5,25.3 L210.0,23.6 L212.5,23.0 L215.0,23.6 L217.5,25.3 L220.0,27.9 L222.5,31.3 L225.0,35.0 L227.5,38.7 L230.0,42.1 L232.5,44.7 L235.0,46.4 L237.5,47.0 L240.0,46.4 L242.5,44.7 L245.0,42.1 L247.5,38.7 L250.0,35.0" fill="none" stroke="#f87171" stroke-width="2.5"/>
<text x="265" y="40" font-size="14" fill="currentColor" text-anchor="middle">=</text>
<path d="M280.0,35.0 L282.5,27.6 L285.0,20.9 L287.5,15.6 L290.0,12.2 L292.5,11.0 L295.0,12.2 L297.5,15.6 L300.0,20.9 L302.5,27.6 L305.0,35.0 L307.5,42.4 L310.0,49.1 L312.5,54.4 L315.0,57.8 L317.5,59.0 L320.0,57.8 L322.5,54.4 L325.0,49.1 L327.5,42.4 L330.0,35.0 L332.5,27.6 L335.0,20.9 L337.5,15.6 L340.0,12.2 L342.5,11.0 L345.0,12.2 L347.5,15.6 L350.0,20.9 L352.5,27.6 L355.0,35.0 L357.5,42.4 L360.0,49.1 L362.5,54.4 L365.0,57.8 L367.5,59.0 L370.0,57.8 L372.5,54.4 L375.0,49.1 L377.5,42.4 L380.0,35.0" fill="none" stroke="#c084fc" stroke-width="2.5"/>
<path d="M20.0,105.0 L22.5,101.3 L25.0,97.9 L27.5,95.3 L30.0,93.6 L32.5,93.0 L35.0,93.6 L37.5,95.3 L40.0,97.9 L42.5,101.3 L45.0,105.0 L47.5,108.7 L50.0,112.1 L52.5,114.7 L55.0,116.4 L57.5,117.0 L60.0,116.4 L62.5,114.7 L65.0,112.1 L67.5,108.7 L70.0,105.0 L72.5,101.3 L75.0,97.9 L77.5,95.3 L80.0,93.6 L82.5,93.0 L85.0,93.6 L87.5,95.3 L90.0,97.9 L92.5,101.3 L95.0,105.0 L97.5,108.7 L100.0,112.1 L102.5,114.7 L105.0,116.4 L107.5,117.0 L110.0,116.4 L112.5,114.7 L115.0,112.1 L117.5,108.7 L120.0,105.0" fill="none" stroke="#60a5fa" stroke-width="2.5"/>
<text x="135" y="110" font-size="14" fill="currentColor" text-anchor="middle">+</text>
<path d="M150.0,105.0 L152.5,108.7 L155.0,112.1 L157.5,114.7 L160.0,116.4 L162.5,117.0 L165.0,116.4 L167.5,114.7 L170.0,112.1 L172.5,108.7 L175.0,105.0 L177.5,101.3 L180.0,97.9 L182.5,95.3 L185.0,93.6 L187.5,93.0 L190.0,93.6 L192.5,95.3 L195.0,97.9 L197.5,101.3 L200.0,105.0 L202.5,108.7 L205.0,112.1 L207.5,114.7 L210.0,116.4 L212.5,117.0 L215.0,116.4 L217.5,114.7 L220.0,112.1 L222.5,108.7 L225.0,105.0 L227.5,101.3 L230.0,97.9 L232.5,95.3 L235.0,93.6 L237.5,93.0 L240.0,93.6 L242.5,95.3 L245.0,97.9 L247.5,101.3 L250.0,105.0" fill="none" stroke="#f87171" stroke-width="2.5"/>
<text x="265" y="110" font-size="14" fill="currentColor" text-anchor="middle">=</text>
<line x1="280" y1="105" x2="380" y2="105" stroke="#c084fc" stroke-width="2.5"/>
<text x="330" y="134" font-size="12" fill="currentColor" text-anchor="middle">flat!</text>
</svg><figcaption>Top: crest meets crest, and the waves add up to a bigger wave. Bottom: crest meets trough, and they cancel.</figcaption></figure>
<p>Afterwards the waves carry on as if nothing had happened. Two people at the ends of a skipping rope can each flick a bump towards the other. The bumps meet in the middle, make one odd-shaped wiggle for a moment, then pass straight through each other and keep going.</p>
<p>When two musical notes are <i>almost</i> the same, they keep drifting in and out of step. In step, they add up and sound loud; out of step, they cancel and sound quiet. You hear a slow "wah… wah… wah". These are called <b>beats</b>, and musicians use them to tune instruments: when the beats stop, the notes match.</p>
<div class="fact"><b>Fun fact:</b> Noise-cancelling headphones use this trick. A tiny microphone listens to the noise outside, and the headphones play a sound wave that is upside down, a trough wherever the noise has a crest, so the two add up to much less noise.</div>`,
        },
        {
          level: "school",
          html: `
<p>The <b>principle of superposition</b>: when two or more waves overlap, the total displacement at each point is the sum of the displacements of the individual waves. Each wave then carries on unchanged.</p>
<h4>Constructive and destructive interference</h4>
<p>Two sources, in phase and with the same wavelength λ, send waves to a point at distances r<sub>1</sub> and r<sub>2</sub>. The <b>path difference</b> is r<sub>2</sub> − r<sub>1</sub>.</p>
<ul>
<li>Path difference 0, λ, 2λ, … (a whole number of wavelengths): crests arrive together. This is <b>constructive</b> interference; two waves of amplitude A give amplitude 2A.</li>
<li>Path difference λ/2, 3λ/2, …: crest meets trough. This is <b>destructive</b> interference; the amplitude is 0.</li>
</ul>
<p>Example: λ = 15 cells. A point 100 cells from one source and 130 cells from the other has a path difference of 30 cells = 2λ, so it is bright. A point at 100 and 107.5 cells has 7.5 cells = λ/2, so it is dark.</p>
<h4>Standing waves</h4>
<p>Two equal waves travelling in opposite directions, for example a wave and its reflection from a wall, make a <b>standing wave</b>: points that never move (<b>nodes</b>) half a wavelength apart, with points of biggest swing (<b>antinodes</b>) halfway between them.</p>
<h4>Beats</h4>
<p>Two waves with nearly equal frequencies f<sub>1</sub> and f<sub>2</sub> drift in and out of step. The loudness rises and falls at the <b>beat frequency</b></p>
<p class="formula">f<sub>beat</sub> = |f<sub>1</sub> − f<sub>2</sub>|</p>
<figure class="diagram"><svg viewBox="0 0 400 178" role="img" aria-label="Two waves of slightly different frequency and their sum, which swells and fades">
<defs><marker id="mw-ar-beat" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<text x="6" y="34" font-size="12" fill="currentColor">f₁</text>
<path d="M50.0,30.0 L51.0,33.7 L52.0,37.1 L53.0,39.7 L54.0,41.4 L55.0,42.0 L56.0,41.4 L57.0,39.7 L58.0,37.1 L59.0,33.7 L60.0,30.0 L61.0,26.3 L62.0,22.9 L63.0,20.3 L64.0,18.6 L65.0,18.0 L66.0,18.6 L67.0,20.3 L68.0,22.9 L69.0,26.3 L70.0,30.0 L71.0,33.7 L72.0,37.1 L73.0,39.7 L74.0,41.4 L75.0,42.0 L76.0,41.4 L77.0,39.7 L78.0,37.1 L79.0,33.7 L80.0,30.0 L81.0,26.3 L82.0,22.9 L83.0,20.3 L84.0,18.6 L85.0,18.0 L86.0,18.6 L87.0,20.3 L88.0,22.9 L89.0,26.3 L90.0,30.0 L91.0,33.7 L92.0,37.1 L93.0,39.7 L94.0,41.4 L95.0,42.0 L96.0,41.4 L97.0,39.7 L98.0,37.1 L99.0,33.7 L100.0,30.0 L101.0,26.3 L102.0,22.9 L103.0,20.3 L104.0,18.6 L105.0,18.0 L106.0,18.6 L107.0,20.3 L108.0,22.9 L109.0,26.3 L110.0,30.0 L111.0,33.7 L112.0,37.1 L113.0,39.7 L114.0,41.4 L115.0,42.0 L116.0,41.4 L117.0,39.7 L118.0,37.1 L119.0,33.7 L120.0,30.0 L121.0,26.3 L122.0,22.9 L123.0,20.3 L124.0,18.6 L125.0,18.0 L126.0,18.6 L127.0,20.3 L128.0,22.9 L129.0,26.3 L130.0,30.0 L131.0,33.7 L132.0,37.1 L133.0,39.7 L134.0,41.4 L135.0,42.0 L136.0,41.4 L137.0,39.7 L138.0,37.1 L139.0,33.7 L140.0,30.0 L141.0,26.3 L142.0,22.9 L143.0,20.3 L144.0,18.6 L145.0,18.0 L146.0,18.6 L147.0,20.3 L148.0,22.9 L149.0,26.3 L150.0,30.0 L151.0,33.7 L152.0,37.1 L153.0,39.7 L154.0,41.4 L155.0,42.0 L156.0,41.4 L157.0,39.7 L158.0,37.1 L159.0,33.7 L160.0,30.0 L161.0,26.3 L162.0,22.9 L163.0,20.3 L164.0,18.6 L165.0,18.0 L166.0,18.6 L167.0,20.3 L168.0,22.9 L169.0,26.3 L170.0,30.0 L171.0,33.7 L172.0,37.1 L173.0,39.7 L174.0,41.4 L175.0,42.0 L176.0,41.4 L177.0,39.7 L178.0,37.1 L179.0,33.7 L180.0,30.0 L181.0,26.3 L182.0,22.9 L183.0,20.3 L184.0,18.6 L185.0,18.0 L186.0,18.6 L187.0,20.3 L188.0,22.9 L189.0,26.3 L190.0,30.0 L191.0,33.7 L192.0,37.1 L193.0,39.7 L194.0,41.4 L195.0,42.0 L196.0,41.4 L197.0,39.7 L198.0,37.1 L199.0,33.7 L200.0,30.0 L201.0,26.3 L202.0,22.9 L203.0,20.3 L204.0,18.6 L205.0,18.0 L206.0,18.6 L207.0,20.3 L208.0,22.9 L209.0,26.3 L210.0,30.0 L211.0,33.7 L212.0,37.1 L213.0,39.7 L214.0,41.4 L215.0,42.0 L216.0,41.4 L217.0,39.7 L218.0,37.1 L219.0,33.7 L220.0,30.0 L221.0,26.3 L222.0,22.9 L223.0,20.3 L224.0,18.6 L225.0,18.0 L226.0,18.6 L227.0,20.3 L228.0,22.9 L229.0,26.3 L230.0,30.0 L231.0,33.7 L232.0,37.1 L233.0,39.7 L234.0,41.4 L235.0,42.0 L236.0,41.4 L237.0,39.7 L238.0,37.1 L239.0,33.7 L240.0,30.0 L241.0,26.3 L242.0,22.9 L243.0,20.3 L244.0,18.6 L245.0,18.0 L246.0,18.6 L247.0,20.3 L248.0,22.9 L249.0,26.3 L250.0,30.0 L251.0,33.7 L252.0,37.1 L253.0,39.7 L254.0,41.4 L255.0,42.0 L256.0,41.4 L257.0,39.7 L258.0,37.1 L259.0,33.7 L260.0,30.0 L261.0,26.3 L262.0,22.9 L263.0,20.3 L264.0,18.6 L265.0,18.0 L266.0,18.6 L267.0,20.3 L268.0,22.9 L269.0,26.3 L270.0,30.0 L271.0,33.7 L272.0,37.1 L273.0,39.7 L274.0,41.4 L275.0,42.0 L276.0,41.4 L277.0,39.7 L278.0,37.1 L279.0,33.7 L280.0,30.0 L281.0,26.3 L282.0,22.9 L283.0,20.3 L284.0,18.6 L285.0,18.0 L286.0,18.6 L287.0,20.3 L288.0,22.9 L289.0,26.3 L290.0,30.0 L291.0,33.7 L292.0,37.1 L293.0,39.7 L294.0,41.4 L295.0,42.0 L296.0,41.4 L297.0,39.7 L298.0,37.1 L299.0,33.7 L300.0,30.0 L301.0,26.3 L302.0,22.9 L303.0,20.3 L304.0,18.6 L305.0,18.0 L306.0,18.6 L307.0,20.3 L308.0,22.9 L309.0,26.3 L310.0,30.0 L311.0,33.7 L312.0,37.1 L313.0,39.7 L314.0,41.4 L315.0,42.0 L316.0,41.4 L317.0,39.7 L318.0,37.1 L319.0,33.7 L320.0,30.0 L321.0,26.3 L322.0,22.9 L323.0,20.3 L324.0,18.6 L325.0,18.0 L326.0,18.6 L327.0,20.3 L328.0,22.9 L329.0,26.3 L330.0,30.0 L331.0,33.7 L332.0,37.1 L333.0,39.7 L334.0,41.4 L335.0,42.0 L336.0,41.4 L337.0,39.7 L338.0,37.1 L339.0,33.7 L340.0,30.0 L341.0,26.3 L342.0,22.9 L343.0,20.3 L344.0,18.6 L345.0,18.0 L346.0,18.6 L347.0,20.3 L348.0,22.9 L349.0,26.3 L350.0,30.0 L351.0,33.7 L352.0,37.1 L353.0,39.7 L354.0,41.4 L355.0,42.0 L356.0,41.4 L357.0,39.7 L358.0,37.1 L359.0,33.7 L360.0,30.0 L361.0,26.3 L362.0,22.9 L363.0,20.3 L364.0,18.6 L365.0,18.0 L366.0,18.6 L367.0,20.3 L368.0,22.9 L369.0,26.3 L370.0,30.0 L371.0,33.7 L372.0,37.1 L373.0,39.7 L374.0,41.4 L375.0,42.0 L376.0,41.4 L377.0,39.7 L378.0,37.1 L379.0,33.7 L380.0,30.0 L381.0,26.3 L382.0,22.9 L383.0,20.3 L384.0,18.6 L385.0,18.0 L386.0,18.6 L387.0,20.3 L388.0,22.9 L389.0,26.3 L390.0,30.0" fill="none" stroke="#60a5fa" stroke-width="1.5"/>
<text x="6" y="74" font-size="12" fill="currentColor">f₂</text>
<path d="M50.0,58.1 L51.0,59.1 L52.0,60.9 L53.0,63.5 L54.0,66.6 L55.0,70.0 L56.0,73.4 L57.0,76.5 L58.0,79.1 L59.0,80.9 L60.0,81.9 L61.0,81.9 L62.0,80.9 L63.0,79.1 L64.0,76.5 L65.0,73.4 L66.0,70.0 L67.0,66.6 L68.0,63.5 L69.0,60.9 L70.0,59.1 L71.0,58.1 L72.0,58.1 L73.0,59.1 L74.0,60.9 L75.0,63.5 L76.0,66.6 L77.0,70.0 L78.0,73.4 L79.0,76.5 L80.0,79.1 L81.0,80.9 L82.0,81.9 L83.0,81.9 L84.0,80.9 L85.0,79.1 L86.0,76.5 L87.0,73.4 L88.0,70.0 L89.0,66.6 L90.0,63.5 L91.0,60.9 L92.0,59.1 L93.0,58.1 L94.0,58.1 L95.0,59.1 L96.0,60.9 L97.0,63.5 L98.0,66.6 L99.0,70.0 L100.0,73.4 L101.0,76.5 L102.0,79.1 L103.0,80.9 L104.0,81.9 L105.0,81.9 L106.0,80.9 L107.0,79.1 L108.0,76.5 L109.0,73.4 L110.0,70.0 L111.0,66.6 L112.0,63.5 L113.0,60.9 L114.0,59.1 L115.0,58.1 L116.0,58.1 L117.0,59.1 L118.0,60.9 L119.0,63.5 L120.0,66.6 L121.0,70.0 L122.0,73.4 L123.0,76.5 L124.0,79.1 L125.0,80.9 L126.0,81.9 L127.0,81.9 L128.0,80.9 L129.0,79.1 L130.0,76.5 L131.0,73.4 L132.0,70.0 L133.0,66.6 L134.0,63.5 L135.0,60.9 L136.0,59.1 L137.0,58.1 L138.0,58.1 L139.0,59.1 L140.0,60.9 L141.0,63.5 L142.0,66.6 L143.0,70.0 L144.0,73.4 L145.0,76.5 L146.0,79.1 L147.0,80.9 L148.0,81.9 L149.0,81.9 L150.0,80.9 L151.0,79.1 L152.0,76.5 L153.0,73.4 L154.0,70.0 L155.0,66.6 L156.0,63.5 L157.0,60.9 L158.0,59.1 L159.0,58.1 L160.0,58.1 L161.0,59.1 L162.0,60.9 L163.0,63.5 L164.0,66.6 L165.0,70.0 L166.0,73.4 L167.0,76.5 L168.0,79.1 L169.0,80.9 L170.0,81.9 L171.0,81.9 L172.0,80.9 L173.0,79.1 L174.0,76.5 L175.0,73.4 L176.0,70.0 L177.0,66.6 L178.0,63.5 L179.0,60.9 L180.0,59.1 L181.0,58.1 L182.0,58.1 L183.0,59.1 L184.0,60.9 L185.0,63.5 L186.0,66.6 L187.0,70.0 L188.0,73.4 L189.0,76.5 L190.0,79.1 L191.0,80.9 L192.0,81.9 L193.0,81.9 L194.0,80.9 L195.0,79.1 L196.0,76.5 L197.0,73.4 L198.0,70.0 L199.0,66.6 L200.0,63.5 L201.0,60.9 L202.0,59.1 L203.0,58.1 L204.0,58.1 L205.0,59.1 L206.0,60.9 L207.0,63.5 L208.0,66.6 L209.0,70.0 L210.0,73.4 L211.0,76.5 L212.0,79.1 L213.0,80.9 L214.0,81.9 L215.0,81.9 L216.0,80.9 L217.0,79.1 L218.0,76.5 L219.0,73.4 L220.0,70.0 L221.0,66.6 L222.0,63.5 L223.0,60.9 L224.0,59.1 L225.0,58.1 L226.0,58.1 L227.0,59.1 L228.0,60.9 L229.0,63.5 L230.0,66.6 L231.0,70.0 L232.0,73.4 L233.0,76.5 L234.0,79.1 L235.0,80.9 L236.0,81.9 L237.0,81.9 L238.0,80.9 L239.0,79.1 L240.0,76.5 L241.0,73.4 L242.0,70.0 L243.0,66.6 L244.0,63.5 L245.0,60.9 L246.0,59.1 L247.0,58.1 L248.0,58.1 L249.0,59.1 L250.0,60.9 L251.0,63.5 L252.0,66.6 L253.0,70.0 L254.0,73.4 L255.0,76.5 L256.0,79.1 L257.0,80.9 L258.0,81.9 L259.0,81.9 L260.0,80.9 L261.0,79.1 L262.0,76.5 L263.0,73.4 L264.0,70.0 L265.0,66.6 L266.0,63.5 L267.0,60.9 L268.0,59.1 L269.0,58.1 L270.0,58.1 L271.0,59.1 L272.0,60.9 L273.0,63.5 L274.0,66.6 L275.0,70.0 L276.0,73.4 L277.0,76.5 L278.0,79.1 L279.0,80.9 L280.0,81.9 L281.0,81.9 L282.0,80.9 L283.0,79.1 L284.0,76.5 L285.0,73.4 L286.0,70.0 L287.0,66.6 L288.0,63.5 L289.0,60.9 L290.0,59.1 L291.0,58.1 L292.0,58.1 L293.0,59.1 L294.0,60.9 L295.0,63.5 L296.0,66.6 L297.0,70.0 L298.0,73.4 L299.0,76.5 L300.0,79.1 L301.0,80.9 L302.0,81.9 L303.0,81.9 L304.0,80.9 L305.0,79.1 L306.0,76.5 L307.0,73.4 L308.0,70.0 L309.0,66.6 L310.0,63.5 L311.0,60.9 L312.0,59.1 L313.0,58.1 L314.0,58.1 L315.0,59.1 L316.0,60.9 L317.0,63.5 L318.0,66.6 L319.0,70.0 L320.0,73.4 L321.0,76.5 L322.0,79.1 L323.0,80.9 L324.0,81.9 L325.0,81.9 L326.0,80.9 L327.0,79.1 L328.0,76.5 L329.0,73.4 L330.0,70.0 L331.0,66.6 L332.0,63.5 L333.0,60.9 L334.0,59.1 L335.0,58.1 L336.0,58.1 L337.0,59.1 L338.0,60.9 L339.0,63.5 L340.0,66.6 L341.0,70.0 L342.0,73.4 L343.0,76.5 L344.0,79.1 L345.0,80.9 L346.0,81.9 L347.0,81.9 L348.0,80.9 L349.0,79.1 L350.0,76.5 L351.0,73.4 L352.0,70.0 L353.0,66.6 L354.0,63.5 L355.0,60.9 L356.0,59.1 L357.0,58.1 L358.0,58.1 L359.0,59.1 L360.0,60.9 L361.0,63.5 L362.0,66.6 L363.0,70.0 L364.0,73.4 L365.0,76.5 L366.0,79.1 L367.0,80.9 L368.0,81.9 L369.0,81.9 L370.0,80.9 L371.0,79.1 L372.0,76.5 L373.0,73.4 L374.0,70.0 L375.0,66.6 L376.0,63.5 L377.0,60.9 L378.0,59.1 L379.0,58.1 L380.0,58.1 L381.0,59.1 L382.0,60.9 L383.0,63.5 L384.0,66.6 L385.0,70.0 L386.0,73.4 L387.0,76.5 L388.0,79.1 L389.0,80.9 L390.0,81.9" fill="none" stroke="#f87171" stroke-width="1.5"/>
<text x="6" y="129" font-size="12" fill="currentColor">sum</text>
<path d="M50.0,106.9 L54.0,107.8 L58.0,108.8 L62.0,109.8 L66.0,110.9 L70.0,112.0 L74.0,113.2 L78.0,114.4 L82.0,115.7 L86.0,116.9 L90.0,118.2 L94.0,119.6 L98.0,120.9 L102.0,122.3 L106.0,123.6 L110.0,125.0 L114.0,123.6 L118.0,122.3 L122.0,120.9 L126.0,119.6 L130.0,118.2 L134.0,116.9 L138.0,115.7 L142.0,114.4 L146.0,113.2 L150.0,112.0 L154.0,110.9 L158.0,109.8 L162.0,108.8 L166.0,107.8 L170.0,106.9 L174.0,106.0 L178.0,105.2 L182.0,104.4 L186.0,103.8 L190.0,103.2 L194.0,102.6 L198.0,102.2 L202.0,101.8 L206.0,101.5 L210.0,101.2 L214.0,101.1 L218.0,101.0 L222.0,101.0 L226.0,101.1 L230.0,101.2 L234.0,101.5 L238.0,101.8 L242.0,102.2 L246.0,102.6 L250.0,103.2 L254.0,103.8 L258.0,104.4 L262.0,105.2 L266.0,106.0 L270.0,106.9 L274.0,107.8 L278.0,108.8 L282.0,109.8 L286.0,110.9 L290.0,112.0 L294.0,113.2 L298.0,114.4 L302.0,115.7 L306.0,116.9 L310.0,118.2 L314.0,119.6 L318.0,120.9 L322.0,122.3 L326.0,123.6 L330.0,125.0 L334.0,123.6 L338.0,122.3 L342.0,120.9 L346.0,119.6 L350.0,118.2 L354.0,116.9 L358.0,115.7 L362.0,114.4 L366.0,113.2 L370.0,112.0 L374.0,110.9 L378.0,109.8 L382.0,108.8 L386.0,107.8 L390.0,106.9" fill="none" stroke="#fbbf24" stroke-dasharray="4 3"/>
<path d="M50.0,143.1 L54.0,142.2 L58.0,141.2 L62.0,140.2 L66.0,139.1 L70.0,138.0 L74.0,136.8 L78.0,135.6 L82.0,134.3 L86.0,133.1 L90.0,131.8 L94.0,130.4 L98.0,129.1 L102.0,127.7 L106.0,126.4 L110.0,125.0 L114.0,126.4 L118.0,127.7 L122.0,129.1 L126.0,130.4 L130.0,131.8 L134.0,133.1 L138.0,134.3 L142.0,135.6 L146.0,136.8 L150.0,138.0 L154.0,139.1 L158.0,140.2 L162.0,141.2 L166.0,142.2 L170.0,143.1 L174.0,144.0 L178.0,144.8 L182.0,145.6 L186.0,146.2 L190.0,146.8 L194.0,147.4 L198.0,147.8 L202.0,148.2 L206.0,148.5 L210.0,148.8 L214.0,148.9 L218.0,149.0 L222.0,149.0 L226.0,148.9 L230.0,148.8 L234.0,148.5 L238.0,148.2 L242.0,147.8 L246.0,147.4 L250.0,146.8 L254.0,146.2 L258.0,145.6 L262.0,144.8 L266.0,144.0 L270.0,143.1 L274.0,142.2 L278.0,141.2 L282.0,140.2 L286.0,139.1 L290.0,138.0 L294.0,136.8 L298.0,135.6 L302.0,134.3 L306.0,133.1 L310.0,131.8 L314.0,130.4 L318.0,129.1 L322.0,127.7 L326.0,126.4 L330.0,125.0 L334.0,126.4 L338.0,127.7 L342.0,129.1 L346.0,130.4 L350.0,131.8 L354.0,133.1 L358.0,134.3 L362.0,135.6 L366.0,136.8 L370.0,138.0 L374.0,139.1 L378.0,140.2 L382.0,141.2 L386.0,142.2 L390.0,143.1" fill="none" stroke="#fbbf24" stroke-dasharray="4 3"/>
<path d="M50.0,113.1 L51.0,117.8 L52.0,123.0 L53.0,128.2 L54.0,133.0 L55.0,137.0 L56.0,139.8 L57.0,141.2 L58.0,141.1 L59.0,139.6 L60.0,136.9 L61.0,133.2 L62.0,128.9 L63.0,124.4 L64.0,120.1 L65.0,116.4 L66.0,113.6 L67.0,111.9 L68.0,111.5 L69.0,112.2 L70.0,114.1 L71.0,116.8 L72.0,120.2 L73.0,123.8 L74.0,127.3 L75.0,130.5 L76.0,133.0 L77.0,134.7 L78.0,135.4 L79.0,135.2 L80.0,134.1 L81.0,132.2 L82.0,129.8 L83.0,127.2 L84.0,124.5 L85.0,122.1 L86.0,120.1 L87.0,118.7 L88.0,117.9 L89.0,117.9 L90.0,118.5 L91.0,119.6 L92.0,121.1 L93.0,122.8 L94.0,124.5 L95.0,126.1 L96.0,127.3 L97.0,128.2 L98.0,128.7 L99.0,128.7 L100.0,128.4 L101.0,127.8 L102.0,127.0 L103.0,126.2 L104.0,125.5 L105.0,124.9 L106.0,124.5 L107.0,124.4 L108.0,124.4 L109.0,124.7 L110.0,125.0 L111.0,125.3 L112.0,125.6 L113.0,125.6 L114.0,125.5 L115.0,125.1 L116.0,124.5 L117.0,123.8 L118.0,123.0 L119.0,122.2 L120.0,121.6 L121.0,121.3 L122.0,121.3 L123.0,121.8 L124.0,122.7 L125.0,123.9 L126.0,125.5 L127.0,127.2 L128.0,128.9 L129.0,130.4 L130.0,131.5 L131.0,132.1 L132.0,132.1 L133.0,131.3 L134.0,129.9 L135.0,127.9 L136.0,125.5 L137.0,122.8 L138.0,120.2 L139.0,117.8 L140.0,115.9 L141.0,114.8 L142.0,114.6 L143.0,115.3 L144.0,117.0 L145.0,119.5 L146.0,122.7 L147.0,126.2 L148.0,129.8 L149.0,133.2 L150.0,135.9 L151.0,137.8 L152.0,138.5 L153.0,138.1 L154.0,136.4 L155.0,133.6 L156.0,129.9 L157.0,125.6 L158.0,121.1 L159.0,116.8 L160.0,113.1 L161.0,110.4 L162.0,108.9 L163.0,108.8 L164.0,110.2 L165.0,113.0 L166.0,117.0 L167.0,121.8 L168.0,127.0 L169.0,132.2 L170.0,136.9 L171.0,140.6 L172.0,143.0 L173.0,143.8 L174.0,142.9 L175.0,140.4 L176.0,136.4 L177.0,131.3 L178.0,125.6 L179.0,119.6 L180.0,114.1 L181.0,109.4 L182.0,106.1 L183.0,104.4 L184.0,104.5 L185.0,106.5 L186.0,110.2 L187.0,115.3 L188.0,121.3 L189.0,127.8 L190.0,134.1 L191.0,139.6 L192.0,143.9 L193.0,146.6 L194.0,147.3 L195.0,146.1 L196.0,142.9 L197.0,138.1 L198.0,132.1 L199.0,125.3 L200.0,118.5 L201.0,112.2 L202.0,107.0 L203.0,103.4 L204.0,101.7 L205.0,102.1 L206.0,104.5 L207.0,108.8 L208.0,114.6 L209.0,121.3 L210.0,128.4 L211.0,135.2 L212.0,141.1 L213.0,145.6 L214.0,148.3 L215.0,148.9 L216.0,147.3 L217.0,143.8 L218.0,138.5 L219.0,132.1 L220.0,125.0 L221.0,117.9 L222.0,111.5 L223.0,106.2 L224.0,102.7 L225.0,101.1 L226.0,101.7 L227.0,104.4 L228.0,108.9 L229.0,114.8 L230.0,121.6 L231.0,128.7 L232.0,135.4 L233.0,141.2 L234.0,145.5 L235.0,147.9 L236.0,148.3 L237.0,146.6 L238.0,143.0 L239.0,137.8 L240.0,131.5 L241.0,124.7 L242.0,117.9 L243.0,111.9 L244.0,107.1 L245.0,103.9 L246.0,102.7 L247.0,103.4 L248.0,106.1 L249.0,110.4 L250.0,115.9 L251.0,122.2 L252.0,128.7 L253.0,134.7 L254.0,139.8 L255.0,143.5 L256.0,145.5 L257.0,145.6 L258.0,143.9 L259.0,140.6 L260.0,135.9 L261.0,130.4 L262.0,124.4 L263.0,118.7 L264.0,113.6 L265.0,109.6 L266.0,107.1 L267.0,106.2 L268.0,107.0 L269.0,109.4 L270.0,113.1 L271.0,117.8 L272.0,123.0 L273.0,128.2 L274.0,133.0 L275.0,137.0 L276.0,139.8 L277.0,141.2 L278.0,141.1 L279.0,139.6 L280.0,136.9 L281.0,133.2 L282.0,128.9 L283.0,124.4 L284.0,120.1 L285.0,116.4 L286.0,113.6 L287.0,111.9 L288.0,111.5 L289.0,112.2 L290.0,114.1 L291.0,116.8 L292.0,120.2 L293.0,123.8 L294.0,127.3 L295.0,130.5 L296.0,133.0 L297.0,134.7 L298.0,135.4 L299.0,135.2 L300.0,134.1 L301.0,132.2 L302.0,129.8 L303.0,127.2 L304.0,124.5 L305.0,122.1 L306.0,120.1 L307.0,118.7 L308.0,117.9 L309.0,117.9 L310.0,118.5 L311.0,119.6 L312.0,121.1 L313.0,122.8 L314.0,124.5 L315.0,126.1 L316.0,127.3 L317.0,128.2 L318.0,128.7 L319.0,128.7 L320.0,128.4 L321.0,127.8 L322.0,127.0 L323.0,126.2 L324.0,125.5 L325.0,124.9 L326.0,124.5 L327.0,124.4 L328.0,124.4 L329.0,124.7 L330.0,125.0 L331.0,125.3 L332.0,125.6 L333.0,125.6 L334.0,125.5 L335.0,125.1 L336.0,124.5 L337.0,123.8 L338.0,123.0 L339.0,122.2 L340.0,121.6 L341.0,121.3 L342.0,121.3 L343.0,121.8 L344.0,122.7 L345.0,123.9 L346.0,125.5 L347.0,127.2 L348.0,128.9 L349.0,130.4 L350.0,131.5 L351.0,132.1 L352.0,132.1 L353.0,131.3 L354.0,129.9 L355.0,127.9 L356.0,125.5 L357.0,122.8 L358.0,120.2 L359.0,117.8 L360.0,115.9 L361.0,114.8 L362.0,114.6 L363.0,115.3 L364.0,117.0 L365.0,119.5 L366.0,122.7 L367.0,126.2 L368.0,129.8 L369.0,133.2 L370.0,135.9 L371.0,137.8 L372.0,138.5 L373.0,138.1 L374.0,136.4 L375.0,133.6 L376.0,129.9 L377.0,125.6 L378.0,121.1 L379.0,116.8 L380.0,113.1 L381.0,110.4 L382.0,108.9 L383.0,108.8 L384.0,110.2 L385.0,113.0 L386.0,117.0 L387.0,121.8 L388.0,127.0 L389.0,132.2 L390.0,136.9" fill="none" stroke="#c084fc" stroke-width="1.5"/>
<line x1="110" y1="160" x2="330" y2="160" stroke="currentColor" marker-start="url(#mw-ar-beat)" marker-end="url(#mw-ar-beat)"/>
<text x="220" y="175" font-size="12" fill="currentColor" text-anchor="middle">one beat</text>
</svg><figcaption>Two waves with slightly different frequencies (blue, red) and their sum (violet). The sum swells and fades; one beat lasts from one quiet moment to the next.</figcaption></figure>
<p>Example: tuning forks at 440 Hz and 444 Hz give 4 beats per second. A guitarist turns the tuning peg until the beats slow down and stop. In Wave Dude, two sources at levels 60 and 62 differ by 2/255 radians per step, so their pattern beats once every 2π × 255 / 2 ≈ 800 steps.</p>`,
        },
        {
          level: "university",
          html: `
<h4>Linearity</h4>
<p>The wave equation is linear: if u<sub>1</sub> and u<sub>2</sub> are solutions, so is αu<sub>1</sub> + βu<sub>2</sub>. Superposition is therefore not an extra law of nature but a property of linear equations (and of real media at small enough amplitude). Wave Dude's update rule is linear in u, so the simulator obeys it up to floating-point rounding (see the research note for a small exception at source cells).</p>
<h4>Phasors</h4>
<p>For equal frequencies write u<sub>j</sub> = Re[U<sub>j</sub> e<sup>−iωt</sup>] with U<sub>j</sub> = A<sub>j</sub> e<sup>iφ<sub>j</sub></sup>. Then u<sub>1</sub> + u<sub>2</sub> = Re[(U<sub>1</sub> + U<sub>2</sub>) e<sup>−iωt</sup>]: adding waves is adding complex numbers, drawn as arrows (<b>phasors</b>) in the plane. The resultant has</p>
<p class="formula">|U|² = A<sub>1</sub>² + A<sub>2</sub>² + 2 A<sub>1</sub> A<sub>2</sub> cos(φ<sub>1</sub> − φ<sub>2</sub>)</p>
<p>and the time-averaged ⟨u²⟩ = |U|²/2. The last term is the <b>interference term</b>. For A<sub>1</sub> = A<sub>2</sub> it moves the intensity between 0 and four times that of one wave; averaged over φ<sub>1</sub> − φ<sub>2</sub> it vanishes, leaving twice one wave. Interference redistributes energy; it does not create or destroy it.</p>
<p>N equal phasors with a constant phase step δ (a grating, a phased array) form part of a regular polygon. Summing the geometric series,</p>
<p class="formula">| Σ<sub>m=0</sub><sup>N−1</sup> A e<sup>imδ</sup> | = A | sin(Nδ/2) / sin(δ/2) |</p>
<p>which equals NA when δ is a multiple of 2π and first falls to zero at δ = ±2π/N. This one formula is behind every grating and array result on the interference page.</p>
<h4>Beats and groups</h4>
<p class="formula">cos ω<sub>1</sub>t + cos ω<sub>2</sub>t = 2 cos(½Δω t) cos(ω̄ t), &nbsp; Δω = ω<sub>1</sub> − ω<sub>2</sub>, &nbsp; ω̄ = ½(ω<sub>1</sub> + ω<sub>2</sub>)</p>
<p>A fast carrier at ω̄ inside a slow envelope; the intensity peaks whenever |cos(½Δω t)| = 1, i.e. at the frequency |f<sub>1</sub> − f<sub>2</sub>|. For travelling waves the same identity gives</p>
<p class="formula">cos(k<sub>1</sub>x − ω<sub>1</sub>t) + cos(k<sub>2</sub>x − ω<sub>2</sub>t) = 2 cos(½(Δk x − Δω t)) cos(k̄x − ω̄t)</p>
<p>The envelope moves at Δω/Δk → <b>group velocity</b> v<sub>g</sub> = dω/dk, which carries energy and information, while the crests move at v<sub>p</sub> = ω/k. For the ideal wave equation v<sub>g</sub> = v<sub>p</sub> = c (non-dispersive). On Wave Dude's grid, short waves have v<sub>g</sub> &lt; v<sub>p</sub> &lt; the long-wave speed, so a sharp pulse sheds short ripples that trail behind it.</p>
<p>A standing wave is the same identity with opposite directions: cos(kx − ωt) + cos(kx + ωt) = 2 cos kx cos ωt, with nodes where cos kx = 0, spaced λ/2.</p>`,
        },
        {
          level: "research",
          title: "When superposition fails, or cannot be seen",
          html: `
<ul>
<li><b>Nonlinearity.</b> Real media superpose only at small amplitude. Steep water waves, very loud sound (which steepens into shocks) and intense light in nonlinear crystals (frequency doubling) all violate it. Wave Dude is strictly linear: it cannot show harmonic generation, solitons or breaking waves.</li>
<li><b>Soft sources.</b> A driven cell is updated as u ← 0.9u + 0.1·s(t). That is affine, so the source cell also partly scatters waves arriving from elsewhere (it removes 10% of the passing field each step). The field of two sources is therefore not exactly the sum of the fields of each source alone. The effect is small but grows with dense arrays of sources.</li>
<li><b>Coherence.</b> The interference term survives time-averaging only if the phase difference stays fixed. Simulated sources are perfectly coherent. Light from hot sources has a coherence time of only femtoseconds, which is why two light bulbs never give a stable fringe pattern and why Young had to take both beams from the same source.</li>
<li><b>Finite averaging.</b> The intensity view averages u² with time constant τ = TimeDecayFactor × 100 / (lowest source level) steps, about 17 steps for level 60 with the default factor. Two sources at slightly different levels give a fringe pattern that slides along with the beat period (about 800 steps for levels 60 and 62); because that is much longer than τ, the view shows the pattern moving rather than averaging it away.</li>
</ul>`,
        },
      ],
      tryIt: [
        { experiment: "splash", label: "Splash! Making waves" },
        { experiment: "double-slit", label: "The double slit" },
      ],
      sources: [
        "R. P. Feynman et al., The Feynman Lectures on Physics, Vol. I, ch. 48 \"Beats\" — https://www.feynmanlectures.caltech.edu/I_48.html",
        "E. Hecht, Optics, 5th ed. (Pearson, 2017), ch. 7 \"The Superposition of Waves\" and ch. 12 \"Basics of Coherence Theory\"",
        "F. S. Crawford, Waves (Berkeley Physics Course Vol. 3, McGraw-Hill, 1968)",
        "M. Born, E. Wolf, Principles of Optics, 7th ed. (Cambridge University Press, 1999), ch. 10 \"Interference and diffraction with partially coherent light\"",
      ],
    },
    // ------------------------------------------------------------------ 3
    {
      id: "wave-equation",
      title: "The wave equation",
      summary: "Derive the equation every wave in the simulator obeys, from a chain of masses and springs to a 2D membrane.",
      sections: [
        {
          level: "kids",
          html: `
<p>Imagine a long row of balls lying on a table, each joined to its neighbours by springs. Lift one ball up. Its springs stretch and pull it back down. It shoots past the middle, and as it moves it tugs on its neighbours. Now <i>they</i> move, and tug on <i>their</i> neighbours. The wiggle travels along the row: a wave!</p>
<figure class="diagram"><svg viewBox="0 0 400 140" role="img" aria-label="A row of balls joined by springs, with the middle ball lifted and pulled back">
<defs><marker id="mw-ar-spring" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#f87171"/></marker></defs>
<path d="M49.0,80.0 L51.2,85.0 L53.4,75.0 L55.6,85.0 L57.8,75.0 L60.0,85.0 L62.2,75.0 L64.5,85.0 L66.7,75.0 L68.9,85.0 L71.1,75.0 L73.3,85.0 L75.5,75.0 L77.7,85.0 L79.9,75.0 L82.1,85.0 L84.3,80.0" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M102.3,80.0 L104.5,85.0 L106.8,75.0 L109.0,85.0 L111.2,75.0 L113.4,85.0 L115.6,75.0 L117.8,85.0 L120.0,75.0 L122.2,85.0 L124.4,75.0 L126.6,85.0 L128.8,75.0 L131.0,85.0 L133.3,75.0 L135.5,85.0 L137.7,80.0" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M153.9,74.6 L159.3,76.8 L155.7,66.9 L164.2,73.1 L160.6,63.3 L169.0,69.5 L165.5,59.6 L173.9,65.8 L170.3,56.0 L178.8,62.2 L175.2,52.3 L183.6,58.5 L180.1,48.7 L188.5,54.9 L184.9,45.0 L193.4,51.2 L192.8,45.4" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M207.2,45.4 L206.6,51.2 L215.1,45.0 L211.5,54.9 L219.9,48.7 L216.4,58.5 L224.8,52.4 L221.2,62.2 L229.7,56.0 L226.1,65.8 L234.5,59.6 L231.0,69.5 L239.4,63.3 L235.8,73.1 L244.3,67.0 L240.7,76.8 L246.1,74.6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M262.3,80.0 L264.5,85.0 L266.8,75.0 L269.0,85.0 L271.2,75.0 L273.4,85.0 L275.6,75.0 L277.8,85.0 L280.0,75.0 L282.2,85.0 L284.4,75.0 L286.6,85.0 L288.8,75.0 L291.0,85.0 L293.3,75.0 L295.5,85.0 L297.7,80.0" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M315.7,80.0 L317.9,85.0 L320.1,75.0 L322.3,85.0 L324.5,75.0 L326.7,85.0 L328.9,75.0 L331.1,85.0 L333.3,75.0 L335.5,85.0 L337.8,75.0 L340.0,85.0 L342.2,75.0 L344.4,85.0 L346.6,75.0 L348.8,85.0 L351.0,80.0" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="40.0" cy="80" r="9" fill="#60a5fa" stroke="currentColor"/><circle cx="93.3" cy="80" r="9" fill="#60a5fa" stroke="currentColor"/><circle cx="146.7" cy="80" r="9" fill="#60a5fa" stroke="currentColor"/><circle cx="200.0" cy="40" r="9" fill="#f87171" stroke="currentColor"/><circle cx="253.3" cy="80" r="9" fill="#60a5fa" stroke="currentColor"/><circle cx="306.7" cy="80" r="9" fill="#60a5fa" stroke="currentColor"/><circle cx="360.0" cy="80" r="9" fill="#60a5fa" stroke="currentColor"/>
<line x1="200" y1="18" x2="200" y2="29" stroke="#f87171" stroke-width="2" marker-end="url(#mw-ar-spring)"/>
<text x="212" y="22" font-size="12" fill="currentColor">pulled back down</text>
<text x="200" y="120" font-size="13" fill="currentColor" text-anchor="middle">The more it sticks out, the harder the pull.</text>
</svg><figcaption>Balls joined by springs. The lifted ball is pulled back towards its neighbours.</figcaption></figure>
<p>Here is the whole secret in one sentence: <b>each ball is pulled towards its neighbours, and the more the row bends at that ball, the harder the pull.</b> A ball that is level with its neighbours feels no pull at all. A ball that sticks out a long way gets a big tug.</p>
<p>Wave Dude uses exactly this rule. The screen is a big grid of cells, like a trampoline made of tiny squares, and every cell is tugged by the eight cells around it. The computer works out the tug on every cell, moves them all a tiny bit, and then does it again, over and over, very fast.</p>
<p>Stronger springs or lighter balls make waves go faster. In "glass" the simulator makes the tug weaker, so waves travel more slowly there.</p>
<div class="home"><b>Try it at home:</b> Lay a slinky on a smooth floor and stretch it out, with a friend holding the other end. Give your end a quick sideways flick and watch the bump run along. Now stretch it further, so the spring is tighter, and flick again: the bump runs faster.</div>`,
        },
        {
          level: "school",
          html: `
<p>Let's turn "pulled towards its neighbours" into maths. Take one bead in the chain at height u, with neighbours at heights u<sub>left</sub> and u<sub>right</sub>. The springs pull it up if the neighbours are higher and down if they are lower. The net pull is proportional to</p>
<p class="formula">u<sub>left</sub> + u<sub>right</sub> − 2u</p>
<p>which is twice the difference between the average of the neighbours and the bead itself. For a smooth curve this measures the <b>curvature</b>: how sharply the line bends. Newton's second law (force = mass × acceleration) then says</p>
<p class="formula">acceleration = c² × curvature, &nbsp; or &nbsp; ∂²u/∂t² = c² ∂²u/∂x²</p>
<ul>
<li>u: the displacement (height) of the string at position x and time t.</li>
<li>∂²u/∂t²: its acceleration. The curly ∂ means "rate of change, keeping everything else fixed".</li>
<li>∂²u/∂x²: the curvature of the string.</li>
<li>c: the speed of the wave.</li>
</ul>
<p>For a stretched string the wave speed is c = √(T / μ), where T is the tension (newtons) and μ the mass per metre (kg/m). Example: T = 100 N and μ = 0.01 kg/m give c = √(100 / 0.01) = √10 000 = 100 m/s.</p>
<h4>In two dimensions</h4>
<p>On a drum skin or a water surface every point has neighbours in all directions, and the curvature becomes ∂²u/∂x² + ∂²u/∂y², written ∇²u ("del squared u", the <b>Laplacian</b>). The 2D wave equation is</p>
<p class="formula">∂²u/∂t² = c² ∇²u</p>
<p>and this is the equation Wave Dude solves.</p>
<h4>What c and n mean</h4>
<p>The <b>refractive index</b> n tells you how many times slower a wave travels in a material than in empty space: c = c<sub>0</sub> / n. Light (c<sub>0</sub> = 3.0 × 10⁸ m/s) in glass with n = 1.5 travels at 3.0 × 10⁸ / 1.5 = 2.0 × 10⁸ m/s. In Wave Dude every cell has its own n. Empty space carries waves at about 0.562 cells per step, so glass with n = 1.5 carries them at 0.562 / 1.5 ≈ 0.37 cells per step.</p>`,
        },
        {
          level: "university",
          html: `
<h4>From a lattice to the continuum</h4>
<p>Take masses m at spacing h along x, on a string under tension T, and let u<sub>j</sub>(t) be the small transverse displacement of mass j. For small slopes the transverse component of the tension pulling mass j towards mass j+1 is T sin α ≈ T(u<sub>j+1</sub> − u<sub>j</sub>)/h, and likewise on the other side. Newton's law:</p>
<p class="formula">m ü<sub>j</sub> = (T/h)(u<sub>j+1</sub> − 2u<sub>j</sub> + u<sub>j−1</sub>)</p>
<p>With m = μh and the Taylor expansion u<sub>j±1</sub> = u ± h u<sub>x</sub> + ½h² u<sub>xx</sub> ± …, the bracket is h² u<sub>xx</sub> + O(h⁴). Letting h → 0:</p>
<p class="formula">∂²u/∂t² = c² ∂²u/∂x², &nbsp; c = √(T/μ)</p>
<p>d'Alembert (1747) found the general solution u = F(x − ct) + G(x + ct): any shape travels left or right without changing.</p>
<h4>The membrane</h4>
<p>For a membrane with tension T per unit length (N m<sup>−1</sup>) and areal density σ (kg m<sup>−2</sup>), the net transverse force on a patch dx dy is T(u<sub>xx</sub> + u<sub>yy</sub>) dx dy, so σ u<sub>tt</sub> = T ∇²u and c = √(T/σ). Sound in a fluid obeys the same equation for the pressure with c = √(K/ρ) (bulk modulus K, density ρ).</p>
<h4>What Wave Dude solves, physically</h4>
<p>Wave Dude solves u<sub>tt</sub> = (c<sub>0</sub>/n(x, y))² ∇²u. Where n varies, the exact form of a variable-coefficient wave equation matters (a membrane of varying tension gives ∇·(T∇u) instead), but this one has a clean physical meaning. For light in a 2D dielectric with the electric field along z (TE, or s, polarisation), E = E<sub>z</sub>(x, y, t) ẑ has ∇·E = 0, so ∇×∇×E = −∇²E and Maxwell's equations give exactly ∇²E<sub>z</sub> = (n²/c<sub>0</sub>²) ∂²E<sub>z</sub>/∂t². The simulator's u is that field component.</p>
<h4>The Helmholtz equation</h4>
<p>For one frequency, put u = Re[U(x, y) e<sup>−iωt</sup>]:</p>
<p class="formula">∇²U + k<sub>0</sub>² n² U = 0, &nbsp; k<sub>0</sub> = ω/c<sub>0</sub> = 2π/λ<sub>0</sub></p>
<p>Plane waves U = e<sup>i<b>k</b>·<b>r</b></sup> solve it when |<b>k</b>| = n k<sub>0</sub>: the dispersion relation ω = c<sub>0</sub>|<b>k</b>|/n, the same for all frequencies (non-dispersive).</p>
<h4>And on the grid</h4>
<p>Replace ∂²u/∂t² by u<sup>n+1</sup> − 2u<sup>n</sup> + u<sup>n−1</sup> (time step 1) and the Laplacian by the 3×3 kernel K, and you get Wave Dude's update rule, u<sup>n+1</sup> = u<sup>n</sup> + d·(u<sup>n</sup> − u<sup>n−1</sup>) + c²(K∗u<sup>n</sup>), where d = 1 means no damping. Because K∗u ≈ 0.316 ∇²u for smooth fields, the long-wave speed is √0.316 / n ≈ 0.562 / n cells per step.</p>`,
        },
        {
          level: "research",
          title: "The simulator is the lattice",
          html: `
<p>The derivation above can be read backwards: Wave Dude does not so much approximate a membrane as <i>be</i> a lattice of coupled oscillators, each cell coupled to its 4 edge neighbours with weight 0.184 and its 4 corner neighbours with weight 0.066, stepped in time with the leapfrog (Störmer–Verlet) scheme. The 1D chain has the semi-discrete dispersion relation ω = 2√(T/(mh)) |sin(kh/2)|; the grid's axial relation 4 sin²(ω/2) = 1.264 c² sin²(k/2) is the 2D analogue with the time step adding the sin(ω/2) on the left.</p>
<p><b>Isotropy.</b> The stencil's symbol is −1 + 2a(cos k<sub>x</sub> + cos k<sub>y</sub>) + 4b cos k<sub>x</sub> cos k<sub>y</sub> with a = 0.184, b = 0.066. Expanded to fourth order, the k<sub>x</sub>²k<sub>y</sub>² coefficient is b, while direction-independence needs (a + 2b)/6 ≈ 0.053 (the classic isotropic nine-point Laplacian has a = 4b). The residual 0.013 is about a quarter of the 0.053 of a five-point cross with the same long-wave speed, so the diagonal neighbours reduce, but do not remove, direction-dependent dispersion.</p>
<p><b>Stability.</b> Von Neumann analysis of the leapfrog step with symbol −κ requires c²κ ≤ 4. The 3×3 kernel's largest |symbol| is 1.472 (at k = (π, π)), giving c² ≤ 2.72, always met since n ≥ 0.9. The optional fourth-order cross stencil is scaled by the same 0.316 (so waves keep their speed) and reaches |symbol| ≈ 3.37, too close to the limit, which is why the engine then sub-steps.</p>
<p>For the theory of such schemes see Trefethen's and LeVeque's texts; Taflove and Hagness treat numerical dispersion and stability for the closely related FDTD method in detail.</p>`,
        },
      ],
      tryIt: [
        { experiment: "splash", label: "Splash! Making waves" },
        { experiment: "refraction", label: "Bending waves: Snell's law" },
        { experiment: "grid-dispersion", label: "Waves on a grid: numerical dispersion" },
      ],
      sources: [
        "R. P. Feynman et al., The Feynman Lectures on Physics, Vol. I, ch. 47 \"Sound. The wave equation\" — https://www.feynmanlectures.caltech.edu/I_47.html",
        "F. S. Crawford, Waves (Berkeley Physics Course Vol. 3, McGraw-Hill, 1968), ch. 1–2 (coupled oscillators to continuous systems)",
        "J. le Rond d'Alembert, Recherches sur la courbe que forme une corde tendue mise en vibration (Mémoires de l'Académie de Berlin, 1747)",
        "R. J. LeVeque, Finite Difference Methods for Ordinary and Partial Differential Equations (SIAM, 2007)",
        "A. Taflove, S. C. Hagness, Computational Electrodynamics: The Finite-Difference Time-Domain Method, 3rd ed. (Artech House, 2005)",
        "WaveSimulator2D by 0x23 — https://github.com/0x23/WaveSimulator2D",
      ],
    },
    // ------------------------------------------------------------------ 4
    {
      id: "huygens-principle",
      title: "Huygens' principle",
      summary: "Every point of a wavefront acts as a new little source: the idea behind spreading, bending and diffraction.",
      sections: [
        {
          level: "kids",
          html: `
<p>Drop a stone in a pond and a ring of ripples spreads out. More than 300 years ago a Dutch scientist, Christiaan Huygens, had a clever idea about this: <b>every bit of a wave acts like a brand-new tiny splash</b>.</p>
<p>Picture a long, straight wave rolling along. Pretend that every point on it is a little pebble plopping into the water. Each one makes its own small ring. A moment later, all those tiny rings overlap, and the line where they all reach makes the new wave. That is where the wave is now.</p>
<figure class="diagram"><svg viewBox="0 0 400 180" role="img" aria-label="Left: wavelets from points on a straight wavefront build the next wavefront. Right: a wave passing through a narrow gap spreads out in circles.">
<path d="M40,0 A40,40 0 0 1 40,80" fill="none" stroke="#60a5fa" stroke-dasharray="3 3"/><circle cx="40" cy="40" r="3" fill="#f87171"/><path d="M40,25 A40,40 0 0 1 40,105" fill="none" stroke="#60a5fa" stroke-dasharray="3 3"/><circle cx="40" cy="65" r="3" fill="#f87171"/><path d="M40,50 A40,40 0 0 1 40,130" fill="none" stroke="#60a5fa" stroke-dasharray="3 3"/><circle cx="40" cy="90" r="3" fill="#f87171"/><path d="M40,75 A40,40 0 0 1 40,155" fill="none" stroke="#60a5fa" stroke-dasharray="3 3"/><circle cx="40" cy="115" r="3" fill="#f87171"/><path d="M40,100 A40,40 0 0 1 40,180" fill="none" stroke="#60a5fa" stroke-dasharray="3 3"/><circle cx="40" cy="140" r="3" fill="#f87171"/><path d="M250,68 A22,22 0 0 1 250,112" fill="none" stroke="#60a5fa" stroke-width="1.5"/><path d="M250,46 A44,44 0 0 1 250,134" fill="none" stroke="#60a5fa" stroke-width="1.5"/><path d="M250,24 A66,66 0 0 1 250,156" fill="none" stroke="#60a5fa" stroke-width="1.5"/><path d="M250,2 A88,88 0 0 1 250,178" fill="none" stroke="#60a5fa" stroke-width="1.5"/><path d="M250,-20 A110,110 0 0 1 250,200" fill="none" stroke="#60a5fa" stroke-width="1.5"/><path d="M250,-42 A132,132 0 0 1 250,222" fill="none" stroke="#60a5fa" stroke-width="1.5"/><path d="M250,-64 A154,154 0 0 1 250,244" fill="none" stroke="#60a5fa" stroke-width="1.5"/>
<line x1="40" y1="20" x2="40" y2="160" stroke="#f87171" stroke-width="2.5"/>
<line x1="80" y1="20" x2="80" y2="160" stroke="#34d399" stroke-width="2.5"/>
<text x="40" y="13" font-size="12" fill="currentColor" text-anchor="middle">now</text>
<text x="80" y="176" font-size="12" fill="currentColor" text-anchor="middle">a moment later</text>
<line x1="190" y1="0" x2="190" y2="180" stroke="#60a5fa" stroke-width="1.5"/>
<line x1="210" y1="0" x2="210" y2="180" stroke="#60a5fa" stroke-width="1.5"/>
<line x1="230" y1="0" x2="230" y2="180" stroke="#60a5fa" stroke-width="1.5"/>
<rect x="246" y="0" width="8" height="80" fill="currentColor"/>
<rect x="246" y="100" width="8" height="80" fill="currentColor"/>
</svg><figcaption>Left: every point on the wave (red) sends out a small ring; together the rings make the next wave (green). Right: only a small piece of the wave gets through a narrow gap, and it spreads out in circles behind the wall.</figcaption></figure>
<p>This explains something surprising. When a wave hits a wall with a gap in it, only the part of the wave inside the gap gets through. That part acts like a short row of tiny splashes, and their ripples spread out in a fan behind the wall, even into the "shadow" of the wall. The narrower the gap, the more the wave spreads.</p>
<p>It is one reason you can hear a friend talking around a corner even though you cannot see them.</p>
<div class="home"><b>Try it at home:</b> In the bath, or in a baking tray of water, stand two books or plastic boxes upright to make a wall with a narrow gap. Make waves on one side by gently dipping a ruler in and out. Watch them fan out on the other side of the gap.</div>
<div class="fact"><b>Fun fact:</b> Huygens also built the first pendulum clock, in 1656, and discovered Saturn's largest moon, Titan.</div>`,
        },
        {
          level: "school",
          html: `
<p>A <b>wavefront</b> is a line joining points that are at the same stage of their oscillation, for example along a crest. <b>Rays</b> are drawn at right angles to the wavefronts and show which way the wave travels.</p>
<p><b>Huygens' principle</b> (described in 1678 and published in his <i>Traité de la lumière</i> in 1690): every point on a wavefront acts as a source of small circular <b>wavelets</b> that spread out at the wave speed v. After a time t the new wavefront is the line that touches all the wavelets of radius v · t, their <b>envelope</b>.</p>
<p>Example: in Wave Dude with n = 1, waves travel 0.562 cells per step. After 100 steps every wavelet has a radius of about 56 cells, so a straight wavefront moves forward 56 cells and stays straight, and a circular wavefront of radius 100 cells grows to about 156 cells.</p>
<p>Huygens' construction explains:</p>
<ul>
<li>why straight wavefronts stay straight and circular ones stay circular;</li>
<li>reflection and refraction (see "Deriving reflection and refraction");</li>
<li><b>diffraction</b>: at a gap, the wavelets near the edges have no neighbours on one side to cancel their sideways spread, so the wave bends into the shadow. The spreading is large when the gap is about one wavelength wide or smaller, and small when the gap is many wavelengths wide.</li>
</ul>
<p>Example: water waves with λ = 2 cm passing a 2 cm gap spread out almost as semicircles. Light with λ = 0.0005 mm passing a 2 cm window hardly spreads at all, because the window is 40 000 wavelengths wide.</p>
<p class="aside">Huygens' own version could not explain why the wavelets do not also make a wave running backwards, or predict the bright and dark bands seen in diffraction. Fresnel fixed both by letting the wavelets interfere.</p>`,
        },
        {
          level: "university",
          html: `
<h4>Huygens–Fresnel</h4>
<p>Fresnel (memoir of 1818) gave the wavelets a phase and let them interfere. The field at a point P is the superposition of wavelets from a surface Σ:</p>
<p class="formula">U(P) = (1/iλ) ∬<sub>Σ</sub> U(Q) (e<sup>ikr</sup>/r) K(χ) dS</p>
<p>where r = |P − Q|, χ is the angle between the normal at Q and the direction to P, and K(χ) is an obliquity factor. Fresnel had to choose the prefactor (amplitude scaled by 1/λ, phase advanced by 90°) and K by hand so that a plane wave reproduces itself.</p>
<h4>Kirchhoff</h4>
<p>Kirchhoff (1882) derived it from the Helmholtz equation. Green's theorem applied to U and G = e<sup>ikr</sup>/r gives the exact Helmholtz–Kirchhoff integral theorem (time dependence e<sup>−iωt</sup>, n the outward normal):</p>
<p class="formula">U(P) = (1/4π) ∯<sub>S</sub> [ (∂U/∂n) (e<sup>ikr</sup>/r) − U ∂/∂n (e<sup>ikr</sup>/r) ] dS</p>
<p>This is Huygens' principle made exact: the field and its normal derivative on any closed surface determine the field inside. Kirchhoff then assumed that in an aperture the field equals the incident field, and that U and ∂U/∂n both vanish on the dark side of the screen. For r ≫ λ this gives the Fresnel–Kirchhoff formula, with the prefactor 1/(iλ) now derived and, for a plane wave at normal incidence, K(χ) = (1 + cos χ)/2: 1 forwards, 0 backwards. Rayleigh and Sommerfeld later used a Green's function that vanishes on the screen plane, which avoids prescribing both U and ∂U/∂n, and obtained K = cos χ.</p>
<h4>In two dimensions</h4>
<p>Wave Dude's world is 2D. There the outgoing Green's function of the Helmholtz equation is (i/4) H<sub>0</sub><sup>(1)</sup>(kr), whose far field falls off as e<sup>ikr</sup>/√(kr). The 2D Rayleigh–Sommerfeld formula for an aperture on a line becomes, for kr ≫ 1,</p>
<p class="formula">U(P) ≈ (1/√(iλ)) ∫ U(Q) (e<sup>ikr</sup>/√r) cos χ dl</p>
<p>The wavelets are cylindrical, their amplitude falls as 1/√r, and the prefactor shifts the phase by 45° instead of 90°.</p>`,
        },
        {
          level: "research",
          title: "Strong and weak Huygens principle",
          html: `
<p>In 3D, a flash from a point gives a spherical shell, and once it has passed the field returns exactly to zero: the retarded Green's function of ∂²/∂t² − c²∇² is δ(t − r/c)/(4πc²r). This sharp ("strong") Huygens principle holds in odd numbers of space dimensions from 3 up, and fails in even ones. Integrating the 3D Green's function along a line gives the 2D one,</p>
<p class="formula">G(r, t) = H(ct − r) / (2πc √(c²t² − r²))</p>
<p>which is non-zero everywhere inside the light cone: a pulse leaves a wake that dies away only slowly (like 1/t at a fixed point). A 2D world is a 3D world in which every source is an infinitely long line, and the wake is the late-arriving signal from the distant parts of that line. You can see it in Wave Dude: a short pulse from a point source gives a sharp ring followed by a slowly fading wash inside it, not silence.</p>
<p>Kirchhoff's theory is not self-consistent: Poincaré and Sommerfeld pointed out that a solution of the Helmholtz equation whose value and normal derivative both vanish on a finite piece of surface vanishes everywhere. Kirchhoff's and Rayleigh–Sommerfeld's formulas are nevertheless accurate many wavelengths from the aperture and for apertures much larger than λ. Exact solutions exist only for a few shapes, the classic being Sommerfeld's half-plane (1896). A full-wave simulation such as Wave Dude makes no Kirchhoff assumption: it includes the near field, waves scattered from the edges, and multiple scattering between edges, though with its own idealisations (scalar field, pixel-staircase walls, a finite grid). Comparing the simulated pattern behind a slit only a few wavelengths wide with the Kirchhoff prediction is a good exercise.</p>`,
        },
      ],
      tryIt: [
        { experiment: "single-slit", label: "One gap: how waves spread" },
        { experiment: "splash", label: "Splash! Making waves" },
      ],
      sources: [
        "C. Huygens, Traité de la lumière (Leiden, 1690); English translation: Treatise on Light, tr. S. P. Thompson (Macmillan, 1912)",
        "M. Born, E. Wolf, Principles of Optics, 7th ed. (Cambridge University Press, 1999), ch. 8 \"Elements of the theory of diffraction\"",
        "J. W. Goodman, Introduction to Fourier Optics, 3rd ed. (Roberts & Company, 2005), ch. 3",
        "B. B. Baker, E. T. Copson, The Mathematical Theory of Huygens' Principle (Oxford, 1939)",
        "D.-C. Dai, D. Stojkovic, Origin of the tail in Green's functions in odd dimensional space-times — https://arxiv.org/abs/1309.2996",
        "E. Hecht, Optics, 5th ed. (Pearson, 2017), ch. 4 and 10",
      ],
    },
    // ------------------------------------------------------------------ 5
    {
      id: "reflection-refraction",
      title: "Deriving reflection and refraction",
      summary: "Why waves bounce off at equal angles and bend in slower materials, from wavefronts and from Fermat's principle of least time.",
      sections: [
        {
          level: "kids",
          html: `
<p>Roll a ball at a wall at a slant and it bounces off at the same slant the other way. Waves do the same when they hit a mirror or a wall: they leave at the same angle they came in.</p>
<figure class="diagram"><svg viewBox="0 0 400 180" role="img" aria-label="A wave bouncing off a wall at equal angles">
<defs><marker id="mw-ar-mirror" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#60a5fa"/></marker></defs>
<line x1="60" y1="150" x2="340" y2="150" stroke="currentColor" stroke-width="3"/>
<g stroke="currentColor" opacity="0.5"><line x1="70" y1="152" x2="60" y2="164"/><line x1="100" y1="152" x2="90" y2="164"/><line x1="130" y1="152" x2="120" y2="164"/><line x1="160" y1="152" x2="150" y2="164"/><line x1="190" y1="152" x2="180" y2="164"/><line x1="220" y1="152" x2="210" y2="164"/><line x1="250" y1="152" x2="240" y2="164"/><line x1="280" y1="152" x2="270" y2="164"/><line x1="310" y1="152" x2="300" y2="164"/><line x1="340" y1="152" x2="330" y2="164"/></g>
<line x1="200" y1="30" x2="200" y2="150" stroke="currentColor" stroke-dasharray="4 4" opacity="0.6"/>
<line x1="80" y1="40" x2="198" y2="148" stroke="#60a5fa" stroke-width="2.5" marker-end="url(#mw-ar-mirror)"/>
<line x1="200" y1="150" x2="318" y2="42" stroke="#60a5fa" stroke-width="2.5" marker-end="url(#mw-ar-mirror)"/>
<path d="M200,120 A30,30 0 0 0 177.9,129.7" fill="none" stroke="#fbbf24" stroke-width="2.5"/>
<path d="M200,120 A30,30 0 0 1 222.1,129.7" fill="none" stroke="#fbbf24" stroke-width="2.5"/>
<path d="M200,112 A38,38 0 0 1 228.0,124.3" fill="none" stroke="#fbbf24" stroke-width="2.5"/>
<path d="M200,112 A38,38 0 0 0 172.0,124.3" fill="none" stroke="#fbbf24" stroke-width="2.5"/>
<text x="64" y="32" font-size="13" fill="currentColor">comes in</text>
<text x="336" y="32" font-size="13" fill="currentColor" text-anchor="end">goes out</text>
<text x="200" y="176" font-size="13" fill="currentColor" text-anchor="middle">wall</text>
</svg><figcaption>A wave bouncing off a wall. The two yellow angles are the same.</figcaption></figure>
<p>Bending is more fun. Imagine a marching band walking at a slant from a hard car park onto a muddy field. The players who reach the mud first slow down, while those still on hard ground keep marching fast. So the whole line swings round and changes direction. Waves do exactly this when they go from a fast place into a slow place, like light going from air into water or glass. The wave turns to head more "straight in". This turning is called <b>refraction</b>.</p>
<p>Going the other way, from slow to fast, the wave turns away from straight. If it arrives at too much of a slant, it cannot get out at all and bounces back inside. That is how light stays trapped inside the thin glass threads of internet cables.</p>
<div class="home"><b>Try it at home:</b> Put a pencil in a glass of water and look from the side. The pencil seems to break at the water surface, because the light from the underwater part bends as it comes out into the air.</div>
<div class="fact"><b>Fun fact:</b> Waves on a beach nearly always arrive almost straight on to the shore, even when the wind blows at a slant. Water waves travel more slowly in shallow water, so as they come in, they bend round to face the beach.</div>`,
        },
        {
          level: "school",
          html: `
<p>Angles are measured from the <b>normal</b>, the line at right angles to the surface.</p>
<p><b>Law of reflection:</b> angle of incidence = angle of reflection, with the two rays on opposite sides of the normal.</p>
<p><b>Refraction:</b> the refractive index is n = c<sub>0</sub> / v (speed in empty space divided by speed in the material). Snell's law:</p>
<p class="formula">n<sub>1</sub> · sin θ<sub>1</sub> = n<sub>2</sub> · sin θ<sub>2</sub></p>
<p>where n<sub>1</sub> and n<sub>2</sub> are the indices of the two materials, θ<sub>1</sub> is the angle of incidence and θ<sub>2</sub> the angle of refraction.</p>
<h4>Why? Huygens' construction</h4>
<p>A straight wavefront AB arrives at a slant. End A touches the surface first. In the time t that end B needs to travel the distance BD = v<sub>1</sub>t to the surface, the wavelet from A grows only to radius AE = v<sub>2</sub>t in the slower material. The new wavefront is the line DE, touching that wavelet.</p>
<figure class="diagram"><svg viewBox="0 0 400 200" role="img" aria-label="Huygens construction for refraction at a boundary">
<line x1="10" y1="110" x2="390" y2="110" stroke="currentColor" stroke-width="2"/>
<rect x="10" y="110" width="380" height="90" fill="#60a5fa" opacity="0.12"/>
<line x1="120" y1="40" x2="120" y2="185" stroke="currentColor" stroke-dasharray="4 4" opacity="0.6"/>
<line x1="81.4" y1="64" x2="120" y2="110" stroke="currentColor" stroke-width="1.5"/>
<line x1="120" y1="110" x2="213.9" y2="31.2" stroke="#34d399" stroke-width="2.5"/>
<line x1="213.9" y1="31.2" x2="280" y2="110" stroke="#f87171" stroke-width="2.5"/>
<path d="M51.4,110 A68.6,68.6 0 0 0 188.6,110" fill="none" stroke="#60a5fa" stroke-dasharray="4 3"/>
<line x1="120" y1="110" x2="149.4" y2="172" stroke="#f87171" stroke-width="2.5"/>
<line x1="280" y1="110" x2="149.4" y2="172" stroke="#34d399" stroke-width="2.5"/>
<text x="110" y="84" font-size="13" fill="currentColor" text-anchor="middle">θ₁</text>
<text x="131" y="164" font-size="13" fill="currentColor" text-anchor="middle">θ₂</text>
<text x="104" y="126" font-size="13" fill="currentColor">A</text>
<text x="218" y="26" font-size="13" fill="currentColor">B</text>
<text x="286" y="104" font-size="13" fill="currentColor">D</text>
<text x="146" y="190" font-size="13" fill="currentColor">E</text>
<text x="256" y="68" font-size="13" fill="currentColor">v₁t</text>
<text x="150" y="140" font-size="13" fill="currentColor">v₂t</text>
<text x="390" y="60" font-size="12" fill="currentColor" text-anchor="end">medium 1 (fast)</text>
<text x="390" y="160" font-size="12" fill="currentColor" text-anchor="end">medium 2 (slow)</text>
</svg><figcaption>Huygens' construction for refraction. While B travels v₁t to D, the wavelet from A grows only to v₂t. The old wavefront AB and the new one DE are shown in green.</figcaption></figure>
<p>The right-angled triangles ABD and AED share the side AD, so</p>
<p class="formula">sin θ<sub>1</sub> = v<sub>1</sub>t / AD, &nbsp; sin θ<sub>2</sub> = v<sub>2</sub>t / AD &nbsp; ⇒ &nbsp; sin θ<sub>1</sub> / sin θ<sub>2</sub> = v<sub>1</sub> / v<sub>2</sub> = n<sub>2</sub> / n<sub>1</sub></p>
<p>which is Snell's law. For reflection the wavelet grows in the same material at the same speed, so the two triangles are identical and the angles are equal.</p>
<h4>Worked example</h4>
<p>A wave passes from n<sub>1</sub> = 1.0 into glass with n<sub>2</sub> = 1.5 at θ<sub>1</sub> = 30°. Then sin θ<sub>2</sub> = 1.0 × sin 30° / 1.5 = 0.5 / 1.5 ≈ 0.333, so θ<sub>2</sub> ≈ 19.5°. The frequency does not change, so the wavelength shrinks by the factor n: in Wave Dude a 15-cell wave becomes a 10-cell wave inside n = 1.5 glass.</p>
<p>Going from glass back into air, the wave bends away from the normal. Beyond the <b>critical angle</b>, given by sin θ<sub>c</sub> = n<sub>2</sub> / n<sub>1</sub>, there is no refracted wave: <b>total internal reflection</b>. For glass to air, sin θ<sub>c</sub> = 1 / 1.5, so θ<sub>c</sub> ≈ 41.8°.</p>
<p class="aside">The law was written down by Ibn Sahl in Baghdad around 984, and found again by Willebrord Snellius in 1621 and by René Descartes, who published it in 1637.</p>`,
        },
        {
          level: "university",
          html: `
<h4>Phase matching</h4>
<p>At a flat interface y = 0, the incident, reflected and transmitted plane waves must satisfy the boundary conditions at every x and every t. That is only possible if they share ω and the tangential wavenumber k<sub>x</sub>:</p>
<p class="formula">k<sub>1</sub> sin θ<sub>i</sub> = k<sub>1</sub> sin θ<sub>r</sub> = k<sub>2</sub> sin θ<sub>t</sub>, &nbsp; k<sub>j</sub> = n<sub>j</sub> ω / c<sub>0</sub></p>
<p>which gives θ<sub>r</sub> = θ<sub>i</sub> and Snell's law at once. When n<sub>1</sub> sin θ<sub>i</sub> &gt; n<sub>2</sub>, the normal wavenumber in medium 2, √(k<sub>2</sub>² − k<sub>x</sub>²), is imaginary: the transmitted field is evanescent, decaying as e<sup>−κ|y|</sup> with κ = k<sub>0</sub> √(n<sub>1</sub>² sin²θ<sub>i</sub> − n<sub>2</sub>²). The total-internal-reflection experiment shows it.</p>
<h4>Fermat's principle</h4>
<p>Fermat (1662): light follows a path along which the travel time, or equivalently the optical path length L = ∫ n ds, is stationary. Go from A, at height a above the interface, to B, at depth b below it and a horizontal distance D further on, crossing the interface at x:</p>
<p class="formula">L(x) = n<sub>1</sub> √(a² + x²) + n<sub>2</sub> √(b² + (D − x)²)</p>
<p class="formula">dL/dx = n<sub>1</sub> x / √(a² + x²) − n<sub>2</sub> (D − x) / √(b² + (D − x)²) = n<sub>1</sub> sin θ<sub>1</sub> − n<sub>2</sub> sin θ<sub>2</sub> = 0</p>
<p>For reflection, mirror B in the surface: the shortest route from A to the image is a straight line, which meets the surface at equal angles. "Stationary" rather than "least" matters: for some curved mirrors the actual path is a maximum. The wave picture explains why: near a stationary path, neighbouring paths have almost the same phase and add constructively; away from it they cancel.</p>
<h4>How much is reflected</h4>
<p>Written as (n²/c<sub>0</sub>²) u<sub>tt</sub> = ∇²u, the equation the simulator approximates forces both u and ∂u/∂y to be continuous across a jump in n. Matching the three plane waves gives</p>
<p class="formula">r = (n<sub>1</sub> cos θ<sub>1</sub> − n<sub>2</sub> cos θ<sub>2</sub>) / (n<sub>1</sub> cos θ<sub>1</sub> + n<sub>2</sub> cos θ<sub>2</sub>), &nbsp; t = 1 + r</p>
<p>the Fresnel amplitude coefficients for s (TE) polarisation, which is exactly what the scalar field represents (see "The wave equation"). At normal incidence from n = 1 to n = 1.5, r = −0.2: 4% of the power is reflected, with a sign flip. The power transmission is (n<sub>2</sub> cos θ<sub>2</sub> / n<sub>1</sub> cos θ<sub>1</sub>)|t|² = 1.5 × 0.64 = 0.96, and 0.04 + 0.96 = 1. This polarisation has no Brewster angle, so the simulator cannot show one.</p>`,
        },
        {
          level: "research",
          title: "Rays, eikonals and staircases",
          html: `
<p>Geometric optics is the short-wavelength limit. Writing U = A e<sup>ik<sub>0</sub>S</sup> and expanding the Helmholtz equation in powers of 1/k<sub>0</sub>, the leading order gives the eikonal equation |∇S|² = n², whose rays (curves along ∇S) obey d/ds(n dr/ds) = ∇n: the Euler–Lagrange equations of Fermat's principle. The next order gives the transport equation ∇·(A²∇S) = 0, energy conservation along ray tubes. The approximation breaks down at foci and caustics, where diffraction takes over.</p>
<p>Two numerical caveats matter in Wave Dude:</p>
<ul>
<li><b>Staircasing.</b> A slanted interface is a pixel staircase. For wavelengths of many cells it behaves like a smooth interface, but at a few cells per wavelength it scatters and can act like a weak grating. FDTD practice smooths material parameters at the subpixel level to reduce this (Farjadpour et al., 2006).</li>
<li><b>Dispersion differs between media.</b> The slower medium has fewer cells per wavelength, so its numerical dispersion is stronger and the effective index ratio drifts with frequency. At level 120 the exact axial grid wavelengths are 7.35 cells (n = 1) and 4.68 cells (n = 1.5), an effective ratio of 1.57 instead of 1.5. Use low levels when measuring angles with the protractor against Snell's law.</li>
</ul>`,
        },
      ],
      tryIt: [
        { experiment: "refraction", label: "Bending waves: Snell's law" },
        { experiment: "total-internal-reflection", label: "Trapped light: total internal reflection" },
        { experiment: "echoes", label: "Echoes and mirrors" },
      ],
      sources: [
        "R. P. Feynman et al., The Feynman Lectures on Physics, Vol. I, ch. 26 \"Optics: The Principle of Least Time\" — https://www.feynmanlectures.caltech.edu/I_26.html",
        "E. Hecht, Optics, 5th ed. (Pearson, 2017), ch. 4 \"The Propagation of Light\"",
        "M. Born, E. Wolf, Principles of Optics, 7th ed. (Cambridge University Press, 1999), ch. 1 and 3",
        "R. Rashed, A pioneer in anaclastics: Ibn Sahl on burning mirrors and lenses, Isis 81, 464–491 (1990)",
        "A. Farjadpour et al., Improving accuracy by subpixel smoothing in the finite-difference time domain, Optics Letters 31, 2972–2974 (2006)",
      ],
    },
    // ------------------------------------------------------------------ 6
    {
      id: "interference-diffraction",
      title: "Interference and diffraction formulas",
      summary: "Where the bright and dark fringes go: double slits, single slits, gratings, phased arrays and the Fraunhofer integral.",
      sections: [
        {
          level: "kids",
          html: `
<p>Drop two stones into a pond at the same moment, a little apart. Each makes rings of ripples, and the rings cross. Look closely and you will see a pattern like the ribs of a fan: lines where the water hardly moves, with lines of big waves in between.</p>
<figure class="diagram"><svg viewBox="0 0 400 200" role="img" aria-label="Two sets of circular ripples overlapping">
<circle cx="170" cy="100" r="18" fill="none" stroke="#60a5fa" stroke-opacity="0.7" stroke-width="1.5"/><circle cx="170" cy="100" r="36" fill="none" stroke="#60a5fa" stroke-opacity="0.7" stroke-width="1.5"/><circle cx="170" cy="100" r="54" fill="none" stroke="#60a5fa" stroke-opacity="0.7" stroke-width="1.5"/><circle cx="170" cy="100" r="72" fill="none" stroke="#60a5fa" stroke-opacity="0.7" stroke-width="1.5"/><circle cx="170" cy="100" r="90" fill="none" stroke="#60a5fa" stroke-opacity="0.7" stroke-width="1.5"/><circle cx="170" cy="100" r="108" fill="none" stroke="#60a5fa" stroke-opacity="0.7" stroke-width="1.5"/><circle cx="170" cy="100" r="126" fill="none" stroke="#60a5fa" stroke-opacity="0.7" stroke-width="1.5"/><circle cx="170" cy="100" r="144" fill="none" stroke="#60a5fa" stroke-opacity="0.7" stroke-width="1.5"/><circle cx="170" cy="100" r="162" fill="none" stroke="#60a5fa" stroke-opacity="0.7" stroke-width="1.5"/><circle cx="170" cy="100" r="180" fill="none" stroke="#60a5fa" stroke-opacity="0.7" stroke-width="1.5"/><circle cx="170" cy="100" r="198" fill="none" stroke="#60a5fa" stroke-opacity="0.7" stroke-width="1.5"/><circle cx="230" cy="100" r="18" fill="none" stroke="#f87171" stroke-opacity="0.7" stroke-width="1.5"/><circle cx="230" cy="100" r="36" fill="none" stroke="#f87171" stroke-opacity="0.7" stroke-width="1.5"/><circle cx="230" cy="100" r="54" fill="none" stroke="#f87171" stroke-opacity="0.7" stroke-width="1.5"/><circle cx="230" cy="100" r="72" fill="none" stroke="#f87171" stroke-opacity="0.7" stroke-width="1.5"/><circle cx="230" cy="100" r="90" fill="none" stroke="#f87171" stroke-opacity="0.7" stroke-width="1.5"/><circle cx="230" cy="100" r="108" fill="none" stroke="#f87171" stroke-opacity="0.7" stroke-width="1.5"/><circle cx="230" cy="100" r="126" fill="none" stroke="#f87171" stroke-opacity="0.7" stroke-width="1.5"/><circle cx="230" cy="100" r="144" fill="none" stroke="#f87171" stroke-opacity="0.7" stroke-width="1.5"/><circle cx="230" cy="100" r="162" fill="none" stroke="#f87171" stroke-opacity="0.7" stroke-width="1.5"/><circle cx="230" cy="100" r="180" fill="none" stroke="#f87171" stroke-opacity="0.7" stroke-width="1.5"/><circle cx="230" cy="100" r="198" fill="none" stroke="#f87171" stroke-opacity="0.7" stroke-width="1.5"/>
<circle cx="170" cy="100" r="5" fill="#60a5fa"/>
<circle cx="230" cy="100" r="5" fill="#f87171"/>
</svg><figcaption>Ripples from two stones (blue and red). Where the rings cross, crests add up; in between, a crest meets a trough and the water stays calm.</figcaption></figure>
<p>On the calm lines, a crest from one stone always arrives together with a trough from the other, so they cancel. On the wavy lines, crests arrive together and make bigger crests. This is called <b>interference</b>.</p>
<p>Waves also spread out when they pass through a gap or go past an edge. That is called <b>diffraction</b>. The rule is: the narrower the gap compared with the wave, the more it spreads. The sound of your voice has waves from a few centimetres to a few metres long, so it spreads easily through a doorway. Light waves are tiny, about a hundredth of the thickness of a hair, so light goes through a doorway in a straight beam and makes a sharp shadow.</p>
<div class="home"><b>Try it at home:</b> Tilt the shiny side of an old CD or DVD under a lamp. The rainbow colours come from interference: the disc has thousands of tiny, evenly spaced tracks, and each colour adds up best at a different angle.</div>
<div class="fact"><b>Fun fact:</b> In the early 1800s Thomas Young showed that light coming through two narrow openings makes bright and dark stripes, which convinced many scientists that light is a wave. Wave Dude's "double slit" experiment copies his idea.</div>`,
        },
        {
          level: "school",
          html: `
<h4>Double slit</h4>
<p>Two narrow slits a distance d apart, lit by the same wave, act as two sources in phase. Far away, in a direction at angle θ from straight ahead, the wave from one slit has to travel an extra distance d · sin θ. Bright fringes appear where that is a whole number of wavelengths:</p>
<p class="formula">d · sin θ = m · λ &nbsp; (m = 0, ±1, ±2, …)</p>
<figure class="diagram"><svg viewBox="0 0 400 200" role="img" aria-label="Two slits, two parallel rays at angle theta, and the extra path d sin theta">
<line x1="60" y1="0" x2="60" y2="95" stroke="currentColor" stroke-width="4"/>
<line x1="60" y1="105" x2="60" y2="175" stroke="currentColor" stroke-width="4"/>
<line x1="60" y1="185" x2="60" y2="200" stroke="currentColor" stroke-width="4"/>
<line x1="60" y1="140" x2="390" y2="140" stroke="currentColor" stroke-dasharray="4 4" opacity="0.5"/>
<line x1="60" y1="100" x2="330" y2="2" stroke="#60a5fa" stroke-width="2"/>
<line x1="60" y1="180" x2="330" y2="82" stroke="#60a5fa" stroke-width="2"/>
<line x1="60" y1="100" x2="85.7" y2="170.6" stroke="currentColor" stroke-dasharray="3 3"/>
<line x1="60" y1="180" x2="85.7" y2="170.6" stroke="#f87171" stroke-width="4"/>
<path d="M100,180 A40,40 0 0 0 97.6,166.3" fill="none" stroke="#fbbf24" stroke-width="2"/>
<text x="106" y="178" font-size="13" fill="currentColor">θ</text>
<text x="48" y="145" font-size="13" fill="currentColor" text-anchor="end">d</text>
<text x="92" y="196" font-size="12" fill="currentColor">extra path = d · sin θ</text>
<text x="250" y="132" font-size="12" fill="currentColor">straight ahead</text>
</svg><figcaption>Rays from two slits towards a distant point. The lower ray travels the extra red distance d · sin θ.</figcaption></figure>
<p>Here d is the slit separation, θ the angle from straight ahead, m the <b>order</b> of the fringe and λ the wavelength. On a screen at distance L, for small angles, neighbouring bright fringes are Δy ≈ λL / d apart.</p>
<p>Example (laser): λ = 633 nm, d = 0.25 mm and L = 2.0 m give Δy = 633 × 10⁻⁹ × 2.0 / (0.25 × 10⁻³) ≈ 5.1 mm.</p>
<p>Example (Wave Dude): λ = 15 cells and d = 60 cells give sin θ<sub>1</sub> = 15/60 = 0.25, so θ<sub>1</sub> ≈ 14.5°; sin θ<sub>2</sub> = 0.5, so θ<sub>2</sub> = 30°. The highest possible order is m = 4, where sin θ = 1 and the fringe runs along the wall.</p>
<h4>Single slit</h4>
<p>For one slit of width a, pair each point in the top half of the slit with the point a/2 below it. When a · sin θ = λ, every pair differs in path by λ/2 and cancels: the first <b>dark</b> fringe. Dark fringes lie at</p>
<p class="formula">a · sin θ = m · λ &nbsp; (m = ±1, ±2, …)</p>
<p>and the central bright band is twice as wide as the others. Example: a = 30 cells and λ = 15 cells give the first dark fringe at sin θ = 0.5, θ = 30°. Halve the gap to 15 cells and sin θ = 1: the wave fills the whole space behind the wall.</p>
<h4>Gratings</h4>
<p>Many slits with spacing d give bright peaks at the same angles, d · sin θ = m · λ, but much sharper and brighter. A CD has a track spacing of 1.6 µm, so green light (λ = 530 nm) comes off in first order at sin θ = 0.53 / 1.6 ≈ 0.33, θ ≈ 19°.</p>`,
        },
        {
          level: "university",
          html: `
<h4>The Fraunhofer integral</h4>
<p>Far from an aperture (distance R ≫ a²/λ, the Fraunhofer condition), the distance from aperture point x to a far point in direction θ is r ≈ R − x sin θ. Inserting this into the Huygens–Fresnel integral and taking the slowly varying factors outside:</p>
<p class="formula">U(θ) ∝ ∫ A(x) e<sup>−ikx sin θ</sup> dx</p>
<p>The far field is the Fourier transform of the aperture function A(x), evaluated at spatial frequency sin θ / λ. Everything below follows from it.</p>
<p><b>Single slit</b> (A = 1 for |x| &lt; a/2):</p>
<p class="formula">I(θ) = I<sub>0</sub> (sin β / β)², &nbsp; β = π a sin θ / λ</p>
<p>with zeros at a sin θ = mλ (m ≠ 0) and side lobes of about 4.7% and 1.6% of the central peak.</p>
<p><b>N slits</b> of width a and spacing d (a slit convolved with a comb, so the transforms multiply):</p>
<p class="formula">I(θ) = I<sub>0</sub> (sin β / β)² [ sin(Nα) / (N sin α) ]², &nbsp; α = π d sin θ / λ</p>
<p>For N = 2 the bracket is cos²α: double-slit fringes under the single-slit envelope. An order disappears where a fringe maximum falls on an envelope zero; with d = 4a the orders m = ±4 are missing. Principal maxima have an angular half-width Δθ ≈ λ / (N d cos θ), and the resolving power is λ/Δλ = mN.</p>
<figure class="diagram"><svg viewBox="0 0 400 160" role="img" aria-label="Double slit intensity pattern under the single-slit envelope">
<line x1="20" y1="140" x2="380" y2="140" stroke="currentColor" opacity="0.6"/>
<path d="M20.0,138.9 L22.0,139.1 L24.0,139.2 L26.0,139.4 L28.0,139.5 L30.0,139.6 L32.0,139.8 L34.0,139.9 L36.0,139.9 L38.0,140.0 L40.0,140.0 L42.0,140.0 L44.0,139.9 L46.0,139.8 L48.0,139.7 L50.0,139.5 L52.0,139.3 L54.0,139.1 L56.0,138.8 L58.0,138.5 L60.0,138.2 L62.0,137.8 L64.0,137.5 L66.0,137.1 L68.0,136.7 L70.0,136.4 L72.0,136.1 L74.0,135.8 L76.0,135.5 L78.0,135.2 L80.0,135.0 L82.0,134.9 L84.0,134.8 L86.0,134.8 L88.0,134.9 L90.0,135.0 L92.0,135.1 L94.0,135.4 L96.0,135.7 L98.0,136.0 L100.0,136.4 L102.0,136.9 L104.0,137.3 L106.0,137.8 L108.0,138.3 L110.0,138.7 L112.0,139.1 L114.0,139.5 L116.0,139.8 L118.0,139.9 L120.0,140.0 L122.0,139.9 L124.0,139.7 L126.0,139.3 L128.0,138.7 L130.0,137.9 L132.0,136.8 L134.0,135.5 L136.0,134.0 L138.0,132.2 L140.0,130.1 L142.0,127.7 L144.0,125.1 L146.0,122.2 L148.0,119.1 L150.0,115.6 L152.0,112.0 L154.0,108.1 L156.0,104.1 L158.0,99.8 L160.0,95.4 L162.0,90.9 L164.0,86.3 L166.0,81.7 L168.0,77.0 L170.0,72.4 L172.0,67.8 L174.0,63.3 L176.0,58.9 L178.0,54.8 L180.0,50.8 L182.0,47.1 L184.0,43.7 L186.0,40.6 L188.0,37.9 L190.0,35.5 L192.0,33.6 L194.0,32.0 L196.0,30.9 L198.0,30.2 L200.0,30.0 L202.0,30.2 L204.0,30.9 L206.0,32.0 L208.0,33.6 L210.0,35.5 L212.0,37.9 L214.0,40.6 L216.0,43.7 L218.0,47.1 L220.0,50.8 L222.0,54.8 L224.0,58.9 L226.0,63.3 L228.0,67.8 L230.0,72.4 L232.0,77.0 L234.0,81.7 L236.0,86.3 L238.0,90.9 L240.0,95.4 L242.0,99.8 L244.0,104.1 L246.0,108.1 L248.0,112.0 L250.0,115.6 L252.0,119.1 L254.0,122.2 L256.0,125.1 L258.0,127.7 L260.0,130.1 L262.0,132.2 L264.0,134.0 L266.0,135.5 L268.0,136.8 L270.0,137.9 L272.0,138.7 L274.0,139.3 L276.0,139.7 L278.0,139.9 L280.0,140.0 L282.0,139.9 L284.0,139.8 L286.0,139.5 L288.0,139.1 L290.0,138.7 L292.0,138.3 L294.0,137.8 L296.0,137.3 L298.0,136.9 L300.0,136.4 L302.0,136.0 L304.0,135.7 L306.0,135.4 L308.0,135.1 L310.0,135.0 L312.0,134.9 L314.0,134.8 L316.0,134.8 L318.0,134.9 L320.0,135.0 L322.0,135.2 L324.0,135.5 L326.0,135.8 L328.0,136.1 L330.0,136.4 L332.0,136.7 L334.0,137.1 L336.0,137.5 L338.0,137.8 L340.0,138.2 L342.0,138.5 L344.0,138.8 L346.0,139.1 L348.0,139.3 L350.0,139.5 L352.0,139.7 L354.0,139.8 L356.0,139.9 L358.0,140.0 L360.0,140.0 L362.0,140.0 L364.0,139.9 L366.0,139.9 L368.0,139.8 L370.0,139.6 L372.0,139.5 L374.0,139.4 L376.0,139.2 L378.0,139.1 L380.0,138.9" fill="none" stroke="#fbbf24" stroke-dasharray="4 3" stroke-width="1.5"/>
<path d="M20.0,138.9 L21.0,139.0 L22.0,139.1 L23.0,139.3 L24.0,139.5 L25.0,139.6 L26.0,139.8 L27.0,139.9 L28.0,140.0 L29.0,140.0 L30.0,140.0 L31.0,140.0 L32.0,140.0 L33.0,140.0 L34.0,140.0 L35.0,140.0 L36.0,140.0 L37.0,140.0 L38.0,140.0 L39.0,140.0 L40.0,140.0 L41.0,140.0 L42.0,140.0 L43.0,140.0 L44.0,140.0 L45.0,139.9 L46.0,139.9 L47.0,140.0 L48.0,140.0 L49.0,140.0 L50.0,140.0 L51.0,140.0 L52.0,139.9 L53.0,139.8 L54.0,139.7 L55.0,139.5 L56.0,139.2 L57.0,138.9 L58.0,138.7 L59.0,138.4 L60.0,138.2 L61.0,138.1 L62.0,138.0 L63.0,138.1 L64.0,138.3 L65.0,138.6 L66.0,139.0 L67.0,139.4 L68.0,139.7 L69.0,139.9 L70.0,140.0 L71.0,139.9 L72.0,139.6 L73.0,139.2 L74.0,138.5 L75.0,137.8 L76.0,137.0 L77.0,136.3 L78.0,135.7 L79.0,135.3 L80.0,135.0 L81.0,135.1 L82.0,135.4 L83.0,135.9 L84.0,136.6 L85.0,137.4 L86.0,138.2 L87.0,138.9 L88.0,139.5 L89.0,139.9 L90.0,140.0 L91.0,139.9 L92.0,139.5 L93.0,139.0 L94.0,138.4 L95.0,137.8 L96.0,137.2 L97.0,136.7 L98.0,136.4 L99.0,136.3 L100.0,136.4 L101.0,136.7 L102.0,137.2 L103.0,137.7 L104.0,138.2 L105.0,138.8 L106.0,139.2 L107.0,139.6 L108.0,139.8 L109.0,140.0 L110.0,140.0 L111.0,140.0 L112.0,139.9 L113.0,139.9 L114.0,139.8 L115.0,139.8 L116.0,139.8 L117.0,139.9 L118.0,139.9 L119.0,140.0 L120.0,140.0 L121.0,140.0 L122.0,139.9 L123.0,139.9 L124.0,139.8 L125.0,139.8 L126.0,139.8 L127.0,139.8 L128.0,139.9 L129.0,140.0 L130.0,140.0 L131.0,139.9 L132.0,139.7 L133.0,139.2 L134.0,138.5 L135.0,137.4 L136.0,136.1 L137.0,134.5 L138.0,132.9 L139.0,131.4 L140.0,130.1 L141.0,129.2 L142.0,128.9 L143.0,129.3 L144.0,130.3 L145.0,131.8 L146.0,133.9 L147.0,136.0 L148.0,138.0 L149.0,139.4 L150.0,140.0 L151.0,139.4 L152.0,137.3 L153.0,133.8 L154.0,129.0 L155.0,123.1 L156.0,116.5 L157.0,109.8 L158.0,103.6 L159.0,98.7 L160.0,95.4 L161.0,94.3 L162.0,95.6 L163.0,99.2 L164.0,104.9 L165.0,112.0 L166.0,119.8 L167.0,127.5 L168.0,134.0 L169.0,138.4 L170.0,140.0 L171.0,138.3 L172.0,133.1 L173.0,124.6 L174.0,113.5 L175.0,100.5 L176.0,87.0 L177.0,74.0 L178.0,62.9 L179.0,54.9 L180.0,50.8 L181.0,51.2 L182.0,56.0 L183.0,64.9 L184.0,77.0 L185.0,91.1 L186.0,105.7 L187.0,119.2 L188.0,130.3 L189.0,137.5 L190.0,140.0 L191.0,137.4 L192.0,129.8 L193.0,117.9 L194.0,102.7 L195.0,85.7 L196.0,68.6 L197.0,53.1 L198.0,40.7 L199.0,32.7 L200.0,30.0 L201.0,32.7 L202.0,40.7 L203.0,53.1 L204.0,68.6 L205.0,85.7 L206.0,102.7 L207.0,117.9 L208.0,129.8 L209.0,137.4 L210.0,140.0 L211.0,137.5 L212.0,130.3 L213.0,119.2 L214.0,105.7 L215.0,91.1 L216.0,77.0 L217.0,64.9 L218.0,56.0 L219.0,51.2 L220.0,50.8 L221.0,54.9 L222.0,62.9 L223.0,74.0 L224.0,87.0 L225.0,100.5 L226.0,113.5 L227.0,124.6 L228.0,133.1 L229.0,138.3 L230.0,140.0 L231.0,138.4 L232.0,134.0 L233.0,127.5 L234.0,119.8 L235.0,112.0 L236.0,104.9 L237.0,99.2 L238.0,95.6 L239.0,94.3 L240.0,95.4 L241.0,98.7 L242.0,103.6 L243.0,109.8 L244.0,116.5 L245.0,123.1 L246.0,129.0 L247.0,133.8 L248.0,137.3 L249.0,139.4 L250.0,140.0 L251.0,139.4 L252.0,138.0 L253.0,136.0 L254.0,133.9 L255.0,131.8 L256.0,130.3 L257.0,129.3 L258.0,128.9 L259.0,129.2 L260.0,130.1 L261.0,131.4 L262.0,132.9 L263.0,134.5 L264.0,136.1 L265.0,137.4 L266.0,138.5 L267.0,139.2 L268.0,139.7 L269.0,139.9 L270.0,140.0 L271.0,140.0 L272.0,139.9 L273.0,139.8 L274.0,139.8 L275.0,139.8 L276.0,139.8 L277.0,139.9 L278.0,139.9 L279.0,140.0 L280.0,140.0 L281.0,140.0 L282.0,139.9 L283.0,139.9 L284.0,139.8 L285.0,139.8 L286.0,139.8 L287.0,139.9 L288.0,139.9 L289.0,140.0 L290.0,140.0 L291.0,140.0 L292.0,139.8 L293.0,139.6 L294.0,139.2 L295.0,138.8 L296.0,138.2 L297.0,137.7 L298.0,137.2 L299.0,136.7 L300.0,136.4 L301.0,136.3 L302.0,136.4 L303.0,136.7 L304.0,137.2 L305.0,137.8 L306.0,138.4 L307.0,139.0 L308.0,139.5 L309.0,139.9 L310.0,140.0 L311.0,139.9 L312.0,139.5 L313.0,138.9 L314.0,138.2 L315.0,137.4 L316.0,136.6 L317.0,135.9 L318.0,135.4 L319.0,135.1 L320.0,135.0 L321.0,135.3 L322.0,135.7 L323.0,136.3 L324.0,137.0 L325.0,137.8 L326.0,138.5 L327.0,139.2 L328.0,139.6 L329.0,139.9 L330.0,140.0 L331.0,139.9 L332.0,139.7 L333.0,139.4 L334.0,139.0 L335.0,138.6 L336.0,138.3 L337.0,138.1 L338.0,138.0 L339.0,138.1 L340.0,138.2 L341.0,138.4 L342.0,138.7 L343.0,138.9 L344.0,139.2 L345.0,139.5 L346.0,139.7 L347.0,139.8 L348.0,139.9 L349.0,140.0 L350.0,140.0 L351.0,140.0 L352.0,140.0 L353.0,140.0 L354.0,139.9 L355.0,139.9 L356.0,140.0 L357.0,140.0 L358.0,140.0 L359.0,140.0 L360.0,140.0 L361.0,140.0 L362.0,140.0 L363.0,140.0 L364.0,140.0 L365.0,140.0 L366.0,140.0 L367.0,140.0 L368.0,140.0 L369.0,140.0 L370.0,140.0 L371.0,140.0 L372.0,140.0 L373.0,139.9 L374.0,139.8 L375.0,139.6 L376.0,139.5 L377.0,139.3 L378.0,139.1 L379.0,139.0 L380.0,138.9" fill="none" stroke="#c084fc" stroke-width="2"/>
<text x="200" y="156" font-size="12" fill="currentColor" text-anchor="middle">sin θ →</text>
<text x="368" y="130" font-size="12" fill="currentColor" text-anchor="end">I(θ)</text>
</svg><figcaption>Double slit with d = 4a: cos² fringes (violet) under the single-slit envelope (dashed). The fourth orders fall on the envelope zeros and are missing.</figcaption></figure>
<h4>Phased arrays</h4>
<p>Drive N sources at spacing d with a phase step Δφ from one to the next. Then α = π d sin θ / λ − Δφ/2, and the main beam swings to the angle θ<sub>0</sub> with</p>
<p class="formula">sin θ<sub>0</sub> = Δφ λ / (2π d)</p>
<p>(towards the side of the lagging sources). Grating lobes, the other principal maxima, sit at sin θ = sin θ<sub>0</sub> + mλ/d, and none is visible while d/λ &lt; 1/(1 + |sin θ<sub>0</sub>|). Example: λ = 15 cells, d = 7 cells, Δφ = 60° = π/3 give sin θ<sub>0</sub> = (1/6)(15/7) ≈ 0.357, θ<sub>0</sub> ≈ 20.9°; d/λ ≈ 0.47 &lt; 0.74, so there are no grating lobes. Space the sources one wavelength apart with the same step and sin θ<sub>0</sub> = 1/6, but a grating lobe appears at sin θ = 1/6 − 1 ≈ −0.83, θ ≈ −56°.</p>
<h4>Two dimensions</h4>
<p>In Wave Dude a slit is a gap in a line in a 2D plane, which is exactly the geometry of these one-dimensional aperture integrals (in 3D they describe long slits). With 2D wavelets every far-field intensity above also falls as 1/R. The Fraunhofer condition matters in practice: with d = 60 cells and λ = 15 cells, R must be well beyond d²/λ = 240 cells. Closer in you see the Fresnel (near-field) pattern instead, which is often what a small scene shows.</p>`,
        },
        {
          level: "research",
          title: "Beyond Fraunhofer",
          html: `
<p>When the Fresnel number N<sub>F</sub> = a²/(λR) is not small, the quadratic phase must be kept: U(x) ∝ ∫ A(x′) exp[ik(x − x′)²/(2R)] dx′, which leads to Fresnel integrals and the Cornu spiral for straight edges. A full-wave simulation contains all regimes at once (near field, Fresnel and Fraunhofer) and can therefore test the approximations instead of relying on them.</p>
<ul>
<li><b>Real screens.</b> Thick screens, conducting edges and polarisation-dependent transmission through sub-wavelength slits lie outside a scalar model; Wave Dude's walls and absorbers are idealised. Babinet's principle (complementary screens give the same Fraunhofer pattern away from θ = 0) can be tested with the wall tool.</li>
<li><b>Gratings.</b> Practical gratings use blazing to put light into one order, and periodic ruling errors produce spurious "ghost" lines.</li>
<li><b>Phased arrays.</b> Real antenna arrays must deal with element patterns, mutual coupling, quantised phase shifters and scan blindness (Mailloux). The simulator's sources are idealised points, though their soft coupling to the field does add a weak element-to-element interaction.</li>
<li><b>Grid accuracy.</b> Numerical dispersion shortens λ on the grid by about 1% at 10 cells per wavelength and more at fewer cells, which shifts fringe angles. Compare measured angles with d sin θ = mλ using the wavelength you measure with the ruler, not the long-wave formula.</li>
</ul>`,
        },
      ],
      tryIt: [
        { experiment: "double-slit", label: "The double slit" },
        { experiment: "single-slit", label: "One gap: how waves spread" },
        { experiment: "phased-array", label: "Steering a beam with a phased array" },
      ],
      sources: [
        "R. P. Feynman et al., The Feynman Lectures on Physics, Vol. I, ch. 29 \"Interference\" and ch. 30 \"Diffraction\" — https://www.feynmanlectures.caltech.edu/I_30.html",
        "E. Hecht, Optics, 5th ed. (Pearson, 2017), ch. 9 \"Interference\" and ch. 10 \"Diffraction\"",
        "J. W. Goodman, Introduction to Fourier Optics, 3rd ed. (Roberts & Company, 2005), ch. 4",
        "T. Young, The Bakerian Lecture: Experiments and calculations relative to physical optics, Philosophical Transactions of the Royal Society 94, 1–16 (1804)",
        "R. J. Mailloux, Phased Array Antenna Handbook, 2nd ed. (Artech House, 2005)",
      ],
    },
    // ------------------------------------------------------------------ 7
    {
      id: "energy-intensity",
      title: "Energy and intensity",
      summary: "What a wave carries, why intensity goes as amplitude squared, and why waves fade as they spread: 1/r in Wave Dude's 2D world, 1/r² in 3D.",
      sections: [
        {
          level: "kids",
          html: `
<p>A wave carries <b>energy</b>: the power to make things move. The water in a pond does not travel to the shore, but the energy does. That is why ripples from a stone can rock a toy boat on the far side.</p>
<p>Bigger waves carry much more energy. A wave twice as tall carries four times as much energy. Three times as tall: nine times as much! That is because a taller wave moves the water both further and faster.</p>
<p>As a ripple spreads out in a ring, the ring gets longer and longer, but there is no more energy than there was at the start. The same energy is shared out along a longer ring, so each part gets less and the wave gets smaller. It is like spreading the same bit of butter over a bigger and bigger slice of toast.</p>
<figure class="diagram"><svg viewBox="0 0 400 200" role="img" aria-label="Three rings around a source, each carrying the same number of energy dots, spaced further apart on bigger rings">
<circle cx="100" cy="100" r="25" fill="none" stroke="#60a5fa" stroke-width="1.5"/><circle cx="124.5" cy="105.0" r="4" fill="#fbbf24"/><circle cx="113.8" cy="120.8" r="4" fill="#fbbf24"/><circle cx="95.0" cy="124.5" r="4" fill="#fbbf24"/><circle cx="79.2" cy="113.8" r="4" fill="#fbbf24"/><circle cx="75.5" cy="95.0" r="4" fill="#fbbf24"/><circle cx="86.2" cy="79.2" r="4" fill="#fbbf24"/><circle cx="105.0" cy="75.5" r="4" fill="#fbbf24"/><circle cx="120.8" cy="86.2" r="4" fill="#fbbf24"/><circle cx="100" cy="100" r="50" fill="none" stroke="#60a5fa" stroke-width="1.5"/><circle cx="149.0" cy="109.9" r="4" fill="#fbbf24"/><circle cx="127.6" cy="141.7" r="4" fill="#fbbf24"/><circle cx="90.1" cy="149.0" r="4" fill="#fbbf24"/><circle cx="58.3" cy="127.6" r="4" fill="#fbbf24"/><circle cx="51.0" cy="90.1" r="4" fill="#fbbf24"/><circle cx="72.4" cy="58.3" r="4" fill="#fbbf24"/><circle cx="109.9" cy="51.0" r="4" fill="#fbbf24"/><circle cx="141.7" cy="72.4" r="4" fill="#fbbf24"/><circle cx="100" cy="100" r="85" fill="none" stroke="#60a5fa" stroke-width="1.5"/><circle cx="183.3" cy="116.9" r="4" fill="#fbbf24"/><circle cx="147.0" cy="170.8" r="4" fill="#fbbf24"/><circle cx="83.1" cy="183.3" r="4" fill="#fbbf24"/><circle cx="29.2" cy="147.0" r="4" fill="#fbbf24"/><circle cx="16.7" cy="83.1" r="4" fill="#fbbf24"/><circle cx="53.0" cy="29.2" r="4" fill="#fbbf24"/><circle cx="116.9" cy="16.7" r="4" fill="#fbbf24"/><circle cx="170.8" cy="53.0" r="4" fill="#fbbf24"/>
<circle cx="100" cy="100" r="5" fill="#f87171"/>
<text x="210" y="70" font-size="13" fill="currentColor">Every ring carries the same</text>
<text x="210" y="88" font-size="13" fill="currentColor">8 bits of energy (yellow).</text>
<text x="210" y="118" font-size="13" fill="currentColor">On a bigger ring they are</text>
<text x="210" y="136" font-size="13" fill="currentColor">spread further apart.</text>
</svg><figcaption>A ripple's energy spreads out as its ring grows, so each part of the ring gets less.</figcaption></figure>
<div class="home"><b>Try it at home:</b> In a dark room, shine a torch straight at a wall from close up, then step back slowly. The patch of light gets bigger and dimmer: the same light is spread over a bigger area.</div>
<div class="fact"><b>Fun fact:</b> Your ears cope with an enormous range. A sound loud enough to hurt carries about a million million times more energy each second than the faintest sound you can hear.</div>`,
        },
        {
          level: "school",
          html: `
<p><b>Intensity</b> is the power a wave carries through each square metre facing it (W/m²). For a wave of a given frequency,</p>
<p class="formula">intensity ∝ amplitude²</p>
<p>Double the amplitude and the intensity goes up four times. The reason: the energy of something oscillating is like the kinetic energy ½mv², and the speed it moves at is proportional to the amplitude.</p>
<h4>Spreading out</h4>
<p>A small source sends out a power P equally in all directions. Far away, all of that power passes through a surface around the source:</p>
<ul>
<li>In 3D the surface is a sphere of area 4πr², so I = P / (4πr²). Double the distance and the intensity drops to a quarter, the amplitude to a half. This is the <b>inverse-square law</b>.</li>
<li>In 2D, like Wave Dude or ripples on a pond, the power passes through a circle of length 2πr, so I = P / (2πr). Double the distance and the intensity halves, while the amplitude drops by √2 ≈ 1.41. The amplitude falls as 1/√r.</li>
</ul>
<p>Example (3D): a small loudspeaker radiating 0.1 W of sound evenly. At 2 m, I = 0.1 / (4π × 2²) ≈ 2.0 × 10⁻³ W/m²; at 4 m, I ≈ 5.0 × 10⁻⁴ W/m², a quarter as much.</p>
<p>Example (Wave Dude): suppose a probe shows an amplitude of 0.20 at 25 cells from a point source. At 100 cells, four times as far, expect 0.20 / √4 = 0.10, and a quarter of the intensity. (Within about a wavelength of the source this rule does not hold yet.)</p>
<p>In decibels, the level of a sound in 3D drops by 6 dB every time the distance doubles; in a 2D world it would drop by only 3 dB.</p>
<p>Wave Dude's <b>intensity view</b> averages u² over time, so brightness means "a lot of energy flowing here on average", which is what your eye or a light meter would register, rather than the fast-moving crests.</p>`,
        },
        {
          level: "university",
          html: `
<h4>Energy of a string</h4>
<p>A string carries kinetic energy ½μu<sub>t</sub>² and stretching (potential) energy ½Tu<sub>x</sub>² per unit length. The energy density and energy flux are</p>
<p class="formula">e = ½ μ u<sub>t</sub>² + ½ T u<sub>x</sub>², &nbsp;&nbsp; P = −T u<sub>x</sub> u<sub>t</sub></p>
<p>With the wave equation, ∂e/∂t = μu<sub>t</sub>u<sub>tt</sub> + Tu<sub>x</sub>u<sub>xt</sub> = T(u<sub>t</sub>u<sub>xx</sub> + u<sub>x</sub>u<sub>xt</sub>) = ∂(T u<sub>x</sub> u<sub>t</sub>)/∂x, so ∂e/∂t + ∂P/∂x = 0: energy is conserved locally. For u = A cos(kx − ωt) the averages are</p>
<p class="formula">⟨e⟩ = ½ μ ω² A², &nbsp;&nbsp; ⟨P⟩ = ⟨e⟩ c = ½ Z ω² A², &nbsp; Z = √(Tμ) = μc</p>
<p>with kinetic and potential energy equal on average; Z is the impedance. Intensity is proportional to ω²A². The membrane is the same with e = ½σu<sub>t</sub>² + ½T|∇u|² and flux vector <b>S</b> = −T u<sub>t</sub> ∇u.</p>
<h4>Cylindrical spreading</h4>
<p>A time-harmonic point source in 2D radiates U ∝ H<sub>0</sub><sup>(1)</sup>(kr), with</p>
<p class="formula">H<sub>0</sub><sup>(1)</sup>(kr) ≈ √(2/(πkr)) e<sup>i(kr − π/4)</sup>, &nbsp; kr ≫ 1</p>
<p>so |U| ∝ 1/√r and the flux through a circle, ∝ |U|² · 2πr, does not depend on r. Near the source H<sub>0</sub> diverges logarithmically and the 1/√r law fails; the leading correction to the asymptotic form is of relative size about 1/(8kr), roughly 2% at one wavelength from the source.</p>
<h4>What the intensity view computes</h4>
<p>s<sub>1</sub> ← αs<sub>1</sub> + (1 − α)u², s<sub>2</sub> ← αs<sub>2</sub> + (1 − α)s<sub>1</sub>, I = (s<sub>1</sub> + s<sub>2</sub>)/2, with α = e<sup>−1/τ</sup>. Each stage is a discrete low-pass filter with time constant τ steps. For a steady sinusoid both stages converge to ⟨u²⟩ = A²/2, and the cascade suppresses the 2ω ripple of u². The display shows √I, which is proportional to the local amplitude, so the brightness of a 2D point source's intensity image falls as 1/√r.</p>`,
        },
        {
          level: "research",
          title: "Energy on the grid",
          html: `
<p>The leapfrog scheme conserves a discrete energy exactly (in exact arithmetic). Multiply u<sub>i</sub><sup>n+1</sup> − 2u<sub>i</sub><sup>n</sup> + u<sub>i</sub><sup>n−1</sup> = c<sub>i</sub>² (Ku<sup>n</sup>)<sub>i</sub> by (u<sub>i</sub><sup>n+1</sup> − u<sub>i</sub><sup>n−1</sup>)/c<sub>i</sub>² and sum over cells. Because K is symmetric, the right-hand side telescopes, and with n<sub>i</sub>² = 1/c<sub>i</sub>²</p>
<p class="formula">E<sup>n+½</sup> = Σ<sub>i</sub> n<sub>i</sub>² (u<sub>i</sub><sup>n+1</sup> − u<sub>i</sub><sup>n</sup>)² − Σ<sub>i</sub> u<sub>i</sub><sup>n+1</sup> (Ku<sup>n</sup>)<sub>i</sub></p>
<p>is constant when d = 1 everywhere and no source is driven. For uniform n it is positive, and so a genuine energy, exactly when the stability condition c²κ ≤ 4 holds for every mode. The scheme is therefore non-dissipative but dispersive: pulses change shape, but energy is not lost.</p>
<p><b>Damping.</b> With d &lt; 1 the update is u<sup>n+1</sup> − u<sup>n</sup> = d(u<sup>n</sup> − u<sup>n−1</sup>) + c²Ku<sup>n</sup>. In a uniform region every spatial Fourier mode (stencil eigenvalue −κ) obeys z² − (1 + d − c²κ)z + d = 0. Whenever the mode oscillates (complex roots), |z|² = d exactly: the amplitude shrinks by √d per step and the energy by d, whatever the frequency. The absorbing edge grades d = √(i/thickness) over its width because an abrupt change of d reflects, just as an abrupt change of n does; the measured edge reflections (about 6% for a 16-cell edge, 2% for 64 cells and 1% for 128 cells at λ ≈ 15 cells) show what is left of that mismatch. Perfectly matched layers (Bérenger, 1994) are the standard way to do much better.</p>
<p><b>Limits.</b> Real media absorb in a frequency-dependent way, and in 3D energy spreads as 1/r². Wave Dude's 2D world fades more slowly with distance than real 3D sound or light, and its cylindrical waves leave a tail behind each pulse (see "Huygens' principle").</p>`,
        },
      ],
      tryIt: [
        { experiment: "splash", label: "Splash! Making waves" },
        { experiment: "double-slit", label: "The double slit" },
        { experiment: "absorbing-edge", label: "How good is the absorbing edge?" },
      ],
      sources: [
        "F. S. Crawford, Waves (Berkeley Physics Course Vol. 3, McGraw-Hill, 1968), ch. 4 (energy and impedance)",
        "D. Halliday, R. Resnick, J. Walker, Fundamentals of Physics (Wiley), chapters on waves and sound",
        "NIST Digital Library of Mathematical Functions, §10.17 Asymptotic expansions of Hankel functions — https://dlmf.nist.gov/10.17",
        "J.-P. Bérenger, A perfectly matched layer for the absorption of electromagnetic waves, Journal of Computational Physics 114, 185–200 (1994)",
        "A. Taflove, S. C. Hagness, Computational Electrodynamics: The Finite-Difference Time-Domain Method, 3rd ed. (Artech House, 2005)",
      ],
    },
  ],
};
