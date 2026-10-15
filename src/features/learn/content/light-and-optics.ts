// Wave Dude 2D web - "How it works" library: light and optics (is light a wave, wave or particle, lenses, mirrors,
// total internal reflection and fibres, colour and rainbows, resolution, polarization).
// GPL-3.0-or-later.

import type { LearnCategory } from "../types";

export const category: LearnCategory = {
  id: "light-and-optics",
  title: "Light and optics",
  icon: "🔦",
  blurb: "Light is a wave too: how we found out, and how lenses, mirrors, optical fibres, prisms, rainbows and microscopes all follow from it, plus the one thing about light the simulator cannot show.",
  pages: [
    // ------------------------------------------------------------------ is light a wave?
    {
      id: "is-light-a-wave",
      title: "Is light a wave?",
      summary: "Three hundred years of argument, from Newton's particles and Huygens' wavelets to Young's fringes, Maxwell's equations and the photon.",
      sections: [
        {
          level: "kids",
          html: `
<p>What <i>is</i> light? People argued about this for a very long time. One idea was that light is a stream of tiny, fast bullets. Another idea was that light is a <b>wave</b>, like the ripples on a pond.</p>
<p>How can you tell? Here is a clever test. Shine light through two very thin slits that sit close together. If light were bullets, you would see two bright lines on the wall behind, one for each slit. But that is not what happens. You see <b>many</b> stripes: bright, dark, bright, dark.</p>
<p>That is exactly what water waves do when two pebbles drop at once. Where a hill from one slit meets a hill from the other, you get extra bright light. Where a hill meets a valley, they cancel and it goes dark. Only waves can cancel each other like that. An English scientist called Thomas Young did experiments like this a little over 200 years ago.</p>
<p>Then came a surprise. About 100 years later, scientists found that light also arrives in tiny packets of energy, called <b>photons</b>. So light travels like a wave, but is caught in little bits. Scientists still find that amazing.</p>
<div class="fact"><b>Fun fact:</b> Light is very fast: about 300,000 kilometres every second. In one second it could go round the Earth about seven and a half times. Light waves are also tiny: about 2,000 of them fit across one millimetre.</div>
<div class="home"><b>Try it at home:</b> Hold two fingers up in front of a lamp or a bright window (never the Sun) and squeeze them together until there is only a hair-thin gap. Look through the gap with one eye. Can you see thin dark lines inside it? That is light behaving like a wave as it squeezes through.</div>`,
        },
        {
          level: "school",
          html: `
<h4>A short history</h4>
<ul>
<li><b>Isaac Newton</b> (prism experiments from the 1660s, book <i>Opticks</i> 1704) thought light was made of tiny particles, “corpuscles”. Particles explain straight shadows and reflection well. To explain refraction, his theory needed the particles to go <i>faster</i> in glass and water.</li>
<li><b>Christiaan Huygens</b> (treatise finished in 1678, published 1690 as <i>Traité de la Lumière</i>) said light is a wave, and that every point on a wave front acts as a source of new little wavelets (<b>Huygens' principle</b>). Waves explain refraction if light goes <i>slower</i> in glass.</li>
<li><b>Thomas Young</b> stated the principle of interference in 1801 and showed interference fringes in 1803. His two-slit drawing appears in his published lectures of 1807. From the fringes he worked out the wavelengths of the colours.</li>
<li><b>Augustin Fresnel</b> wrote a full wave theory of diffraction (prize essay 1818, prize awarded 1819). Siméon Poisson pointed out it predicted a bright spot in the middle of the shadow of a round disc, which seemed absurd; François Arago looked and found the spot.</li>
<li><b>Léon Foucault</b> (1850) measured that light is slower in water than in air, as the wave theory said and the particle theory did not.</li>
<li><b>James Clerk Maxwell</b> (1860s) showed that light is an electromagnetic wave; <b>Heinrich Hertz</b> made and detected such waves (radio waves) in 1887–1888.</li>
<li><b>Albert Einstein</b> (1905) explained the photoelectric effect with “light quanta”: light delivers its energy in packets. The name <b>photon</b> became popular after 1926.</li>
</ul>
<figure class="diagram"><svg viewBox="0 0 420 220" role="img" aria-label="Straight waves pass two slits; circular waves overlap and make bright and dark stripes on a screen">
  <g stroke="currentColor" stroke-width="2" opacity="0.6"><line x1="40" y1="60" x2="40" y2="160"/><line x1="65" y1="60" x2="65" y2="160"/><line x1="90" y1="60" x2="90" y2="160"/></g>
  <g stroke="currentColor" stroke-width="6"><line x1="120" y1="5" x2="120" y2="84"/><line x1="120" y1="96" x2="120" y2="124"/><line x1="120" y1="136" x2="120" y2="215"/></g>
  <g fill="none" stroke="#60a5fa" stroke-width="1.6" opacity="0.85">
    <path d="M120 60 A30 30 0 0 1 120 120"/><path d="M120 30 A60 60 0 0 1 120 150"/><path d="M120 0 A90 90 0 0 1 120 180"/><path d="M120 -30 A120 120 0 0 1 120 210"/><path d="M120 -60 A150 150 0 0 1 120 240"/><path d="M120 -90 A180 180 0 0 1 120 270"/>
  </g>
  <g fill="none" stroke="#f87171" stroke-width="1.6" opacity="0.85">
    <path d="M120 100 A30 30 0 0 1 120 160"/><path d="M120 70 A60 60 0 0 1 120 190"/><path d="M120 40 A90 90 0 0 1 120 220"/><path d="M120 10 A120 120 0 0 1 120 250"/><path d="M120 -20 A150 150 0 0 1 120 280"/><path d="M120 -50 A180 180 0 0 1 120 310"/>
  </g>
  <line x1="350" y1="10" x2="350" y2="210" stroke="currentColor" stroke-width="2"/>
  <g fill="#fbbf24"><rect x="354" y="104" width="16" height="12"/><rect x="354" y="76" width="16" height="10" opacity="0.8"/><rect x="354" y="134" width="16" height="10" opacity="0.8"/><rect x="354" y="47" width="16" height="9" opacity="0.55"/><rect x="354" y="164" width="16" height="9" opacity="0.55"/><rect x="354" y="18" width="16" height="8" opacity="0.3"/><rect x="354" y="194" width="16" height="8" opacity="0.3"/></g>
  <text x="65" y="180" font-size="13" fill="currentColor" text-anchor="middle">light</text>
  <text x="128" y="214" font-size="13" fill="currentColor">two slits</text>
  <text x="345" y="214" font-size="13" fill="currentColor" text-anchor="end">screen</text>
</svg><figcaption>Light from the two slits (blue and red rings) overlaps. Where crests meet crests the screen is bright (yellow); in between it is dark.</figcaption></figure>
<h4>Measuring a wavelength with two slits</h4>
<p>For two slits a distance <i>d</i> apart and a screen a distance <i>L</i> away (with <i>L</i> much bigger than <i>d</i>), the bright stripes are evenly spaced by</p>
<p class="formula">Δy = λ · L / d</p>
<p>where Δy is the distance between neighbouring bright stripes and λ (lambda) is the wavelength.</p>
<p><b>Worked example.</b> Red laser light, λ = 650 nm = 650 × 10<sup>−9</sup> m, slits d = 0.25 mm = 0.25 × 10<sup>−3</sup> m apart, screen L = 1.0 m away: Δy = 650 × 10<sup>−9</sup> × 1.0 / 0.25 × 10<sup>−3</sup> = 2.6 × 10<sup>−3</sup> m, so the stripes are 2.6 mm apart: easy to see and measure with a ruler. Turn it round and you can measure a wavelength smaller than a thousandth of a millimetre.</p>
<p>Light obeys the same wave rule as every other wave: <b>c = f · λ</b>, where c ≈ 3.00 × 10<sup>8</sup> m/s is the speed of light, f the frequency and λ the wavelength. Green light with λ = 530 nm has f = 3.00 × 10<sup>8</sup> / 530 × 10<sup>−9</sup> ≈ 5.7 × 10<sup>14</sup> Hz: more than five hundred million million wiggles per second.</p>
<p class="aside">The simulator works in cells and steps, not metres and seconds. Its waves are typically 10–20 cells long, so think of one cell as a small fraction of a wavelength, whatever the real wavelength is.</p>`,
        },
        {
          level: "university",
          html: `
<h4>Light from Maxwell's equations</h4>
<p>In vacuum, with no charges or currents, Maxwell's equations are ∇·<b>E</b> = 0, ∇·<b>B</b> = 0, ∇×<b>E</b> = −∂<b>B</b>/∂t and ∇×<b>B</b> = μ<sub>0</sub>ε<sub>0</sub> ∂<b>E</b>/∂t. Taking the curl of the third and using ∇×(∇×<b>E</b>) = ∇(∇·<b>E</b>) − ∇²<b>E</b> gives</p>
<p class="formula">∇²<b>E</b> = μ<sub>0</sub>ε<sub>0</sub> ∂²<b>E</b>/∂t², &nbsp; c = 1/√(μ<sub>0</sub>ε<sub>0</sub>) = 299 792 458 m/s</p>
<p>Maxwell noticed that the speed computed from electrical measurements matched the measured speed of light (in <i>On Physical Lines of Force</i>, 1861–62, and <i>A Dynamical Theory of the Electromagnetic Field</i>, 1865). In a non-magnetic dielectric ε<sub>0</sub> → ε<sub>r</sub>ε<sub>0</sub>, so the speed becomes c/n with <b>n = √ε<sub>r</sub></b> (ε<sub>r</sub> taken at the optical frequency, not the static value: water has ε<sub>r</sub> ≈ 80 at DC but n ≈ 1.33 for light).</p>
<p>A plane wave <b>E</b> = <b>E</b><sub>0</sub> cos(<b>k</b>·<b>r</b> − ωt) has <b>E</b><sub>0</sub> ⟂ <b>k</b>, <b>B</b> = <b>k̂</b> × <b>E</b>/c, and a time-averaged intensity I = ½ c ε<sub>0</sub> E<sub>0</sub>². Light is <b>transverse</b>, which is why it can be polarized.</p>
<h4>Two slits, properly</h4>
<p>Let each slit of width a radiate a field E<sub>1</sub> at angle θ. The path difference is d sin θ, so the phase difference is δ = 2π d sin θ / λ and</p>
<p class="formula">I(θ) = 4 I<sub>1</sub>(θ) cos²(π d sin θ / λ), &nbsp; I<sub>1</sub>(θ) ∝ sinc²(π a sin θ / λ)</p>
<p>with sinc x = sin x / x. Maxima at d sin θ = mλ, modulated by the single-slit envelope. The fringe spacing Δy = λL/d is the small-angle version.</p>
<h4>Photons</h4>
<p>Einstein (1905) proposed that light of frequency f exchanges energy in quanta <b>E = hf = hc/λ</b>; Compton scattering of X-rays from electrons (1923) showed quanta also carry momentum <b>p = h/λ</b>. For green light, λ = 530 nm: E = (6.626 × 10<sup>−34</sup> J s)(2.998 × 10<sup>8</sup> m/s)/(530 × 10<sup>−9</sup> m) ≈ 3.75 × 10<sup>−19</sup> J ≈ 2.34 eV. Wave and particle are not rival theories any more: the classical intensity pattern gives the <i>probability</i> of detecting a photon at each point. G. I. Taylor (1909) saw ordinary fringes with light so faint that, by modern reckoning, rarely more than one photon was in the apparatus at a time, and modern single-photon cameras show the fringes building up dot by dot.</p>`,
        },
        {
          level: "research",
          title: "What the simulator's field stands for",
          html: `
<p>Consider a structure that does not vary along z (out of the screen), made of a non-magnetic, linear, lossless dielectric n(x, y), and look only at the field component E<sub>z</sub>. Maxwell's equations then reduce exactly to the scalar equation</p>
<p class="formula">∇²E<sub>z</sub> = (n²/c²) ∂²E<sub>z</sub>/∂t²</p>
<p>which is the equation the grid solves (with c² → 1/n² in cell units). So the field <i>u</i> can be read as the out-of-plane electric field of light in a 2D world, with the polarization fixed perpendicular to the plane of incidence (see the polarization page). Everything the simulator shows about interference, diffraction, refraction, focusing and guiding is then genuine wave optics for that polarization.</p>
<p>What it leaves out: the other polarization (which obeys a different interface condition), the third dimension (a point source in 2D is a line source in 3D, so amplitudes fall off as r<sup>−1/2</sup> rather than r<sup>−1</sup>), magnetic materials, metals with their frequency-dependent ε, material dispersion and absorption spectra, nonlinearity, and anything quantum: photon statistics, antibunching (Grangier, Roger and Aspect 1986), squeezing and entanglement. The intensity view is a running time-average of u², the analogue of the cycle-averaged |E|² that a photodetector responds to.</p>
<p>For the classical theory see Born &amp; Wolf, <i>Principles of Optics</i>; for photons, Loudon, <i>The Quantum Theory of Light</i>, and Grangier, Roger &amp; Aspect, “Experimental evidence for a photon anticorrelation effect on a beam splitter”, Europhys. Lett. 1, 173 (1986).</p>`,
        },
      ],
      tryIt: [
        { experiment: "double-slit", label: "The double slit" },
        { experiment: "single-slit", label: "One gap: how waves spread" },
      ],
      sources: [
        "E. Hecht, Optics, 5th ed. (Pearson, 2017), ch. 1 (a brief history) and ch. 9 (interference)",
        "M. Born and E. Wolf, Principles of Optics, 7th ed. (Cambridge University Press, 1999)",
        "R. Feynman, R. Leighton and M. Sands, The Feynman Lectures on Physics, vol. I ch. 26–30 and vol. III ch. 1 — https://www.feynmanlectures.caltech.edu/",
        "T. Young, Experiments and Calculations relative to Physical Optics, Phil. Trans. R. Soc. 94 (1804) 1–16 (Bakerian Lecture read 24 November 1803)",
        "July 1816: Fresnel's Evidence for the Wave Theory of Light (APS News, 2016) — https://www.aps.org/apsnews/2016/07/fresnel-wave-theory-light",
        "December 18, 1926: Gilbert Lewis coins “photon” in letter to Nature (APS News, 2012) — https://www.aps.org/publications/apsnews/201212/physicshistory.cfm",
        "R. Loudon, The Quantum Theory of Light, 3rd ed. (Oxford University Press, 2000)",
      ],
    },

    // ------------------------------------------------------------------ wave or particle?
    {
      id: "wave-or-particle",
      title: "Wave or particle? Watching the double slit",
      summary: "Send particles through two slits one at a time and they still make stripes. Watch which slit they take and the stripes vanish. Why?",
      sections: [
        {
          level: "kids",
          html: `
<p>Make the light so dim that only <b>one tiny bit of light</b> (a photon) flies at a time. Each one lands on the screen as a single dot, like a raindrop. The first dots look random. But after thousands of dots, a pattern appears: <b>stripes</b>, the same bright and dark stripes that waves make! Even one photon at a time behaves as if its wave went through <b>both</b> slits.</p>
<p>So scientists asked: which slit does each photon <i>really</i> go through? They put a <b>detector</b> at one slit to watch. And then something strange happened: the stripes <b>disappeared</b>. The dots made two plain smudges, just like little balls would.</p>
<p>Why? To see something as tiny as a photon or an electron, you have to bump it with something, like light. That bump is not gentle: it jiggles the particle's wave by a random amount every time. Each particle's stripes end up in a different place, and all the jiggled stripes added together blur into a smooth glow.</p>
<div class="fact"><b>Fun fact:</b> The famous scientist Richard Feynman said this experiment holds “the only mystery” of the quantum world. It works with electrons, atoms and even big molecules made of 60 atoms.</div>`,
        },
        {
          level: "school",
          html: `
<h4>One particle at a time</h4>
<ul>
<li><b>1909</b>: Geoffrey Ingram Taylor photographed interference fringes with light so faint that the exposure took months. By modern reckoning there was hardly ever more than one photon in the apparatus at a time. The fringes were still there.</li>
<li><b>1961</b>: Claus Jönsson showed interference with electrons through several tiny slits.</li>
<li><b>1974–1989</b>: Pier Giorgio Merli, Gian Franco Missiroli and Giulio Pozzi in Bologna, and then Akira Tonomura's team at Hitachi, sent single electrons through an electron “double slit” (a biprism) and filmed the dots arriving one by one. After a few hundred dots: noise. After tens of thousands: clear fringes.</li>
<li><b>1999</b>: Markus Arndt, Anton Zeilinger and colleagues made C<sub>60</sub> “buckyball” molecules interfere.</li>
</ul>
<p>The rule that ties the wave to the dots is <b>Born's rule</b> (Max Born, 1926): the wave does not say where the particle <i>is</i>; its intensity says how <b>likely</b> it is to be found at each place. Where the waves from the two slits cancel, no particle ever lands.</p>
<h4>Which way did it go?</h4>
<p>If each particle went through one slit only, the screen would show the pattern of slit A plus the pattern of slit B: two humps and no stripes. Waves add <i>before</i> they are squared: with A and B the waves from the two slits, the screen gets</p>
<p class="formula">both open, not watched: (A + B)² = A² + B² + 2AB &nbsp;&nbsp; watched: A² + B²</p>
<p>The extra term 2AB is what makes the stripes: positive where the waves meet in step, negative where they cancel. Any detector that tells you which slit the particle took removes that term.</p>
<p>Richard Feynman's explanation: to see an electron you must scatter light off it, and the light must have a wavelength shorter than the distance between the slits to tell them apart. Such light kicks the electron hard enough to shift its stripes by an unpredictable amount, different for every electron. Added up over many electrons, the stripes wash out. In 1927 Einstein proposed measuring the recoil of the slit wall instead; Niels Bohr answered that pinning down the wall's motion that precisely makes its position uncertain enough to smear the fringes too.</p>
<p class="aside">The simulator's double slit has a detector of this kind: it shifts the phase of the wave through one slit by a random amount many times a second. Watch the stripes jump about in the picture, and watch the dots on the screen lose their stripes.</p>`,
        },
        {
          level: "university",
          html: `
<h4>Which-way information and fringe visibility</h4>
<p>Let ψ<sub>A</sub>(x) and ψ<sub>B</sub>(x) be the amplitudes at the screen from each slit. Unobserved, P(x) = |ψ<sub>A</sub> + ψ<sub>B</sub>|². Now let a detector end up in state |d<sub>A</sub>⟩ or |d<sub>B</sub>⟩ depending on the path. The particle and the detector are <b>entangled</b>, |Ψ⟩ = (ψ<sub>A</sub>|d<sub>A</sub>⟩ + ψ<sub>B</sub>|d<sub>B</sub>⟩)/√2, and</p>
<p class="formula">P(x) ∝ |ψ<sub>A</sub>|² + |ψ<sub>B</sub>|² + 2 Re[ψ<sub>A</sub>* ψ<sub>B</sub> ⟨d<sub>A</sub>|d<sub>B</sub>⟩]</p>
<p>The fringe visibility is V = |⟨d<sub>A</sub>|d<sub>B</sub>⟩| (for equal amplitudes). Orthogonal detector states (perfect which-way information) give V = 0, whether or not anyone reads the detector. Englert (1996) made the trade-off exact: with D the best possible distinguishability of the paths, <b>D² + V² ≤ 1</b>.</p>
<p>A random phase kick is a special case: if the detector multiplies ψ<sub>B</sub> by e<sup>iφ</sup> with φ random, then ⟨d<sub>A</sub>|d<sub>B</sub>⟩ is replaced by the average ⟨e<sup>iφ</sup>⟩. For φ spread evenly over [0, Φ], V = |sin(Φ/2)/(Φ/2)|: zero for a full turn Φ = 2π, 2/π ≈ 0.64 for half a turn.</p>
<p><b>Kicks are not the whole story.</b> Dürr, Nonn and Rempe (1998) marked the path of atoms in an atom interferometer with an internal state, transferring far too little momentum to shift the fringes, and the fringes still vanished. What destroys the interference is the <b>correlation</b> between path and detector, not the disturbance as such. Feynman's microscope, the Einstein–Bohr recoiling slit and the simulator's phase kicker are vivid examples of one general rule.</p>
<h4>The quantum eraser</h4>
<p>If the which-way marks are later made indistinguishable (projecting the detector onto (|d<sub>A</sub>⟩ ± |d<sub>B</sub>⟩)/√2), fringes reappear, but only among the particles sorted by that outcome; the two sorted sets show fringes and anti-fringes that add up to no fringes overall. Proposed by Scully and Drühl (1982), done with polarization-marked photons by Walborn et al. (2002). Nothing travels back in time: the unsorted screen never changes.</p>`,
        },
        {
          level: "research",
          title: "What the simulator does here, and what it cannot do",
          html: `
<p>The grid evolves one classical scalar field. The particle screen samples landing points from the time-averaged intensity along the screen probe (Born's rule with the classical field playing ψ), so its dot histogram converges to the intensity pattern averaged over the run. The which-way detector is a glass block in front of one slit whose index jumps among values spread evenly over a range that shifts the phase by up to Φ; it is a classical <b>dephasing</b> channel. The intensity view, a two-stage running average of u² over a few hundred steps, holds only some tens of independent phases at a time, so its stripes fade only to a visibility of about 1/√N; the screen, which adds up particles over the whole run, goes to the ensemble value |sinc(Φ/2)|.</p>
<p>What cannot be modelled: entanglement with a detector that is itself quantum (the general mechanism, see Dürr et al.), single-photon statistics (a single particle cannot land twice; here the dots are independent samples by construction), the eraser's conditional fringes, and any measurement back-action beyond the phase kick. The 2D scalar wave is the exact model for E<sub>z</sub> of light in a z-invariant structure, and the Schrödinger equation for a free particle is a different (dispersive) wave equation, so the analogy for electrons is qualitative.</p>`,
        },
      ],
      tryIt: [
        { experiment: "double-slit", label: "The double slit (with particles and a which-way detector)" },
        { experiment: "single-slit", label: "One gap: squeeze a wave and it spreads" },
      ],
      sources: [
        "R. Feynman, R. Leighton and M. Sands, The Feynman Lectures on Physics, vol. III ch. 1, Quantum Behavior — https://www.feynmanlectures.caltech.edu/III_01.html",
        "G. I. Taylor, Interference fringes with feeble light, Proc. Camb. Phil. Soc. 15 (1909) 114",
        "P. G. Merli, G. F. Missiroli and G. Pozzi, On the statistical aspect of electron interference phenomena, Am. J. Phys. 44 (1976) 306",
        "A. Tonomura, J. Endo, T. Matsuda, T. Kawasaki and H. Ezawa, Demonstration of single-electron buildup of an interference pattern, Am. J. Phys. 57 (1989) 117",
        "M. Arndt et al., Wave–particle duality of C60 molecules, Nature 401 (1999) 680",
        "B.-G. Englert, Fringe visibility and which-way information: an inequality, Phys. Rev. Lett. 77 (1996) 2154",
        "S. Dürr, T. Nonn and G. Rempe, Origin of quantum-mechanical complementarity probed by a ‘which-way’ experiment in an atom interferometer, Nature 395 (1998) 33",
        "M. O. Scully and K. Drühl, Quantum eraser, Phys. Rev. A 25 (1982) 2208",
        "S. P. Walborn, M. O. Terra Cunha, S. Pádua and C. H. Monken, Double-slit quantum eraser, Phys. Rev. A 65 (2002) 033818",
        "N. Bohr, Discussion with Einstein on epistemological problems in atomic physics (1949), in P. A. Schilpp (ed.), Albert Einstein: Philosopher-Scientist",
      ],
    },

    // ------------------------------------------------------------------ lenses
    {
      id: "lenses-and-focusing",
      title: "Lenses and focusing",
      summary: "How a curved piece of glass gathers waves into a point: focal length, the thin lens equation, the lensmaker's equation, eyes and glasses.",
      sections: [
        {
          level: "kids",
          html: `
<p>A <b>lens</b> is a piece of glass (or plastic) with curved sides. Magnifying glasses, cameras, telescopes and glasses all have lenses. Your eyes have them too.</p>
<p>Here is the trick. Light goes a bit slower inside glass than in air. A magnifying glass is <b>fatter in the middle</b> than at the edges. So the middle of a light wave has to wade through more glass and falls behind, while the edges get through quickly and race ahead. The wave comes out curved, like a bowl, and all its parts head for one spot. That spot is the <b>focus</b>.</p>
<p>Think of a line of children holding hands, walking across a playground with a muddy patch in the middle. The middle children slow down, the ends keep going, and the line bends round.</p>
<p>A lens that is <b>thinner</b> in the middle does the opposite: it spreads light out. Glasses for people who cannot see far away are like that.</p>
<p>In your eye, a clear curved window at the front and a soft lens behind it make a small picture on the back of your eye. That picture is upside down. Your brain turns it the right way up without you noticing.</p>
<div class="home"><b>Try it at home:</b> Draw an arrow pointing left on a piece of paper. Hold a round glass full of water in front of it and look through the glass. Move the paper further back. At some point the arrow suddenly points right! The water glass is a lens, and it flips the picture.</div>
<div class="fact"><b>Fun fact:</b> Most of your eye's focusing is done by the curved clear front of the eye, the cornea, not by the lens inside. That is why you cannot see sharply under water: water and your cornea slow light by almost the same amount, so the cornea stops bending light.</div>`,
        },
        {
          level: "school",
          html: `
<figure class="diagram"><svg viewBox="0 0 420 220" role="img" aria-label="Parallel rays pass a convex lens and meet at the focal point F">
  <line x1="10" y1="110" x2="410" y2="110" stroke="currentColor" stroke-width="1" stroke-dasharray="5 4" opacity="0.6"/>
  <ellipse cx="200" cy="110" rx="14" ry="85" fill="#60a5fa" fill-opacity="0.25" stroke="#60a5fa" stroke-width="2"/>
  <g stroke="#fbbf24" stroke-width="2" fill="none">
    <polyline points="20,60 200,60 330,110 400,137"/>
    <polyline points="20,110 400,110"/>
    <polyline points="20,160 200,160 330,110 400,83"/>
  </g>
  <circle cx="330" cy="110" r="4" fill="#f87171"/>
  <text x="330" y="100" font-size="13" fill="#f87171" text-anchor="middle">F</text>
  <g stroke="currentColor" stroke-width="1.2"><line x1="200" y1="200" x2="330" y2="200"/><line x1="200" y1="194" x2="200" y2="206"/><line x1="330" y1="194" x2="330" y2="206"/></g>
  <text x="265" y="193" font-size="13" fill="currentColor" text-anchor="middle">focal length f</text>
  <text x="20" y="50" font-size="13" fill="currentColor">parallel light</text>
  <text x="200" y="18" font-size="13" fill="currentColor" text-anchor="middle">converging lens</text>
</svg><figcaption>A converging (convex) lens sends rays that arrive parallel to its axis through one point, the focal point F. Its distance from the lens is the focal length f.</figcaption></figure>
<h4>Words and the lens formula</h4>
<p>A <b>converging</b> (convex) lens is thicker in the middle and brings parallel light to a <b>focal point</b> F. A <b>diverging</b> (concave) lens is thinner in the middle and spreads light out as if it came from a focal point in front of the lens. The distance from lens to focal point is the <b>focal length f</b>. Opticians use the <b>power</b> P = 1/f, measured in <b>dioptres</b> (D) when f is in metres; diverging lenses have negative f and negative power.</p>
<p>For a thin lens, an object a distance d<sub>o</sub> in front of the lens makes an image a distance d<sub>i</sub> behind it, where</p>
<p class="formula">1/f = 1/d<sub>o</sub> + 1/d<sub>i</sub>, &nbsp; magnification m = −d<sub>i</sub>/d<sub>o</sub></p>
<p>A positive d<sub>i</sub> means a real image (you can catch it on a screen) on the far side; a negative d<sub>i</sub> means a virtual image on the same side as the object. A negative m means the image is upside down.</p>
<p><b>Worked example 1 (a projector).</b> f = 10 cm, object at d<sub>o</sub> = 30 cm: 1/d<sub>i</sub> = 1/10 − 1/30 = 2/30, so d<sub>i</sub> = 15 cm. m = −15/30 = −0.5: a real image, upside down, half the size.</p>
<p><b>Worked example 2 (a magnifying glass).</b> Same lens, object at 5 cm (inside the focal length): 1/d<sub>i</sub> = 1/10 − 1/5 = −1/10, so d<sub>i</sub> = −10 cm. m = −(−10)/5 = +2: a virtual image, the right way up, twice as big.</p>
<h4>Eyes and glasses</h4>
<p>A relaxed human eye has a total power of roughly 60 D; about two thirds of it comes from the cornea and the rest from the lens, which can change shape to focus on near things. A <b>short-sighted</b> eye focuses too strongly: if the farthest point it sees sharply is 50 cm away, a diverging lens with f = −0.5 m (−2 D) makes distant objects appear to be at 50 cm, and they look sharp. A <b>long-sighted</b> eye needs a converging (positive) lens.</p>
<p class="aside">The wave picture and the ray picture agree: the rays are the directions in which the wave fronts move. In the simulator you see the wave fronts themselves: flat ones go into the Sandbox <b>Lens</b> demo and come out curved, closing in on a focus.</p>`,
        },
        {
          level: "university",
          html: `
<h4>A lens is a phase mask</h4>
<p>Take a thin lens of index n in air with thickness Δ(x) at height x from the axis. For spherical surfaces of radii R<sub>1</sub>, R<sub>2</sub> (positive when the centre of curvature lies on the outgoing side), in the paraxial approximation Δ(x) = Δ<sub>0</sub> − (x²/2)(1/R<sub>1</sub> − 1/R<sub>2</sub>). A wave crossing the lens at height x picks up the phase k<sub>0</sub>[nΔ(x) + (Δ<sub>0</sub> − Δ(x))], whose x-dependent part is</p>
<p class="formula">φ(x) = −k<sub>0</sub> (n − 1) (x²/2)(1/R<sub>1</sub> − 1/R<sub>2</sub>) = −k<sub>0</sub> x² / (2f)</p>
<p>This is exactly the phase of a wave converging on a point a distance f away, which gives the <b>lensmaker's equation</b> for a thin lens, and its thick-lens form for centre thickness d:</p>
<p class="formula">1/f = (n − 1) [ 1/R<sub>1</sub> − 1/R<sub>2</sub> + (n − 1) d / (n R<sub>1</sub> R<sub>2</sub>) ]</p>
<p>The thin lens equation follows by adding phases: light from a point at distance s<sub>o</sub> arrives with phase k<sub>0</sub>x²/(2s<sub>o</sub>); after the lens it has k<sub>0</sub>x²/(2s<sub>o</sub>) − k<sub>0</sub>x²/(2f) = −k<sub>0</sub>x²/(2s<sub>i</sub>), i.e. 1/s<sub>o</sub> + 1/s<sub>i</sub> = 1/f. Equivalently (Fermat): every path from object point to image point takes the same optical path length.</p>
<p>The approximation x ≪ R hides the <b>aberrations</b>. Spherical surfaces focus marginal rays closer than paraxial ones (spherical aberration); because n depends on λ, blue focuses closer than red (chromatic aberration, corrected with achromatic doublets of two glasses); off-axis points add coma, astigmatism and field curvature.</p>
<h4>The Sandbox Lens demo in numbers</h4>
<p>The demo lens is an ellipse of glass with n = 1.5, half-width 0.14 H and half-height 0.36 H (H = scene height), centred at 32% of the scene width and lit by a line source at level 60 (λ ≈ 15 cells in air, ≈ 10 in glass). At its centre each face has radius of curvature R = b²/a = (0.36 H)²/(0.14 H) ≈ 0.93 H, and the thick-lens formula (thickness 0.28 H) gives a paraxial focal length f ≈ 0.98 H. An ellipse curves much more strongly towards its top and bottom, so the outer parts of the beam cross the axis sooner: measured in the app (intensity along the axis, in scenes from 940 × 602 to 1580 × 944 cells) the brightest point forms 0.77–0.80 H behind the lens centre, with a long bright tail beyond it. That shift towards the lens is spherical aberration.</p>`,
        },
        {
          level: "research",
          title: "Focusing in 2D, and lenses on a grid",
          html: `
<p><b>2D is not 3D.</b> The simulator's lens is really a cylindrical lens that focuses to a line. The peak intensity at focus grows like D/λ (D = aperture) instead of (D/λ)² for a round lens, the focal spot has the sinc² profile of a slit rather than the Airy pattern of a circle, and the Gouy phase anomaly through focus is π/2 instead of π. Comparisons with textbook 3D formulas need these factors.</p>
<p><b>Staircased surfaces.</b> A curved surface on a square grid is a staircase with steps of one cell. For λ ≈ 10–15 cells the step is λ/10–λ/15, enough to scatter a little light and to blur the effective surface position by up to half a cell. Effective-medium smoothing (averaging ε, or better 1/ε, over boundary cells) reduces this error in FDTD; see Taflove &amp; Hagness. The simulator does not smooth: each cell is either glass or not.</p>
<p><b>Grid dispersion shifts the focus.</b> The numerical phase velocity falls as the number of cells per wavelength falls, and it falls faster in glass, where the wavelength is n times shorter. The effective index ratio is therefore a little above the nominal n and grows with frequency, so focal lengths are slightly short and slightly frequency dependent, a numerical chromatic aberration.</p>
<p><b>Beyond the classical lens.</b> Graded-index lenses bend light with a smooth n(x) instead of curved surfaces, which a pixel scene can approximate with a gradient in the red channel. Metasurface lenses (“metalenses”, e.g. Khorasaninejad et al., Science 352, 1190, 2016) impose the phase φ(x) of the formula above with sub-wavelength nanostructures.</p>`,
        },
      ],
      tryIt: [
        { experiment: "refraction", label: "Bending waves: Snell's law" },
        { experiment: "wavelength", label: "How long is a wave?" },
      ],
      sources: [
        "E. Hecht, Optics, 5th ed. (Pearson, 2017), ch. 5 (geometrical optics) and ch. 6 (aberrations)",
        "J. W. Goodman, Introduction to Fourier Optics, 3rd ed. (Roberts, 2005), ch. 5 (a thin lens as a phase transformation)",
        "D. Halliday, R. Resnick and J. Walker, Fundamentals of Physics (Wiley), chapter on images",
        "The optical power of the eye — https://en.wikipedia.org/wiki/Dioptre",
        "A. Taflove and S. C. Hagness, Computational Electrodynamics: The Finite-Difference Time-Domain Method, 3rd ed. (Artech House, 2005)",
        "M. Khorasaninejad et al., Metalenses at visible wavelengths, Science 352, 1190 (2016)",
      ],
    },

    // ------------------------------------------------------------------ mirrors
    {
      id: "mirrors",
      title: "Mirrors: flat, curved and parabolic",
      summary: "Why a mirror image looks the way it does, how curved mirrors focus, and why telescopes and satellite dishes are shaped like parabolas.",
      sections: [
        {
          level: "kids",
          html: `
<p>A mirror bounces light back, just like a wall bounces a ball. If the light comes in at a slant, it leaves at the same slant on the other side. That is why you can see round a corner with a mirror, and why a mirror shows the room behind you.</p>
<figure class="diagram"><svg viewBox="0 0 320 200" role="img" aria-label="A ray hits a flat mirror and leaves at the same angle">
  <rect x="40" y="160" width="240" height="10" fill="currentColor" opacity="0.35"/>
  <line x1="160" y1="160" x2="160" y2="40" stroke="currentColor" stroke-width="1.2" stroke-dasharray="5 4" opacity="0.7"/>
  <g stroke="#fbbf24" stroke-width="2.5" fill="none"><line x1="70" y1="70" x2="160" y2="160"/><line x1="160" y1="160" x2="250" y2="70"/></g>
  <path d="M138.8 138.8 A30 30 0 0 1 160 130" fill="none" stroke="#f87171" stroke-width="2"/>
  <path d="M160 130 A30 30 0 0 1 181.2 138.8" fill="none" stroke="#34d399" stroke-width="2"/>
  <text x="70" y="60" font-size="13" fill="currentColor" text-anchor="middle">light in</text>
  <text x="250" y="60" font-size="13" fill="currentColor" text-anchor="middle">light out</text>
  <text x="160" y="190" font-size="13" fill="currentColor" text-anchor="middle">mirror</text>
  <text x="160" y="32" font-size="13" fill="currentColor" text-anchor="middle">same angle on both sides</text>
</svg><figcaption>Light leaves a mirror at the same angle as it arrived.</figcaption></figure>
<p>Curved mirrors do more. A mirror that curves inwards, like the inside of a bowl, collects light and sends it to one spot. Torches and car headlights use this the other way round: the bulb sits at that spot, and the curved mirror sends all its light forwards in a beam. Big telescopes use giant curved mirrors to collect the faint light of faraway stars, and a satellite dish uses the same shape to collect radio waves from a satellite.</p>
<div class="home"><b>Try it at home:</b> Look at yourself in a shiny metal spoon. In the inside (the bowl) you are upside down. On the back you are the right way up but small, and you can see much more of the room. Slowly bring the bowl side very close to one eye: what happens to the picture?</div>
<div class="fact"><b>Fun fact:</b> The James Webb Space Telescope's main mirror is 6.5 metres across, taller than a giraffe. It is made of 18 six-sided pieces covered with a very thin layer of gold, which reflects infrared light very well.</div>`,
        },
        {
          level: "school",
          html: `
<h4>Flat mirrors</h4>
<p>The <b>law of reflection</b>: the angle of incidence equals the angle of reflection, both measured from the <b>normal</b> (the line square to the mirror). A flat mirror makes a <b>virtual</b> image: it seems to sit as far behind the mirror as the object is in front, the right way up and the same size. It is not really “left–right swapped”; it is reversed front-to-back, which is why your raised right hand appears on the same side of the picture but faces you.</p>
<h4>Curved mirrors</h4>
<p>A <b>concave</b> mirror (curved inwards) with radius of curvature R brings parallel light to a focus at f = R/2 from the mirror, as long as the mirror is not too deep. It obeys the same formula as a lens:</p>
<p class="formula">1/f = 1/d<sub>o</sub> + 1/d<sub>i</sub>, &nbsp; m = −d<sub>i</sub>/d<sub>o</sub></p>
<p>with real images now in front of the mirror. <b>Worked example (a make-up mirror).</b> R = 60 cm, so f = 30 cm. Your face is 20 cm away: 1/d<sub>i</sub> = 1/30 − 1/20 = −1/60, so d<sub>i</sub> = −60 cm (a virtual image behind the mirror) and m = −(−60)/20 = +3: the right way up and three times bigger. A <b>convex</b> mirror (curved outwards, like the back of the spoon or a car's wing mirror) always gives a smaller, upright image and a wider view.</p>
<figure class="diagram"><svg viewBox="0 0 400 220" role="img" aria-label="Parallel rays reflect off a parabolic mirror and all pass through the focus">
  <polyline points="310,10 328,30 342,50 352,70 358,90 360,110 358,130 352,150 342,170 328,190 310,210" fill="none" stroke="currentColor" stroke-width="4"/>
  <line x1="20" y1="110" x2="380" y2="110" stroke="currentColor" stroke-width="1" stroke-dasharray="5 4" opacity="0.5"/>
  <g stroke="#fbbf24" stroke-width="1.8" fill="none">
    <polyline points="20,30 328,30 310,110"/>
    <polyline points="20,70 352,70 310,110"/>
    <polyline points="20,150 352,150 310,110"/>
    <polyline points="20,190 328,190 310,110"/>
  </g>
  <circle cx="310" cy="110" r="5" fill="#f87171"/>
  <text x="300" y="104" font-size="13" fill="#f87171" text-anchor="end">focus</text>
  <text x="20" y="20" font-size="13" fill="currentColor">light from a distant star</text>
  <text x="372" y="214" font-size="13" fill="currentColor" text-anchor="end">parabolic mirror</text>
</svg><figcaption>A parabolic mirror sends every ray that arrives parallel to its axis through one point, however wide the mirror is.</figcaption></figure>
<h4>Why parabolas?</h4>
<p>A spherical mirror focuses well only near its centre: rays that hit near the rim cross the axis a little too close to the mirror. This blur is called <b>spherical aberration</b>. A <b>parabolic</b> mirror (shape y² = 4 f x, with x measured along the axis) has no such blur for light arriving parallel to its axis, so it is the shape of reflecting telescopes, satellite dishes and radio telescopes, and, used backwards with a lamp at the focus, of searchlights. Isaac Newton built the first practical reflecting telescope in 1668.</p>`,
        },
        {
          level: "university",
          html: `
<h4>Reflection from Fermat, focusing from equal paths</h4>
<p>For a ray from A to B via a point P on a flat mirror, the path length is stationary when the angle of incidence equals the angle of reflection: this is Fermat's principle, or equivalently the phase-matching condition that the tangential wave vector k sin θ is the same on both sides.</p>
<p>A focus needs every path from an incoming plane wave front to the focus to have the same length. The parabola is the set of points equidistant from a focus and a line (the directrix), so a plane wave perpendicular to the axis reaches the focus with equal path along every ray: the focus is <b>perfect on axis</b>. Writing the sag of a mirror as z(r):</p>
<p class="formula">parabola: z = r² / (4f) &nbsp;&nbsp; sphere: z = R − √(R² − r²) = r²/(2R) + r⁴/(8R³) + …</p>
<p>With R = 2f the two agree to second order; the sphere's extra r⁴/(8R³) is the source of spherical aberration. A paraboloid is not perfect off-axis: its main defect there is <b>coma</b>, which limits the useful field of view. Telescope designs use two or three curved mirrors to cancel aberrations over a wider field: the Hubble Space Telescope is a Ritchey–Chrétien design with two hyperboloidal mirrors.</p>
<h4>Dishes and the diffraction limit</h4>
<p>A dish of diameter D is still limited by diffraction. Its gain over an isotropic antenna is G = η(πD/λ)², with an aperture efficiency η typically 0.5–0.7, and its beam is roughly 70 λ/D degrees wide. A 60 cm satellite-TV dish at 11.7 GHz (λ = 2.56 cm) has πD/λ ≈ 73.5, so with η = 0.65, G ≈ 3500 ≈ 35.5 dBi, and a beam about 3° wide: one reason the dish must be pointed carefully.</p>
<h4>In the simulator</h4>
<p>A wall is made of cells with damping factor 0: the update drops their “velocity” term, so they barely move and send much of the wave back, inverted, like a hard wall. They are not perfect mirrors, though: measured in the app, a wall returns about 57% of the amplitude at λ ≈ 45 cells, 44% at λ ≈ 15 and 23% at λ ≈ 6, and absorbs the rest (see Reflection and echoes). In the <b>Echoes and mirrors</b> experiment the dish is the parabola x = X<sub>0</sub> − (y − y<sub>c</sub>)²/(4f) with f = 160 cells, lit by straight waves at level 55 (λ ≈ 16 cells): about 10 wavelengths of focal length and 28 of aperture, so the focus is a bright spot a couple of wavelengths across, not a point. The Sandbox <b>Corner reflector</b> demo has two flat walls at close to a right angle: a ray hitting both is sent back parallel to where it came from. The retroreflector arrays left on the Moon by Apollo 11, 14 and 15 use 3D corner cubes in the same way, so that laser pulses from Earth come straight back.</p>`,
        },
        {
          level: "research",
          title: "How good does a mirror have to be?",
          html: `
<p>A wave-front error that varies across the aperture with root-mean-square value σ (in wavelengths) lowers the peak of the focal spot by the Strehl ratio S ≈ exp(−(2πσ)²). The Maréchal criterion S ≥ 0.8 corresponds to σ ≲ λ/14. A mirror doubles any surface error on reflection, so the surface itself must be good to about λ/28 rms: roughly 20 nm for visible light. The Hubble Space Telescope's primary mirror was ground very precisely to a slightly wrong shape, too flat at the edge by about 2.2 µm, and the resulting spherical aberration was corrected by optics installed in 1993.</p>
<p>The grid makes the same point at a coarser scale. A wall drawn at a slant is a staircase with one-cell steps, so the simulator's mirrors have a built-in “surface roughness” of about one cell: λ/16 peak-to-valley at λ ≈ 16 cells. That is good enough for a clear focus, but you can see faint scattered wavelets from the steps if you turn the brightness up. Doubling the scale (more cells per wavelength) halves this error but costs four times as many cells and twice as many steps to cross the scene.</p>
<p>Two more modelling limits: damped wall cells are not an exact perfect conductor (a small amount of field leaks into the first layer of cells, which shifts the effective mirror surface by a fraction of a cell), and the 2D dish is a trough, not a dish of revolution, so it focuses to a line in 3D terms. See Hecht ch. 5–6, and for the Hubble mirror the NASA account of the servicing missions.</p>`,
        },
      ],
      tryIt: [
        { experiment: "echoes", label: "Echoes and mirrors" },
      ],
      sources: [
        "E. Hecht, Optics, 5th ed. (Pearson, 2017), ch. 4–6",
        "M. Born and E. Wolf, Principles of Optics, 7th ed. (Cambridge University Press, 1999), §9.1 (the Strehl ratio and the Maréchal criterion)",
        "Isaac Newton and his reflecting telescope (1668) — Cambridge University Press excerpt, https://assets.cambridge.org/97805213/02180/excerpt/9780521302180_excerpt.pdf",
        "NASA, James Webb Space Telescope: the mirror — https://science.nasa.gov/mission/webb/",
        "NASA, Hubble Space Telescope servicing mission 1 (1993) — https://science.nasa.gov/mission/hubble/",
        "J. D. Kraus and R. J. Marhefka, Antennas, 3rd ed. (McGraw-Hill, 2002): aperture antennas and dish gain",
      ],
    },

    // ------------------------------------------------------------------ total internal reflection
    {
      id: "total-internal-reflection-and-fibres",
      title: "Total internal reflection and optical fibres",
      summary: "Why light can be trapped inside glass, why diamonds sparkle, how the internet travels through glass threads, and the evanescent wave that leaks a little way out.",
      sections: [
        {
          level: "kids",
          html: `
<p>When light goes from water or glass out into air, it speeds up and bends. If it hits the surface at a steep angle, most of it gets out. But if it skims the surface at a shallow, sloping angle, something surprising happens: it cannot get out at all. The surface acts like a perfect mirror and <b>all</b> the light bounces back inside. This is called <b>total internal reflection</b>.</p>
<p>Swimmers know it. Dive under water and look up at the surface, not straight up but off to the side: you see a silvery mirror instead of the sky.</p>
<p>Scientists use this trick to trap light inside long, thin threads of very clear glass called <b>optical fibres</b>. The light zigzags along inside, bouncing off the walls again and again, and cannot escape, even when the fibre bends gently. Fibres carry phone calls, videos and the internet across countries and under oceans as flashes of light.</p>
<figure class="diagram"><svg viewBox="0 0 500 160" role="img" aria-label="Light zigzags along inside a glass fibre, bouncing off the walls">
  <rect x="20" y="50" width="460" height="60" rx="8" fill="#60a5fa" fill-opacity="0.18" stroke="#60a5fa" stroke-width="2"/>
  <polyline points="20,80 60,52 140,108 220,52 300,108 380,52 460,108 480,94" fill="none" stroke="#fbbf24" stroke-width="2.5"/>
  <text x="250" y="36" font-size="13" fill="currentColor" text-anchor="middle">glass fibre (thinner than a hair)</text>
  <text x="250" y="138" font-size="13" fill="currentColor" text-anchor="middle">the light bounces off the walls and stays inside</text>
</svg><figcaption>Light trapped in a fibre by total internal reflection.</figcaption></figure>
<div class="home"><b>Try it at home:</b> With a grown-up, poke a small hole near the bottom of a clear plastic bottle, fill it with water over a sink and let the stream pour out. In a dark room, shine a torch through the bottle from behind, straight at the hole. The light follows the curved stream of water, and where the stream hits the sink you see a bright spot. (Use a torch, never a laser pointer.)</div>
<div class="fact"><b>Fun fact:</b> Diamonds sparkle because they trap light so well. Light inside a diamond is bent so strongly that it bounces around many times before finding a way out, and it comes out from the top in bright flashes.</div>`,
        },
        {
          level: "school",
          html: `
<h4>The critical angle</h4>
<p>At a boundary, <b>Snell's law</b> says n<sub>1</sub> sin θ<sub>1</sub> = n<sub>2</sub> sin θ<sub>2</sub>, where n<sub>1</sub>, n<sub>2</sub> are the refractive indices and θ<sub>1</sub>, θ<sub>2</sub> the angles from the normal. Going from glass (n<sub>1</sub> = 1.5) into air (n<sub>2</sub> = 1.0) the light bends <i>away</i> from the normal, so θ<sub>2</sub> &gt; θ<sub>1</sub>. As θ<sub>1</sub> grows, θ<sub>2</sub> reaches 90°: the refracted beam skims along the surface. That value of θ<sub>1</sub> is the <b>critical angle</b> θ<sub>c</sub>:</p>
<p class="formula">sin θ<sub>c</sub> = n<sub>2</sub> / n<sub>1</sub> &nbsp; (only possible when n<sub>1</sub> &gt; n<sub>2</sub>)</p>
<p>For any bigger angle there is no refracted beam at all, and all the light is reflected.</p>
<figure class="diagram"><svg viewBox="0 0 500 200" role="img" aria-label="Three rays inside glass hit the surface at 25, 41.8 and 60 degrees: the first escapes, the second skims the surface, the third is reflected">
  <rect x="0" y="100" width="500" height="100" fill="#60a5fa" fill-opacity="0.15"/>
  <line x1="0" y1="100" x2="500" y2="100" stroke="currentColor" stroke-width="2"/>
  <g stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" opacity="0.6"><line x1="80" y1="45" x2="80" y2="165"/><line x1="220" y1="45" x2="220" y2="165"/><line x1="380" y1="45" x2="380" y2="165"/></g>
  <g stroke="#fbbf24" stroke-width="2.2" fill="none">
    <line x1="52" y1="160" x2="80" y2="100"/><line x1="80" y1="100" x2="129" y2="40"/>
    <line x1="166.4" y1="160" x2="220" y2="100"/><line x1="220" y1="99" x2="300" y2="99"/>
    <line x1="276.1" y1="160" x2="380" y2="100"/><line x1="380" y1="100" x2="483.9" y2="160"/>
  </g>
  <g stroke="#fbbf24" stroke-width="1.2" fill="none" stroke-dasharray="3 3" opacity="0.7"><line x1="80" y1="100" x2="108" y2="160"/><line x1="220" y1="100" x2="273.6" y2="160"/></g>
  <text x="10" y="20" font-size="13" fill="currentColor">air, n = 1.0</text>
  <text x="10" y="194" font-size="13" fill="currentColor">glass, n = 1.5</text>
  <text x="135" y="45" font-size="12" fill="#34d399">25°: escapes</text>
  <text x="225" y="88" font-size="12" fill="#fbbf24">41.8°: skims (critical)</text>
  <text x="372" y="80" font-size="12" fill="#f87171">60°: all reflected</text>
</svg><figcaption>Inside glass, a ray at 25° gets out (with a weak reflection, dashed); at the critical angle 41.8° it just skims the surface; beyond it, at 60°, everything is reflected.</figcaption></figure>
<p><b>Worked examples.</b> Glass to air: sin θ<sub>c</sub> = 1.0/1.5 = 0.667, θ<sub>c</sub> = 41.8°. Water to air (n = 1.33): sin θ<sub>c</sub> = 0.752, θ<sub>c</sub> = 48.8°; this is why, under water, the whole sky is squeezed into a circle (“Snell's window”) and beyond it you see a mirror. Diamond (n = 2.42): sin θ<sub>c</sub> = 0.413, θ<sub>c</sub> = 24.4°, so a well-cut diamond traps most light that tries to leave through its lower faces and sends it out through the top.</p>
<h4>Optical fibres</h4>
<p>A fibre has a <b>core</b> of glass surrounded by a <b>cladding</b> of glass with a slightly lower index. Take, for example, a core with n = 1.47 and cladding with n = 1.46: θ<sub>c</sub> = sin<sup>−1</sup>(1.46/1.47) = 83.3°. Light travelling within about 6.7° of the fibre's axis hits the wall beyond the critical angle and stays trapped. Today's best fibres are so clear that light loses only about 4–5% of its power per kilometre at a wavelength of 1550 nm (an infrared colour); signals still need amplifying every few tens of kilometres on long links. In 1966 Charles Kao and George Hockham argued that glass fibres could carry signals well if impurities were removed; Corning made such a fibre in 1970, and Kao shared the 2009 Nobel Prize in Physics.</p>
<p class="aside">In the <b>Trapped light</b> experiment a beam inside glass (n = 1.5) meets the surface at an angle you choose. The simulator's critical angle is computed from its own wavelengths in glass and air, whose ratio differs very slightly from 1.5 because of the grid; it comes out at about 41.5°, close to the textbook 41.8°.</p>`,
        },
        {
          level: "university",
          html: `
<h4>Beyond the critical angle: the evanescent wave</h4>
<p>At a flat interface the tangential wave number is conserved: k<sub>x</sub> = n<sub>1</sub>k<sub>0</sub> sin θ (k<sub>0</sub> = 2π/λ<sub>0</sub>). In medium 2 the normal component must satisfy k<sub>x</sub>² + k<sub>y</sub>² = n<sub>2</sub>²k<sub>0</sub>². Beyond the critical angle k<sub>x</sub> &gt; n<sub>2</sub>k<sub>0</sub>, so k<sub>y</sub> is imaginary, k<sub>y</sub> = iκ, and the transmitted field is</p>
<p class="formula">E<sub>2</sub> ∝ e<sup>−κy</sup> e<sup>i(k<sub>x</sub>x − ωt)</sup>, &nbsp; κ = k<sub>0</sub> √(n<sub>1</sub>² sin²θ − n<sub>2</sub>²)</p>
<p>It travels along the surface and decays away from it: an <b>evanescent wave</b>. It carries no net energy across the interface (for a lossless medium 2 the reflection coefficient has |r| = 1, only a phase shift), but it is real. Example: glass n = 1.5 to air, θ = 60°, λ<sub>0</sub> = 600 nm: n<sub>1</sub>² sin²θ − 1 = 0.6875, so 1/κ = 600 nm / (2π × 0.829) ≈ 115 nm: the field reaches about a fifth of a wavelength into the air.</p>
<p>Bring a second block of glass within that distance and the evanescent wave couples into it: <b>frustrated total internal reflection</b>, the optical analogue of quantum tunnelling, used in beam-splitter cubes and fingerprint sensors. The reflected beam is also displaced slightly along the surface (the Goos–Hänchen shift, measured in 1947), because the evanescent field stores energy for a moment before returning it.</p>
<h4>Fibres: acceptance angle and modes</h4>
<p>Light entering the fibre end from air at angle α is trapped if sin α ≤ NA, with the <b>numerical aperture</b> NA = √(n<sub>core</sub>² − n<sub>clad</sub>²). For the school example, NA = √(1.47² − 1.46²) ≈ 0.17, an acceptance half-angle of about 10°. Ray optics is only half the story: in a core of radius a, light travels in a discrete set of <b>modes</b>, and a step-index fibre carries only one when the normalized frequency</p>
<p class="formula">V = (2π a / λ<sub>0</sub>) · NA &lt; 2.405</p>
<p>Standard telecom single-mode fibre has a core about 8–9 µm across, NA ≈ 0.14 (an index difference of only about 0.35%), a 125 µm cladding, and loss around 0.2 dB/km at 1550 nm, where the residual Rayleigh scattering and infrared absorption of silica are smallest. Single-mode operation avoids the spreading of pulses that different modes with different speeds would cause.</p>
<p>The simulator's <b>Light guide</b> demo is a wavy glass channel (n = 1.6, 36 cells wide) fed by a point source near its start, with λ ≈ 8 cells in the glass: several wavelengths across, so it carries several modes. Watch where light leaks out: at the sharpest bends some rays meet the wall below the critical angle (bend loss).</p>`,
        },
        {
          level: "research",
          title: "Waveguides in a 2D scalar model",
          html: `
<p>A glass strip in the 2D simulator is a planar (slab) dielectric waveguide, and for the field polarized out of the plane (E<sub>z</sub>) the scalar equation is exact, so its guided modes, cut-off frequencies, evanescent tails and bend losses are those of a real slab guide for that polarization, apart from grid errors. Two parallel strips a few wavelengths apart exchange power through their evanescent fields, as in a directional coupler; a ring next to a strip makes a ring resonator. Both are easy to draw in the Sandbox.</p>
<p>Limits to keep in mind: the evanescent decay length 1/κ shrinks to a few cells at steep angles, so it is resolved only coarsely; the sim's index ratio is slightly frequency dependent (grid dispersion), shifting the effective critical angle; and the damping edge reflects a percent or so, which matters when measuring small leakage. Fibre physics that needs three dimensions or vector fields (hybrid HE/EH modes, polarization-mode dispersion, birefringent fibres) is out of reach, as are nonlinear effects (Kerr effect, solitons, stimulated Raman scattering) and photonic-crystal and hollow-core fibres that guide by a band gap rather than by total internal reflection.</p>
<p>Literature: A. W. Snyder and J. D. Love, <i>Optical Waveguide Theory</i> (Chapman &amp; Hall, 1983); G. P. Agrawal, <i>Fiber-Optic Communication Systems</i> (Wiley); K. C. Kao and G. A. Hockham, Proc. IEE 113, 1151 (1966).</p>`,
        },
      ],
      tryIt: [
        { experiment: "total-internal-reflection", label: "Trapped light: total internal reflection" },
        { experiment: "refraction", label: "Bending waves: Snell's law" },
      ],
      sources: [
        "E. Hecht, Optics, 5th ed. (Pearson, 2017), §4.7 (total internal reflection) and §5.6 (fibre optics)",
        "K. C. Kao and G. A. Hockham, Dielectric-fibre surface waveguides for optical frequencies, Proc. IEE 113, 1151–1158 (1966)",
        "The Nobel Prize in Physics 2009 (Charles K. Kao) — https://www.nobelprize.org/prizes/physics/2009/summary/",
        "How Charles Kao beat Bell Labs to the fiber-optic revolution (IEEE Spectrum) — https://spectrum.ieee.org/how-charles-kao-beat-bell-labs-to-the-fiberoptic-revolution",
        "A. W. Snyder and J. D. Love, Optical Waveguide Theory (Chapman & Hall, 1983)",
        "G. P. Agrawal, Fiber-Optic Communication Systems, 4th ed. (Wiley, 2010)",
      ],
    },

    // ------------------------------------------------------------------ colour and rainbows
    {
      id: "colour-dispersion-rainbows",
      title: "Colour, dispersion and rainbows",
      summary: "Colours are wavelengths; glass and water slow each colour by a slightly different amount, which is how prisms and raindrops spread white light into a spectrum.",
      sections: [
        {
          level: "kids",
          html: `
<p>Sunlight looks white, but it is really a mixture of all the colours of the rainbow. Each colour is a light wave with a different length. Red light has the longest waves, violet light the shortest, and orange, yellow, green and blue are in between.</p>
<p>When light goes into glass or water it slows down and bends. The trick is that each colour slows down by a slightly different amount. Violet slows the most and bends the most; red bends the least. So a triangle of glass, called a <b>prism</b>, spreads white light out into a fan of colours.</p>
<figure class="diagram"><svg viewBox="0 0 420 220" role="img" aria-label="A beam of white light enters a glass prism and comes out as a fan of colours">
  <polygon points="170,30 95,180 245,180" fill="#60a5fa" fill-opacity="0.15" stroke="currentColor" stroke-width="2"/>
  <line x1="10" y1="140" x2="128" y2="112" stroke="currentColor" stroke-width="4"/>
  <line x1="128" y1="112" x2="205" y2="112" stroke="currentColor" stroke-width="3" opacity="0.7"/>
  <g stroke-width="3">
    <line x1="205" y1="112" x2="410" y2="130" stroke="#f87171"/>
    <line x1="205" y1="112" x2="410" y2="148" stroke="#fbbf24"/>
    <line x1="205" y1="112" x2="410" y2="166" stroke="#34d399"/>
    <line x1="205" y1="112" x2="410" y2="184" stroke="#60a5fa"/>
    <line x1="205" y1="112" x2="410" y2="202" stroke="#c084fc"/>
  </g>
  <text x="10" y="128" font-size="13" fill="currentColor">white light</text>
  <text x="170" y="205" font-size="13" fill="currentColor" text-anchor="middle">prism</text>
  <text x="408" y="122" font-size="12" fill="#f87171" text-anchor="end">red bends least</text>
  <text x="300" y="215" font-size="12" fill="#c084fc">violet bends most</text>
</svg><figcaption>A prism bends each colour by a different amount and spreads white light into a spectrum.</figcaption></figure>
<p>A <b>rainbow</b> is made the same way by millions of raindrops. Sunlight goes into each drop, bounces off the back and comes out again, split into colours. That is why you only see a rainbow when the Sun is <b>behind</b> you and the rain is in front of you.</p>
<div class="home"><b>Try it at home:</b> On a sunny day, stand with your back to the Sun and spray a fine mist from a garden hose. Move until a small rainbow appears in the spray. Indoors, put a glass of water on a sunny windowsill and look for a little rainbow on the floor or wall.</div>
<div class="fact"><b>Fun fact:</b> A rainbow is really a whole circle. From the ground, the land gets in the way and you see only the top part, but from an aeroplane or a high mountain you can sometimes see the full ring.</div>`,
        },
        {
          level: "school",
          html: `
<h4>Colour is wavelength</h4>
<p>Visible light runs from about 380 nm (violet) to about 750 nm (red). Roughly: violet 380–450 nm, blue 450–495 nm, green 495–570 nm, yellow 570–590 nm, orange 590–620 nm, red 620–750 nm. The boundaries are a matter of convention: the spectrum changes smoothly.</p>
<h4>Dispersion</h4>
<p>The refractive index n = c/v (speed of light in vacuum divided by the speed in the material) depends slightly on wavelength. This is called <b>dispersion</b>. For a common optical glass (borosilicate crown, BK7): n = 1.5143 for red light (656 nm), 1.5168 for yellow (588 nm) and 1.5224 for blue (486 nm).</p>
<p><b>Worked example.</b> Light hits a flat block of this glass at θ<sub>1</sub> = 30° from the normal. Snell's law, sin θ<sub>2</sub> = sin θ<sub>1</sub>/n, gives: red, sin θ<sub>2</sub> = 0.5/1.5143 = 0.3302, θ<sub>2</sub> = 19.28°; blue, sin θ<sub>2</sub> = 0.5/1.5224 = 0.3284, θ<sub>2</sub> = 19.17°. The colours separate by only about 0.1°. A prism makes the light bend twice, in the same direction, and at steeper angles, which spreads the colours more; still, the spread is a few degrees at most.</p>
<h4>Rainbows</h4>
<figure class="diagram"><svg viewBox="0 0 400 260" role="img" aria-label="Sunlight enters a raindrop, reflects off the back and leaves at about 42 degrees to the incoming direction">
  <circle cx="200" cy="110" r="70" fill="#60a5fa" fill-opacity="0.15" stroke="#60a5fa" stroke-width="2"/>
  <line x1="20" y1="49.7" x2="164.4" y2="49.7" stroke="currentColor" stroke-width="2.5"/>
  <polyline points="164.4,49.7 265.3,84.9 214,178.7" fill="none" stroke="#fbbf24" stroke-width="2"/>
  <line x1="214" y1="178.7" x2="139.7" y2="245.6" stroke="#f87171" stroke-width="2.5"/>
  <line x1="214" y1="178.7" x2="110" y2="178.7" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" opacity="0.7"/>
  <path d="M174 178.7 A40 40 0 0 0 184.3 205.5" fill="none" stroke="#f87171" stroke-width="1.5"/>
  <text x="150" y="200" font-size="13" fill="#f87171">42°</text>
  <text x="20" y="40" font-size="13" fill="currentColor">sunlight</text>
  <text x="280" y="88" font-size="13" fill="currentColor">reflects at the back</text>
  <text x="150" y="252" font-size="13" fill="currentColor" text-anchor="end">to your eye</text>
</svg><figcaption>In a raindrop, light refracts in, reflects once off the back and refracts out. Red light comes out bunched near 42.4° from the direction back towards the Sun, violet near 40.7°.</figcaption></figure>
<p>Light entering a spherical drop at different heights comes out at different angles, but the angles bunch up near a maximum of about 42° (measured from the line from the Sun through your head). Every drop that sits 42° from the point opposite the Sun sends you bright red light; drops at about 40.7° send violet. So the bow is a circle around the shadow of your head, red on the outside. A fainter <b>secondary bow</b> at about 51°, with the colours reversed, comes from light that reflects twice inside the drop. The sky between the two bows is darker (Alexander's dark band).</p>
<h4>Why is the sky blue?</h4>
<p>Air molecules are much smaller than a wavelength and scatter light with a strength proportional to 1/λ⁴ (<b>Rayleigh scattering</b>, explained by Lord Rayleigh in 1871). Blue light at 450 nm is scattered (700/450)⁴ ≈ 6 times more than red at 700 nm, so blue light comes at you from all over the sky, while the direct sunlight at sunset, having crossed a lot of air, has lost much of its blue and looks red-orange. (The sky is not violet because sunlight contains less violet, some of it is absorbed high in the atmosphere, and our eyes are less sensitive to it.)</p>`,
        },
        {
          level: "university",
          html: `
<h4>Describing dispersion</h4>
<p>Away from absorption lines, glass is well described by the Sellmeier equation n²(λ) = 1 + Σ<sub>j</sub> B<sub>j</sub>λ²/(λ² − C<sub>j</sub>), or more roughly by Cauchy's n(λ) ≈ A + B/λ². Opticians quote the <b>Abbe number</b> V<sub>d</sub> = (n<sub>d</sub> − 1)/(n<sub>F</sub> − n<sub>C</sub>); for BK7, V<sub>d</sub> = 0.5168/0.0081 ≈ 64 (low dispersion); flint glasses have V<sub>d</sub> ≈ 30–40. Dispersion also separates two speeds: a pulse travels at the <b>group velocity</b></p>
<p class="formula">v<sub>g</sub> = dω/dk = c / n<sub>g</sub>, &nbsp; n<sub>g</sub> = n − λ dn/dλ</p>
<p>which, in normal dispersion (dn/dλ &lt; 0), is slower than the phase velocity c/n.</p>
<h4>The rainbow angle (Descartes, 1637)</h4>
<p>A ray entering a sphere at angle of incidence θ<sub>i</sub>, refracting to θ<sub>r</sub> (sin θ<sub>i</sub> = n sin θ<sub>r</sub>), reflecting once inside and leaving, is deviated by</p>
<p class="formula">D(θ<sub>i</sub>) = 180° + 2θ<sub>i</sub> − 4θ<sub>r</sub></p>
<p>D has a minimum where dD/dθ<sub>i</sub> = 0, i.e. cos²θ<sub>i</sub> = (n² − 1)/3. Rays near that minimum pile up (a caustic), which makes the bow bright. For n = 1.333: θ<sub>i</sub> = 59.4°, θ<sub>r</sub> = 40.2°, D = 138.0°, so the bow sits 180° − D = 42.0° from the antisolar point. With n = 1.331 (red) the angle is 42.4°; with n = 1.343 (violet) it is 40.7°: the bow is about 1.7° wide, plus the 0.5° width of the Sun's disc. For two internal reflections, D = 2θ<sub>i</sub> − 6θ<sub>r</sub> (plus a whole turn), with cos²θ<sub>i</sub> = (n² − 1)/8, giving the secondary bow near 51°.</p>
<h4>Colour in the simulator</h4>
<p>Each source in Wave Dude has one frequency (its “level”); the display colours sources by level, but that is a label, not physics. Materials have a single n for all frequencies, so there is no material dispersion: draw a glass triangle in the Sandbox and send two line sources at different levels through it, and they bend almost identically. The only frequency dependence is the grid's own numerical dispersion: short waves (few cells per wavelength) travel a little too slowly, more so inside glass, where they are n times shorter. It acts like a weak, artificial normal dispersion and should be kept small (≥ 10 cells per wavelength in the densest material) rather than used as a feature.</p>`,
        },
        {
          level: "research",
          title: "Modelling dispersion and the wave theory of the rainbow",
          html: `
<p><b>Where dispersion comes from.</b> In the Lorentz oscillator model each bound electron resonance contributes ε(ω) = 1 + Σ<sub>j</sub> f<sub>j</sub>ω<sub>p</sub>²/(ω<sub>j</sub>² − ω² − iγ<sub>j</sub>ω). Below the ultraviolet resonances of glass n rises with frequency (normal dispersion); near a resonance it falls and the material absorbs (anomalous dispersion). Real and imaginary parts are tied together by the Kramers–Kronig relations, a consequence of causality.</p>
<p><b>Dispersion in a time-domain solver.</b> A frequency-dependent ε means the polarization depends on the past field, a convolution in time. FDTD codes handle this with auxiliary differential equations (one extra ODE per Lorentz or Drude pole, updated at each cell alongside the field) or with recursive convolution; see Taflove &amp; Hagness ch. 9. Adding one Lorentz pole to Wave Dude would need an extra state per cell, and a white-light pulse would then split into colours in a prism.</p>
<p><b>Rainbows beyond rays.</b> Ray optics predicts an infinitely bright edge at the rainbow angle. Airy's 1838 wave theory replaced it with the Airy function, which also explains the faint <b>supernumerary bows</b> just inside the primary: interference between the two rays that leave at the same angle. The exact solution for scattering from a sphere is Mie theory (1908); the complex-angular-momentum treatment of Nussenzveig gives accurate asymptotics. The rainbow is a classic example of a fold caustic, studied in catastrophe optics (Berry and Upstill, Progress in Optics 18, 1980). A 2D version, a disc of water lit by a line source, can be studied in the simulator for a single frequency.</p>`,
        },
      ],
      tryIt: [
        { experiment: "refraction", label: "Bending waves: Snell's law" },
        { experiment: "wavelength", label: "How long is a wave?" },
      ],
      sources: [
        "E. Hecht, Optics, 5th ed. (Pearson, 2017), §3.5 (dispersion), §4.3 (rainbows) and §8 (scattering)",
        "SCHOTT optical glass data sheet, N-BK7 (refractive indices and Abbe number) — https://www.schott.com/",
        "C. F. Bohren and D. R. Huffman, Absorption and Scattering of Light by Small Particles (Wiley, 1983)",
        "H. M. Nussenzveig, The theory of the rainbow, Scientific American 236 (4), 116 (1977)",
        "M. V. Berry and C. Upstill, Catastrophe optics: morphologies of caustics and their diffraction patterns, Progress in Optics 18, 257 (1980)",
        "A. Taflove and S. C. Hagness, Computational Electrodynamics, 3rd ed. (Artech House, 2005), ch. 9 (dispersive materials)",
      ],
    },

    // ------------------------------------------------------------------ resolution
    {
      id: "resolution-diffraction-limit",
      title: "Resolution and the diffraction limit",
      summary: "Why no lens can focus light to a point, why a light microscope cannot see atoms, and how the Airy disc and the Rayleigh criterion set the limit.",
      sections: [
        {
          level: "kids",
          html: `
<p>Could you build a microscope powerful enough to see a single atom with ordinary light? Sadly, no, and the reason is that light is a wave.</p>
<p>A wave cannot make a spot that is much smaller than its own wavelength. When a lens gathers light into its focus, the light does not end up in a perfect point. It makes a tiny blurry blob, a bit less than one wavelength across. Two things that are closer together than that blob is wide just blur into one.</p>
<p>It is like trying to feel the shape of a tiny bead while wearing thick winter gloves. You can tell there is <i>something</i> there, but not what shape it has, and two beads side by side feel like one lump. The light wave is the glove.</p>
<p>Atoms are about a few ten-millionths of a millimetre across. A wave of visible light is thousands of times longer than that. So to light, a single atom is far too small to make out, the way a grain of sand is too small to feel through thick gloves. To see atoms, scientists use electrons, which behave like waves with much, much shorter wavelengths.</p>
<div class="home"><b>Try it at home:</b> On a dark evening, look at a car with its headlights on, very far down a long straight road. Far away, the two headlights look like one light. As the car comes closer, it suddenly becomes two. The distance where that happens tells you how sharp your eyes are.</div>
<div class="fact"><b>Fun fact:</b> About 2,500 atoms lined up in a row are as long as one wave of green light.</div>`,
        },
        {
          level: "school",
          html: `
<h4>Waves spread out from an opening</h4>
<p>A wave passing through a gap of width a spreads out. The first dark direction on either side of the central beam is at</p>
<p class="formula">a · sin θ = λ</p>
<p>where θ is the angle from the straight-ahead direction and λ the wavelength: the narrower the gap, the wider the spread. A lens is an opening too, so the light it focuses is spread by diffraction into a small blob. For a round lens of diameter D the blob is a bright disc surrounded by faint rings, the <b>Airy disc</b> (worked out by George Airy in 1835). Its first dark ring is at</p>
<p class="formula">sin θ ≈ 1.22 λ / D</p>
<h4>The Rayleigh criterion</h4>
<p>Two points of light (two stars, two headlights) are just <b>resolved</b> when the centre of one Airy pattern falls on the first dark ring of the other, i.e. when their angular separation is θ ≈ 1.22 λ/D (in radians, for small angles).</p>
<figure class="diagram"><svg viewBox="0 0 420 200" role="img" aria-label="Two diffraction peaks at the Rayleigh separation: their sum has a small dip between them">
  <line x1="30" y1="160" x2="390" y2="160" stroke="currentColor" stroke-width="1.2"/>
  <polyline fill="none" stroke="#60a5fa" stroke-width="2" points="30,159 37,158 43,158 50,158 56,158 63,158 69,159 76,160 82,160 89,159 95,155 102,150 109,141 115,129 122,115 128,99 135,82 141,65 148,50 154,39 161,32 167,30 174,34 181,42 187,55 194,70 200,87 207,104 213,120 220,133 226,144 233,152 239,157 246,159 253,160 259,160 266,159 272,158 279,158 285,158 292,158 298,159 305,159 311,160 318,160 325,160 331,160 338,160 344,160 351,160 357,159 364,159 370,160 377,160 383,160 390,160"/>
  <polyline fill="none" stroke="#f87171" stroke-width="2" points="30,160 37,160 43,160 50,160 56,159 63,159 69,160 76,160 82,160 89,160 95,160 102,160 109,160 115,159 122,159 128,158 135,158 141,158 148,158 154,159 161,160 167,160 174,159 181,157 187,152 194,144 200,133 207,120 213,104 220,87 226,70 233,55 239,42 246,34 253,30 259,32 266,39 272,50 279,65 285,82 292,99 298,115 305,129 311,141 318,150 325,155 331,159 338,160 344,160 351,159 357,158 364,158 370,158 377,158 383,158 390,159"/>
  <polyline fill="none" stroke="#fbbf24" stroke-width="2" stroke-dasharray="5 3" points="30,159 37,158 43,158 50,157 56,157 63,158 69,159 76,160 82,160 89,159 95,155 102,150 109,141 115,129 122,114 128,97 135,79 141,63 148,49 154,38 161,32 167,30 174,33 181,39 187,46 194,54 200,61 207,64 213,64 220,61 226,54 233,46 239,39 246,33 253,30 259,32 266,38 272,49 279,63 285,79 292,97 298,114 305,129 311,141 318,150 325,155 331,159 338,160 344,160 351,159 357,158 364,157 370,157 377,158 383,158 390,159"/>
  <line x1="167" y1="172" x2="253" y2="172" stroke="currentColor" stroke-width="1.2"/><line x1="167" y1="166" x2="167" y2="178" stroke="currentColor"/><line x1="253" y1="166" x2="253" y2="178" stroke="currentColor"/>
  <text x="210" y="192" font-size="13" fill="currentColor" text-anchor="middle">θ = 1.22 λ / D</text>
  <text x="40" y="22" font-size="13" fill="#fbbf24">together: a small dip</text>
  <text x="100" y="70" font-size="12" fill="#60a5fa" text-anchor="end">star 1</text>
  <text x="300" y="70" font-size="12" fill="#f87171">star 2</text>
</svg><figcaption>Two Airy patterns at the Rayleigh limit: the peak of one sits on the first dark ring of the other. Their sum (dashed) dips to about three quarters of the peak between them: just enough to see two.</figcaption></figure>
<p><b>Worked example 1 (your eye).</b> Pupil D = 3 mm, green light λ = 550 nm: θ = 1.22 × 550 × 10<sup>−9</sup> / 3 × 10<sup>−3</sup> ≈ 2.2 × 10<sup>−4</sup> rad. Headlights 1.5 m apart could, in principle, be told apart up to 1.5 / 2.2 × 10<sup>−4</sup> ≈ 6.7 km away. Real eyes do somewhat worse, because the light-sensitive cells in the retina have a finite size and the eye's optics are not perfect.</p>
<p><b>Worked example 2 (Hubble).</b> D = 2.4 m, λ = 500 nm: θ = 1.22 × 500 × 10<sup>−9</sup> / 2.4 ≈ 2.5 × 10<sup>−7</sup> rad ≈ 0.05 arcseconds. A bigger mirror sees finer detail; that is one reason telescopes keep getting bigger.</p>
<p><b>Microscopes.</b> The best light microscopes resolve about 200 nm. An atom is about 0.1–0.3 nm across, a thousand times smaller. Electron microscopes use electrons, whose wavelength at 100 kV is only about 0.004 nm, and the best of them resolve individual atoms.</p>`,
        },
        {
          level: "university",
          html: `
<h4>Fraunhofer diffraction from a circular aperture</h4>
<p>In the far field (or the focal plane of a lens), the field is the Fourier transform of the aperture. For a circular aperture of radius a, with x = k a sin θ:</p>
<p class="formula">I(θ) = I<sub>0</sub> [ 2 J<sub>1</sub>(x) / x ]²</p>
<p>J<sub>1</sub> is the Bessel function of order one. Its first zero is x = 3.8317, so sin θ = 3.8317/(k a) = 1.22 λ/D. The central disc holds about 84% of the power. For a slit (and for the simulator's 2D “lenses”, which are cylindrical) the pattern is instead sinc²(π a sin θ / λ) with first zero at sin θ = λ/a: the factor 1.22 belongs to round apertures.</p>
<h4>Abbe's limit for microscopes</h4>
<p>Abbe (1873) analysed a microscope imaging a periodic object. A grating of period p diffracts light into orders at sin θ<sub>m</sub> = mλ/(np); the image shows the period only if the objective collects at least two orders. With oblique illumination that gives the smallest resolvable period</p>
<p class="formula">d<sub>min</sub> = λ / (2 NA), &nbsp; NA = n sin α</p>
<p>where α is the half-angle of the cone of light the objective accepts and n the index of the immersion medium. With oil (n = 1.52) NA can reach about 1.4, so at λ = 550 nm d<sub>min</sub> ≈ 200 nm. Rayleigh's two-point version for a microscope is 0.61 λ/NA. Both criteria are conventions: with a good model of the blur and plenty of light, two points can be located far more precisely than this; what is lost is the ability to separate them in a single image.</p>
<h4>Why there is a limit at all</h4>
<p>A feature of size s needs spatial frequencies k<sub>x</sub> ~ 2π/s. A propagating wave in a medium of index n has |k<sub>x</sub>| ≤ n k<sub>0</sub>; anything finer becomes evanescent (k<sub>y</sub> imaginary, as in total internal reflection) and dies out within a fraction of a wavelength. Far from the object, details below about λ/(2n) are simply not in the field any more.</p>
<p><b>In the simulator.</b> In the Sandbox Lens demo (λ ≈ 15 cells, aperture 0.72 H, focus about 0.78 H behind the lens, so NA ≈ 0.42) the focal spot measures 17–18 cells across at half maximum, close to λ/(2 NA) ≈ 18 cells. A vertical line probe through the focus shows the profile.</p>`,
        },
        {
          level: "research",
          title: "Beating the limit, and the grid's own limit",
          html: `
<p><b>Super-resolution.</b> The diffraction limit applies to linear, far-field imaging of the whole field at once. Methods that break one of these assumptions can go beyond it. Near-field scanning optical microscopy (SNOM) puts a sub-wavelength probe inside the evanescent field. Structured illumination shifts high spatial frequencies into the passband (about a factor of 2). STED (stimulated emission depletion, proposed by Hell and Wichmann in 1994) uses a nonlinear switch-off of fluorescence around the focus, and single-molecule localization (PALM/STORM, 2006) switches on sparse molecules and localizes each to nanometres. Betzig, Hell and Moerner received the 2014 Nobel Prize in Chemistry for super-resolved fluorescence microscopy. Pendry's “perfect lens” proposal (Phys. Rev. Lett. 85, 3966, 2000) uses a slab with n = −1 to amplify evanescent waves; real metamaterials are limited by losses.</p>
<p><b>The grid's resolution.</b> The simulator has its own, coarser limit: the shortest wave it can carry is 2 cells (the Nyquist limit), and waves shorter than about 6–10 cells already travel noticeably too slowly and anisotropically. Sub-wavelength objects are allowed, but anything smaller than a cell cannot be drawn. Evanescent tails decay over a fraction of a wavelength, only a few cells, so they are resolved roughly. For a diffraction-limited test, check the spot size against λ/(2 NA) at two grid scales; if the answer changes, the grid, not the optics, is limiting.</p>
<p>References: Born &amp; Wolf §8.5–8.6; Goodman, <i>Introduction to Fourier Optics</i>; S. W. Hell, Far-field optical nanoscopy, Science 316, 1153 (2007); the 2014 Nobel Prize in Chemistry scientific background (nobelprize.org).</p>`,
        },
      ],
      tryIt: [
        { experiment: "single-slit", label: "One gap: how waves spread" },
        { experiment: "double-slit", label: "The double slit" },
      ],
      sources: [
        "E. Hecht, Optics, 5th ed. (Pearson, 2017), §10.2 (Fraunhofer diffraction, the Airy pattern, resolution)",
        "M. Born and E. Wolf, Principles of Optics, 7th ed. (Cambridge University Press, 1999), §8.5–8.6",
        "J. W. Goodman, Introduction to Fourier Optics, 3rd ed. (Roberts, 2005)",
        "Microscope resolution: concepts, factors and calculation (Leica Microsystems) — https://www.leica-microsystems.com/science-lab/microscope-resolution-concepts-factors-and-calculation/",
        "Rayleigh or Abbe? Origin and naming of the resolution formula, J. Micro/Nanolithogr. MEMS MOEMS 19, 040501 (2020)",
        "The Nobel Prize in Chemistry 2014 (super-resolved fluorescence microscopy) — https://www.nobelprize.org/prizes/chemistry/2014/summary/",
        "J. B. Pendry, Negative refraction makes a perfect lens, Phys. Rev. Lett. 85, 3966 (2000)",
      ],
    },

    // ------------------------------------------------------------------ polarization
    {
      id: "polarization",
      title: "Polarization (the one the simulator cannot show)",
      summary: "Light wiggles across its direction of travel, and the direction of the wiggle is its polarization: sunglasses, glare and screens, and why a scalar simulator has none.",
      sections: [
        {
          level: "kids",
          html: `
<p>Tie a rope to a fence post and shake the end. You can shake it <b>up and down</b>, or <b>side to side</b>. Either way a wave runs along the rope. The direction of the wiggle is called the wave's <b>polarization</b>.</p>
<p>Light is a wiggle too, and it also wiggles across the direction it travels. Most light, from the Sun or a lamp, is a jumble of all wiggle directions. A <b>polarizing filter</b> is like a fence with narrow upright slats: up-and-down rope waves slip through the gaps, side-to-side ones get stopped.</p>
<figure class="diagram"><svg viewBox="0 0 400 230" role="img" aria-label="An up-and-down rope wave passes through a slatted fence; a side-to-side wave is stopped">
  <g stroke="currentColor" stroke-width="5"><line x1="190" y1="10" x2="190" y2="105"/><line x1="210" y1="10" x2="210" y2="105"/><line x1="190" y1="125" x2="190" y2="220"/><line x1="210" y1="125" x2="210" y2="220"/></g>
  <path d="M20 58 C 40 28, 60 28, 80 58 S 120 88, 140 58 S 180 28, 200 58 S 240 88, 260 58 S 300 28, 320 58 S 360 88, 380 58" fill="none" stroke="#34d399" stroke-width="3"/>
  <path d="M20 172 C 40 162, 60 162, 80 172 S 120 182, 140 172 S 180 162, 186 170" fill="none" stroke="#f87171" stroke-width="3" stroke-dasharray="6 3"/>
  <line x1="214" y1="172" x2="380" y2="172" stroke="#f87171" stroke-width="1.5" opacity="0.5"/>
  <text x="20" y="20" font-size="13" fill="currentColor">up and down: gets through</text>
  <text x="20" y="200" font-size="13" fill="currentColor">side to side (in and out of the page)</text>
  <text x="380" y="195" font-size="13" fill="#f87171" text-anchor="end">blocked</text>
</svg><figcaption>A polarizing filter works like a fence of upright slats: it lets through only one wiggle direction.</figcaption></figure>
<p>Polarizing sunglasses use this to cut glare. Light that bounces off water or a wet road wiggles mostly side to side, so glasses that only let up-and-down wiggles through block most of the glare.</p>
<p>Wave Dude <b>cannot show polarization</b>. In the simulator each spot only has a “how high” number, like the height of water in a bath. There is no direction of wiggle, so there is nothing to filter.</p>
<div class="home"><b>Try it at home:</b> If someone has polarizing sunglasses, look through them at a computer or phone screen and slowly tilt your head (or the glasses) sideways. At some angle the screen goes dark, because the screen's light is already polarized. Then look at the shine on a puddle or a window and tilt again.</div>
<div class="fact"><b>Fun fact:</b> Bees can see the polarization of light from the blue sky, which we cannot. They use the pattern in the sky as a compass to find their way back to the hive.</div>`,
        },
        {
          level: "school",
          html: `
<h4>Transverse and longitudinal</h4>
<p>Only <b>transverse</b> waves, which wiggle across their direction of travel, can be polarized. Light is transverse. Sound in air is <b>longitudinal</b> (the air moves back and forth along the direction of travel), so sound has no polarization.</p>
<h4>Malus's law</h4>
<p>An ideal polarizer passes half of unpolarized light. If polarized light of intensity I<sub>0</sub> meets a polarizer whose axis makes an angle θ with the light's polarization direction, the transmitted intensity is</p>
<p class="formula">I = I<sub>0</sub> cos²θ</p>
<p><b>Worked example.</b> Unpolarized light of intensity 80 W/m² goes through a polarizer (40 W/m² left), then a second polarizer at θ = 60° to the first: I = 40 × cos²60° = 40 × 0.25 = 10 W/m². At θ = 90° (“crossed polarizers”), nothing gets through.</p>
<h4>Polarization by reflection</h4>
<p>When light reflects off glass or water, the part polarized parallel to the surface reflects much more strongly. At one angle, <b>Brewster's angle</b> θ<sub>B</sub>, the reflected light is completely polarized parallel to the surface:</p>
<p class="formula">tan θ<sub>B</sub> = n<sub>2</sub> / n<sub>1</sub></p>
<p>From air onto water (n = 1.33): θ<sub>B</sub> = 53.1°; onto glass (n = 1.5): 56.3°, measured from the normal. Étienne-Louis Malus discovered polarization by reflection in 1808 while looking through a calcite crystal at sunlight reflected from a window, and David Brewster found the law for its angle in 1815. Young and Fresnel then concluded (around 1817–1821) that light waves must be transverse.</p>
<p class="aside"><b>Not in the simulator.</b> Wave Dude stores one number per cell, so it is a <b>scalar</b> wave model: it cannot represent a direction of oscillation, has no polarizers, and shows no Brewster angle. What it shows is correct for light with one fixed polarization (see the university section).</p>`,
        },
        {
          level: "university",
          html: `
<h4>Describing polarization</h4>
<p>For a plane wave travelling along z, <b>E</b> = Re{(E<sub>x</sub>, E<sub>y</sub>) e<sup>i(kz − ωt)</sup>} with complex amplitudes. The <b>Jones vector</b> (E<sub>x</sub>, E<sub>y</sub>) describes the state: (1, 0) horizontal, (1, 1)/√2 linear at 45°, (1, ±i)/√2 circular (the sign of the handedness depends on convention), anything else elliptical. Optical elements act as 2 × 2 Jones matrices; a linear polarizer at angle θ is P = [[cos²θ, sinθ cosθ], [sinθ cosθ, sin²θ]], which gives Malus's law. Partially polarized light needs the Stokes parameters (S<sub>0</sub>, S<sub>1</sub>, S<sub>2</sub>, S<sub>3</sub>) or a coherency matrix.</p>
<h4>Fresnel equations and Brewster's angle</h4>
<p>For incidence from n<sub>1</sub> onto n<sub>2</sub> with angles θ<sub>i</sub>, θ<sub>t</sub>, the amplitude reflection coefficients for <b>s</b> (E perpendicular to the plane of incidence) and <b>p</b> (E in the plane of incidence) are</p>
<p class="formula">r<sub>s</sub> = (n<sub>1</sub>cos θ<sub>i</sub> − n<sub>2</sub>cos θ<sub>t</sub>) / (n<sub>1</sub>cos θ<sub>i</sub> + n<sub>2</sub>cos θ<sub>t</sub>), &nbsp; r<sub>p</sub> = (n<sub>2</sub>cos θ<sub>i</sub> − n<sub>1</sub>cos θ<sub>t</sub>) / (n<sub>2</sub>cos θ<sub>i</sub> + n<sub>1</sub>cos θ<sub>t</sub>)</p>
<p>r<sub>p</sub> = 0 when θ<sub>i</sub> + θ<sub>t</sub> = 90°, which with Snell's law gives tan θ<sub>B</sub> = n<sub>2</sub>/n<sub>1</sub>; r<sub>s</sub> never vanishes for non-magnetic media. Air to glass (n = 1.5) at 45°: θ<sub>t</sub> = 28.1°, R<sub>s</sub> = |r<sub>s</sub>|² ≈ 9.2% but R<sub>p</sub> ≈ 0.85%. At normal incidence both give R = ((n<sub>1</sub> − n<sub>2</sub>)/(n<sub>1</sub> + n<sub>2</sub>))² = 4%.</p>
<h4>Which polarization does the simulator model?</h4>
<p>In a 2D, z-invariant, non-magnetic dielectric, Maxwell's equations split into two independent problems. With <b>E</b> along z (out of the screen):</p>
<p class="formula">∂²E<sub>z</sub>/∂t² = (c<sub>0</sub>/n)² ∇²E<sub>z</sub></p>
<p>with E<sub>z</sub> and its normal derivative continuous at interfaces. That is the form Wave Dude solves (c² = 1/n² times a discrete Laplacian), so its field behaves like <b>s-polarized</b> light: E perpendicular to the plane of incidence, which here is the screen. (Slab-waveguide texts call this TE; Taflove's FDTD notation calls the same field set TM<sub>z</sub>. Check the convention before comparing.) With <b>H</b> along z instead, the equation is ∂²H<sub>z</sub>/∂t² = c<sub>0</sub>² ∇·((1/n²)∇H<sub>z</sub>), and the interface condition becomes continuity of (1/n²)∂H<sub>z</sub>/∂n. That p-polarized case is <i>not</i> what the simulator solves, so it shows reflection following r<sub>s</sub>, never Brewster's angle.</p>`,
        },
        {
          level: "research",
          title: "Vector waves and what a vector solver would add",
          html: `
<p>A full-vector simulation of light uses Yee's staggered-grid FDTD scheme (K. S. Yee, IEEE Trans. Antennas Propag. 14, 302, 1966): <b>E</b> and <b>H</b> components live on interleaved grids and leapfrog in time. In 2D it decouples into the (E<sub>z</sub>, H<sub>x</sub>, H<sub>y</sub>) and (H<sub>z</sub>, E<sub>x</sub>, E<sub>y</sub>) sets; the first is equivalent to the scalar equation solved here. Adding the second set would give the p-polarization, Brewster's angle and the different behaviour of the two polarizations at metal surfaces (surface plasmons need p-polarization) at roughly double the cost. A divergence-form update, ∇·((1/n²)∇u), on the same grid would also do it for non-magnetic dielectrics.</p>
<p>Phenomena that need more than that: birefringence (calcite, liquid crystals, stressed plastic) needs an anisotropic permittivity tensor; optical activity and Faraday rotation need chirality or magneto-optic terms; polarization-mode dispersion in fibres needs 3D; depolarization by scattering needs vector Mie theory. In 3D, even an isotropic scene couples the polarizations at every curved interface, so the scalar picture is an approximation (good for paraxial beams and weak index contrast, poor for high-NA focusing, where the longitudinal field component at focus becomes significant; Richards and Wolf, Proc. R. Soc. A 253, 358, 1959).</p>
<p>References: Born &amp; Wolf ch. 1 and 10; Hecht ch. 8; Taflove &amp; Hagness ch. 3 (2D TM<sub>z</sub>/TE<sub>z</sub> modes); D. Goldstein, <i>Polarized Light</i> (CRC Press).</p>`,
        },
      ],
      tryIt: [
        { experiment: "refraction", label: "Bending waves: Snell's law (one polarization only)" },
      ],
      sources: [
        "E. Hecht, Optics, 5th ed. (Pearson, 2017), ch. 4 (Fresnel equations) and ch. 8 (polarization)",
        "M. Born and E. Wolf, Principles of Optics, 7th ed. (Cambridge University Press, 1999), §1.5",
        "Étienne-Louis Malus (biography, MacTutor / DSB) — https://mathshistory.st-andrews.ac.uk/DSB/Malus.pdf",
        "D. Brewster, On the laws which regulate the polarisation of light by reflexion from transparent bodies, Phil. Trans. R. Soc. 105, 125 (1815)",
        "A. Taflove and S. C. Hagness, Computational Electrodynamics, 3rd ed. (Artech House, 2005), ch. 3",
        "K. S. Yee, Numerical solution of initial boundary value problems involving Maxwell's equations in isotropic media, IEEE Trans. Antennas Propag. 14, 302 (1966)",
        "K. von Frisch, The Dance Language and Orientation of Bees (Harvard University Press, 1967)",
      ],
    },
  ],
};
