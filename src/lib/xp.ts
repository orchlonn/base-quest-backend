export const RANKS = [
  { code: "BEGINNER_BIT", title: "Beginner Bit", minXp: 0 },
  { code: "BINARY_EXPLORER", title: "Binary Explorer", minXp: 250 },
  { code: "HEX_HERO", title: "Hex Hero", minXp: 750 },
  { code: "CONVERSION_WIZARD", title: "Conversion Wizard", minXp: 2000 },
] as const;

export function levelForXp(xp: number): number {
  // Quadratic curve: level n needs 100 * n^2 cumulative XP
  let level = 1;
  while (100 * level * level <= xp) level++;
  return level;
}

export function rankForXp(xp: number): string {
  let code = RANKS[0].code;
  for (const r of RANKS) if (xp >= r.minXp) code = r.code;
  return code;
}

export function xpToNextLevel(xp: number): { current: number; next: number; level: number } {
  const level = levelForXp(xp);
  const current = 100 * (level - 1) * (level - 1);
  const next = 100 * level * level;
  return { current, next, level };
}
