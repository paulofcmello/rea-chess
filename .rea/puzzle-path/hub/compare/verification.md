# Puzzle Path comparison

Reference: logged-in chess.com /puzzles via localhost:9222; inspection and scene scrolling only. No puzzles started or solved.

At 300px width the live canvas uses 54px tile art, 75×64px ground cells, and consecutive tile center steps of 37.5px horizontally and 32px vertically. REA previously used 70px art, which closed up the gaps. REA now matches the measured art and center spacing.

Wheel input is frame-batched and 1:1 (120px input → 120px movement). Pointer drag uses the reference's 0.95 momentum decay and 0.5px stopping threshold, with bounded offsets. A 80px mouse drag moved 80px before coasting; a 60px touch movement moved 60px. Keyboard arrows, Page Up/Down, Home/End also work. Reduced motion disables release momentum.

Current-tile centering, first tile, tile 20, level rollover, 390px mobile layout, keyboard bounds, and camera preservation during coach resize passed (final-checks.json). Number 18's actual text bounds clear the pawn element when on tile 17; see rea-current-17.png.

Images:
- side-by-side-current.png: both cards on current tile 15 (isolated REA fixture).
- side-by-side-earlier.png: both scenes after a +400px wheel movement.
- side-by-side-upcoming.png: both scenes after a -400px net wheel movement.

Existing coach, header, footer, and future-area decoration differences remain outside this spacing/scrolling/pawn fix.

Validation: cd app && npx tsc -b && npm run build passed without warnings. Targeted oxlint passed for both changed TypeScript files. Full-repository lint still reports existing warnings in unrelated files.

Temporary browser contexts were removed after verification. No dependencies added; no commits or pushes.
