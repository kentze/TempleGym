// Short workout facts for the tip on Home. To add or remove one, edit this list.
export const FACTS = [
  'Muscles grow while you rest, not while you lift. Sleep counts as training.',
  'A 5 to 10 minute warm up helps your body get ready and lowers the chance of getting hurt.',
  'Sip water before and during your workout to keep your energy up.',
  'Good form matters more than heavy weight. Start light and add weight slowly.',
  'Rest days are part of the plan. Your body gets stronger while it recovers.',
  'Adding a little weight or one more rep from week to week is how you keep improving.',
  'Feeling sore a day or two after a new workout is normal. It fades as your body gets used to it.',
  'Breathe out when you push or lift, and breathe in on the way back.',
  'Stretching when your muscles are warm is easier and more comfortable.',
  'Protein helps your muscles repair after a workout.',
  'Writing down your sets and reps makes your progress easy to see.',
  'Showing up often matters more than having one perfect workout.',
] as const;

export type DayKind = 'PUSH' | 'PULL' | 'LEGS';

const DAYS: Record<DayKind, { label: string; description: string }> = {
  PUSH: { label: 'Push', description: 'Chest, shoulders and triceps' },
  PULL: { label: 'Pull', description: 'Back, biceps and rear delts' },
  LEGS: { label: 'Legs', description: 'Quads, hamstrings, glutes and calves' },
};

const DAY_ORDER: DayKind[] = ['PUSH', 'PULL', 'LEGS'];

// Today's suggested day. It rotates Push, Pull, Legs, one per calendar day.
export function suggestedDay(date: Date): DayKind {
  const days = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
  return DAY_ORDER[days % DAY_ORDER.length];
}

export type Tip = { kind: 'suggestion' } | { kind: 'fact'; index: number };

// Every tip once, in a random order: the day suggestion and each fact.
// The card shows them one after another, so nothing repeats until all have been shown.
export function buildTipOrder(random: () => number = Math.random): Tip[] {
  const tips: Tip[] = [{ kind: 'suggestion' }, ...FACTS.map((_, index): Tip => ({ kind: 'fact', index }))];
  for (let i = tips.length - 1; i > 0; i--) {
    const j = Math.min(i, Math.floor(random() * (i + 1)));
    [tips[i], tips[j]] = [tips[j], tips[i]];
  }
  return tips;
}

export function tipContent(tip: Tip, date: Date): { lead: string; body: string } {
  if (tip.kind === 'suggestion') {
    const day = DAYS[suggestedDay(date)];
    return { lead: 'Suggestion:', body: `Try a ${day.label} day today. ${day.description}.` };
  }
  return { lead: 'Did you know?', body: FACTS[Math.min(Math.max(tip.index, 0), FACTS.length - 1)] };
}
