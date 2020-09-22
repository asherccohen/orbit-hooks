import { useEffect, useState, useCallback } from 'react';
import { QueryResult } from '@orbit/record-cache';
import {
  buildQuery as bq,
  Query,
  QueryBuilder,
  QueryOrExpressions,
  RequestOptions,
} from '@orbit/data';
import { QueryDispatch } from './shared/queries';

export interface SyncQueryable {
  query(
    queryOrExpressions: QueryOrExpressions,
    options?: RequestOptions,
    id?: string
  ): QueryResult;

  queryBuilder: QueryBuilder;
}

export default function useSyncQuery(
  queryable: SyncQueryable,
  queryOrExpressions: QueryOrExpressions,
  queryOptions?: RequestOptions,
  queryId?: string
): {
  data: QueryResult | undefined;
  error: Error | undefined;
  retry: () => void;
  reset: QueryDispatch;
} {
  const [query, setQuery] = useState(
    buildQuery(queryOrExpressions, queryOptions, queryId)
  );
  const [data, setData] = useState<QueryResult | undefined>();
  const [error, setError] = useState();

  function buildQuery(
    queryOrExpressions: QueryOrExpressions,
    queryOptions?: RequestOptions,
    queryId?: string
  ): Query {
    return bq(
      queryOrExpressions,
      queryOptions,
      queryId,
      queryable.queryBuilder
    );
  }

  const performQuery = useCallback(() => {
    if (query) {
      try {
        setData(queryable.query(query));
      } catch (e) {
        setError(e);
      }
    }
    // else if (data !== undefined) {
    //   setData(undefined);
    // }
  }, [query, queryable]);

  const reset = (
    queryOrExpressions: QueryOrExpressions,
    queryOptions?: RequestOptions,
    queryId?: string
  ) => {
    setQuery(buildQuery(queryOrExpressions, queryOptions, queryId));
  };

  const retry = () => performQuery();

  useEffect(() => performQuery(), [performQuery, query]);

  return { data, error, retry, reset };
}
