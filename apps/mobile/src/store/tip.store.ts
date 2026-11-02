import { create } from 'zustand';
import { pickTip, type Tip } from '../constants/tips';

interface TipState {
  tip: Tip;
  // Picks the tip for this app launch. Call it once when the app starts.
  choose: () => void;
}

export const useTipStore = create<TipState>((set) => ({
  // Only shown until choose() runs, so Home never has an empty tip
  tip: { kind: 'suggestion' },
  choose: () => set({ tip: pickTip() }),
}));
