import { useSyncExternalStore } from 'react';
import { Store } from '../../store/createStore';

const useStore = <T>(store: Store<T>) => {
  const state = useSyncExternalStore(store.subscribe, store.getState);

  return [state, store.setState] as const;
};

export default useStore;
