## Purpose

This specimen exists to show what the BITFire document pipeline produces. Every
element below is generated from markdown, a bibliography file and the design
system's own tokens. Nothing was positioned by hand.

Rate-of-spread models carry substantial predictive uncertainty [@cruz2013], and
the Australian operational baseline still traces to @mcarthur1967, later
expressed as equations by @noble1980.

## List hierarchies

Four levels, each marker lighter than the one above it, and every wrapped line
aligned to its text rather than its bullet.

<ul class="b">
<li>Fuel inputs to the spread model
<ul>
<li>Surface fuel load, by stratum
<ul>
<li>Litter, measured or modelled from time since fire
<ul><li>Default accumulation curve where no measurement exists</li>
<li>Site-specific curve where a fuel plot is available</li></ul>
</li>
<li>Near-surface fuel, scored by height and cover</li>
</ul>
</li>
<li>Elevated and bark fuels, scored on the overall fuel hazard guide</li>
</ul>
</li>
<li>Weather inputs
<ul>
<li>Ten-metre open wind, reduced to mid-flame height</li>
<li>Air temperature and relative humidity at the fire</li>
</ul>
</li>
<li>Terrain, as slope in the direction of spread</li>
</ul>

A **term-led** variant, for definitions and parameter lists:

<ul class="b tight">
<li><strong>Drought factor</strong> — fuel availability on a 0 to 10 scale</li>
<li><strong>Curing</strong> — percentage of grass fuel that has died off</li>
<li><strong>Spread direction</strong> — the heading of the fire's forward run</li>
</ul>

### Numbered, where order or reference matters

<ol class="n">
<li>Establish the analysis domain
<ol>
<li>Confirm the fuel type mapping covers every polygon
<ol><li>Structural types take height and cover scaling</li>
<li>Direct-map types do not</li></ol>
</li>
<li>Reconcile any unallocated classes</li>
</ol>
</li>
<li>Run the ensemble and record the spread envelope</li>
<li>Report the envelope, never a single deterministic run</li>
</ol>

## Quotes

A block quote, for cited material:

<blockquote>
<p>The predictive uncertainty of a rate-of-spread model is routinely larger than
the differences between competing models, which makes model selection a weaker
lever than practitioners assume.</p>
<p class="attrib">Cruz and Alexander (2013), paraphrased</p>
</blockquote>

A pull quote, to break a dense page and carry the finding:

<p class="pull">Report the spread envelope, not the single run that happens to
sit in the middle of it.</p>

## Figures and tables

<figure id="f1"><div class="frame">
<svg viewBox="0 0 520 120" width="100%" height="110">
<rect x="0" y="0" width="520" height="120" fill="none"/>
<line x1="34" y1="96" x2="508" y2="96" stroke="#64757e" stroke-width="1"/>
<line x1="34" y1="12" x2="34" y2="96" stroke="#64757e" stroke-width="1"/>
<polyline points="34,88 120,78 206,60 292,40 378,26 464,14" fill="none"
 stroke="#c93d06" stroke-width="2"/>
<polyline points="34,92 120,87 206,80 292,71 378,62 464,52" fill="none"
 stroke="#0b5cc4" stroke-width="2" stroke-dasharray="4 3"/>
<text x="474" y="14" font-family='PlexSans' font-size="9" fill="#c93d06">upper</text>
<text x="474" y="56" font-family='PlexSans' font-size="9" fill="#0b5cc4">median</text>
<text x="34" y="112" font-family='PlexSans' font-size="8" fill="#59696f">0</text>
<text x="464" y="112" font-family='PlexSans' font-size="8" fill="#59696f">6 h</text>
</svg></div>
<figcaption>Ensemble spread envelope against elapsed time. The upper bound, not
the median, is the number that drives an evacuation decision.</figcaption></figure>

<figure id="f2"><div class="frame">
<table>
<thead><tr><th>Fuel type</th><th>Model</th><th class="num">ROS km/h</th><th class="num">Spread</th></tr></thead>
<tbody>
<tr><td>Dry eucalypt forest</td><td>Vesta</td><td class="num">2.4</td><td class="num">±0.9</td></tr>
<tr><td>Grassland, 90% cured</td><td>CSIRO</td><td class="num">8.1</td><td class="num">±2.2</td></tr>
<tr><td>Mallee heath</td><td>Mallee</td><td class="num">3.7</td><td class="num">±1.4</td></tr>
</tbody></table>
</div>
<figcaption>Modelled rates of spread by fuel type, with the ensemble spread shown
as a plus-or-minus band rather than a confidence interval.</figcaption></figure>

Physical and quasi-physical approaches to the same problem are reviewed in
@sullivan2009.

## References
