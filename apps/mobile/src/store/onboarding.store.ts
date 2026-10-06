import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface OnboardingState {
  visible: boolean;
  show: () => void;
  hide: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  visible: false,
  show: () => set({ visible: true }),
  hide: () => set({ visible: false }),
}));

const seenKey = (userId: string) => `templegym_onboarding_seen_${userId}`;

export async function hasSeenOnboarding(userId: string): Promise<boolean> {
  try {
    const value = await SecureStore.getItemAsync(seenKey(userId));
    return value === 'true';
  } catch {
    return false;
  }
}

export async function markOnboardingSeen(userId: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(seenKey(userId), 'true');
  } catch {}
}
