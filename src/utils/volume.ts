import { WorkoutLogs } from "../types";

/**
 * Calculates the total weight volume lifted in the current calendar week (Monday - Sunday).
 * Volume = Sum(weight * reps) for all completed sets.
 */
export const calculateWeeklyVolume = (logs: WorkoutLogs): number => {
  const now = new Date();
  
  // Get Monday of current week in user's local time
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const diffToMonday = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diffToMonday, 0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  let totalVolume = 0;

  for (const [key, dayLog] of Object.entries(logs || {})) {
    const parts = key.split("|");
    if (parts.length < 2) continue;
    const dateStr = parts[1]; // YYYY-MM-DD
    const dateParts = dateStr.split("-");
    if (dateParts.length !== 3) continue;
    
    const y = parseInt(dateParts[0], 10);
    const m = parseInt(dateParts[1], 10) - 1;
    const d = parseInt(dateParts[2], 10);
    const logDate = new Date(y, m, d);

    if (logDate >= startOfWeek && logDate <= endOfWeek) {
      for (const [fieldKey, val] of Object.entries(dayLog)) {
        if (fieldKey.startsWith("__")) continue; // skip metadata
        if (Array.isArray(val)) {
          for (const set of val) {
            if (set && set.done) {
              const weight = parseFloat(set.w) || 0;
              const reps = parseFloat(set.r) || 0;
              totalVolume += weight * reps;
            }
          }
        }
      }
    }
  }
  return totalVolume;
};
