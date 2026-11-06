import { create } from 'zustand';
import { buildTipOrder, FACTS, type Tip } from '../constants/tips';

interface TipState {
  // The tips in the order the card shows them
  order: Tip[];
  // Shuffles the order for this app launch. Call it once when the app starts.
  choose: () => void;
}

export const useTipStore = create<TipState>((set) => ({
  // Only shown until choose() runs, so Home never has an empty tip
  order: [{ kind: 'suggestion' }, ...FACTS.map((_, index): Tip => ({ kind: 'fact', index }))],
  choose: () => set({ order: buildTipOrder() }),
}));
