export function calculateRice(
  reach: number,
  impact: number,
  confidence: number,
  effort: number
): number {
  if (effort <= 0) return 0;
  const score = (reach * impact * (confidence / 100)) / effort;
  return Math.round(score * 10) / 10;
}

export function getScoreColor(score: number): string {
  if (score >= 2) return "var(--color-score-high)";
  if (score >= 1) return "var(--color-score-medium)";
  return "var(--color-score-low)";
}

export function getScoreLevel(score: number): "high" | "medium" | "low" {
  if (score >= 2) return "high";
  if (score >= 1) return "medium";
  return "low";
}
