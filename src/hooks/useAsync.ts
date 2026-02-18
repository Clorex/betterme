// src/hooks/useAsync.ts
import { useState, useCallback, useRef, useEffect } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

type AsyncFunction<T, Args extends any[]> = (...args: Args) => Promise<T>;

export function useAsync<T, Args extends any[] = []>(
  asyncFunction: AsyncFunction<T, Args>,
  immediate = false,
  ...immediateArgs: Args
): AsyncState<T> & {
  execute: (...args: Args) => Promise<T>;
  reset: () => void;
} {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args: Args): Promise<T> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      
      try {
        const data = await asyncFunction(...args);
        if (mountedRef.current) {
          setState({ data, loading: false, error: null });
        }
        return data;
      } catch (error) {
        if (mountedRef.current) {
          setState({ 
            data: null, 
            loading: false, 
            error: error instanceof Error ? error : new Error(String(error)) 
          });
        }
        throw error;
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  useEffect(() => {
    if (immediate) {
      execute(...immediateArgs);
    }
  }, [immediate, execute, ...immediateArgs]);

  return {
    ...state,
    execute,
    reset,
  };
}

// Hook for optimistic updates
export function useOptimistic<T>(
  initialValue: T,
  updateFn: (current: T, optimisticValue: T) => T
) {
  const [state, setState] = useState<T>(initialValue);
  const [optimisticState, setOptimisticState] = useState<T>(initialValue);

  const updateOptimistic = useCallback(
    (newValue: T) => {
      setOptimisticState(newValue);
      return newValue;
    },
    []
  );

  const confirmUpdate = useCallback(
    (finalValue: T) => {
      setState(finalValue);
      setOptimisticState(finalValue);
    },
    []
  );

  const revert = useCallback(() => {
    setOptimisticState(state);
  }, [state]);

  return {
    state: optimisticState,
    actualState: state,
    updateOptimistic,
    confirmUpdate,
    revert,
  };
}
