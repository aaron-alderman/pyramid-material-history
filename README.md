# The Missing Middle

**Physics to archaeology through the pyramids.**

A pyramid is a meeting of worlds: electronic states, bonds, mineral structure, chemical processes, rock, landscape, human work and surviving evidence. This corpus follows the mechanisms that connect those descriptions and the missing information between them.

The pyramids are the canonical example. Khufu's Great Pyramid is the first named anchor. Granite–alkali treatment is one candidate investigation within that larger material history.

- [Read the website](https://aaron-alderman.github.io/pyramid-material-history/)
- [Read the full research atlas](corpus/atlas.md)
- [Inspect the material-history register](corpus/atlas.json)
- [Inspect the presentation declarations](data/publication.json)
- [Read the UI decomposition contract](UI-DECOMPOSITION.md)
- [Read the agent field file](FOR_AGENTS.md)

## What is here

The next layer is now populated: [three worked investigations](https://aaron-alderman.github.io/pyramid-material-history/studies/) cover material identity, granite–alkali feasibility and archaeological discrimination. They contain eighteen atomic research steps, nine additional source records and six reproducible calculations. These are completed desk investigations, not newly performed experiments or monument sampling.

Start with [the canonical investigation records](corpus/worked-investigations.json), [calculation inputs](corpus/calculation-inputs.json) and [the numerical adapter](scripts/worked-calculations.mjs). The build publishes every calculation, its assumptions and the retained composer's quantity-dimension checks. Source access limits are visible on individual source pages. Proposed controls and unmeasured rates retain their scope.

The corpus contains nine operation families, seventeen domain stations, twenty-six candidate bridges, seven pyramid investigations, negative constraints, retained unknowns and source references. The operation families provide the scoped MECE partition. Disciplines remain overlapping annotations.

The route passes through quantum models, orbitals, bonds, Bloch and Wannier representations, lattices and defects, chemical thermodynamics and kinetics, coupled material processes, geology, geophysics, manufacture, preservation and archaeological inference.

Attention motivates the example. Evidence determines the conclusions. A mathematical relation, a feasible process and an established historical occurrence carry different authority.

## Reused machinery

This repository uses the existing Claimipedia/Sourcery twelve-coordinate kernel, common-algebra interpreter and scientific record composer, surface-composition contract, native lowering, component library, native adoption and grammar-driven collection controls. The static Pages workflow follows the existing corpus and Halloween Monster Hunt publications.

[REUSE.md](REUSE.md) identifies the owners and boundaries. [data/reuse-lock.json](data/reuse-lock.json) binds retained source bytes and the explicit serializer extraction. No new Sourcery lane, runtime, scheduler or authority registry is introduced.

The research source originated in [Spin(2,3) Relational Geometry](https://github.com/aaron-alderman/spin23-relational-geometry). This repository owns the standalone material-history corpus and its presentation. Upstream results retain their cited scope and authority.

## Build and inspect

Node.js 22 or later is sufficient. Retained dependencies are included; no dependency installation is required.

```text
node scripts/build.mjs
node --test scripts/qualification.test.mjs
node scripts/serve.mjs
```

Open the printed local URL. `_site/` is a disposable reading projection. Canonical research lives in `corpus/`; presentation declarations live in `data/publication.json`. The build produces per-page composition and native-lowering receipts, native adoption records, the semantic decomposition and the common-algebra composition/refusal result.

GitHub Actions rebuilds and qualifies the publication before deploying it to GitHub Pages.

## Licenses

Research and documentation are CC BY-SA 4.0. Software is GPL-3.0-or-later; identified third-party material retains its own terms. See [LICENSE.md](LICENSE.md).
