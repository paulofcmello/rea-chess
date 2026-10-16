#!/bin/sh
# Regenerates public/data/puzzles.json from the Lichess puzzle database (CC0).
# Streams the first 400k rows, keeps popular well-rated puzzles, samples 170 per 100-point band.
set -e
cd "$(dirname "$0")/.."
curl -sL https://database.lichess.org/lichess_db_puzzle.csv.zst | zstd -dc 2>/dev/null | head -n 400001 > /tmp/rea-puzzles.csv || true
python3 - <<'PY'
import csv, json, random, collections
random.seed(7)
b = collections.defaultdict(list)
for r in csv.DictReader(open("/tmp/rea-puzzles.csv")):
    if int(r["Popularity"]) < 85 or int(r["NbPlays"]) < 300 or int(r["RatingDeviation"]) > 90: continue
    rt = int(r["Rating"])
    if 400 <= rt < 3000: b[rt // 100].append(r)
out = []
for k in sorted(b):
    random.shuffle(b[k])
    out += [[r["PuzzleId"], r["FEN"], r["Moves"], int(r["Rating"]), r["Themes"]] for r in b[k][:170]]
out.sort(key=lambda x: x[3])
json.dump(out, open("public/data/puzzles.json", "w"), separators=(",", ":"))
print(len(out), "puzzles written")
PY
