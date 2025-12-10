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
    state = typeof nextState === 'function' ? (nextState as (previous: T) => T)(state) : nextState;
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
