export type Parsed<T> = { ok: true; set: T } | { ok: false; error: string };

// Reads the weight and reps typed for a lifting set. Pounds are converted to kg.
export function parseStrengthSet(
  weightText: string,
  repsText: string,
  preferMetric: boolean,
): Parsed<{ weightKg: number; reps: number }> {
  const weight = parseFloat(weightText);
  const reps   = parseInt(repsText, 10);
  if (isNaN(weight) || weight < 0 || isNaN(reps) || reps < 1) {
    return { ok: false, error: 'Enter valid weight and reps before adding a set.' };
  }
  const maxWeight = preferMetric ? 250 : 550;
  if (weight > maxWeight) {
    return { ok: false, error: `Weight cannot exceed ${maxWeight} ${preferMetric ? 'kg' : 'lbs'} per set.` };
  }
  if (reps > 50) {
    return { ok: false, error: 'Reps cannot exceed 50 per set.' };
  }
  return { ok: true, set: { weightKg: preferMetric ? weight : weight / 2.20462, reps } };
}

// Reads the minutes typed for a cardio entry. Whole minutes only, up to 600, like the server.
export function parseCardioSet(minutesText: string): Parsed<{ minutes: number }> {
  const text = minutesText.trim();
  if (!/^\d+$/.test(text) || parseInt(text, 10) < 1) {
    return { ok: false, error: 'Enter the minutes before logging.' };
  }
  const minutes = parseInt(text, 10);
  if (minutes > 600) {
    return { ok: false, error: 'Cardio cannot exceed 600 minutes per entry.' };
  }
  return { ok: true, set: { minutes } };
}
