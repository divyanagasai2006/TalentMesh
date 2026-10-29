import { useEffect, useState } from "react";

/**
 * Wraps a Firestore subscribe function so loading always resolves,
 * even when Firebase errors or returns no data.
 */
export function useSubscription(subscribeFn, deps = [], initialData = []) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    const safetyTimer = setTimeout(() => {
      if (active) setLoading(false);
    }, 8000);

    let unsubscribe = () => {};

    try {
      unsubscribe = subscribeFn(
        (items) => {
          if (!active) return;
          clearTimeout(safetyTimer);
          setData(items);
          setLoading(false);
        },
        (err) => {
          if (!active) return;
          clearTimeout(safetyTimer);
          setError(err);
          setLoading(false);
        },
      );
    } catch (err) {
      clearTimeout(safetyTimer);
      if (active) {
        setError(err);
        setLoading(false);
      }
    }

    return () => {
      active = false;
      clearTimeout(safetyTimer);
      unsubscribe?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, setData };
}
