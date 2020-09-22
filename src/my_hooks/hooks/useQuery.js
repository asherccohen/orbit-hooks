import { useReducer, useCallback, useEffect, useState } from 'react';
import queryReducer from './utils/reducer';
import useStore from './useStore';

export default function useQuery() {
  const store = useStore();
  const dataStore = store.memory;
  const [state = {}, dispatch] = useReducer(queryReducer);
  const [_query, setQuery] = useState();

  useEffect(() => {
    dataStore.on('transform', () => {
      try {
        if (_query) {
          const data = dataStore.cache.query(_query);
          dispatch({
            type: 'DATA_UPDATE',
            payload: { data },
          });
        }
      } catch (error) {
        console.log('useQuery -> error', error);
      }
    });
  }, [dataStore, _query]);

  useEffect(() => {
    async function fetch(query) {
      try {
        const data = await dataStore.query(query);
        dispatch({
          type: 'DATA_UPDATE',
          payload: { data },
        });
      } catch (e) {
        // noop
        dispatch({
          type: 'DATA_ERROR',
          payload: { error: e },
        });
        debugger;
      }
    }
    if (_query) {
      fetch(_query);
    }
  }, [dataStore, _query]);

  const query = useCallback(
    (query) => {
      setQuery(() => query);
    },
    [setQuery]
  );

  return { ...state, query };
}
