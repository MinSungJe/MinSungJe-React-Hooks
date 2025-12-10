export interface Store<T> {
  getState: () => T;
  setState: (nextState: T | ((previous: T) => T)) => void;
  subscribe: (callback: () => void) => () => void;
}

const createStore = <T>(initialState: T): Store<T> => {
  let state = initialState;
  const callbacks = new Set<() => void>();

  const getState = () => state;

  const setState = (nextState: T | ((previous: T) => T)) => {
    const previousState = state;

    const resolvedState =
      typeof nextState === 'function'
        ? (nextState as (previous: T) => T)(previousState)
        : nextState;

    if (Object.is(previousState, resolvedState)) return;

    state = resolvedState;

    for (const callback of callbacks) callback();
  };

  const subscribe = (callback: () => void) => {
    callbacks.add(callback);
    return () => {
      callbacks.delete(callback);
    };
  };

  return { getState, setState, subscribe };
};

export default createStore;
