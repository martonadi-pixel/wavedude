// Wave Dude 2D web - "How it works" library: Waves at work (real-world applications).
// GPL-3.0-or-later.

import type { LearnCategory } from "../types";
import { page as computingWithWaves } from "./computing-with-waves";

export const category: LearnCategory = {
  id: "waves-at-work",
  title: "Waves at work",
  icon: "📡",
  blurb: "Bats, scanners, radar, earthquakes, headphones, guitars, Wi-Fi and computers made of light: the same wave ideas doing real jobs.",
  pages: [
    // ------------------------------------------------------------------------------------------ echolocation and sonar
    {
      id: "echolocation-sonar",
      title: "Echolocation and sonar",
      summary: "Bats, dolphins and ships find things by sending out a sound and timing its echo.",
      sections: [
        {
          level: "kids",
          html: `
<p>Shout in a big empty hall or towards a cliff and, a moment later, your shout comes back. That is an <b>echo</b>: the sound wave hit something hard and bounced back to you, like a ball thrown at a wall.</p>
<p>Bats use echoes to "see" in the dark. A bat makes very high squeaks, much too high for you to hear, and listens for the echoes. A quick echo means the moth is close. A slow echo means it is far away. Bats are so good at it that they can catch tiny insects in total darkness.</p>
<p>Dolphins do the same under water with fast clicks. Ships use a machine called <b>sonar</b>: it sends a "ping" down into the sea and times how long the echo takes to come back from the sea floor or from a shoal of fish.</p>
<figure class="diagram"><svg viewBox="0 0 320 130">
  <circle cx="40" cy="65" r="12" fill="#c084fc"/>
  <text x="40" y="100" font-size="13" fill="currentColor" text-anchor="middle">bat</text>
  <path d="M 70 40 Q 82 65 70 90" fill="none" stroke="#60a5fa" stroke-width="2.5"/>
  <path d="M 95 32 Q 110 65 95 98" fill="none" stroke="#60a5fa" stroke-width="2.5"/>
  <path d="M 120 26 Q 138 65 120 104" fill="none" stroke="#60a5fa" stroke-width="2.5"/>
  <text x="100" y="18" font-size="13" fill="#60a5fa" text-anchor="middle">squeak →</text>
  <ellipse cx="270" cy="65" rx="10" ry="6" fill="#fbbf24"/>
  <text x="270" y="100" font-size="13" fill="currentColor" text-anchor="middle">moth</text>
  <path d="M 240 45 Q 228 65 240 85" fill="none" stroke="#f87171" stroke-width="2"/>
  <path d="M 215 38 Q 200 65 215 92" fill="none" stroke="#f87171" stroke-width="2"/>
  <text x="225" y="18" font-size="13" fill="#f87171" text-anchor="middle">← echo</text>
</svg><figcaption>The bat's squeak travels out, bounces off the moth, and the echo comes back.</figcaption></figure>
<div class="home"><b>Try it at home:</b> Stand about 20 big steps from a large flat wall outdoors (a school building or garage works) and clap once, sharply. Can you hear the clap come back? Walk closer and clap again: the echo arrives sooner, until it is so quick it blends into your clap.</div>`,
        },
        {
          level: "school",
          html: `
<p>Echolocation and sonar work by <b>timing</b>. The sound travels to the object and back, so it covers twice the distance:</p>
<p class="formula">d = v · t / 2</p>
<p>Here <i>d</i> is the distance to the object (m), <i>v</i> is the speed of sound in the medium (m/s) and <i>t</i> is the time between sending the pulse and hearing the echo (s).</p>
<h4>Worked examples</h4>
<ul>
<li><b>Bat in air</b> (v ≈ 343 m/s at 20 °C): an echo after 20 ms = 0.020 s means d = 343 × 0.020 / 2 ≈ 3.4 m.</li>
<li><b>Ship's depth sounder</b> in sea water (v ≈ 1500 m/s): an echo after 4.0 s means d = 1500 × 4.0 / 2 = 3000 m of water below the ship.</li>
</ul>
<h4>Why so high-pitched?</h4>
<p>A wave only bounces off an object strongly if the object is not much smaller than the <b>wavelength</b> λ = v / f. Most bat calls lie between about 20 kHz and 100 kHz; across all species the range is roughly 10 kHz to just over 200 kHz. At 50 kHz in air, λ = 343 / 50 000 ≈ 6.9 mm, about the size of a small insect. A 500 Hz sound has λ ≈ 69 cm and would mostly wash around a moth. Bottlenose dolphins click with most energy between about 40 and 130 kHz; at 100 kHz in water, λ = 1500 / 100 000 = 1.5 cm.</p>
<p>The price of high frequency is <b>range</b>: air absorbs ultrasound strongly, so a bat detects an insect only a few metres away, while dolphins can detect fish-sized targets at around 100 m. Recreational fish finders use 200 kHz for detail in shallow water and 50 kHz to reach deeper, and military low-frequency sonars work at a few hundred hertz to cover very long distances.</p>
<p class="aside">In the simulator an echo off a wall works exactly the same way, but distances are in cells and times in steps. With n = 1 a long wave moves about 0.56 cells per step, so an echo from a wall 280 cells away returns after about 2 × 280 / 0.56 ≈ 1000 steps.</p>`,
        },
        {
          level: "university",
          html: `
<h4>How far, how sharp, how loud</h4>
<p><b>Range resolution.</b> Two targets a distance Δr apart give echoes separated by 2Δr / v. A plain pulse of duration τ can separate them only if Δr ≳ vτ / 2. Bats and modern sonars avoid the trade-off between long (energetic) and short (sharp) pulses by sweeping the frequency (an FM "chirp") and correlating the echo with the known call — a <b>matched filter</b>. The correlation peak has a width of about 1/B for bandwidth B, so</p>
<p class="formula">Δr ≈ v / (2B)</p>
<p>A bat sweeping over B = 50 kHz in air gets Δr ≈ 343 / (10<sup>5</sup>) ≈ 3.4 mm from the bandwidth alone; behavioural experiments show bats discriminate range differences of the order of a millimetre or less.</p>
<p><b>Angular resolution.</b> An emitter or receiver of size D forms a beam of angular width ≈ λ / D. A sonar transducer of 0.2 m at 50 kHz in water (λ = 3 cm) has a beam of roughly 0.15 rad ≈ 9°; using 200 kHz narrows it fourfold. Manufacturers of small fish-finder transducers quote beam widths of roughly 20–50° at 50 kHz and 6–15° at 200 kHz.</p>
<p><b>Echo strength.</b> In 3D, intensity from a small source falls as 1/r<sup>2</sup> on the way out and the echo from a small target falls as 1/r<sup>2</sup> again on the way back, so received intensity goes as 1/r<sup>4</sup> times the absorption factor e<sup>−2αr</sup>. In decibels this is the active <b>sonar equation</b>:</p>
<p class="formula">EL = SL − 2 TL + TS,&nbsp;&nbsp; TL = 20 log<sub>10</sub>(r / 1 m) + α r</p>
<p>with source level SL, transmission loss TL, target strength TS, echo level EL, all in dB; detection needs EL to exceed noise level minus array gain by a detection threshold. The absorption coefficient α grows roughly with f<sup>2</sup>; in air at 50 kHz it is of the order of 1 dB per metre (the exact value depends on humidity and temperature, ISO 9613-1), which is why bat sonar is a short-range sense.</p>
<p><b>The 2D simulator is different.</b> In 2D a point source spreads over a circle, not a sphere, so amplitude falls as 1/√r and intensity as 1/r one way. An echo from a small object in the simulator therefore fades as 1/r<sup>2</sup> in intensity, not 1/r<sup>4</sup>. Distances still come out right from timing. The simulator also has no moving sources, so the <b>Doppler shift</b> that some bats use (horseshoe bats lower their call frequency to compensate for their own flight speed) is not modelled.</p>`,
        },
        {
          level: "research",
          title: "Modelling biosonar",
          html: `
<p>Biosonar research combines acoustics, signal processing and behaviour. Some active threads:</p>
<ul>
<li><b>Emission and reception beams.</b> Bat noseleaves and pinnae and the dolphin melon shape the beam. These structures are modelled with finite-element and boundary-element methods on 3D scans (e.g. the work of R. Müller and colleagues on horseshoe-bat pinna dynamics), because their size is comparable to λ and ray methods fail.</li>
<li><b>Clutter and jamming.</b> How bats in dense swarms separate their own echoes from those of neighbours, and how echoes from vegetation are rejected, is still argued about; FM frequency shifting and spatial filtering are both implicated.</li>
<li><b>Target classification.</b> Dolphins discriminate material and wall thickness of objects using spectral "ripples" in the echo; W. W. L. Au's <i>The Sonar of Dolphins</i> remains the standard reference.</li>
</ul>
<p>Full-wave simulations of sonar scenes are usually done with FDTD or k-space pseudospectral solvers (e.g. k-Wave). The Wave Dude engine is a 2D scalar finite-difference scheme: suitable for exploring timing, reflection and focusing qualitatively, but its echo amplitudes follow 2D (cylindrical) spreading, its walls are idealized, and the absorbing edge reflects a few per cent (about 6% for a 16-cell edge at λ ≈ 15 cells), which can masquerade as a weak echo in careful measurements. Check the edge before interpreting faint returns.</p>`,
        },
      ],
      tryIt: [
        { experiment: "echoes", label: "Echoes and mirrors" },
        { experiment: "absorbing-edge", label: "How good is the absorbing edge?" },
      ],
      sources: [
        "D. R. Griffin, Listening in the Dark (Yale University Press, 1958)",
        "W. W. L. Au, The Sonar of Dolphins (Springer, 1993)",
        "R. J. Urick, Principles of Underwater Sound, 3rd ed. (McGraw-Hill, 1983)",
        "Discovering sonar in bats (AAAS) — https://www.aaas.org/discovering-sonar-bats",
        "Fish finder basics: frequencies and beam angles (Furuno) — https://www.furuno.com/special/en/fishfinder/topic4.html",
        "SURTASS LFA sonar (Discovery of Sound in the Sea) — https://dosits.org/galleries/technology-gallery/locating-objects-using-sonar/surtass-lfa-sonar",
      ],
    },

    // ------------------------------------------------------------------------------------------ medical ultrasound
    {
      id: "medical-ultrasound",
      title: "Medical ultrasound",
      summary: "How a scanner builds a picture of the inside of the body from echoes, and why it needs gel.",
      sections: [
        {
          level: "kids",
          html: `
<p>An ultrasound scanner works a bit like a bat, but it looks <b>inside your body</b>. The doctor holds a small handle, called a probe, against your skin. The probe makes very fast sound vibrations, millions of times every second. That is far too high for anyone to hear.</p>
<p>The sound travels into the body. Every time it meets a boundary, for example between muscle and bone, or between a baby and the water around it, a little bit of the sound bounces back. The probe listens to all these echoes. A computer works out how far away each echo came from and paints a picture: strong echoes bright, weak echoes dark. That is how parents see their baby before it is born.</p>
<p>Before scanning, the doctor puts cold, slippery <b>gel</b> on your skin. Why? Even a very thin layer of air between the probe and the skin would bounce almost all the sound straight back, and nothing would get in. The gel squeezes the air out.</p>
<div class="fact"><b>Fun fact:</b> You can hear sounds that vibrate up to about 20 000 times a second. Ultrasound scanners use between about 2 million and 15 million vibrations a second. Ultrasound uses no X-rays, which is why it is used to check on babies.</div>
<div class="home"><b>Try it at home:</b> Put one ear flat on a wooden table and gently scratch the far end with a fingernail. Then lift your head a little and listen again. With your ear touching the table the sound is much louder: it does not have to jump across a gap of air.</div>`,
        },
        {
          level: "school",
          html: `
<h4>Measuring depth</h4>
<p>Sound travels through soft tissue at about <b>1540 m/s</b>. The scanner sends a short pulse and listens. An echo arriving after time t came from depth</p>
<p class="formula">d = v · t / 2</p>
<p>Example: an echo after 130 µs = 0.000 130 s comes from d = 1540 × 0.000 130 / 2 ≈ 0.10 m = 10 cm.</p>
<h4>Why gel? Acoustic impedance</h4>
<p>Every material has an <b>acoustic impedance</b> Z = ρ · v, where ρ is the density (kg/m³) and v the speed of sound (m/s). At a boundary the fraction of <b>intensity</b> reflected is</p>
<p class="formula">R = ( (Z<sub>2</sub> − Z<sub>1</sub>) / (Z<sub>2</sub> + Z<sub>1</sub>) )²</p>
<table>
<tr><th>Material</th><th>Z (MRayl = 10<sup>6</sup> kg m<sup>−2</sup> s<sup>−1</sup>)</th></tr>
<tr><td>Air</td><td>0.0004</td></tr>
<tr><td>Fat</td><td>1.38</td></tr>
<tr><td>Water / gel</td><td>about 1.5</td></tr>
<tr><td>Soft tissue (average)</td><td>1.63</td></tr>
<tr><td>Muscle</td><td>1.70</td></tr>
<tr><td>Bone</td><td>about 7.8</td></tr>
</table>
<ul>
<li><b>Air → tissue:</b> R = ((1.63 − 0.0004)/(1.63 + 0.0004))² ≈ 0.999. Over 99.9% bounces back. That is why there must be no air gap, and why the gel is used.</li>
<li><b>Fat → muscle:</b> R = ((1.70 − 1.38)/(1.70 + 1.38))² = (0.32/3.08)² ≈ 0.011, about 1%. Enough to see the boundary, and 99% carries on to deeper layers.</li>
<li><b>Tissue → bone:</b> R ≈ ((7.8 − 1.63)/(7.8 + 1.63))² ≈ 0.43. Bone throws a bright echo and a dark "shadow" behind it.</li>
</ul>
<h4>Choosing the frequency</h4>
<p>Wavelength λ = v / f: at 2 MHz λ ≈ 0.77 mm, at 5 MHz 0.31 mm, at 15 MHz about 0.10 mm. Shorter waves show finer detail but are absorbed faster. So deep organs (liver, a baby in the womb) are scanned at about 2–5 MHz and shallow ones (thyroid, tendons, blood vessels) at about 7–15 MHz.</p>
<figure class="diagram"><svg viewBox="0 0 320 170">
  <rect x="120" y="8" width="80" height="30" rx="4" fill="none" stroke="currentColor" stroke-width="2"/>
  <text x="160" y="28" font-size="13" fill="currentColor" text-anchor="middle">probe</text>
  <rect x="115" y="38" width="90" height="7" fill="#34d399"/>
  <text x="215" y="45" font-size="12" fill="#34d399">gel</text>
  <line x1="20" y1="48" x2="300" y2="48" stroke="currentColor" stroke-width="1.5"/>
  <text x="25" y="62" font-size="12" fill="currentColor">skin</text>
  <path d="M 30 115 Q 160 85 290 115" fill="none" stroke="#fbbf24" stroke-width="2.5"/>
  <text x="250" y="132" font-size="12" fill="#fbbf24">organ boundary</text>
  <line x1="150" y1="50" x2="150" y2="96" stroke="#60a5fa" stroke-width="2.5"/>
  <polygon points="145,90 155,90 150,100" fill="#60a5fa"/>
  <line x1="170" y1="96" x2="170" y2="54" stroke="#f87171" stroke-width="2"/>
  <polygon points="165,60 175,60 170,50" fill="#f87171"/>
  <text x="100" y="80" font-size="12" fill="#60a5fa">pulse</text>
  <text x="178" y="80" font-size="12" fill="#f87171">echo</text>
  <text x="160" y="160" font-size="12" fill="currentColor" text-anchor="middle">depth = 1540 m/s × time / 2</text>
</svg><figcaption>The gel removes the air gap so the pulse gets in; echoes from boundaries are timed to find their depth.</figcaption></figure>`,
        },
        {
          level: "university",
          html: `
<h4>From echoes to an image</h4>
<p>A B-mode ("brightness") image is built line by line. For each line the probe fires a short pulse (two or three cycles), records the echo signal for the time 2d<sub>max</sub>/v, detects its envelope, compresses the huge dynamic range logarithmically and maps it to grey levels. At 15 cm depth one line takes 2 × 0.15 / 1540 ≈ 195 µs, so 128 lines take about 25 ms: roughly 40 frames per second. Deeper imaging means fewer frames per second, set by the speed of sound.</p>
<p><b>Attenuation</b> in soft tissue rises roughly in proportion to frequency, typically quoted as about 0.5 dB cm<sup>−1</sup> MHz<sup>−1</sup> (it varies by tissue). A 5 MHz echo from 10 cm deep travels 20 cm and loses about 0.5 × 5 × 20 = 50 dB. Scanners apply <b>time-gain compensation</b>: amplification that increases with echo arrival time.</p>
<p><b>Resolution.</b> Axial resolution is about half the spatial pulse length; a 3-cycle pulse at 5 MHz is 3 × 0.31 mm ≈ 0.9 mm long, giving about 0.5 mm. Lateral resolution at the focus is about λ · F / D (F the focal depth, D the active aperture); both improve with frequency.</p>
<h4>Phased-array probes</h4>
<p>Modern probes contain 64–256 piezoelectric elements. To focus at a point (x<sub>f</sub>, z<sub>f</sub>), element i at lateral position x<sub>i</sub> fires with delay</p>
<p class="formula">τ<sub>i</sub> = ( max<sub>j</sub> r<sub>j</sub> − r<sub>i</sub> ) / v,&nbsp;&nbsp; r<sub>i</sub> = √( (x<sub>f</sub> − x<sub>i</sub>)² + z<sub>f</sub>² )</p>
<p>so that all wavelets arrive at the focus together. A linear delay ramp steers the beam; the curvature of the delay profile sets the focal depth. On receive, the same delays are applied in software ("delay-and-sum"), and can be updated continuously with depth (dynamic receive focusing). Sector ("phased") probes for the heart keep the element pitch near λ/2 to avoid grating lobes when steering to large angles.</p>
<h4>Impedance matching</h4>
<p>The piezoelectric ceramic (PZT, Z ≈ 30–35 MRayl) is badly matched to tissue (≈ 1.5 MRayl). Probes use one or more <b>quarter-wave matching layers</b>: a layer of thickness λ<sub>m</sub>/4 and impedance Z<sub>m</sub> = √(Z<sub>1</sub> Z<sub>2</sub>) (≈ 7 MRayl here) makes the reflections from its two faces cancel, exactly like an anti-reflection coating on a lens. The gel then removes the air between probe and skin.</p>
<p class="aside">In the simulator's scalar model, a change of n acts like a change of impedance with Z ∝ n: at normal incidence the amplitude reflection is (n<sub>1</sub> − n<sub>2</sub>)/(n<sub>1</sub> + n<sub>2</sub>). You can build a quarter-wave layer in the Sandbox: between n = 1 and n = 2.25, a layer of n = 1.5 that is λ/4 thick (measured inside the layer) strongly reduces the reflection at that frequency. The range 0.9–10 cannot reproduce the 4000-fold air–tissue contrast, and the model has no frequency-dependent absorption.</p>`,
        },
        {
          level: "research",
          title: "Beyond line-by-line imaging",
          html: `
<ul>
<li><b>Ultrafast imaging.</b> Instead of one focused line at a time, the probe sends unfocused plane waves at a few angles and forms the whole image in software by coherent compounding, reaching thousands of frames per second (Tanter &amp; Fink, 2014). This enables ultrafast Doppler and functional ultrasound of the brain.</li>
<li><b>Shear-wave elastography.</b> A focused push generates a slow shear wave (a few m/s) in tissue; tracking it with ultrafast imaging gives the shear modulus, i.e. tissue stiffness. Shear waves are transverse and cannot be represented in a scalar model like Wave Dude's.</li>
<li><b>Nonlinear propagation.</b> At diagnostic pressures, waves steepen as they travel and generate harmonics. Tissue harmonic imaging forms the image from the 2f component, which reduces clutter from the body wall. The simulator is linear and cannot show this.</li>
<li><b>Aberration.</b> The 1540 m/s assumption is only an average; fat (≈ 1450 m/s) and muscle layers distort the focusing delays. Aberration correction and speed-of-sound estimation are active topics, as is transcranial ultrasound through the skull.</li>
</ul>
<p>Standard simulation tools are Field II (J. A. Jensen, linear spatial impulse response method) and k-Wave (B. E. Treeby and B. T. Cox, k-space pseudospectral method with power-law absorption and nonlinearity). Compared with these, Wave Dude is a qualitative 2D sandbox: good for seeing how delay patterns steer and focus, not for predicting real pressure fields.</p>`,
        },
      ],
      tryIt: [
        { experiment: "echoes", label: "Echoes and mirrors" },
        { experiment: "phased-array", label: "Steering a beam with a phased array" },
        { experiment: "refraction", label: "Bending waves: Snell's law" },
      ],
      sources: [
        "T. L. Szabo, Diagnostic Ultrasound Imaging: Inside Out, 2nd ed. (Academic Press, 2014)",
        "F. A. Duck, Physical Properties of Tissue (Academic Press, 1990)",
        "M. Tanter and M. Fink, Ultrafast imaging in biomedical ultrasound, IEEE Trans. Ultrason. Ferroelectr. Freq. Control 61, 102–119 (2014)",
        "J. A. Jensen, Field: A program for simulating ultrasound systems, Med. Biol. Eng. Comput. 34 (Suppl. 1), 351–353 (1996)",
        "B. E. Treeby and B. T. Cox, k-Wave: MATLAB toolbox for the simulation and reconstruction of photoacoustic wave fields, J. Biomed. Opt. 15, 021314 (2010)",
        "Ultrasound (NIBIB, National Institutes of Health) — https://www.nibib.nih.gov/science-education/science-topics/ultrasound",
      ],
    },

    // ------------------------------------------------------------------------------------------ radar, phased arrays, 5G
    {
      id: "radar-phased-arrays-5g",
      title: "Radar, phased arrays and 5G beamforming",
      summary: "How a flat panel of antennas points a beam in any direction without moving, and what goes wrong if the antennas are too far apart.",
      sections: [
        {
          level: "kids",
          html: `
<p><b>Radar</b> is echolocation with radio waves. A radar station sends out a pulse of radio waves and listens for echoes from aeroplanes, ships or rain clouds. Radio waves travel incredibly fast, so the echo from a plane 150 km away comes back in about one thousandth of a second.</p>
<p>Old radars had a big dish that turned round and round to look in every direction. Many new radars, and the boxes on top of mobile phone masts, are flat and never move. So how do they aim?</p>
<p>Imagine a line of children standing along the edge of a swimming pool. If they all slap the water at the same moment, one long straight wave sets off straight across the pool. Now let the first child slap, then the next one a tiny moment later, then the next, like a <b>stadium wave</b> running along the line. The wave now sets off at a slant! Changing the timing changes the direction. A flat radar does exactly this with hundreds of tiny antennas, and it can change direction thousands of times every second.</p>
<div class="fact"><b>Fun fact:</b> Some of the biggest radars in the world look like giant flat walls or pyramids. They watch huge parts of the sky without moving at all.</div>
<div class="home"><b>Try it at home:</b> In the bath, put both hands flat on the water side by side and push down together: one straight wave. Now push down with one hand a moment before the other. Watch which way the combined wave heads.</div>`,
        },
        {
          level: "school",
          html: `
<h4>Radar timing</h4>
<p>Radio waves travel at the speed of light, c = 3.0 × 10<sup>8</sup> m/s. Like sonar, d = c · t / 2. An echo after 1.0 ms means d = 3.0 × 10<sup>8</sup> × 0.0010 / 2 = 150 000 m = 150 km.</p>
<h4>Steering a beam with phase</h4>
<p>A <b>phased array</b> is a row of antennas a distance <i>d</i> apart. Each antenna's wave is shifted by a <b>phase step</b> Δφ (measured in degrees; 360° is one whole cycle) compared with its neighbour. The waves add up into a beam at the angle θ (measured from straight ahead) where the extra distance d · sin θ makes up for that delay:</p>
<p class="formula">sin θ = (Δφ / 360°) · λ / d</p>
<p>Example: a 5G base station working at 3.5 GHz has λ = c / f = 3.0 × 10<sup>8</sup> / 3.5 × 10<sup>9</sup> ≈ 8.6 cm. With antennas d = λ/2 = 4.3 cm apart and Δφ = 90°: sin θ = (90/360) × 8.6 / 4.3 = 0.5, so θ = 30°.</p>
<figure class="diagram"><svg viewBox="0 0 320 180">
  <circle cx="60" cy="30" r="6" fill="#60a5fa"/>
  <circle cx="60" cy="70" r="6" fill="#60a5fa"/>
  <circle cx="60" cy="110" r="6" fill="#60a5fa"/>
  <circle cx="60" cy="150" r="6" fill="#60a5fa"/>
  <text x="20" y="54" font-size="12" fill="currentColor">d</text>
  <line x1="35" y1="30" x2="35" y2="70" stroke="currentColor" stroke-width="1"/>
  <line x1="64" y1="24" x2="136" y2="148" stroke="#f87171" stroke-width="2.5"/>
  <text x="74" y="16" font-size="13" fill="#f87171">tilted wavefront</text>
  <line x1="60" y1="90" x2="300" y2="90" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4"/>
  <line x1="130" y1="90" x2="262" y2="14" stroke="#fbbf24" stroke-width="2.5"/>
  <polygon points="265,12 257.1,22.3 252.1,13.7" fill="#fbbf24"/>
  <text x="270" y="28" font-size="13" fill="#fbbf24">beam</text>
  <path d="M 210 90 A 80 80 0 0 0 199.3 50" fill="none" stroke="#fbbf24" stroke-width="1.5"/>
  <text x="214" y="76" font-size="13" fill="#fbbf24">θ</text>
  <text x="70" y="172" font-size="12" fill="currentColor">each antenna a little later: Δφ</text>
</svg><figcaption>Each antenna fires a little later than the one below it, so the combined wavefront tilts and the beam goes off at angle θ.</figcaption></figure>
<h4>Too far apart: grating lobes</h4>
<p>If the antennas are more than half a wavelength apart, there can be <b>other</b> angles where the waves also line up, because being a whole wavelength out of step looks the same as being in step. These extra beams are called <b>grating lobes</b>; they waste energy and can pick up echoes from the wrong direction. It is the same physics as the bright fringes of a double slit or diffraction grating. That is why real arrays put their antennas about λ/2 apart.</p>`,
        },
        {
          level: "university",
          html: `
<h4>Array factor</h4>
<p>For N identical isotropic elements at positions x<sub>m</sub> = m d, driven with phases −mΔφ, the far field in direction θ is proportional to the <b>array factor</b></p>
<p class="formula">AF(θ) = Σ<sub>m=0</sub><sup>N−1</sup> e<sup>i m ψ</sup> = e<sup>i(N−1)ψ/2</sup> · sin(Nψ/2) / sin(ψ/2),&nbsp;&nbsp; ψ = k d sin θ − Δφ</p>
<p>with k = 2π/λ. The main lobe is at ψ = 0, i.e. sin θ<sub>0</sub> = Δφ / (k d). The first nulls are at ψ = ±2π/N, giving a half-power beam width of about</p>
<p class="formula">Δθ<sub>3dB</sub> ≈ 0.886 λ / (N d cos θ<sub>0</sub>)</p>
<p>so the beam broadens as 1/cos θ<sub>0</sub> when steered off broadside (the array looks shorter from the side). For 16 elements at λ/2 spacing, Δθ ≈ 0.886 × 2 / 16 ≈ 0.11 rad ≈ 6.3° at broadside.</p>
<h4>Grating lobes</h4>
<p>AF is periodic in ψ with period 2π, so further maxima occur at ψ = 2πm: sin θ<sub>m</sub> = sin θ<sub>0</sub> − m λ/d. A grating lobe enters visible space (|sin θ<sub>m</sub>| ≤ 1) unless</p>
<p class="formula">d &lt; λ / (1 + |sin θ<sub>0</sub>|)</p>
<p>For scanning to ±90° this gives d &lt; λ/2; for a ±60° scan limit, d &lt; 0.536 λ. Example: d = λ and θ<sub>0</sub> = 30° gives a lobe at sin θ = 0.5 − 1 = −0.5, i.e. −30°, as strong as the main beam.</p>
<h4>Real systems</h4>
<ul>
<li><b>Early radar.</b> In the Daventry experiment (26 February 1935) Watson-Watt's team detected a bomber by the reflection of a BBC shortwave transmission. The British Chain Home network (operating around 20–30 MHz, λ ≈ 10–15 m) used fixed "floodlight" transmitting arrays with direction finding on receive, not electronic beam steering.</li>
<li><b>Military phased arrays</b> such as the Aegis SPY-1 radar on warships and the PAVE PAWS early-warning radars use thousands of elements on fixed flat faces.</li>
<li><b>5G.</b> Mid-band "massive MIMO" base stations at about 3.5 GHz commonly use 64 transmit/receive chains (often written 64T64R) feeding a panel of more radiating elements at about λ/2 ≈ 4.3 cm spacing. In the millimetre-wave bands (e.g. 26–29 GHz, λ ≈ 1.1 cm) the elements are only about 5 mm apart, so many fit in a small module, and beamforming makes up for the high path loss and poor penetration at those frequencies.</li>
<li><b>Satellite internet</b> terminals for low-orbit constellations use electronically steered flat arrays to track satellites crossing the sky.</li>
</ul>
<p class="aside">The <i>phased-array</i> experiment uses 16 soft point sources at level 60 (λ ≈ 15 cells) with adjustable spacing and phase step; with spacing above about 7.5 cells you can see grating lobes appear as you steer. The simulator gives the 2D, scalar version: no polarization, no element pattern, no ground plane.</p>`,
        },
        {
          level: "research",
          title: "Wideband arrays and hardware limits",
          html: `
<ul>
<li><b>Beam squint.</b> A phase shift steers correctly at one frequency only, since sin θ<sub>0</sub> = Δφ/(k d) depends on k. Wideband radars and wideband 5G links therefore use <b>true time delay</b> (delay lines or digital delays) at least at sub-array level.</li>
<li><b>Hybrid beamforming.</b> Giving every element its own data converter is costly and power hungry at mm-wave, so arrays combine analogue phase shifters within sub-arrays with digital precoding across them. Choosing the split is an active optimization problem.</li>
<li><b>Mutual coupling and scan blindness.</b> Real elements are not isotropic and couple to their neighbours; the active element pattern changes with scan angle, and at some angles a surface wave on the array can almost cancel radiation ("scan blindness"). Full-wave periodic simulations (FDTD, FEM, MoM with Floquet boundaries) are used to design around this.</li>
<li><b>Adaptive arrays.</b> The same mathematics run backwards on receive lets an array place nulls on interferers (MVDR / Capon beamforming, see Van Trees).</li>
</ul>
<p>In the simulator each source is a "soft" source that pulls its cell towards the drive signal (u ← 0.9u + 0.1 × drive), so sources partly let passing waves through and coupling between them is weak and not physically calibrated. Numerical dispersion also matters: at λ ≈ 15 cells the phase velocity is slightly below the continuum value, so measured steering angles can differ from sin θ = Δφλ/(2πd) by a little, more so at higher source levels.</p>`,
        },
      ],
      tryIt: [
        { experiment: "phased-array", label: "Steering a beam with a phased array" },
        { experiment: "double-slit", label: "The double slit" },
      ],
      sources: [
        "M. I. Skolnik, Introduction to Radar Systems, 3rd ed. (McGraw-Hill, 2001)",
        "R. J. Mailloux, Phased Array Antenna Handbook, 2nd ed. (Artech House, 2005)",
        "H. L. Van Trees, Optimum Array Processing (Wiley, 2002)",
        "Phased Array Antenna Patterns, Part 2: Grating Lobes and Beam Squint (Analog Devices) — https://www.analog.com/en/resources/analog-dialogue/articles/phased-array-antenna-patterns-part2.html",
        "Radar in World War II — https://en.wikipedia.org/wiki/Radar_in_World_War_II",
      ],
    },

    // ------------------------------------------------------------------------------------------ seismology
    {
      id: "earthquakes-seismology",
      title: "Earthquakes and seismology",
      summary: "Earthquake waves come in two main kinds, and the way they bend, bounce and vanish inside the Earth revealed its liquid outer core and solid inner core.",
      sections: [
        {
          level: "kids",
          html: `
<p>When rocks deep underground suddenly slip, the ground shakes. That shaking spreads out as <b>seismic waves</b>, just like ripples from a stone in a pond, but through solid rock and right through the whole Earth.</p>
<p>There are two main kinds of waves inside the Earth:</p>
<ul>
<li><b>P waves</b> ("primary", or push waves). The rock is squashed and stretched along the direction the wave travels, like pushing one end of a slinky. They are the fastest, so they arrive first.</li>
<li><b>S waves</b> ("secondary", or shake waves). The rock wiggles sideways, like flicking a rope up and down. They are slower, so they arrive second.</li>
</ul>
<p>Here is the clever part: S waves <b>cannot travel through liquid</b>. You cannot wiggle water sideways and have the wiggle passed along. Scientists noticed that S waves never reach the far side of the Earth. That told them that part of the Earth's centre is liquid metal!</p>
<div class="fact"><b>Fun fact:</b> In 1936 the Danish scientist Inge Lehmann studied earthquake waves and worked out that inside the liquid core there is a solid inner ball. She lived to be 104 years old.</div>
<div class="home"><b>Try it at home:</b> Stretch a slinky (or a long spring) along the floor with a friend. Give your end a quick push forwards: that is a P wave. Now flick it quickly sideways: that is an S wave. Which one reaches your friend first?</div>`,
        },
        {
          level: "school",
          html: `
<h4>How far away was the earthquake?</h4>
<p>In the Earth's crust, P waves travel at about <b>6 km/s</b> and S waves at about <b>3.5 km/s</b>. A seismometer far away records the P wave first and the S wave later. The bigger the gap, the further away the earthquake. If the distance is D, the time gap is Δt = D / v<sub>S</sub> − D / v<sub>P</sub>, so</p>
<p class="formula">D = Δt · v<sub>P</sub> · v<sub>S</sub> / (v<sub>P</sub> − v<sub>S</sub>)</p>
<p>With 6 km/s and 3.5 km/s, v<sub>P</sub> v<sub>S</sub> / (v<sub>P</sub> − v<sub>S</sub>) = 21 / 2.5 = 8.4 km/s. Example: a gap of 20 s means D ≈ 20 × 8.4 ≈ 170 km. One station gives a distance (a circle on the map); three stations give the point where the circles cross.</p>
<h4>X-raying the Earth with earthquakes</h4>
<p>Seismic waves change speed with depth, so they <b>refract</b> (bend) just like light entering glass, and they <b>reflect</b> from boundaries. By comparing arrival times at stations all over the world, seismologists mapped the inside of the Earth:</p>
<ul>
<li><b>1906</b> – Richard Dixon Oldham found that P waves arriving far from an earthquake were late, and explained it with a slower central core.</li>
<li><b>1909</b> – Andrija Mohorovičić found the boundary between crust and mantle (the "Moho").</li>
<li><b>1913</b> – Beno Gutenberg calculated the depth of the core boundary as about 2900 km (today: about 2890 km).</li>
<li><b>1926</b> – Harold Jeffreys showed, from Earth tides and seismic waves, that the core has almost no rigidity: it is liquid, so S waves cannot pass through it.</li>
<li><b>1936</b> – Inge Lehmann explained faint P waves arriving inside the "shadow zone" by a <b>solid inner core</b>.</li>
</ul>
<figure class="diagram"><svg viewBox="0 0 320 250">
  <circle cx="160" cy="130" r="100" fill="none" stroke="currentColor" stroke-width="2"/>
  <circle cx="160" cy="130" r="55" fill="#fbbf24" fill-opacity="0.25" stroke="#fbbf24" stroke-width="2"/>
  <circle cx="160" cy="130" r="19" fill="#fbbf24" fill-opacity="0.6"/>
  <text x="160" y="134" font-size="12" fill="currentColor" text-anchor="middle">inner</text>
  <text x="160" y="170" font-size="12" fill="currentColor" text-anchor="middle">liquid outer core</text>
  <polygon points="160,22 154,34 166,34" fill="#f87171"/>
  <text x="172" y="22" font-size="12" fill="#f87171">earthquake</text>
  <line x1="160" y1="30" x2="246.6" y2="80" stroke="#60a5fa" stroke-width="1.5"/>
  <line x1="160" y1="30" x2="260" y2="130" stroke="#60a5fa" stroke-width="1.5"/>
  <line x1="160" y1="30" x2="73.4" y2="80" stroke="#60a5fa" stroke-width="1.5"/>
  <line x1="160" y1="30" x2="60" y2="130" stroke="#60a5fa" stroke-width="1.5"/>
  <polyline points="160,30 172,76 190,170 210,216.6" fill="none" stroke="#60a5fa" stroke-width="1.5"/>
  <polyline points="160,30 148,76 130,170 110,216.6" fill="none" stroke="#60a5fa" stroke-width="1.5"/>
  <path d="M 257 154.2 A 100 100 0 0 1 224.3 206.6" fill="none" stroke="#f87171" stroke-width="6"/>
  <path d="M 63 154.2 A 100 100 0 0 0 95.7 206.6" fill="none" stroke="#f87171" stroke-width="6"/>
  <text x="262" y="196" font-size="12" fill="#f87171">P shadow</text>
  <text x="262" y="210" font-size="12" fill="#f87171">zone</text>
  <text x="8" y="196" font-size="12" fill="#f87171">104°–140°</text>
  <text x="160" y="246" font-size="12" fill="currentColor" text-anchor="middle">no direct S waves anywhere beyond about 104°</text>
</svg><figcaption>P waves (blue) that hit the slow liquid core are bent, leaving a shadow zone between about 104° and 140° from the earthquake. S waves cannot cross the liquid core at all.</figcaption></figure>`,
        },
        {
          level: "university",
          html: `
<h4>Two wave speeds from elasticity</h4>
<p>In an isotropic elastic solid with bulk modulus K, shear modulus μ and density ρ, the equation of motion splits into a compressional (curl-free) and a shear (divergence-free) part with speeds</p>
<p class="formula">v<sub>P</sub> = √( (K + 4μ/3) / ρ ),&nbsp;&nbsp; v<sub>S</sub> = √( μ / ρ )</p>
<p>A liquid has μ = 0, so v<sub>S</sub> = 0: shear waves do not exist there, and v<sub>P</sub> drops to √(K/ρ). This is why v<sub>P</sub> falls from about 13.7 km/s at the base of the mantle to about 8 km/s in the outer core. (Typical values: crust v<sub>P</sub> ≈ 6 km/s, v<sub>S</sub> ≈ 3.5 km/s; upper mantle ≈ 8 and 4.5 km/s; inner core v<sub>P</sub> ≈ 11 km/s and v<sub>S</sub> ≈ 3.5 km/s.)</p>
<h4>Rays in a layered sphere</h4>
<p>Snell's law in a spherically symmetric Earth says that along each ray the <b>ray parameter</b></p>
<p class="formula">p = r sin i / v(r)</p>
<p>is constant, where r is the distance from the centre and i the angle from the vertical. Where speed increases with depth (most of the mantle) rays curve back up to the surface. At the core–mantle boundary v<sub>P</sub> drops sharply, so rays are refracted towards the centre and emerge much further away: no direct P arrivals land between about 104° and 140°, the <b>P shadow zone</b>. The travel time T(Δ) as a function of epicentral distance satisfies p = dT/dΔ, and the Herglotz–Wiechert inversion recovers v(r) from T(Δ) when speed increases with depth.</p>
<p>At the Moho, where speed jumps up, waves hitting beyond the critical angle travel along the boundary as <b>head waves</b> (Pn), the seismic version of total internal reflection; Mohorovičić identified the crust from exactly these arrivals. At the surface, <b>Rayleigh</b> and <b>Love</b> surface waves travel slower than S waves, are dispersive (long periods sample deeper, faster rock) and usually do the most damage.</p>
<h4>What the simulator can and cannot show</h4>
<p>Wave Dude solves a <b>scalar</b> wave equation, which corresponds to only one wave type: think of it as P waves in a fluid-like medium. It cannot model S waves, conversion between P and S at boundaries, or surface waves. It can show the geometry: a disc with higher n (slower waves) inside a medium of lower n behaves like the slow core, bending rays inward and producing a shadow and a focusing caustic behind it. The <i>refraction</i> and <i>total internal reflection</i> experiments show the boundary physics in a single layer.</p>`,
        },
        {
          level: "research",
          title: "Imaging the deep Earth",
          html: `
<ul>
<li><b>Reference models.</b> PREM (Dziewonski &amp; Anderson, 1981) gives v<sub>P</sub>, v<sub>S</sub> and ρ as functions of radius from body-wave travel times, surface-wave dispersion and normal-mode frequencies. Its core–mantle boundary lies at 3480 km radius (≈ 2891 km depth), the inner core boundary at 1221.5 km radius.</li>
<li><b>Tomography.</b> Since the late 1970s, travel-time and waveform tomography have mapped 3D velocity anomalies: subducted slabs, and two large low-shear-velocity provinces under Africa and the Pacific whose origin is still debated.</li>
<li><b>Full-waveform inversion</b> (Tarantola, 1984) fits whole seismograms using adjoint methods. Global forward modelling uses spectral-element solvers such as SPECFEM (Komatitsch &amp; Tromp) on the cubed sphere, with attenuation, anisotropy, rotation and self-gravitation.</li>
<li><b>Ambient-noise interferometry</b> (Shapiro et al., 2005) recovers surface waves between station pairs by cross-correlating background noise, giving crustal images without earthquakes.</li>
<li><b>The inner core.</b> It is seismically anisotropic (P waves travel faster parallel to the rotation axis), may have a distinct "innermost inner core", and whether it rotates at a slightly different rate from the mantle has been debated since Song &amp; Richards (1996).</li>
</ul>
<p>All of this needs the elastic (vector) wave equation in 3D with realistic attenuation, far beyond Wave Dude's 2D scalar model. The simulator's finite-difference core is, however, a close cousin of the staggered-grid finite-difference methods that remain workhorses of regional and exploration seismology (Virieux, 1986).</p>`,
        },
      ],
      tryIt: [
        { experiment: "refraction", label: "Bending waves: Snell's law" },
        { experiment: "total-internal-reflection", label: "Trapped light: total internal reflection" },
        { experiment: "echoes", label: "Echoes and mirrors" },
      ],
      sources: [
        "P. M. Shearer, Introduction to Seismology, 2nd ed. (Cambridge University Press, 2009)",
        "S. Stein and M. Wysession, An Introduction to Seismology, Earthquakes, and Earth Structure (Blackwell, 2003)",
        "A. M. Dziewonski and D. L. Anderson, Preliminary reference Earth model, Phys. Earth Planet. Inter. 25, 297–356 (1981)",
        "I. Lehmann, P′, Publications du Bureau Central Séismologique International, Série A, 14, 87–115 (1936)",
        "Shadow zone (USGS) — https://www.usgs.gov/media/videos/shadow-zone",
        "Inge Lehmann: Discoverer of the Earth's Inner Core (AMNH) — https://www.amnh.org/explore/resource-collections/earth-inside-and-out/inge-lehmann-discoverer-of-the-earth-s-inner-core",
        "History of the detection of the core (NASA GSFC mirror) — https://core2.gsfc.nasa.gov/MIRROR_www_astro_oma_be/history.html",
      ],
    },

    // ------------------------------------------------------------------------------------------ noise-cancelling headphones
    {
      id: "noise-cancelling",
      title: "Noise-cancelling headphones",
      summary: "Adding the exact opposite of a sound wave makes silence, but only for low notes and only close to the ear.",
      sections: [
        {
          level: "kids",
          html: `
<p>When two waves meet, they add together. If a hump of one wave meets a hump of another, you get a bigger hump. But if a hump meets a dip of the same size, they cancel out and the water (or the air) stays flat. Scientists call this <b>destructive interference</b>.</p>
<p>Noise-cancelling headphones use this trick. A tiny microphone on the headphone listens to the noise around you, for example the rumble of an aeroplane engine. A little computer chip quickly makes the <b>opposite</b> sound wave: a dip wherever the noise has a hump. The speaker plays this "anti-noise" into your ear. Noise plus anti-noise adds up to almost nothing, so the rumble fades away.</p>
<p>It works best on low, steady sounds like engines, fans and train rumble. High, sudden sounds like voices, claps and clinking cups are much harder, because the waves are so short and quick that the chip cannot keep up perfectly. For those, the soft padding around your ears does the work.</p>
<figure class="diagram"><svg viewBox="0 0 300 170">
  <text x="8" y="30" font-size="12" fill="#60a5fa">noise</text>
  <path d="M 60 30 Q 80 5 100 30 T 140 30 T 180 30 T 220 30 T 260 30 T 300 30" fill="none" stroke="#60a5fa" stroke-width="2.5"/>
  <text x="8" y="90" font-size="12" fill="#f87171">anti-noise</text>
  <path d="M 60 85 Q 80 110 100 85 T 140 85 T 180 85 T 220 85 T 260 85 T 300 85" fill="none" stroke="#f87171" stroke-width="2.5"/>
  <text x="8" y="145" font-size="12" fill="#34d399">together</text>
  <line x1="60" y1="140" x2="300" y2="140" stroke="#34d399" stroke-width="2.5"/>
  <text x="180" y="163" font-size="12" fill="currentColor" text-anchor="middle">hump + dip = flat: quiet</text>
</svg><figcaption>The headphone plays a wave that is the exact upside-down copy of the noise. Added together they cancel.</figcaption></figure>
<div class="fact"><b>Fun fact:</b> The idea of cancelling sound with opposite sound was patented in the 1930s by the German physicist Paul Lueg, long before there were chips fast enough to make it work in headphones.</div>`,
        },
        {
          level: "school",
          html: `
<h4>Superposition and phase</h4>
<p>When two waves overlap, the displacement at each point is the <b>sum</b> of the two displacements. If the anti-noise has the same amplitude as the noise but is shifted by half a cycle (180°), crest meets trough everywhere and the sum is zero.</p>
<h4>Why low frequencies are easier</h4>
<p>The wavelength of sound in air is λ = v / f with v ≈ 343 m/s:</p>
<table>
<tr><th>Frequency f</th><th>Wavelength λ</th><th>Period T = 1/f</th><th>Typical source</th></tr>
<tr><td>100 Hz</td><td>3.4 m</td><td>10 ms</td><td>engine drone, hum</td></tr>
<tr><td>1000 Hz</td><td>34 cm</td><td>1 ms</td><td>voices</td></tr>
<tr><td>5000 Hz</td><td>6.9 cm</td><td>0.2 ms</td><td>hiss, clinks</td></tr>
</table>
<p>To cancel well, the anti-noise must be very close to exactly opposite. Working through the maths (see the university section), cutting the sound to one tenth of its amplitude needs the phase to be right to within about 6°, which is 6/360 = 1/60 of a period.</p>
<ul>
<li>At 100 Hz, 1/60 of a period is 10 ms / 60 ≈ 0.17 ms: easy for electronics, and the wave hardly changes over the size of your ear canal.</li>
<li>At 1000 Hz it is only about 17 µs, and moving just 34 cm / 60 ≈ 6 mm through the air changes the phase by that much. The cancellation only works in a very small region.</li>
</ul>
<p>So active cancellation is typically effective up to about 1 kHz. Above that, headphones rely on <b>passive</b> isolation (the ear cups and tips), which works best at high frequencies. Together the two cover the whole range.</p>
<p class="aside">In the simulator, two point sources driven in opposite phase (an array with a 180° phase step) give a line of silence along the middle between them. Away from that line the cancellation fails; that is why headphones only make a quiet zone right at your ear, not a quiet room.</p>`,
        },
        {
          level: "university",
          html: `
<h4>How much cancellation for a given error</h4>
<p>Let the primary noise at the ear be p<sub>1</sub> = A e<sup>iωt</sup> and the anti-noise p<sub>2</sub> = −aA e<sup>i(ωt+φ)</sup>, with amplitude ratio a and phase error φ. The residual intensity relative to the noise alone is |1 − a e<sup>iφ</sup>|², so the attenuation in decibels is</p>
<p class="formula">ΔL = −10 log<sub>10</sub>( 1 + a² − 2a cos φ )</p>
<p>For a = 1 this is |2 sin(φ/2)|²: φ = 5.7° gives 20 dB, φ = 1.8° gives 30 dB. An amplitude error alone (φ = 0) of 10% (a = 0.9) also limits ΔL to 20 dB. A fixed time error δt gives φ = ωδt, so attenuation for a given latency degrades as frequency rises.</p>
<h4>Zone of quiet</h4>
<p>Cancelling at one point does not cancel nearby. In a diffuse sound field, the region around a single control point where the level is reduced by at least 10 dB has a diameter of only about <b>λ/10</b> (Elliott, Nelson and co-workers): 3.4 cm at 1 kHz but 34 cm at 100 Hz. Headphones exploit the fact that the small cavity between driver and eardrum is much smaller than λ at low frequency, so the pressure there is nearly uniform. Global cancellation in a room, by contrast, needs the secondary source within a small fraction of a wavelength of the primary source.</p>
<h4>Feedforward and feedback</h4>
<ul>
<li><b>Feedforward:</b> an outside microphone senses the noise before it reaches the ear; a filter W predicts the anti-noise. Causality demands that electronic latency be shorter than the acoustic travel time from microphone to ear (a few tens of µs for a few cm). W is adapted online with the <b>filtered-x LMS</b> algorithm, which accounts for the "secondary path" from speaker to error microphone.</li>
<li><b>Feedback:</b> a microphone inside the cup feeds back an inverted, filtered signal. High loop gain gives strong attenuation, but loop delay and the phase response of the speaker limit stable gain to low frequencies; pushing gain higher causes amplification ("waterbed" effect, from Bode's sensitivity integral) elsewhere in the spectrum.</li>
</ul>
<p>Commercial headphones usually combine both ("hybrid ANC"). History: Paul Lueg's patent (US 2,043,416, 1936) described cancelling sound in a duct with an inverted loudspeaker signal; Olson and May's "electronic sound absorber" (1953) built a working feedback system; practical headsets followed once compact analogue and later digital electronics allowed it.</p>
<p class="aside">The simulator is linear, so superposition holds exactly and cancellation can be perfect along nodal lines. It does not model the enclosed ear-cup cavity, electronic latency or adaptive filtering, and in 2D the sources are effectively infinite line sources.</p>`,
        },
      ],
      tryIt: [
        { experiment: "splash", label: "Splash! Making waves" },
        { experiment: "double-slit", label: "The double slit" },
      ],
      sources: [
        "P. A. Nelson and S. J. Elliott, Active Control of Sound (Academic Press, 1992)",
        "S. M. Kuo and D. R. Morgan, Active Noise Control Systems: Algorithms and DSP Implementations (Wiley, 1996)",
        "P. Lueg, Process of silencing sound oscillations, US Patent 2,043,416 (1936)",
        "H. F. Olson and E. G. May, Electronic sound absorber, J. Acoust. Soc. Am. 25, 1130–1136 (1953)",
        "S. J. Elliott, P. Joseph, P. A. Nelson, Active control in diffuse sound fields (Institute of Acoustics) — https://www.ioa.org.uk/system/files/publications/SJ%20ELLIOTT%20P%20JOSEPH%20PA%20NELSON%20ACTIVE%20CONTROL%20IN%20DIFFUSE%20SOUND%20FIELDS.pdf",
        "Active noise control — https://en.wikipedia.org/wiki/Active_noise_control",
      ],
    },

    // ------------------------------------------------------------------------------------------ musical instruments
    {
      id: "musical-instruments",
      title: "Musical instruments and resonance",
      summary: "Strings, pipes and drums only ring at certain notes: the standing waves that fit inside them.",
      sections: [
        {
          level: "kids",
          html: `
<p>Pluck a guitar string and it wobbles back and forth. Its two ends are held tight, so the wave runs along the string, bounces off one end, runs back, bounces off the other end, and so on. Only certain wobbles fit neatly between the two ends. Those are the notes the string likes to play. Scientists call this <b>resonance</b>.</p>
<p>You can change the note in three ways:</p>
<ul>
<li><b>Shorter</b> string: higher note. That is why guitarists press the string down on the neck.</li>
<li><b>Tighter</b> string: higher note. That is how you tune it.</li>
<li><b>Thinner, lighter</b> string: higher note. The thin strings on a guitar play the high notes.</li>
</ul>
<p>Flutes, recorders and organ pipes work the same way, but the thing that wobbles is the air inside a tube. A longer tube gives a lower note. A big church organ has pipes taller than a house for its deepest notes.</p>
<div class="home"><b>Try it at home:</b> Blow gently across the top of an empty glass bottle until it hoots. Now pour in some water and blow again. With less air inside, the note goes higher. Then try tapping the bottle with a spoon instead: now more water makes the note go <i>lower</i>, because this time it is the glass and water that wobble, not the air.</div>
<div class="fact"><b>Fun fact:</b> When you play one note, you are really hearing many notes at once: the main one plus quieter, higher "overtones". The mix of overtones is why a violin and a flute sound different even when they play the same note.</div>`,
        },
        {
          level: "school",
          html: `
<h4>Standing waves on a string</h4>
<p>A wave on a string reflects at the fixed ends. The outgoing and returning waves add up into a <b>standing wave</b> with points that never move (<b>nodes</b>) and points that move the most (<b>antinodes</b>). The ends must be nodes, so a whole number of half wavelengths must fit on the string: L = n · λ / 2. Using v = f · λ:</p>
<p class="formula">f<sub>n</sub> = n · v / (2L),&nbsp;&nbsp; n = 1, 2, 3, …</p>
<p>Here f<sub>n</sub> is the frequency of the n-th harmonic (Hz), v the wave speed on the string (m/s) and L its length (m). The lowest, n = 1, is the <b>fundamental</b>; the others are exact multiples of it.</p>
<figure class="diagram"><svg viewBox="0 0 300 190">
  <line x1="30" y1="35" x2="270" y2="35" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3"/>
  <path d="M 30 35 Q 150 -5 270 35" fill="none" stroke="#60a5fa" stroke-width="2.5"/>
  <path d="M 30 35 Q 150 75 270 35" fill="none" stroke="#60a5fa" stroke-width="1.5" stroke-dasharray="4 3"/>
  <text x="280" y="40" font-size="12" fill="currentColor">n = 1</text>
  <line x1="30" y1="95" x2="270" y2="95" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3"/>
  <path d="M 30 95 Q 90 60 150 95 Q 210 130 270 95" fill="none" stroke="#f87171" stroke-width="2.5"/>
  <path d="M 30 95 Q 90 130 150 95 Q 210 60 270 95" fill="none" stroke="#f87171" stroke-width="1.5" stroke-dasharray="4 3"/>
  <text x="280" y="100" font-size="12" fill="currentColor">n = 2</text>
  <line x1="30" y1="155" x2="270" y2="155" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3"/>
  <path d="M 30 155 Q 70 125 110 155 Q 150 185 190 155 Q 230 125 270 155" fill="none" stroke="#34d399" stroke-width="2.5"/>
  <path d="M 30 155 Q 70 185 110 155 Q 150 125 190 155 Q 230 185 270 155" fill="none" stroke="#34d399" stroke-width="1.5" stroke-dasharray="4 3"/>
  <text x="280" y="160" font-size="12" fill="currentColor">n = 3</text>
  <circle cx="150" cy="95" r="3.5" fill="#fbbf24"/>
  <circle cx="110" cy="155" r="3.5" fill="#fbbf24"/>
  <circle cx="190" cy="155" r="3.5" fill="#fbbf24"/>
  <text x="150" y="186" font-size="12" fill="#fbbf24" text-anchor="middle">yellow dots: nodes</text>
</svg><figcaption>The first three standing waves on a string fixed at both ends: L = λ/2, λ, 3λ/2.</figcaption></figure>
<p>Example: a guitar's high E string sounds 329.6 Hz on a scale length of 0.648 m. The wave speed on it is v = 2 L f<sub>1</sub> = 2 × 0.648 × 329.6 ≈ 427 m/s. Pressing it at the 12th fret halves L and doubles f: one octave up.</p>
<h4>Pipes</h4>
<ul>
<li><b>Open at both ends</b> (flute, open organ pipe): both ends are pressure nodes, so again f<sub>n</sub> = n v / (2L), all harmonics. A flute about 0.6 m long gives 343 / 1.2 ≈ 290 Hz, near its lowest note C4 (262 Hz; the effective length is a bit longer than the tube).</li>
<li><b>Closed at one end</b> (clarinet, to a good approximation): a pressure node at the open end and a pressure antinode at the closed end. Only a quarter wavelength fits in the fundamental: f<sub>n</sub> = n v / (4L) with <b>odd n only</b>. A 0.6 m clarinet gives 343 / 2.4 ≈ 143 Hz, close to its lowest note (about 147 Hz). That is roughly an octave below a flute of the same length.</li>
</ul>`,
        },
        {
          level: "university",
          html: `
<h4>The string and its spectrum</h4>
<p>A string of tension T and mass per length μ obeys ∂²y/∂t² = (T/μ) ∂²y/∂x², so v = √(T/μ). With y(0) = y(L) = 0 the normal modes are sin(nπx/L) cos(2πf<sub>n</sub>t). A string plucked at distance a from one end into a triangle of height h has Fourier amplitudes</p>
<p class="formula">b<sub>n</sub> = 2hL² / (π² n² a (L − a)) · sin(nπa / L)</p>
<p>falling as 1/n², and with every harmonic that has a node at the plucking point missing (pluck at L/3 and harmonics 3, 6, 9… vanish). Plucking near the bridge (small a) gives a brighter tone. Real strings have bending stiffness, which makes the overtones slightly sharp: f<sub>n</sub> ≈ n f<sub>1</sub> √(1 + B n²), with inharmonicity coefficient B noticeable in piano bass strings.</p>
<h4>Air columns</h4>
<p>The pressure in a pipe obeys the 1D wave equation with p = 0 at an open end (approximately) and ∂p/∂x = 0 at a closed end. The open end actually radiates, so the effective length is longer: ΔL ≈ 0.61 r for an unflanged pipe of radius r. A <b>Helmholtz resonator</b> (a bottle) is not a pipe resonance: the air in the neck (area A, effective length L<sub>eff</sub>) bounces on the spring of the air in the cavity (volume V):</p>
<p class="formula">f = (v / 2π) · √( A / (V · L<sub>eff</sub>) )</p>
<p>Adding water reduces V and raises f, as in the kids' experiment.</p>
<h4>Two-dimensional resonators</h4>
<p>A rectangular membrane or room of sides L<sub>x</sub>, L<sub>y</sub> with fixed edges has modes f<sub>mn</sub> = (v/2) √((m/L<sub>x</sub>)² + (n/L<sub>y</sub>)²), which are not integer multiples of each other. A circular drum head has modes at f ∝ j<sub>mn</sub>, the zeros of Bessel functions: relative to the fundamental, 1, 1.59, 2.14, 2.30, … That is why most drums have a less definite pitch than strings or pipes. (Timpani get closer to a harmonic series because of air loading.)</p>
<p class="aside">The simulator is 2D, so it naturally shows <b>2D</b> resonances: draw a closed box of wall, put a source inside, and at certain source levels the field locks into a strong standing-wave pattern with fixed nodal lines, like a Chladni figure. A long narrow channel approximates a 1D pipe. With absorbing edges far away and a reflecting wall, the <i>echoes</i> experiment shows the reflection that every standing wave is built from.</p>`,
        },
        {
          level: "research",
          title: "Physical modelling of instruments",
          html: `
<p>"Physical modelling synthesis" generates sound by simulating the instrument's equations instead of playing back recordings, and several of its methods are close relatives of the simulator's update rule.</p>
<ul>
<li><b>Karplus–Strong</b> (1983) and <b>digital waveguides</b> (J. O. Smith, 1992) represent a string or bore as two delay lines carrying travelling waves in opposite directions, with filters at the ends for losses and dispersion. They are exact for the lossless 1D wave equation and very cheap.</li>
<li><b>Finite-difference time-domain</b> schemes for stiff strings, plates, membranes and 3D rooms (S. Bilbao, <i>Numerical Sound Synthesis</i>, 2009) handle nonlinearity (gongs, cymbals) and coupling (strings to soundboard) that waveguides cannot. Their main numerical artefact is the same as Wave Dude's: <b>numerical dispersion</b>, which detunes high modes. In the simulator the 3×3 kernel makes the phase velocity about 3% low at 6 cells per wavelength; for audio, a 3% pitch error is half a semitone, so synthesis schemes are tuned or use higher-order stencils.</li>
<li><b>Open questions</b> include the bowed string's stick–slip dynamics and playability (Helmholtz motion, Schelleng's bow-force limits), the role of wall vibrations in brass and woodwind timbre, and data-driven or differentiable models that learn instrument parameters from recordings.</li>
</ul>`,
        },
      ],
      tryIt: [
        { experiment: "wavelength", label: "How long is a wave?" },
        { experiment: "echoes", label: "Echoes and mirrors" },
        { experiment: "grid-dispersion", label: "Waves on a grid: numerical dispersion" },
      ],
      sources: [
        "N. H. Fletcher and T. D. Rossing, The Physics of Musical Instruments, 2nd ed. (Springer, 1998)",
        "R. P. Feynman, R. B. Leighton, M. Sands, The Feynman Lectures on Physics, Vol. I, ch. 49–50 (modes, harmonics) — https://www.feynmanlectures.caltech.edu/I_49.html",
        "F. S. Crawford, Waves: Berkeley Physics Course Vol. 3 (McGraw-Hill, 1968)",
        "S. Bilbao, Numerical Sound Synthesis (Wiley, 2009)",
        "J. O. Smith III, Physical modeling using digital waveguides, Computer Music Journal 16(4), 74–91 (1992)",
        "K. Karplus and A. Strong, Digital synthesis of plucked-string and drum timbres, Computer Music Journal 7(2), 43–55 (1983)",
      ],
    },

    // ------------------------------------------------------------------------------------------ Wi-Fi and mobile signals
    {
      id: "wifi-in-buildings",
      title: "Wi-Fi and mobile signals in buildings",
      summary: "Why the Wi-Fi is strong in one spot and weak a hand's width away: reflection, diffraction and interference of 12 cm waves.",
      sections: [
        {
          level: "kids",
          html: `
<p>Wi-Fi and mobile phones talk to each other with <b>radio waves</b>. You cannot see them, but they are a kind of light, and they travel just as fast. Wi-Fi waves are about <b>12 centimetres</b> long, roughly the length of your hand.</p>
<p>Inside a house, radio waves do the same things as water waves in a bath:</p>
<ul>
<li>They <b>bounce</b> off walls, and very strongly off metal: fridges, radiators, mirrors and foil.</li>
<li>They <b>bend</b> around corners and spread out through doorways.</li>
<li>They are <b>soaked up</b> by thick walls and by water, and people are mostly water!</li>
</ul>
<p>Because the waves bounce around, your phone gets the same signal from several directions at once. In some places the humps all arrive together and the signal is strong. In other places a hump from one path meets a dip from another and they cancel. That can make a <b>dead spot</b>, and moving your phone just a few centimetres can fix it.</p>
<div class="home"><b>Try it at home:</b> With a grown-up's permission, run a Wi-Fi speed test on a phone or tablet in different rooms: next to the router, behind a closed door, behind the fridge, and in a far bedroom. Draw a map of your home and write the results on it. Where are the weak spots?</div>
<div class="fact"><b>Fun fact:</b> Microwave ovens use radio waves of almost the same length as Wi-Fi, around 12 cm. Their metal box and the metal mesh in the door keep the waves inside.</div>`,
        },
        {
          level: "school",
          html: `
<h4>How long are the waves?</h4>
<p>Radio waves travel at c = 3.0 × 10<sup>8</sup> m/s, so λ = c / f:</p>
<ul>
<li>Wi-Fi 2.4 GHz: λ = 3.0 × 10<sup>8</sup> / 2.4 × 10<sup>9</sup> = 0.125 m = <b>12.5 cm</b>.</li>
<li>Wi-Fi 5 GHz: λ = 6.0 cm. Wi-Fi 6 GHz: about 5 cm.</li>
<li>Mobile 4G/5G at 800 MHz: 37.5 cm; at 3.5 GHz: 8.6 cm.</li>
</ul>
<h4>Diffraction through doorways</h4>
<p>A doorway 80 cm wide is only about 6 wavelengths of 2.4 GHz Wi-Fi, so the waves spread out noticeably after passing through it (for a single gap the first dark direction is at sin θ = λ / a = 12.5 / 80 ≈ 0.16, θ ≈ 9°, and the waves spread well beyond that into neighbouring rooms). Light, with λ about half a micrometre, goes straight through the same doorway and casts a sharp shadow.</p>
<h4>Interference and dead spots</h4>
<p>Suppose the signal reaches your laptop directly and also by bouncing off a metal cupboard. If the reflected path is longer by half a wavelength (or 1½, 2½ … wavelengths), crest meets trough and the two cancel. Next to a flat reflector, the incoming and reflected waves form a <b>standing wave</b> with weak spots every λ / 2: at 2.4 GHz, every 6 cm.</p>
<figure class="diagram"><svg viewBox="0 0 320 170">
  <rect x="20" y="70" width="34" height="22" rx="3" fill="none" stroke="currentColor" stroke-width="2"/>
  <line x1="28" y1="70" x2="24" y2="52" stroke="currentColor" stroke-width="2"/>
  <line x1="46" y1="70" x2="50" y2="52" stroke="currentColor" stroke-width="2"/>
  <text x="37" y="108" font-size="12" fill="currentColor" text-anchor="middle">router</text>
  <rect x="262" y="72" width="40" height="22" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>
  <text x="282" y="110" font-size="12" fill="currentColor" text-anchor="middle">laptop</text>
  <line x1="56" y1="80" x2="260" y2="82" stroke="#60a5fa" stroke-width="2.5"/>
  <text x="150" y="74" font-size="12" fill="#60a5fa" text-anchor="middle">direct path</text>
  <line x1="20" y1="150" x2="300" y2="150" stroke="currentColor" stroke-width="4"/>
  <text x="160" y="166" font-size="12" fill="currentColor" text-anchor="middle">metal surface</text>
  <polyline points="56,88 158,148 260,90" fill="none" stroke="#f87171" stroke-width="2.5"/>
  <text x="158" y="132" font-size="12" fill="#f87171" text-anchor="middle">reflected path</text>
  <text x="160" y="20" font-size="12" fill="currentColor" text-anchor="middle">extra distance = λ/2 → the two cancel</text>
  <text x="160" y="36" font-size="12" fill="currentColor" text-anchor="middle">extra distance = λ → they add</text>
</svg><figcaption>Two paths from the same router. Whether the signals add or cancel depends on the difference in path length.</figcaption></figure>
<p>Thick walls also weaken the signal. Building engineers measure this in decibels (dB); every 10 dB is a factor of 10 in power. A brick or concrete wall typically costs somewhere between about 10 and 25 dB at 2.4 GHz depending on thickness, steel reinforcement and moisture, and 5 GHz Wi-Fi usually loses more than 2.4 GHz.</p>`,
        },
        {
          level: "university",
          html: `
<h4>Free-space loss</h4>
<p>Between isotropic antennas in free space, the received power fraction follows the Friis equation. In decibels,</p>
<p class="formula">FSPL = 20 log<sub>10</sub>(4π d / λ) = 20 log<sub>10</sub>(d / 1 m) + 20 log<sub>10</sub>(f / 1 Hz) − 147.55 dB</p>
<p>At 2.4 GHz and 10 m: 20 + 187.6 − 147.55 ≈ 60 dB. Doubling the distance adds 6 dB. At 5 GHz the same distance costs about 6.4 dB more, mainly because a fixed-gain antenna has a smaller effective area (A = Gλ²/4π), not because the air absorbs more.</p>
<h4>Multipath and fading</h4>
<p>Indoors the received field is a sum of many paths, h = Σ<sub>k</sub> a<sub>k</sub> e<sup>−i k<sub>0</sub> L<sub>k</sub></sup> with path lengths L<sub>k</sub>. When no path dominates, the real and imaginary parts behave like independent Gaussian variables, so |h| is <b>Rayleigh distributed</b> and the power |h|² is exponential:</p>
<p class="formula">P( |h|² &lt; x Ω ) = 1 − e<sup>−x</sup></p>
<p>with Ω the mean power. A fade 10 dB below the mean (x = 0.1) occurs about 10% of the time or locations; 20 dB below, about 1%. With isotropic scattering in a plane, the field correlation between two points a distance Δ apart is J<sub>0</sub>(2πΔ/λ) (Clarke's model), which first drops to zero at Δ ≈ 0.38 λ: about 5 cm at 2.4 GHz. This is why two antennas a few centimetres apart see nearly independent fading.</p>
<h4>Turning multipath into an advantage</h4>
<ul>
<li><b>OFDM</b> (Wi-Fi, 4G, 5G) splits the band into many narrow subcarriers, each of which sees a flat channel; frequency-selective fades only hit some of them, and coding spreads data across subcarriers.</li>
<li><b>MIMO</b> uses several antennas at each end. Rich multipath makes the channel matrix well conditioned, so several data streams can share the same frequency at the same time (spatial multiplexing); beamforming steers energy towards the receiver as in a phased array.</li>
</ul>
<p class="aside">In the simulator, draw a few walls and an absorbing frame around a "floor plan", place a continuous source, and switch to the Intensity view: the speckled pattern of bright and dark spots spaced about λ/2 apart is multipath interference. Remember the differences: the simulator is 2D (walls are infinitely tall and spreading is 1/√r in amplitude), scalar (no polarization, which matters for real antennas), and its "walls" and "absorbers" are idealized rather than calibrated brick or concrete.</p>`,
        },
        {
          level: "research",
          title: "Predicting indoor coverage",
          html: `
<p>Radio planners use three families of models:</p>
<ul>
<li><b>Empirical</b> models (log-distance path loss with wall and floor penalties, e.g. ITU-R P.1238 for indoor links) are fast and need only a floor plan and loss tables, but cannot predict small-scale fading.</li>
<li><b>Ray tracing</b> with geometrical optics plus the uniform theory of diffraction (UTD) follows reflected, transmitted and diffracted rays in 3D. It is the industry standard for site-specific prediction and is accurate when structures are large compared with λ.</li>
<li><b>Full-wave</b> solvers (FDTD, finite elements, or frequency-domain Helmholtz solvers) capture everything but are costly: a 10 m × 10 m × 3 m room at 2.4 GHz needs about 1.5 × 10<sup>8</sup> cells at λ/10 resolution, and 3D FDTD needs several numbers per cell and thousands of time steps. 2D Helmholtz solutions of a flat's floor plan, such as J. Cole's well-known "Helmhurts" post, give an intuitive picture of the speckle pattern and are close in spirit to what Wave Dude shows.</li>
</ul>
<p>A 2D model overstates interference contrast compared with 3D (fewer, more coherent paths; no floor and ceiling bounces) and has the wrong distance law. Material modelling is also crucial: real walls are lossy dielectrics with frequency-dependent complex permittivity (ITU-R P.2040 gives standard values), whereas the simulator's damping factor removes energy roughly equally at all frequencies.</p>
<p>Current research directions include reconfigurable intelligent surfaces (programmable reflectors that redirect signals into dead zones), differentiable ray tracers that learn material parameters from measurements, and Wi-Fi sensing, which uses changes in the multipath channel to detect motion, presence or breathing.</p>`,
        },
      ],
      tryIt: [
        { experiment: "single-slit", label: "One gap: how waves spread" },
        { experiment: "double-slit", label: "The double slit" },
        { experiment: "absorbing-edge", label: "How good is the absorbing edge?" },
      ],
      sources: [
        "T. S. Rappaport, Wireless Communications: Principles and Practice, 2nd ed. (Prentice Hall, 2002)",
        "D. Tse and P. Viswanath, Fundamentals of Wireless Communication (Cambridge University Press, 2005)",
        "ITU-R Recommendation P.1238: Propagation data and prediction methods for indoor radio systems — https://www.itu.int/rec/R-REC-P.1238",
        "ITU-R Recommendation P.2040: Effects of building materials and structures on radiowave propagation above about 100 MHz — https://www.itu.int/rec/R-REC-P.2040",
        "J. Cole, Helmhurts (2014) — https://jasmcole.com/2014/08/25/helmhurts/",
      ],
    },
    computingWithWaves,
  ],
};
