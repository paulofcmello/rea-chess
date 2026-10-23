#!/bin/sh
# Regenerates public/data/puzzles.json from the Lichess puzzle database (CC0).
# Streams the first 3M rows, keeps popular well-rated puzzles, samples 1500 per 100-point band.
set -e
cd "$(dirname "$0")/.."
curl -fsSL https://database.lichess.org/lichess_db_puzzle.csv.zst | zstd -dc 2>/dev/null | head -n 3000001 > /tmp/rea-puzzles.csv || true
python3 - <<'PY'
import csv, json, random, collections
random.seed(7)
b = collections.defaultdict(list)
for r in csv.DictReader(open("/tmp/rea-puzzles.csv")):
    if int(r["Popularity"]) < 85 or int(r["NbPlays"]) < 300 or int(r["RatingDeviation"]) > 90: continue
    rt = int(r["Rating"])
    if 400 <= rt < 3000: b[rt // 100].append(r)
out = []
for k in range(4, 30):
    random.shuffle(b[k])
    sample = b[k][:1500]
    out += [[r["PuzzleId"], r["FEN"], r["Moves"], int(r["Rating"]), r["Themes"]] for r in sample]
    print(f"{k * 100}-{k * 100 + 99}: {len(sample)}")
out.sort(key=lambda x: x[3])
json.dump(out, open("public/data/puzzles.json", "w"), separators=(",", ":"))
print(len(out), "puzzles written")
PY
