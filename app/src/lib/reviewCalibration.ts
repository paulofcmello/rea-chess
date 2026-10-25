// Calibration is fitted offline against captured chess.com summaries.
// See docs/review-calibration.md and scripts/calibrate-review.mjs for validation.
export type GameRatingFeature = 'rating' | 'accuracy' | 'opponentRating' | 'opponentAccuracy' | 'moveCount'
export interface GameRatingModel { features: GameRatingFeature[]; coefficients: number[] }
export const REVIEW_CALIBRATION: {
  epScale: number; epRatingSlope: number; accuracyK: number; arithmeticWeight: number
  minimumMoves: number; gameRating: GameRatingModel | null; classificationVersion: number
} = {
  "epScale": 0.0027615599999999997,
  "epRatingSlope": 0.75,
  "accuracyK": 0.12,
  "arithmeticWeight": 0.75,
  "minimumMoves": 10,
  "gameRating": {
    "features": [
      "rating",
      "accuracy"
    ],
    "coefficients": [
      -1389.5440821760078,
      1.070099890908159,
      22.543184596382424
    ]
  },
  "classificationVersion": 2
}
