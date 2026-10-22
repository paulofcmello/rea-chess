Implemented; changes are uncommitted.

- TypeScript, build, calculation/cache tests pass; no new lint warnings.
- Browser interactions and 390px layout verified.
- Screenshots: [desktop](/Users/paulomello/REA%20Chess/.rea/profile-stats/rea-desktop.png), [390px](/Users/paulomello/REA%20Chess/.rea/profile-stats/rea-390.png).

Rapid and Blitz match the reference. Bullet shows 387 / ↑89 / 59 games versus ↑105 / 63, likely from rolling-window timing and private API aggregation differences.

Necessary adjustments: lazy-loaded Stats to avoid a bundle warning; added read-only cached month fetching to prevent Insights from stalling.