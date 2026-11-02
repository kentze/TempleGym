// The word shown before the name at the top of Home. To add or remove one, edit this list.
export const GREETINGS = [
  'Hey',
  'Hi',
  'Hello',
  'Sup',
  'Yo',
  'Hey there',
  'What’s up',
  'Good to see you',
  'Great to see you here',
  'Hoot hoot',
  'Go Owls',
  'Hiya',
  'Heya',
  'Howdy',
  'Hey hey',
  'Nice to see you',
  'Welcome to the nest',
] as const;

// A random greeting, never the same one as last time.
export function pickGreeting(previous: string | null, random: () => number = Math.random): string {
  const options = GREETINGS.filter((g) => g !== previous);
  const index = Math.min(options.length - 1, Math.floor(random() * options.length));
  return options[index];
}
