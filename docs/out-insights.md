Implemented all seven Insights sections, filters, SVG tooltips, puzzle stats, persistent game history, and cancellable cached batch reviews.

Changed `Stats.tsx`, added chart/metrics/storage modules, and updated CSS plus import, review, bot, friend, and puzzle integrations.

Verified with 313 imported games and 10 reviews. TypeScript/build pass, no new lint warnings, and no horizontal overflow at 390px.

[Evidence and screenshots](/Users/paulomello/REA%20Chess/.rea/insights/notes.md)

Deviations: none; used the permitted paywall fallback. Historical games without saved PGNs cannot be backfilled. Changes remain uncommitted.