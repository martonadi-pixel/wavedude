// Wave Dude 2D web - "How it works" library, category "Inside the code": the software side of the simulator.
// GPL-3.0-or-later.

import type { LearnCategory } from "../types";

export const category: LearnCategory = {
  id: "inside-the-code",
  title: "Inside the code",
  icon: "💻",
  blurb: "How the simulator is built: where the code came from, how a graphics card does the maths, and how pictures, probes, files and videos are made.",
  pages: [
    // ------------------------------------------------------------------------------------------ 1. family tree
    {
      id: "family-tree",
      title: "From Python to your browser: the family tree",
      summary: "Where the code came from — WaveSimulator2D in Python, Wave Dude 2D for Windows, and this web version — and the licence that ties them together.",
      sections: [
        {
          level: "kids",
          html: `
<p>Programs have families, just like people. The simulator you are using did not start from nothing. It has a grandparent and a parent.</p>
<ul>
<li><b>The grandparent:</b> a programmer who goes by the name <b>0x23</b> wrote a small wave simulator called <b>WaveSimulator2D</b>, in a programming language called Python.</li>
<li><b>The parent:</b> JJM Vleggaar of <b>Huygens Optics</b> built a big Windows program around the same idea and called it <b>Wave Dude 2D</b>.</li>
<li><b>The child:</b> Wave Dude 2D was then moved into the web browser. That is the version in front of you now.</li>
</ul>
<p>Think of a family recipe. Grandma writes it on a card. Your parent copies it into a thick cookbook and adds new dishes. Then someone rewrites it so it works on a camping stove. The <b>recipe</b> — the rule that makes the waves move — stays the same. Only the <b>kitchen</b> changes.</p>
<figure class="diagram"><svg viewBox="0 0 520 120" xmlns="http://www.w3.org/2000/svg">
<rect x="10" y="30" width="140" height="60" rx="8" fill="none" stroke="#fbbf24" stroke-width="2"/>
<text x="80" y="55" font-size="13" text-anchor="middle" fill="currentColor">WaveSimulator2D</text>
<text x="80" y="74" font-size="12" text-anchor="middle" fill="currentColor">Python</text>
<rect x="190" y="30" width="140" height="60" rx="8" fill="none" stroke="#60a5fa" stroke-width="2"/>
<text x="260" y="55" font-size="13" text-anchor="middle" fill="currentColor">Wave Dude 2D</text>
<text x="260" y="74" font-size="12" text-anchor="middle" fill="currentColor">Windows</text>
<rect x="370" y="30" width="140" height="60" rx="8" fill="none" stroke="#34d399" stroke-width="2"/>
<text x="440" y="55" font-size="13" text-anchor="middle" fill="currentColor">Wave Dude 2D</text>
<text x="440" y="74" font-size="12" text-anchor="middle" fill="currentColor">web browser</text>
<path d="M150 60 H182 M174 54 L182 60 L174 66 M330 60 H362 M354 54 L362 60 L354 66" fill="none" stroke="currentColor" stroke-width="2"/>
<text x="80" y="110" font-size="12" text-anchor="middle" fill="currentColor">grandparent</text>
<text x="260" y="110" font-size="12" text-anchor="middle" fill="currentColor">parent</text>
<text x="440" y="110" font-size="12" text-anchor="middle" fill="currentColor">child</text>
</svg><figcaption>Three versions of the same wave rule, each in a new “kitchen”.</figcaption></figure>
<p>All three come with a sharing rule: anyone may use the program, look inside it, change it and give it away — as long as they share their changes in the same way.</p>
<div class="fact"><b>Fun fact:</b> “0x23” is how programmers write the number 35 in <i>hexadecimal</i>, a way of counting in sixteens instead of tens.</div>`,
        },
        {
          level: "school",
          html: `
<p>A <b>programming language</b> is a way of writing instructions that a computer can follow. Moving a program to a new language or a new kind of computer while keeping what it does is called <b>porting</b>. Wave Dude has been ported twice:</p>
<table>
<tr><th>Version</th><th>Written in</th><th>The heavy maths runs on</th><th>Runs where</th></tr>
<tr><td>WaveSimulator2D (by 0x23)</td><td>Python</td><td>the graphics card, through CuPy</td><td>a PC with a suitable (NVIDIA) graphics card</td></tr>
<tr><td>Wave Dude 2D (JJM Vleggaar, Huygens Optics)</td><td>Visual Basic .NET</td><td>the processor, or the graphics card through OpenCL</td><td>Windows</td></tr>
<tr><td>Wave Dude 2D web</td><td>TypeScript</td><td>the graphics card, through WebGL2</td><td>any modern browser</td></tr>
</table>
<h4>What stayed the same</h4>
<ul>
<li>The <b>update rule</b> that moves the waves, including the exact numbers in its 3 × 3 kernel: 0.066, 0.184 and −1.</li>
<li>The <b>scene image rules</b>: red = refractive index × 100, green = source, blue = damping. For example, a pixel with red = 150 means glass with n = 150 / 100 = 1.5 in all three programs.</li>
<li>The <b>colour scheme files</b> and the <b>project format</b>, so a project saved in the browser opens in the Windows app and the other way round.</li>
</ul>
<h4>What changed</h4>
<p>The way the program talks to the graphics card (CuPy → OpenCL → WebGL2), the buttons and windows around the simulation (Windows Forms → web pages), and some extras that exist only in the web version: line sources, phase steps for steering arrays, the 3D view and the guided experiments.</p>
<h4>The licence</h4>
<p>Wave Dude 2D and this web version are released under the <b>GNU General Public License, version 3 or later</b> (GPL-3.0-or-later). In short you may <b>run</b> it, <b>study</b> how it works, <b>change</b> it and <b>share</b> it. The one condition: if you give someone a changed version, you must also give them its source code under the same licence. This kind of “share-alike” licence is called <b>copyleft</b>.</p>`,
        },
        {
          level: "university",
          html: `
<h4>Three architectures for one algorithm</h4>
<p><b>WaveSimulator2D</b> is a compact Python project that keeps its arrays on an NVIDIA GPU with CuPy (a NumPy-compatible array library on top of CUDA). Scenes are built from objects, one of which reads the RGB scene image.</p>
<p><b>Wave Dude 2D for Windows</b> (VB.NET, Windows Forms, .NET Framework 4.6.1) has two interchangeable engines behind an <code>IWaveEngine</code> interface: <code>WaveSimulator</code> on the CPU and <code>GpuWaveSimulator</code> on OpenCL. The OpenCL kernels are generated as source text at run time and compiled by the driver; the choice of stencil is baked in as a <code>#define USE_4TH_ORDER</code> rather than a run-time branch. For display, the field is copied back to main memory (<code>PrepareFrame</code> → <code>clEnqueueReadBuffer</code>) and coloured on the CPU by <code>FrameRenderer</code>.</p>
<p><b>The web version</b> (TypeScript, WebGL2, built with Vite, no UI framework) keeps everything on the GPU, including the colouring: the field is never copied back just to draw it. Compare the core line in both:</p>
<pre><code>// OpenCL (GpuWaveSimulator.vb)
float nv = uc + (uc - up[i]) * d[i] + lap * c2[i] * c2Scale;

// GLSL (src/engine/shaders.ts)
float nv = uc + (uc - st.g) * pow(m.g, dPow) + lap * m.r * c2Scale;</code></pre>
<p>The arithmetic is identical; only the storage differs (separate buffers for u, u<sub>prev</sub>, c², d in OpenCL; packed RGBA texels in WebGL, see “Thousands of tiny calculators”).</p>
<h4>What the port does not copy</h4>
<ul>
<li>There is no CPU fallback: the browser must offer WebGL2 with the <code>EXT_color_buffer_float</code> extension, or the engine stops with an explanation.</li>
<li>Composite sources in the Windows app can redraw their pulse off-width every cycle on the GPU (a per-element xorshift32 generator inside the OpenCL kernel). The web version keeps each element's first off-width and warns when a project relies on it.</li>
<li>Video is written through WebCodecs instead of Windows Media Foundation.</li>
</ul>
<h4>Licences and credits</h4>
<p>The source files that derive from WaveSimulator2D say so in their headers. Most colour schemes were sampled from matplotlib and seaborn colormaps; <code>Ice_and_fire</code> and <code>Orange_symmetry</code> come from WaveSimulator2D. The MP4 writer used by the web version, Mediabunny, is MPL-2.0, a file-level copyleft licence that can be combined with GPL code. The Windows README also notes that the program was developed with substantial help from Claude (Anthropic).</p>`,
        },
        {
          level: "research",
          title: "Do the three engines agree?",
          html: `
<p>All three implement the same explicit scheme, but they are not expected to agree bit for bit. Floating-point addition is not associative, so the order in which the nine stencil terms are summed matters at the level of the last bits; GPU compilers may contract <code>a * b + c</code> into a fused multiply-add; and <code>sin</code> on a GPU is implemented differently from the CPU's maths library. The Windows source states this explicitly for its random off-widths (“not bit-for-bit — the two engines are not expected to reproduce each other”).</p>
<p>Because the scheme is linear and (for c² below the stability limit) non-amplifying, such round-off differences do not grow exponentially; they stay at the level of single-precision noise relative to the field. For quantitative comparisons between engines, compare observables — wavelengths, reflection coefficients, interference fringe positions — rather than raw field values at one step. The experiments in this app follow that approach: their checks use the grid's own dispersion relation, not a stored reference field.</p>`,
        },
      ],
      tryIt: [{ experiment: "splash", label: "Splash! Making waves" }],
      sources: [
        "0x23, WaveSimulator2D — https://github.com/0x23/WaveSimulator2D",
        "JJM Vleggaar (Huygens Optics), Wave Dude 2D for Windows: README.md and LICENSE in the source distribution",
        "GNU General Public License, version 3 — https://www.gnu.org/licenses/gpl-3.0.html",
        "Mozilla Public License 2.0 FAQ (compatibility with the GPL) — https://www.mozilla.org/en-US/MPL/2.0/FAQ/",
        "CuPy: NumPy and SciPy for GPU — https://cupy.dev",
        "Khronos Group, OpenCL — https://www.khronos.org/opencl/",
        "D. Goldberg, What every computer scientist should know about floating-point arithmetic, ACM Computing Surveys 23(1), 1991",
      ],
    },

    // ------------------------------------------------------------------------------------------ 2. GPU and WebGL2
    {
      id: "gpu-webgl2",
      title: "Thousands of tiny calculators: computing with WebGL2",
      summary: "Why the simulation runs on the graphics card, and how a tool made for drawing triangles is persuaded to solve the wave equation.",
      sections: [
        {
          level: "kids",
          html: `
<p>The simulator cuts the water into a huge grid of tiny squares called <b>cells</b> — often about two million of them. For every new moment in time, <b>every</b> cell has to do a little sum.</p>
<p>The main chip in a computer (the CPU) is like a few very clever people. They can do anything, but there are only a few of them. The <b>graphics card</b> (the GPU) is like <b>thousands of tiny calculators</b> working at the same time. Each one is simple, but together they finish the whole grid in a blink. That is exactly what a wave needs: the same small sum, in every cell, all at once.</p>
<p>Where are the numbers kept? In a <b>texture</b>. Normally a texture is a picture glued onto a shape in a video game. Here it is a picture that stores <b>numbers instead of colours</b>: each square holds how high the water is.</p>
<figure class="diagram"><svg viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg">
<g fill="none" stroke="currentColor" stroke-width="1.5">
<rect x="20" y="20" width="180" height="120"/>
<path d="M80 20 V140 M140 20 V140 M20 60 H200 M20 100 H200"/>
</g>
<rect x="80" y="60" width="60" height="40" fill="#60a5fa" fill-opacity="0.25"/>
<g font-size="13" text-anchor="middle" fill="currentColor">
<text x="50" y="45">0.1</text><text x="110" y="45">0.4</text><text x="170" y="45">0.2</text>
<text x="50" y="85">−0.3</text><text x="110" y="85">0.5</text><text x="170" y="85">0.0</text>
<text x="50" y="125">−0.6</text><text x="110" y="125">−0.2</text><text x="170" y="125">0.3</text>
</g>
<text x="210" y="75" font-size="12" fill="currentColor">a texture:</text>
<text x="210" y="92" font-size="12" fill="currentColor">numbers,</text>
<text x="210" y="109" font-size="12" fill="currentColor">not colours</text>
</svg><figcaption>A tiny piece of a texture. Each square is one cell and holds the height of the water there.</figcaption></figure>
<div class="home"><b>Try it at home:</b> Draw a 4 × 4 grid on squared paper and write a number in each square. Now, for every square, write the average of its neighbours — but write the answers on a <b>second</b> sheet. Try doing it on the same sheet instead and you will mix up old and new numbers. The graphics card has the same problem, and solves it with two sheets as well.</div>
<div class="fact"><b>Fun fact:</b> A fast graphics card can do about 20 billion cell updates every second. If every person on Earth did one sum per second, all of them together would need more than two seconds to do what the card does in one.</div>`,
        },
        {
          level: "school",
          html: `
<p>A <b>CPU</b> has a handful of powerful cores and is good at long, branching tasks. A <b>GPU</b> has thousands of simpler cores that all run the same little program on different data. The wave update is a perfect fit: within one time step, every cell's new value depends only on the <i>old</i> values, so all cells can be updated at the same moment.</p>
<h4>Disguising maths as drawing</h4>
<p>WebGL2 is a browser interface made for drawing 3D graphics. It has no “calculate this array” command, so the simulator uses its drawing parts in a clever way:</p>
<ul>
<li>A grid of W × H cells is stored as a <b>texture</b> of W × H texels (texture pixels). Each texel holds four numbers, called R, G, B and A.</li>
<li>To do one time step, the program “draws” a shape that covers the whole texture. The GPU then runs a small program, the <b>fragment shader</b>, once for every texel. That shader is the calculation for one cell.</li>
<li>The results are written into another texture instead of onto the screen.</li>
</ul>
<h4>Ping-pong</h4>
<p>A shader may not read from the same texture it is writing to — like your squared-paper experiment. So there are two state textures, A and B. Step 1 reads A and writes B; step 2 reads B and writes A; and so on, back and forth like a ping-pong ball.</p>
<figure class="diagram"><svg viewBox="0 0 420 140" xmlns="http://www.w3.org/2000/svg">
<rect x="20" y="40" width="100" height="60" rx="6" fill="none" stroke="#60a5fa" stroke-width="2"/>
<text x="70" y="68" font-size="13" text-anchor="middle" fill="currentColor">texture A</text>
<text x="70" y="86" font-size="12" text-anchor="middle" fill="currentColor">step n</text>
<rect x="160" y="45" width="100" height="50" rx="25" fill="none" stroke="#fbbf24" stroke-width="2"/>
<text x="210" y="74" font-size="13" text-anchor="middle" fill="currentColor">shader</text>
<rect x="300" y="40" width="100" height="60" rx="6" fill="none" stroke="#34d399" stroke-width="2"/>
<text x="350" y="68" font-size="13" text-anchor="middle" fill="currentColor">texture B</text>
<text x="350" y="86" font-size="12" text-anchor="middle" fill="currentColor">step n + 1</text>
<path d="M120 70 H152 M146 64 L152 70 L146 76 M260 70 H292 M286 64 L292 70 L286 76" fill="none" stroke="currentColor" stroke-width="2"/>
<path d="M350 100 C350 132 70 132 70 108 M64 114 L70 106 L76 114" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 4"/>
<text x="210" y="126" font-size="12" text-anchor="middle" fill="currentColor">then swap: B is read, A is written</text>
<text x="210" y="24" font-size="12" text-anchor="middle" fill="currentColor">read</text>
<text x="210" y="38" font-size="12" text-anchor="middle" fill="currentColor">→ calculate → write</text>
</svg><figcaption>Ping-pong: one texture is read while the other is written, then they swap roles.</figcaption></figure>
<h4>A worked example</h4>
<p>A full-HD scene has 1920 × 1080 = 2 073 600 cells. At about 20 billion cell updates per second, the card can do 20 000 000 000 ÷ 2 073 600 ≈ <b>9 600 steps per second</b>. The screen shows 60 pictures per second, so there is room for about 160 steps between two pictures.</p>
<p>Memory: each texel holds 4 numbers of 4 bytes, so 16 bytes. The simulator keeps five full-size textures (two state textures, the material, and two for the sources): 5 × 16 = 80 bytes per cell, and 2 073 600 × 80 ≈ <b>166 MB</b> of graphics memory.</p>`,
        },
        {
          level: "university",
          html: `
<h4>Getting a context that can compute</h4>
<p>The engine asks for a WebGL2 context and then for one extension. In core WebGL2, 32-bit float textures (<code>RGBA32F</code>) can be sampled but are not colour-renderable, so a framebuffer with one attached would be incomplete. <code>EXT_color_buffer_float</code> makes <code>R32F</code>, <code>RG32F</code>, <code>RGBA32F</code> (and the 16-bit float formats) renderable:</p>
<pre><code>const gl = canvas.getContext("webgl2", { antialias: false, alpha: false, preserveDrawingBuffer: true });
if (!gl.getExtension("EXT_color_buffer_float")) throw new Error("This GPU/browser cannot render to float textures (EXT_color_buffer_float).");</code></pre>
<p><code>preserveDrawingBuffer</code> keeps the last frame readable, which screenshots and the video recorder rely on.</p>
<h4>Texture layout</h4>
<p>Every texture is <code>RGBA32F</code>, one texel per cell, with <code>NEAREST</code> filtering and <code>CLAMP_TO_EDGE</code>; the shaders read them with <code>texelFetch</code> (integer coordinates, no filtering), so a cell's value is never blended with its neighbours by the hardware.</p>
<table>
<tr><th>texture</th><th>R</th><th>G</th><th>B</th><th>A</th></tr>
<tr><td>state (×2)</td><td>u<sup>n</sup></td><td>u<sup>n−1</sup></td><td>intensity s₁</td><td>intensity s₂</td></tr>
<tr><td>material</td><td>c²</td><td>d</td><td>n (display)</td><td>absorber (display)</td></tr>
<tr><td>source A</td><td>ω</td><td>amplitude</td><td>phase</td><td>mode</td></tr>
<tr><td>source B</td><td>on cycles</td><td>off cycles</td><td>detach step</td><td>—</td></tr>
</table>
<p>Packing u<sup>n</sup> and u<sup>n−1</sup> into one texel means the three-level time scheme needs only two textures, and one fetch delivers both.</p>
<h4>A kernel launch is a draw call</h4>
<p>There is no vertex buffer at all. The vertex shader builds one oversized triangle from <code>gl_VertexID</code> — corners (−1, −1), (3, −1), (−1, 3) — which covers the whole viewport, so the fragment shader runs exactly once per texel:</p>
<pre><code>vec2 p = vec2((gl_VertexID &lt;&lt; 1) &amp; 2, gl_VertexID &amp; 2);
gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);</code></pre>
<p>One time step is then: bind the current state texture as input, bind the framebuffer of the other one as output, draw three vertices, swap:</p>
<pre><code>this.bind(0, this.state[this.cur]);
gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo[1 - this.cur]);
gl.drawArrays(gl.TRIANGLES, 0, 3);
this.cur = 1 - this.cur;</code></pre>
<p>Inside the shader, <code>ivec2(gl_FragCoord.xy)</code> is the cell's integer coordinate. The ping-pong is not optional: WebGL reports an <code>INVALID_OPERATION</code> error for a “feedback loop”, a draw that samples a texture attached to the framebuffer being drawn into.</p>
<h4>The GPU is a separate computer</h4>
<p>The field lives only in graphics memory. If the driver resets, the browser fires <code>webglcontextlost</code> and every texture is gone. The engine keeps CPU-side copies of everything it uploaded (the scene arrays and the source data) and, on <code>webglcontextrestored</code>, rebuilds programs and textures from them; the field itself restarts from zero.</p>`,
        },
        {
          level: "research",
          title: "Limits of the WebGL approach",
          html: `
<ul>
<li><b>Memory-bound stencil.</b> A 9-point update does very little arithmetic per byte fetched, so speed is set mainly by memory traffic and how well the texture cache serves the overlapping neighbourhoods. Packing four quantities per texel helps; so does the 2D-tiled layout GPUs use for textures.</li>
<li><b>One draw per step.</b> Every step (and every 4th-order sub-step) is a separate draw call. For small grids the fixed per-draw overhead, not the arithmetic, limits the step rate. Fusing several steps into one pass would need neighbour exchange inside a tile, which fragment shaders cannot do.</li>
<li><b>Compute shaders.</b> WebGPU, now shipping in major browsers, offers compute shaders with workgroup shared memory and storage buffers. That would allow tiling the stencil in shared memory and an OpenCL-like layout (separate buffers, in-place update of the u<sub>prev</sub> buffer as the Windows kernel does). It is the natural next step for this code, not something the current version uses.</li>
<li><b>Precision.</b> GLSL ES 3.00 requires <code>highp</code> (IEEE-754 single precision, 24-bit significand) in fragment shaders. Half floats (<code>RGBA16F</code>) would halve the memory traffic but give only about three decimal digits — too few for the small differences u<sup>n</sup> − u<sup>n−1</sup> of long waves.</li>
</ul>
<p>Background reading: the early “GPGPU” literature describes exactly this textures-as-arrays, fragment-shader-as-kernel, ping-pong pattern (Harris 2005; Owens et al. 2007).</p>`,
        },
      ],
      tryIt: [{ experiment: "splash", label: "Splash! Making waves" }],
      sources: [
        "MDN Web Docs, EXT_color_buffer_float — https://developer.mozilla.org/en-US/docs/Web/API/EXT_color_buffer_float",
        "Khronos Group, WebGL 2.0 Specification — https://registry.khronos.org/webgl/specs/latest/2.0/",
        "Khronos Group, The OpenGL ES Shading Language, version 3.00 — https://registry.khronos.org/OpenGL/specs/es/3.0/GLSL_ES_Specification_3.00.pdf",
        "M. Harris, Mapping Computational Concepts to GPUs, in GPU Gems 2, ch. 31 (Addison-Wesley, 2005)",
        "J. D. Owens et al., A Survey of General-Purpose Computation on Graphics Hardware, Computer Graphics Forum 26(1), 2007",
        "WebGL2 Fundamentals, WebGL2 GPGPU — https://webgl2fundamentals.org/webgl/lessons/webgl-gpgpu.html",
      ],
    },

    // ------------------------------------------------------------------------------------------ 3. the step shader
    {
      id: "wave-step-shader",
      title: "The wave step, line by line",
      summary: "A walk through the small GPU program that moves every cell forward by one time step.",
      sections: [
        {
          level: "kids",
          html: `
<p>A simulation works like a <b>flip-book</b>. Each page is one moment, called a <b>step</b>. To draw the next page, every cell asks three questions:</p>
<ol>
<li><b>Where am I now?</b></li>
<li><b>Where was I on the page before?</b> If I was going up, I keep going up a bit — like a swing that keeps swinging.</li>
<li><b>Where are my neighbours?</b> If I am higher than the cells around me, they pull me down. If I am lower, they pull me up. Like people holding hands in a stadium wave.</li>
</ol>
<figure class="diagram"><svg viewBox="0 0 260 170" xmlns="http://www.w3.org/2000/svg">
<g fill="none" stroke="currentColor" stroke-width="1.5">
<rect x="60" y="15" width="150" height="150"/>
<path d="M110 15 V165 M160 15 V165 M60 65 H210 M60 115 H210"/>
</g>
<rect x="110" y="65" width="50" height="50" fill="#fbbf24" fill-opacity="0.35"/>
<text x="135" y="95" font-size="13" text-anchor="middle" fill="currentColor">me</text>
<g stroke="#60a5fa" stroke-width="2" fill="none">
<path d="M135 40 V62 M135 140 V118 M85 90 H107 M185 90 H163"/>
<path d="M90 45 L107 62 M180 45 L163 62 M90 135 L107 118 M180 135 L163 118"/>
</g>
<text x="10" y="95" font-size="12" fill="currentColor">8</text>
<text x="10" y="110" font-size="12" fill="currentColor">helpers</text>
</svg><figcaption>Each cell looks at its eight neighbours to work out its next height.</figcaption></figure>
<p>In glass the neighbours pull more gently, so the wave goes slower. In a sponge-like absorber the cell moves as if through honey, so the wave dies away. A <b>source</b> is a cell that gets a little push towards where a tapping finger wants it to be, every single step.</p>
<p>That is the whole secret. The graphics card does these three questions for millions of cells, thousands of times a second.</p>
<div class="home"><b>Try it at home:</b> Make a flip-book from a pad of sticky notes. On the first page draw a dot. On each next page draw a ring a little bigger than before. Flip fast — your ring grows like a ripple. Every page is one step.</div>`,
        },
        {
          level: "school",
          html: `
<p>Every step, for every cell, the program works out:</p>
<p class="formula">u<sub>new</sub> = u + d · (u − u<sub>prev</sub>) + c² · (K ∗ u)</p>
<ul>
<li><b>u</b> is the height of the cell now, <b>u<sub>prev</sub></b> its height one step ago. So (u − u<sub>prev</sub>) is how fast it was moving.</li>
<li><b>d</b> is the damping factor: 1 means no damping, 0 means the motion is stopped.</li>
<li><b>c²</b> = 1 / n², where n is the refractive index. Glass with n = 1.5 gives c² = 0.444.</li>
<li><b>K ∗ u</b> is a weighted sum of the 3 × 3 block around the cell, using the weights below. It measures how much the cell sticks out from its neighbours.</li>
</ul>
<figure class="diagram"><svg viewBox="0 0 220 180" xmlns="http://www.w3.org/2000/svg">
<g fill="none" stroke="currentColor" stroke-width="1.5">
<rect x="35" y="15" width="150" height="150"/>
<path d="M85 15 V165 M135 15 V165 M35 65 H185 M35 115 H185"/>
</g>
<rect x="85" y="65" width="50" height="50" fill="#f87171" fill-opacity="0.3"/>
<rect x="85" y="15" width="50" height="50" fill="#60a5fa" fill-opacity="0.25"/>
<rect x="85" y="115" width="50" height="50" fill="#60a5fa" fill-opacity="0.25"/>
<rect x="35" y="65" width="50" height="50" fill="#60a5fa" fill-opacity="0.25"/>
<rect x="135" y="65" width="50" height="50" fill="#60a5fa" fill-opacity="0.25"/>
<g font-size="13" text-anchor="middle" fill="currentColor">
<text x="60" y="45">0.066</text><text x="110" y="45">0.184</text><text x="160" y="45">0.066</text>
<text x="60" y="95">0.184</text><text x="110" y="95">−1</text><text x="160" y="95">0.184</text>
<text x="60" y="145">0.066</text><text x="110" y="145">0.184</text><text x="160" y="145">0.066</text>
</g>
</svg><figcaption>The 3 × 3 kernel K. The weights add up to zero, so a flat sheet stays flat.</figcaption></figure>
<h4>A worked example</h4>
<p>Take a cell with u = 0.5 and u<sub>prev</sub> = 0.4. Its four side neighbours are 0.3, 0.3, 0.2 and 0.2 (sum 1.0); its four corner neighbours are each 0.1 (sum 0.4). No damping, so d = 1.</p>
<p class="formula">K ∗ u = 0.066 × 0.4 + 0.184 × 1.0 − 0.5 = 0.0264 + 0.184 − 0.5 = −0.2896</p>
<p>In empty space (n = 1, c² = 1): u<sub>new</sub> = 0.5 + 1 × (0.5 − 0.4) + 1 × (−0.2896) = <b>0.310</b>. The cell was higher than its neighbours, so it is pulled down.</p>
<p>In glass (n = 1.5, c² = 0.444): u<sub>new</sub> = 0.5 + 0.1 + 0.444 × (−0.2896) = <b>0.471</b>. The pull is weaker, so the cell responds more slowly — and that is why waves travel more slowly in glass.</p>
<p>The graphics card does this sum about 2 million times per step for a full-HD scene.</p>`,
        },
        {
          level: "university",
          html: `
<p>The whole step is one fragment shader, <code>STEP_FS</code> in <code>src/engine/shaders.ts</code>. It starts with a helper that returns the field as the step should see it:</p>
<pre><code>float U(ivec2 p) {
  if (p.x &lt; 0 || p.y &lt; 0 || p.x &gt;= size.x || p.y &gt;= size.y) return 0.0;
  float u = texelFetch(state, p, 0).r;
  if (applySrc &gt; 0.5) {
    vec4 a = texelFetch(srcA, p, 0);
    float v;
    if (a.a &gt; 0.5 &amp;&amp; sourceValue(a, texelFetch(srcB, p, 0), v)) u = u * 0.9 + v * 0.1;
  }
  return u;
}</code></pre>
<p>Outside the grid the field is 0 (a fixed, reflecting boundary; the damping edge sits just inside it). A source cell is pulled 10% of the way towards its drive value v = A · sin(φ + ω t) · envelope. In the Windows app this pull is a separate OpenCL kernel, <code>apply_sources</code>, that modifies u in place before <code>wave_step</code>. A fragment shader cannot write to the texture it reads, so the web version folds the pull into every read instead: the cell itself and all its neighbours see the pulled value, which is exactly what the in-place version produces.</p>
<p>Then the Laplacian-like sum, with the optional 4th-order cross everywhere except the outermost ring (two cells away it reads the zero border, as the OpenCL kernel does):</p>
<pre><code>if (use4th &gt; 0.5 &amp;&amp; p.x &gt;= 1 &amp;&amp; p.y &gt;= 1 &amp;&amp; p.x &lt; size.x - 1 &amp;&amp; p.y &lt; size.y - 1) {
  lap = 0.316 * ((-1.0 / 12.0) * (U(p + ivec2(-2, 0)) + U(p + ivec2(2, 0)) + U(p + ivec2(0, -2)) + U(p + ivec2(0, 2)))
      + (4.0 / 3.0) * (U(p + ivec2(-1, 0)) + U(p + ivec2(1, 0)) + U(p + ivec2(0, -1)) + U(p + ivec2(0, 1)))
      - 5.0 * uc);
} else {
  lap = 0.066 * (U(p + ivec2(-1, -1)) + U(p + ivec2(1, -1)) + U(p + ivec2(-1, 1)) + U(p + ivec2(1, 1)))
      + 0.184 * (U(p + ivec2(-1, 0)) + U(p + ivec2(1, 0)) + U(p + ivec2(0, -1)) + U(p + ivec2(0, 1)))
      - uc;
}</code></pre>
<p>The update and the intensity filter:</p>
<pre><code>float nv = uc + (uc - st.g) * pow(m.g, dPow) + lap * m.r * c2Scale;
if (track &lt; 0.5) { o = vec4(nv, uc, st.b, st.a); return; }
float s1 = st.b * alpha + nv * nv * (1.0 - alpha);
float s2 = st.a * alpha + s1 * (1.0 - alpha);
o = vec4(nv, uc, s1, s2);</code></pre>
<p>Reading it against the maths: <code>st.g</code> is u<sup>n−1</sup>, <code>m.g</code> is d, <code>m.r</code> is c² = 1/n². The output texel stores (u<sup>n+1</sup>, u<sup>n</sup>, s₁, s₂), so the next step finds its “previous” value in G without any copy.</p>
<h4>Sub-steps</h4>
<p>With the 4th-order stencil the engine may split one step into N sub-steps, N = ⌈√(c²<sub>max</sub> · 0.316 · 32/3 / 2)⌉ (the cross is scaled by 0.316 so both stencils give waves the same speed). The uniforms make N sub-steps equal one step: <code>c2Scale = 1/N²</code> scales c², <code>dPow = 1/N</code> turns d into d<sup>1/N</sup> (so N sub-steps damp by d in total), sources are applied on the first sub-step only (<code>applySrc</code>) and the intensity on the last (<code>track</code>). The Windows app pre-scales its d buffer on the host instead of calling <code>pow</code>; the result is the same.</p>
<pre><code>for (let s = 0; s &lt; sub; s++) {
  gl.uniform1f(P.u.applySrc, s === 0 ? 1 : 0);
  gl.uniform1f(P.u.track, s === sub - 1 ? 1 : 0);
  ...
}</code></pre>`,
        },
        {
          level: "research",
          title: "Design trade-offs in the step",
          html: `
<ul>
<li><b>Source folding costs fetches.</b> On a step where sources are applied, each <code>U()</code> call also fetches <code>srcA</code> — nine extra fetches per cell for the 3 × 3 kernel, even though almost no cells are sources. The alternative, a separate pass that writes the pulled field into a third texture (or draws the source cells as <code>gl.POINTS</code> into it), costs an extra full-grid pass. Which is faster depends on the GPU's texture cache; the current choice keeps the step to one draw call.</li>
<li><b>The boundary ring matches the Windows kernel.</b> The OpenCL arrays have a one-cell zero border, so its 4th-order branch falls back to the 3 × 3 kernel only in the outermost ring. The web shader has no padding, but its <code>U()</code> function returns 0 for any cell outside the scene, which plays the part of that border, so it too falls back only in the outermost ring.</li>
<li><b>Phase precision in long runs.</b> The drive is evaluated as <code>sin(a.b + omega * t)</code> in single precision. At ω t ≈ 10⁵ rad (a few hundred thousand steps for a typical source) adjacent float values are 2⁻⁷ ≈ 0.008 rad apart, and GPU <code>sin</code> loses accuracy for large arguments. Reducing the phase modulo 2π on the CPU before uploading would remove this; for runs of thousands of steps it does not matter.</li>
<li><b>Boundary condition.</b> Returning 0 outside the domain is a homogeneous Dirichlet condition, perfectly reflecting. All absorption comes from the graded damping layer (d = √(i / thickness)), which is simpler but less effective than a perfectly matched layer.</li>
</ul>`,
        },
      ],
      tryIt: [
        { experiment: "grid-dispersion", label: "Waves on a grid: numerical dispersion" },
        { experiment: "absorbing-edge", label: "How good is the absorbing edge?" },
      ],
      sources: [
        "R. J. LeVeque, Finite Difference Methods for Ordinary and Partial Differential Equations (SIAM, 2007)",
        "A. Taflove and S. C. Hagness, Computational Electrodynamics: The Finite-Difference Time-Domain Method, 3rd ed. (Artech House, 2005)",
        "0x23, WaveSimulator2D (origin of the 3 × 3 kernel) — https://github.com/0x23/WaveSimulator2D",
        "J.-P. Berenger, A perfectly matched layer for the absorption of electromagnetic waves, Journal of Computational Physics 114, 185–200 (1994)",
      ],
    },

    // ------------------------------------------------------------------------------------------ 4. drawing the picture
    {
      id: "drawing-the-picture",
      title: "Drawing the picture: colours, zoom and the 3D surface",
      summary: "How numbers become colours through a colour table, how zoom and pan work, and how the 3D view turns the field into a lit landscape.",
      sections: [
        {
          level: "kids",
          html: `
<p>The graphics card only knows numbers: 0.2 here, −0.5 there. To show you a picture, it plays <b>paint by numbers</b>.</p>
<p>There is a <b>colour table</b>: a strip of 255 colours in a row, like a long box of crayons. Zero (flat water) picks the crayon in the middle. A big positive number (a crest) picks one near one end, a big negative number (a trough) one near the other end. With the normal colours, crests are red, troughs are blue and flat water is black.</p>
<figure class="diagram"><svg viewBox="0 0 340 90" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="itc-lut-kids" x1="0" x2="1" y1="0" y2="0">
<stop offset="0" stop-color="#60a5fa"/><stop offset="0.5" stop-color="#60a5fa" stop-opacity="0"/><stop offset="0.5" stop-color="#f87171" stop-opacity="0"/><stop offset="1" stop-color="#f87171"/>
</linearGradient></defs>
<rect x="20" y="20" width="300" height="30" fill="url(#itc-lut-kids)" stroke="currentColor"/>
<path d="M20 50 V58 M170 50 V58 M320 50 V58" stroke="currentColor"/>
<text x="20" y="75" font-size="12" text-anchor="middle" fill="currentColor">trough</text>
<text x="170" y="75" font-size="12" text-anchor="middle" fill="currentColor">flat</text>
<text x="320" y="75" font-size="12" text-anchor="middle" fill="currentColor">crest</text>
</svg><figcaption>The colour table: each number picks one colour from the strip.</figcaption></figure>
<p>The <b>brightness</b> slider is like a magnifying glass for small waves: it makes gentle ripples pick colours further from the middle, so you can see them.</p>
<p><b>Zooming in</b> makes each cell a big square on your screen, so you can see the grid. <b>Zooming out</b> squeezes many cells into one screen dot, and the computer mixes their colours.</p>
<p>In the <b>3D view</b> the numbers become heights: crests are hills, troughs are valleys, like a rubber sheet. A pretend lamp shines on it, so you can see the shape.</p>
<div class="home"><b>Try it at home:</b> Draw a grid and write numbers from −3 to +3 in the squares. Make your own colour table: −3 dark blue, 0 black (or leave it white), +3 bright red, with in-between shades. Colour the grid. You have just made a wave picture the way the computer does.</div>`,
        },
        {
          level: "school",
          html: `
<h4>Field view</h4>
<p>The colour table has 255 entries, numbered 0 to 254. The program picks an entry with</p>
<p class="formula">index = round down( clamp(u × brightness, −1, 1) × 127 + 127 )</p>
<p>where u is the field value and “clamp” means: anything below −1 counts as −1, anything above 1 counts as 1. So u = 0 gives index 127 (the middle).</p>
<p><b>Example:</b> u = 0.2 with brightness 2: 0.2 × 2 = 0.4, and 0.4 × 127 + 127 = 177.8, so entry <b>177</b>, a medium red. u = −0.6 with brightness 2 gives −1.2, clamped to −1, so entry <b>0</b>: the deepest trough colour. Turning the brightness up makes more of the picture hit the ends of the table.</p>
<h4>Intensity view</h4>
<p>Intensity I is never negative, so it uses the table from one end: index = round down( min(√I × brightness, 1) × 254 ). <b>Example:</b> I = 0.04, √I = 0.2, brightness 2 → 0.4 × 254 = 101.6 → entry <b>101</b>.</p>
<h4>Black level</h4>
<p>The black level b lifts (or, when negative, lowers) the dark colours: each colour channel becomes c × (1 − b) + b, on a 0-to-1 scale. With b = 0.1, pure black (0) becomes 0.1, which is 25 out of 255: a very dark grey, so you can tell “no wave” from the background.</p>
<h4>Zoom and pan</h4>
<p>For every pixel on the screen the program works out which cell it shows: cell = offset + pixel × (cells per pixel). Zoomed in 4 × (0.25 cells per pixel), screen pixel 100 shows cell offset + 25. Dragging the picture just changes the offset; zooming changes the cells per pixel. The simulation itself is not touched.</p>`,
        },
        {
          level: "university",
          html: `
<h4>The display shader</h4>
<p><code>DISPLAY_FS</code> runs once per screen pixel. It flips y (the scene's row 0 is the top, WebGL's is the bottom), maps the pixel to a cell, and looks the value up in the colour table, a 256 × 1 <code>RGBA8</code> texture:</p>
<pre><code>vec2 px = vec2(gl_FragCoord.x, canvasH - gl_FragCoord.y);
if (cellsPerPx &lt;= 1.0) {
  o = vec4(cellColor(offset + px * cellsPerPx), 1.0);
} else {
  // zoomed out: average a few samples per pixel instead of skipping cells (no moire)
  vec3 acc = vec3(0.0);
  for (int j = 0; j &lt; 3; j++) for (int i = 0; i &lt; 3; i++)
    acc += cellColor(offset + (px - 0.5 + (vec2(i, j) + 0.5) / 3.0) * cellsPerPx);
  o = vec4(acc / 9.0, 1.0);
}</code></pre>
<p>Zoomed in, nearest-cell lookup gives crisp squares. Zoomed out, a 3 × 3 box filter averages nine samples per pixel, which suppresses the moiré that point-sampling a fine fringe pattern would produce. <code>cellColor</code> then tints glass (by n), mixes in a stone colour for absorbers, and paints source cells in a spectrum hue from red (level 1) to violet (level 255). The canvas uses the device pixel ratio, capped at 2.</p>
<h4>Colour tables and black level</h4>
<p><code>setColorScheme</code> builds the table on the CPU with the black level of the Windows <code>ColorLut</code>, then uploads 1 KB:</p>
<pre><code>const v = Math.min(1, Math.max(0, (c[k] / 255) * (1 - blackLevel) + blackLevel));
d[i * 4 + k] = Math.min(255, Math.trunc(v * 255));</code></pre>
<p>Because the table is a texture, changing the scheme or the black level is instant and costs nothing per step.</p>
<h4>The 3D surface</h4>
<p>The 3D view draws an indexed triangle mesh with at most one vertex per cell and, by default, 640 vertices along the longest side (640 × 360 = 230 400 vertices for a 16:9 scene; WebGL2 allows 32-bit indices). The mesh has <b>no vertex attributes</b>: <code>MESH_VS</code> derives the grid position from <code>gl_VertexID</code> and reads the height straight from the state texture (vertex texture fetch):</p>
<pre><code>if (mode &lt; 0.5) return tanh(st.r * brightness) * amp;</code></pre>
<p>The <code>tanh</code> compresses large values smoothly, so a strong source makes a rounded hill instead of a spike. The normal comes from central differences, <code>normalize(cross(dz, dx))</code>; walls are lifted up as blocks whose height follows the wave-height setting. The fragment shader combines a diffuse term, a Phong highlight with exponent 48, a rim term (1 − n·v)³ standing in for a sky reflection, and a dark-water base so a zero (black) field still shows its shape. The camera orbits a target point with a 45° perspective projection. Since heights are read on the GPU every frame, turning the camera costs no read-back at all.</p>`,
        },
        {
          level: "research",
          title: "Choosing colours for data",
          html: `
<p>A signed field needs a <b>diverging</b> colour map: a neutral midpoint for zero and two hues for the two signs, with lightness changing monotonically away from the middle (Moreland 2009). The default field scheme does this with black at zero, running through blue to white for troughs and through red to white for crests. Intensity needs a <b>sequential</b> map; the included <code>inferno</code>, <code>magma</code> and <code>plasma</code> schemes come from matplotlib's perceptually uniform family, designed so that equal steps in value look like equal steps in colour. Rainbow maps (also included) create apparent edges where the hue changes quickly and are hard to read for colour-blind viewers (Crameri et al. 2020).</p>
<p>Two display choices also shape what you see: showing √I rather than I compresses the dynamic range (the picture is linear in amplitude, not energy), and the 3 × 3 box filter is a crude anti-aliasing filter — fringes near the sampling limit can still alias when zoomed far out. For quantitative work, use the probes rather than reading values off the colours.</p>`,
        },
      ],
      tryIt: [
        { experiment: "double-slit", label: "The double slit" },
        { experiment: "splash", label: "Splash! Making waves" },
      ],
      sources: [
        "K. Moreland, Diverging Color Maps for Scientific Visualization, in Advances in Visual Computing (ISVC 2009), LNCS 5876",
        "F. Crameri, G. E. Shephard and P. J. Heron, The misuse of colour in science communication, Nature Communications 11, 5444 (2020)",
        "N. Smith and S. van der Walt, A Better Default Colormap for Matplotlib (SciPy 2015) — https://bids.github.io/colormap/",
        "Matplotlib, Choosing Colormaps — https://matplotlib.org/stable/users/explain/colors/colormaps.html",
        "Khronos Group, WebGL 2.0 Specification — https://registry.khronos.org/webgl/specs/latest/2.0/",
      ],
    },

    // ------------------------------------------------------------------------------------------ 5. probes and read-back
    {
      id: "probes-and-readback",
      title: "Probes, graphs and reading back from the GPU",
      summary: "How probes record the field every step, and why the values are collected on the graphics card and fetched in batches.",
      sections: [
        {
          level: "kids",
          html: `
<p>A <b>probe</b> is like a little float bobbing on the water, with a notebook. Every step it writes down how high the water is at its spot. The graph under the simulation is that notebook, drawn as a wiggly line.</p>
<p>A <b>line probe</b> is a whole row of floats. It shows, along a line, where the water moves a lot and where it stays calm.</p>
<p>There is a catch. The numbers live inside the graphics card, and asking the card to send a number back to the rest of the computer is <b>slow</b>, a bit like posting a letter. Imagine posting a separate letter for every single word of a story! Instead, the card writes the probe values onto a page, and when the page is full — or when the screen is about to be redrawn — it sends the whole page at once.</p>
<figure class="diagram"><svg viewBox="0 0 360 130" xmlns="http://www.w3.org/2000/svg">
<rect x="15" y="20" width="130" height="90" rx="6" fill="none" stroke="#60a5fa" stroke-width="2"/>
<text x="80" y="40" font-size="13" text-anchor="middle" fill="currentColor">graphics card</text>
<g stroke="currentColor" stroke-width="1"><path d="M30 55 H130 M30 70 H130 M30 85 H130"/></g>
<text x="80" y="102" font-size="12" text-anchor="middle" fill="currentColor">writes every step</text>
<path d="M150 65 H205 M197 58 L205 65 L197 72" fill="none" stroke="#fbbf24" stroke-width="2.5"/>
<text x="178" y="52" font-size="12" text-anchor="middle" fill="currentColor">one page</text>
<rect x="215" y="20" width="130" height="90" rx="6" fill="none" stroke="#34d399" stroke-width="2"/>
<text x="280" y="40" font-size="13" text-anchor="middle" fill="currentColor">graph</text>
<path d="M228 75 C240 50 252 50 264 75 S288 100 300 75 S324 50 336 75" fill="none" stroke="#f87171" stroke-width="2"/>
</svg><figcaption>Probe values are collected on the graphics card and sent over a page at a time.</figcaption></figure>
<div class="home"><b>Try it at home:</b> Float a cork or a bottle cap in a bath or a sink and make gentle waves at one end. Watch the cork: it bobs up and down but hardly travels. That up-and-down is exactly what a probe's graph shows.</div>`,
        },
        {
          level: "school",
          html: `
<p>There are three kinds of measurement:</p>
<ul>
<li><b>Amplitude</b>: the field value u itself, step by step. The graph swings above and below zero.</li>
<li><b>Intensity</b>: a smoothed average of u², which shows how much the water moves on average. It is never negative.</li>
<li><b>Integrated intensity</b> (line probes): the intensity added up step after step, like a camera with a very long exposure. It can start after a chosen step, so the first, messy waves are left out.</li>
</ul>
<h4>Reading a graph: a worked example</h4>
<p>The horizontal axis of a point-probe graph is in <b>steps</b>. A source at level 60 turns by ω = 60 / 255 × 0.5 × 2 = 0.235 radians per step. One full oscillation is 2π radians, so the period is</p>
<p class="formula">T = 2π / ω = 6.283 / 0.235 ≈ 26.7 steps</p>
<p>So in an amplitude graph of a probe near this source you should count a crest about every 27 steps: 10 crests in about 267 steps. The frequency is f = 1 / T ≈ 0.037 oscillations per step.</p>
<h4>Why collect values first?</h4>
<p>The graphics card works through a queue of commands on its own, while the main processor carries on. Asking for numbers back makes the main processor <b>wait</b> until the card has finished everything in the queue. If the simulation runs 160 steps per screen frame, reading after every step would mean 160 waits per frame. Collecting the values on the card and reading them once per frame means just one wait.</p>`,
        },
        {
          level: "university",
          html: `
<h4>Point probes: one column per step</h4>
<p>Up to 8 point probes share a 1024 × 8 <code>RGBA32F</code> history texture. After each step the engine draws the full-screen triangle into a viewport only one pixel wide, at column <code>histFill</code>, with one row per probe:</p>
<pre><code>gl.bindFramebuffer(gl.FRAMEBUFFER, this.histFbo);
gl.viewport(this.histFill, 0, 1, this.pointProbes.length);
gl.drawArrays(gl.TRIANGLES, 0, 3);</code></pre>
<p>The shader (<code>PROBE_POINT_FS</code>) reads row k's probe position from a uniform array and writes u, or (s₁ + s₂)/2 × scale for intensity. When 1024 columns are full, or once per screen frame (<code>takeSamples</code>), a single <code>readPixels</code> fetches the block:</p>
<pre><code>gl.readPixels(0, 0, n, rows, gl.RGBA, gl.FLOAT, buf);</code></pre>
<p>The CPU keeps the last 6000 values per probe for the graph; integrated point probes are summed on the CPU from these per-step samples.</p>
<h4>Line probes and totals</h4>
<p>Up to 4 line probes of up to 4096 cells use a second texture: row k is line k, column i the i-th cell along it, one cell per step of the longer axis. For <b>integrated</b> lines, a per-step pass adds the current intensity to a running total held in a pair of ping-pong textures, so the accumulation never leaves the GPU; only the profile is read back, once per frame (<code>readProfiles</code>). The “start after step” rule is a per-line uniform that keeps the total at zero until then.</p>
<h4>Why it has to be batched</h4>
<p>WebGL commands are queued and executed asynchronously. <code>readPixels</code> into client memory is synchronous: the browser must flush the queue, wait for the GPU to finish all work that writes the framebuffer, and copy the data across. Each call therefore stalls the pipeline, independent of how few bytes it returns. The Windows OpenCL engine uses the same idea (a history buffer read with <code>clEnqueueReadBuffer</code> when full).</p>
<p>The one unbatched read is <code>readState</code>, used by auto-brightness: it copies the whole state (16 bytes per cell, about 33 MB at full HD), then looks at every k-th cell (k = ⌊cells / 200 000⌋, at least 1) and sets the brightness so that the 99.5th percentile of the values reaches 90% of full colour. That happens on a button press, not every frame.</p>`,
        },
        {
          level: "research",
          title: "Better read-back and accumulation",
          html: `
<ul>
<li><b>Asynchronous read-back.</b> WebGL2 can read into a <code>PIXEL_PACK_BUFFER</code>, insert a <code>fenceSync</code>, and call <code>getBufferSubData</code> only once the fence has signalled, which avoids the stall at the cost of one frame of latency. The current engine reads synchronously but rarely; for many probes or very small scenes an asynchronous path would help.</li>
<li><b>Sampling.</b> Probes sample once per step. The fastest source (level 255, ω = 1 rad/step) has about 6.3 steps per period, well below the Nyquist limit of π rad/step, so probe series are never aliased in time. A discrete Fourier transform of a long series measures ω directly — a good check of the source settings.</li>
<li><b>Single-precision sums.</b> An integrated total adds small increments to a growing number in 32-bit floats. Once the total is about 2²⁴ times larger than an increment, the increments are lost to rounding. Compensated (Kahan) summation, carried in a second channel of the accumulation texture, would delay this considerably.</li>
</ul>`,
        },
      ],
      tryIt: [
        { experiment: "double-slit", label: "The double slit" },
        { experiment: "absorbing-edge", label: "How good is the absorbing edge?" },
      ],
      sources: [
        "MDN Web Docs, WebGL best practices (non-blocking read-back) — https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices",
        "MDN Web Docs, WebGLRenderingContext.readPixels() — https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/readPixels",
        "W. Kahan, Further remarks on reducing truncation errors, Communications of the ACM 8(1), 40 (1965)",
        "A. V. Oppenheim and R. W. Schafer, Discrete-Time Signal Processing, 3rd ed. (Pearson, 2010)",
      ],
    },

    // ------------------------------------------------------------------------------------------ 6. projects and files
    {
      id: "projects-and-files",
      title: "Projects and files",
      summary: "What is inside a project: configuration.json, the scene image and its colour rules, zip files, and colour scheme files.",
      sections: [
        {
          level: "kids",
          html: `
<p>A <b>project</b> is everything needed to rebuild your experiment later, packed like a school bag:</p>
<ul>
<li>a note with all the settings, called <b>configuration.json</b> (where the sources are, how fast they tap, which colours to use…);</li>
<li>a <b>scene picture</b> in the folder <b>scene_images</b>, which tells the computer where the glass, walls and absorbers are.</li>
</ul>
<figure class="diagram"><svg viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg">
<path d="M20 20 H60 L70 30 H120 V55 H20 Z" fill="none" stroke="#fbbf24" stroke-width="2"/>
<text x="130" y="45" font-size="13" fill="currentColor">My project</text>
<path d="M40 55 V135 M40 75 H60 M40 95 H60 M40 115 H60 M40 135 H60" fill="none" stroke="currentColor" stroke-width="1.5"/>
<text x="66" y="79" font-size="12" fill="currentColor">configuration.json</text>
<text x="66" y="99" font-size="12" fill="currentColor">scene_images/  (the scene picture)</text>
<text x="66" y="119" font-size="12" fill="currentColor">assets/</text>
<text x="66" y="139" font-size="12" fill="currentColor">output_frames/, output_video/</text>
</svg><figcaption>A project folder. In the browser it travels as one .zip file.</figcaption></figure>
<p>The scene picture uses a secret colour code. Every pixel on a screen is made of red, green and blue light, and each colour gets its own job:</p>
<ul>
<li><b>Red</b> says how slow the waves are there (more red means glass).</li>
<li><b>Green</b> says “make waves here!” and how fast.</li>
<li><b>Blue</b> says “soak up the waves here”, like a sponge.</li>
</ul>
<p>A <b>zip</b> file is the whole folder squashed into one parcel, so you can send it to a friend or open it in the Windows version of Wave Dude.</p>
<div class="home"><b>Try it at home:</b> Look at a white part of a screen through a magnifying glass (or put a tiny drop of water on a phone screen). You will see tiny red, green and blue dots. Every colour on the screen is a mix of those three — the same three “jobs” a scene picture uses.</div>
<div class="fact"><b>Fun fact:</b> Scene pictures must be saved as PNG, not JPEG. JPEG changes colours very slightly to make files smaller — a tiny change in green would change a source's frequency!</div>`,
        },
        {
          level: "school",
          html: `
<h4>configuration.json</h4>
<p>JSON is a text format for data: names in quotes, a colon, then a value; curly brackets group things together. A shortened example of what Wave Dude writes:</p>
<pre><code>{
  "format_version": 1,
  "project_name": "Lens",
  "scene": {
    "mode": "image",
    "image_file": "scene_images/Lens_scene.png",
    "damping_edge_enabled": true,
    "damping_edge_size_px": 64,
    "use_object_sources": true
  },
  "simulation": {
    "steps": 2500,
    "visualize_every": 2,
    "field_color_scheme": "Default_Field",
    "use_4th_order_laplacian": false,
    "time_decay_factor": 10
  },
  "object_sources": { "count": 1, "items": [ ... ] },
  "probes": { "count": 0, "items": [] }
}</code></pre>
<h4>The scene image rules</h4>
<p>Each colour channel is a whole number from 0 to 255.</p>
<ul>
<li><b>Red</b> = refractive index × 100. Red 100 → n = 1.00 (empty space), red 150 → n = 1.50 (glass). The largest red value, 255, gives n = 2.55 — that is why the glass tool stops at 2.55 when a scene is saved. Indices are kept between 0.9 and 10, so a pixel with red = 0 counts as n = 0.9; always paint empty space with red = 100.</li>
<li><b>Green</b> greater than 0 = an image source with that frequency level (1–255).</li>
<li><b>Blue</b> = damping: d = 1 − blue / 255.</li>
</ul>
<table>
<tr><th>Pixel (R, G, B)</th><th>Meaning</th></tr>
<tr><td>(100, 0, 0)</td><td>empty space, n = 1</td></tr>
<tr><td>(150, 0, 0)</td><td>glass, n = 1.5</td></tr>
<tr><td>(100, 60, 0)</td><td>a source at level 60 in empty space</td></tr>
<tr><td>(100, 0, 64)</td><td>absorber: d = 1 − 64 / 255 = 0.75</td></tr>
<tr><td>(100, 0, 255)</td><td>wall: the field is held at 0 there, so waves reflect completely</td></tr>
</table>
<h4>Colour scheme files</h4>
<p>A colour scheme is a JSON file too: a name, a type (“field” or “intensity”), 9 <b>stops</b> and the full list of 255 colours made by blending between the stops in a straight line. The editor saves schemes in the browser and can download them in the same format the Windows app uses.</p>`,
        },
        {
          level: "university",
          html: `
<h4>Opening</h4>
<p><code>openProject</code> (in <code>src/project/project.ts</code>) accepts a .zip, a whole folder (using each file's <code>webkitRelativePath</code>), or a <code>configuration.json</code> plus its image. It normalises backslashes from Windows paths, takes the configuration with the shortest path as the project root, strips a UTF-8 byte-order mark, and reads every value through small validators (<code>num</code>, <code>int</code>, <code>bool</code>, <code>text</code>) that fall back to a default when a key is missing, of the wrong type or out of range. The whole parsed object is kept as <code>meta.raw</code> and cloned when saving, so keys this version does not understand survive a round trip; web-only settings are written under extra <code>web_*</code> keys that the Windows app ignores.</p>
<h4>Images are data, not pictures</h4>
<p>A scene image must be decoded to its exact stored bytes. Browsers normally apply colour management and may premultiply alpha, either of which would change the numbers. The loader turns both off:</p>
<pre><code>const bmp = await createImageBitmap(blob, { colorSpaceConversion: "none", premultiplyAlpha: "none" });</code></pre>
<p>When saving, an unmodified image is written back byte for byte; a painted scene is re-encoded as PNG from the cell arrays (red = round(n × 100) capped at 255, green = image source level, blue = round((1 − d) × 255)). Scenes larger than 8192 × 4096 cells are refused, to stay within what a browser's GPU memory can hold.</p>
<h4>A zip writer in 100 lines</h4>
<p><code>src/project/zip.ts</code> reads and writes zip files without a library. It finds the end-of-central-directory record by scanning backwards for its signature <code>0x06054b50</code>, uses the browser's <code>CompressionStream("deflate-raw")</code> and <code>DecompressionStream</code> for DEFLATE, stores PNG/JPEG/video entries uncompressed (they are already compressed), sets the UTF-8 file-name flag, and computes the CRC-32 checksum from a table:</p>
<pre><code>for (let k = 0; k &lt; 8; k++) c = c &amp; 1 ? 0xedb88320 ^ (c &gt;&gt;&gt; 1) : c &gt;&gt;&gt; 1;</code></pre>
<p>(0xEDB88320 is the bit-reversed form of the standard CRC-32 polynomial 0x04C11DB7.) There is no zip64 and no encryption, which is plenty for project folders.</p>
<h4>Colour schemes</h4>
<p>The editor interpolates 9 equally spaced stops linearly in RGB to 255 entries and rounds, exactly like the Windows <code>ColorScheme.InterpolateStops</code>. Saved schemes are stored in <code>localStorage</code> as their stops; the downloadable file contains <code>name</code>, <code>origin</code>, <code>category</code>, <code>scheme_type</code>, <code>bits_per_channel</code>, <code>entry_count</code>, <code>stops</code> and <code>colors</code>.</p>`,
        },
        {
          level: "research",
          title: "Reproducible runs",
          html: `
<p>A project is meant to be a complete, re-runnable description of an experiment. Two details make that work. First, composite sources store their generated <b>elements</b> (position, level, phase, pulse settings of every single emitter), so a randomised array reloads exactly as it was rather than being randomised again. Second, the web version generates arrays from a <b>seeded</b> generator (mulberry32) and saves the seed as <code>web_seed</code>, so the same settings always give the same elements.</p>
<p>What is not reproduced: the Windows GPU engine can re-randomise pulse off-widths during a run with a per-element generator inside the kernel; the web version keeps each element's first off-width. And, as for any floating-point simulation on different hardware, the field after many steps agrees with another engine only to within round-off (see “From Python to your browser”). For archiving results, save the project together with the probe data, and note the browser and GPU used.</p>`,
        },
      ],
      sources: [
        "T. Bray (ed.), The JavaScript Object Notation (JSON) Data Interchange Format, RFC 8259 (IETF, 2017)",
        "W3C, Portable Network Graphics (PNG) Specification — https://www.w3.org/TR/png/",
        "PKWARE, APPNOTE.TXT — .ZIP File Format Specification — https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT",
        "P. Deutsch, DEFLATE Compressed Data Format Specification version 1.3, RFC 1951 (IETF, 1996)",
        "MDN Web Docs, CompressionStream — https://developer.mozilla.org/en-US/docs/Web/API/CompressionStream",
        "MDN Web Docs, createImageBitmap() — https://developer.mozilla.org/en-US/docs/Web/API/Window/createImageBitmap",
      ],
    },

    // ------------------------------------------------------------------------------------------ 7. video
    {
      id: "recording-video",
      title: "Recording a video, frame by frame",
      summary: "How the simulator renders an MP4 one picture at a time with WebCodecs, and how to choose steps per frame without fooling your eyes.",
      sections: [
        {
          level: "kids",
          html: `
<p>A video is really a <b>flip-book</b>: lots of still pictures shown very quickly, often 60 every second. Your eyes blend them into movement.</p>
<p>When Wave Dude records a video, it does this:</p>
<ol>
<li>take a picture of the waves;</li>
<li>let the waves move on a few steps;</li>
<li>take the next picture… and so on, hundreds of times.</li>
</ol>
<figure class="diagram"><svg viewBox="0 0 380 120" xmlns="http://www.w3.org/2000/svg">
<g fill="none" stroke="currentColor" stroke-width="1.5">
<rect x="15" y="25" width="70" height="60" rx="4"/><rect x="115" y="25" width="70" height="60" rx="4"/><rect x="215" y="25" width="70" height="60" rx="4"/><rect x="315" y="25" width="50" height="60" rx="4" stroke-dasharray="4 3"/>
</g>
<g fill="none" stroke="#60a5fa" stroke-width="2">
<circle cx="50" cy="55" r="8"/><circle cx="150" cy="55" r="8"/><circle cx="150" cy="55" r="18"/><circle cx="250" cy="55" r="8"/><circle cx="250" cy="55" r="18"/><circle cx="250" cy="55" r="27"/>
</g>
<g fill="none" stroke="#fbbf24" stroke-width="2"><path d="M88 55 H110 M104 50 L110 55 L104 60 M188 55 H210 M204 50 L210 55 L204 60 M288 55 H310 M304 50 L310 55 L304 60"/></g>
<g font-size="12" text-anchor="middle" fill="currentColor"><text x="50" y="105">picture 1</text><text x="150" y="105">picture 2</text><text x="250" y="105">picture 3</text><text x="99" y="20">steps</text><text x="199" y="20">steps</text></g>
</svg><figcaption>Between two pictures of the video, the simulation runs a few steps.</figcaption></figure>
<p>It does not matter if your computer is slow. It is like a clay-animation film: making it takes ages, one careful picture at a time, but the finished film plays smoothly.</p>
<div class="home"><b>Try it at home:</b> Make a flip-book in the corner of an old notebook: a dot that becomes a ring that grows bigger on every page. Draw the rings closer together on some pages and further apart on others, then flip — the ripple seems to speed up and slow down.</div>`,
        },
        {
          level: "school",
          html: `
<p>Three numbers decide what a recording looks like:</p>
<ul>
<li><b>frames</b>: how many pictures are made;</li>
<li><b>frames per second (fps)</b>: how fast the video plays them;</li>
<li><b>steps per frame</b>: how many simulation steps are done between two pictures.</li>
</ul>
<h4>A worked example</h4>
<p>600 frames at 60 fps give a video of 600 / 60 = <b>10 seconds</b>. With 4 steps per frame the simulation runs 600 × 4 = 2400 steps.</p>
<p>A level-60 source has a period of about 26.7 steps. Each frame moves on 4 / 26.7 ≈ 0.15 of an oscillation, so one oscillation takes about 6.7 frames, and in the video the source appears to bob 60 / 6.7 ≈ <b>9 times per second</b>.</p>
<h4>The wagon-wheel trap</h4>
<p>Now choose 27 steps per frame — almost exactly one period. Every picture catches the wave at nearly the same point in its cycle, so the waves seem to stand still or creep slowly. It is the same effect that makes car wheels look as if they turn backwards in films. Pick a number of steps per frame that is a small fraction of the period (a quarter or less) to see the real motion.</p>
<h4>Squeezing the video</h4>
<p>Raw pictures would be enormous: one 1920 × 1080 frame is about 6 MB, so 10 seconds at 60 fps would be 3.7 GB. A <b>codec</b> such as H.264 shrinks this enormously, mainly by storing what changes from one picture to the next. The browser's built-in encoder does that work.</p>`,
        },
        {
          level: "university",
          html: `
<p><code>recordVideo</code> (<code>src/features/sandbox/video.ts</code>) uses <b>WebCodecs</b>, the browser API for hardware and software encoders, through the small Mediabunny library (MPL-2.0, loaded only when you record). It picks the first codec the browser can encode at the requested size:</p>
<pre><code>const codec = await getFirstEncodableVideoCodec(["avc", "vp9", "av1", "hevc"], { width: w, height: h });</code></pre>
<p>H.264 (AVC) is tried first because almost every player accepts it. The frame size is rounded down to even numbers, because 4:2:0 chroma subsampling stores colour at half the resolution in both directions. In “scene” mode the video has one pixel per cell, scaled down if needed to fit 3840 × 2160 pixels; in “view” mode it is what is on screen, optionally with the sources, probes and labels drawn on top.</p>
<h4>Not in real time</h4>
<p>The normal frame loop is paused (<code>sim.exporting = true</code>) and the recorder drives the engine itself:</p>
<pre><code>for (let i = 0; i &lt; o.frames; i++) {
  if (i &gt; 0) eng.step(o.stepsPerFrame);
  ...render, then copy the WebGL canvas into a 2D canvas...
  await source.add(i / o.fps, 1 / o.fps);
  if (i % 4 === 0) { progress(i + 1); await new Promise(r =&gt; setTimeout(r, 0)); }
}</code></pre>
<p>Each frame gets an explicit timestamp i / fps and duration 1 / fps, so the video's timing has nothing to do with how long the computer needed. Every fourth frame the loop yields to the browser, so the progress bar updates and Cancel (an <code>AbortSignal</code>) works. The MP4 is assembled in memory with its index at the front (“fast start”), so it can begin playing before it has fully downloaded. The quality slider (1–100, as in the Windows app) maps to four encoder quality presets.</p>
<h4>Browser support</h4>
<p>The WebCodecs <code>VideoEncoder</code> has been available in Chrome and Edge since version 94, in Safari since 16.4, and in desktop Firefox since version 130. The Windows app instead writes through Windows Media Foundation (or an AVI/MJPEG writer) and can also save individual frames.</p>`,
        },
        {
          level: "research",
          title: "Video is not data",
          html: `
<p>Lossy video is fine for showing results, not for measuring them. The colour table already quantises the field to 255 levels; the encoder then removes detail the eye does not notice — but fine interference fringes are exactly that kind of detail. With 4:2:0 subsampling, colour information has half the resolution of the frame, so patterns with wavelengths of a few cells (near the grid's own resolution limit) can blur or alias in the video even when the simulation resolves them. For quantitative work, record probe series, save the project, or capture lossless PNG screenshots; if you must analyse video, use “scene” mode (one pixel per cell), a high quality setting, and a perceptually uniform colour scheme that you can invert reliably.</p>
<p>Time is sampled as well. A video samples the field every S steps, so a source of period T steps is seen at the aliased frequency |1/T − k/S| (per step, k the nearest integer to S/T) — the wagon-wheel effect in formula form. Motion is only faithful for S &lt; T/2 (the Nyquist condition for the frame sampling); S ≤ T/4 gives visibly smooth oscillation.</p>`,
        },
      ],
      tryIt: [
        { experiment: "phased-array", label: "Steering a beam with a phased array" },
        { experiment: "splash", label: "Splash! Making waves" },
      ],
      sources: [
        "W3C, WebCodecs — https://www.w3.org/TR/webcodecs/",
        "MDN Web Docs, WebCodecs API — https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API",
        "Can I use: VideoEncoder — https://caniuse.com/mdn-api_videoencoder",
        "Mediabunny — https://mediabunny.dev",
        "ITU-T Recommendation H.264, Advanced video coding for generic audiovisual services",
      ],
    },

    // ------------------------------------------------------------------------------------------ 8. own experiment
    {
      id: "write-your-own",
      title: "Write your own experiment (and help build Wave Dude)",
      summary: "How a guided experiment is written as a small TypeScript object, how to register it, and how to build, run and contribute to the project.",
      sections: [
        {
          level: "kids",
          html: `
<p>The guided experiments in Wave Dude are not magic. Each one is like a <b>treasure-hunt card</b> that someone wrote:</p>
<ol>
<li><b>Set the scene:</b> “Put a wall here and a tapping finger there.”</li>
<li><b>Steps:</b> “Press Run. What do you think will happen?”</li>
<li><b>A check:</b> “Measure the wave with the ruler. Is your answer close?”</li>
</ol>
<figure class="diagram"><svg viewBox="0 0 420 100" xmlns="http://www.w3.org/2000/svg">
<g fill="none" stroke-width="2">
<rect x="10" y="30" width="80" height="40" rx="6" stroke="#fbbf24"/>
<rect x="120" y="30" width="80" height="40" rx="6" stroke="#60a5fa"/>
<rect x="230" y="30" width="80" height="40" rx="6" stroke="#60a5fa"/>
<rect x="340" y="30" width="70" height="40" rx="6" stroke="#34d399"/>
<path d="M90 50 H114 M108 45 L114 50 L108 55 M200 50 H224 M218 45 L224 50 L218 55 M310 50 H334 M328 45 L334 50 L328 55" stroke="currentColor"/>
</g>
<g font-size="13" text-anchor="middle" fill="currentColor">
<text x="50" y="55">set up</text><text x="160" y="55">guess</text><text x="270" y="55">measure</text><text x="375" y="55">check</text>
</g>
</svg><figcaption>Every guided experiment follows a plan like this.</figcaption></figure>
<p>A computer person writes that card in a programming language, so the computer can build the scene and check your answers. Because the code is <b>shared openly</b>, anyone — maybe you one day — can write a new experiment and offer it to everybody.</p>
<div class="home"><b>Try it at home:</b> Invent your own wave experiment on paper. Write three things: what you set up (for example two tapping fingers close together), the question you ask (“Where will the water stay calm?”) and what you think the answer is. Then try it in the Sandbox.</div>
<div class="fact"><b>Fun fact:</b> This very page is also just data in a code file — a list of pages, each with a short text for every level.</div>`,
        },
        {
          level: "school",
          html: `
<p>An experiment is an <b>object</b>: a bundle of named values. The most important parts are:</p>
<ul>
<li><code>id</code>, <code>title</code>, <code>level</code> (kids, school, university or research), <code>summary</code> and <code>goals</code>;</li>
<li><code>params</code>: sliders, for example the frequency;</li>
<li><code>setup</code>: a function that builds the scene and places the sources;</li>
<li><code>steps</code>: the pages the learner goes through. A step can ask a <code>predict</code> question with multiple-choice answers, offer <code>tools</code> such as the ruler, and set a <code>task</code> whose <code>check</code> compares what you measured with what the model predicts.</li>
</ul>
<h4>How a check works: a worked example</h4>
<p>The helper <code>lam(level)</code> gives the wavelength the simulation really produces, worked out from the grid's own rules. For level 40 in empty space it is about <b>22.5 cells</b>.</p>
<p>Suppose you draw the ruler across 5 wavelengths and it reads 115 cells. Your wavelength is 115 / 5 = 23.0 cells. The difference from 22.5 is 0.5 / 22.5 ≈ 2%. The check <code>within(..., 0.12, ...)</code> accepts anything within 12%, so you get a tick. Measuring across many waves and dividing makes your answer more accurate, because the error in placing the ruler's ends is shared out over all the waves.</p>
<p>The same idea is used everywhere in the app: the expected answer comes from how the grid behaves, not from a textbook formula that the grid only approximately follows.</p>`,
        },
        {
          level: "university",
          html: `
<p>A complete, minimal experiment, as a file in <code>src/features/experiments/catalog/</code> (types from <code>../types.ts</code>, helpers from <code>../helpers.ts</code>):</p>
<pre><code>import { Scene, BARRIER } from "../../../core/scene";
import type { Experiment } from "../types";
import { lam, need, pointSource, within } from "../helpers";

export const myEcho: Experiment = {
  id: "my-echo",
  title: "My first echo",
  level: "kids",
  minutes: 5,
  summary: "A wall, a source, and the wave that comes back.",
  goals: ["Waves bounce off walls"],
  params: [{ id: "level", label: "Frequency", min: 20, max: 120, step: 1, value: 40 }],
  setup(sim, p) {
    const scene = new Scene(600, 400);
    scene.rect(450, 50, 12, 300, BARRIER);
    sim.load(scene, [pointSource(150, 200, p.level)]);
    sim.viewMode = "field";
  },
  steps: [
    { title: "Watch", html: "&lt;p&gt;Press &lt;b&gt;Run&lt;/b&gt;.&lt;/p&gt;", enter(sim) { sim.running = true; } },
    {
      title: "Measure",
      html: "&lt;p&gt;Use the ruler to measure 5 wavelengths.&lt;/p&gt;",
      tools: ["ruler"],
      task: {
        prompt: "How many waves does your ruler span?",
        input: { label: "Number of waves" },
        check(m, p) {
          if (m.ruler === null || !m.input) return need("Draw the ruler first.");
          return within(m.ruler / m.input, lam(p.level), 0.12, "wavelength", " cells", true);
        },
      },
    },
  ],
};</code></pre>
<p>Register it by importing it in <code>src/features/experiments/index.ts</code> and adding it to the <code>EXPERIMENTS</code> array; the guide lists experiments by their <code>level</code>.</p>
<h4>The toolbox</h4>
<ul>
<li><b>Scene drawing</b>: <code>rect</code>, <code>disc</code>, <code>ellipse</code>, <code>polygon</code> (even-odd rule) and <code>segment</code> (a thick line) with a <code>Material</code>: <code>BARRIER</code>, <code>VACUUM</code>, <code>glass(n)</code> or <code>{ absorb: 0.25 }</code>.</li>
<li><b>Sources</b>: <code>pointSource</code>, <code>lineSource</code> (a plane-wave maker), or <code>newSource</code> for arrays with spacing and per-element phase steps.</li>
<li><b>The simulation</b> (<code>Sim</code>): <code>load</code>, <code>refreshSources</code> (after changing sources; the field is kept), <code>runUntil(step, done)</code>, <code>viewMode</code>, <code>brightness</code>, <code>stepsPerFrame</code>, <code>addProbe</code>, and <code>history</code> for probe data.</li>
<li><b>Physics helpers</b> in <code>src/core/physics.ts</code>: <code>wavelength</code>, <code>phaseVelocity</code> and <code>groupVelocity</code> from the discrete dispersion relation, and <code>omegaOfLevel</code>.</li>
<li>A <code>Param</code> with a <code>live</code> function updates without restarting (for example changing every source's level); without it, the scene is rebuilt. A step's <code>readout</code> returns HTML that is refreshed a few times a second.</li>
</ul>
<p>Pages of this library are written the same way: a <code>LearnCategory</code> object (<code>src/features/learn/types.ts</code>) with pages and one HTML section per level.</p>`,
        },
        {
          level: "research",
          title: "Building, running and contributing",
          html: `
<table>
<tr><th>Path</th><th>What</th></tr>
<tr><td><code>src/core/</code></td><td>pure maths and data, no browser needed: physics (dispersion, wavelengths, velocities), scene cells, sources and moving sources, optical elements, painting (tested with <code>npm test</code>)</td></tr>
<tr><td><code>src/engine/</code></td><td>the GPU: <code>shaders.ts</code> (step, probes, 2D and 3D display) and <code>engine.ts</code> (textures, stepping, read-back)</td></tr>
<tr><td><code>src/sim/</code></td><td>one running simulation: frame loop, tools, probes, overlay</td></tr>
<tr><td><code>src/view/</code></td><td>zoom and pan viewport with its overlay, graphs</td></tr>
<tr><td><code>src/circuits/</code></td><td>computing with waves: switches, detectors, transistors, ready-made circuits</td></tr>
<tr><td><code>src/project/</code></td><td>Windows-compatible projects; zip reader/writer</td></tr>
<tr><td><code>src/components/</code>, <code>src/app/</code></td><td>reusable UI pieces; the app shell</td></tr>
<tr><td><code>src/features/</code></td><td>the pages: experiments (one catalog of guided experiments), sandbox, learn (this library), colours</td></tr>
<tr><td><code>public/colorschemes/</code></td><td>the Windows colour schemes, unchanged</td></tr>
</table>
<p><code>npm install</code>, then <code>npm run dev</code> (Vite development server with hot reload), <code>npm run build</code> (runs <code>tsc --noEmit</code> under <code>strict</code>, <code>noUnusedLocals</code> and <code>noUnusedParameters</code>, then builds a static site in <code>dist/</code>) and <code>npm run preview</code>. The site needs an HTTP server (not <code>file://</code>). <code>docker compose up -d --build</code> builds it in a <code>node:22-alpine</code> stage and serves it from an unprivileged nginx image on port 8080, published on 127.0.0.1:8090, with a <code>/healthz</code> endpoint. In the browser console, <code>waveDude</code> is the running simulation, e.g. <code>waveDude.engine.step(1000)</code>.</p>
<p>Contributions are GPL-3.0-or-later. Useful checks for physics changes are the ones the research experiments already do: measured wavelength against the discrete dispersion relation, and reflection from the damping edge. Open directions include a WebGPU compute path, asynchronous probe read-back, a perfectly matched layer in place of the graded damping edge, and run-time off-width re-randomisation for full Windows parity.</p>`,
        },
      ],
      tryIt: [
        { experiment: "wavelength", label: "How long is a wave?" },
        { experiment: "echoes", label: "Echoes and mirrors" },
      ],
      sources: [
        "Wave Dude 2D web, README.md (Run it, Docker, Layout, Adding an experiment)",
        "TypeScript Handbook — https://www.typescriptlang.org/docs/handbook/intro.html",
        "Vite documentation — https://vite.dev/guide/",
        "GNU General Public License, version 3 — https://www.gnu.org/licenses/gpl-3.0.html",
      ],
    },
  ],
};
