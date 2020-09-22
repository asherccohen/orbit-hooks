import { useEffect, useState, useCallback } from 'react';
import { SyncRecordCache, QueryResult } from '@orbit/record-cache';
import {
  buildQuery as bq,
  Query,
  QueryOrExpressions,
  RequestOptions,
} from '@orbit/data';
import { QueryDispatch } from './shared/queries';

function buildQuery(
  queryable: SyncRecordCache,
  queryOrExpressions: QueryOrExpressions,
  queryOptions?: RequestOptions,
  queryId?: string
): Query {
  return bq(queryOrExpressions, queryOptions, queryId, queryable.queryBuilder);
}

export default function useSyncLiveQuery(
  queryable: SyncRecordCache,
  queryOrExpressions: QueryOrExpressions,
  queryOptions?: RequestOptions,
  queryId?: string
): {
  data: QueryResult | undefined;
  error: Error | undefined;
  reset: QueryDispatch;
} {
  const [query, setQuery] = useState(() =>
    buildQuery(queryable, queryOrExpressions, queryOptions, queryId)
  );

  const [data, setData] = useState<QueryResult | undefined>();
  const [error, setError] = useState();

  const performLiveQuery = useCallback(() => {
    if (query) {
      try {
        setData(queryable.query(query));
      } catch (e) {
        setError(e);
      }

      let unsubscribe = queryable.liveQuery(query).subscribe((lq) => {
        setData(lq.query());
      });

      return () => {
        unsubscribe();
      };
    }

    // this generates an infinite loop
    // else if (data !== undefined) {
    //   // setData(undefined);
    //   setError(data);
    // }
  }, [query, queryable]);

  useEffect(() => performLiveQuery(), [performLiveQuery, query]);

  const reset = (
    queryOrExpressions: QueryOrExpressions,
    queryOptions?: RequestOptions,
    queryId?: string
  ) => {
    setQuery(buildQuery(queryable, queryOrExpressions, queryOptions, queryId));
  };

  return { data, error, reset };
}
