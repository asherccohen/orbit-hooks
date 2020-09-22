import { useReducer, useCallback, useEffect, useState } from 'react';
import queryReducer from './utils/reducer';
import useStore from './useStore';

export default function useMutation() {
  const store = useStore();
  const dataStore = store.memory;
  const [state = {}, dispatch] = useReducer(queryReducer);
  const [_mutation, setMutation] = useState();

  useEffect(() => {
    async function fetch(mutation) {
      try {
        const data = await dataStore.update(mutation);

        dispatch({
          type: 'DATA_UPDATE',
          payload: { data },
        });
      } catch (e) {
        dispatch({
          type: 'DATA_ERROR',
          payload: { error: e },
        });
        // noop
        debugger;
      }
    }
    if (_mutation) {
      fetch(_mutation);
    }
  }, [dataStore, _mutation]);

  const mutate = useCallback(
    (mutation) => {
      setMutation(() => mutation);
    },
    [setMutation]
  );

  return { ...state, mutate };
}
