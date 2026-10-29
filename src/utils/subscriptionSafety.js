/**
 * Returns a cleanup function that clears the safety timer.
 * Use alongside Firestore subscriptions to prevent infinite loading states.
 */
export function withLoadingSafety(setLoading, ms = 8000) {
  const timer = setTimeout(() => setLoading(false), ms);
  return () => clearTimeout(timer);
}
