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

export interface AsyncQueryable {
  query(
    queryOrExpressions: QueryOrExpressions,
    options?: RequestOptions,
    id?: string
  ): Promise<QueryResult>;

  queryBuilder: QueryBuilder;
}

export default function useQuery(
  queryable: AsyncQueryable,
  queryOrExpressions: QueryOrExpressions,
  queryOptions?: RequestOptions,
  queryId?: string
): {
  data: QueryResult | undefined;
  error: Error | undefined;
  loading: boolean;
  retry: () => void;
  reset: QueryDispatch;
} {
  const [query, setQuery] = useState(
    buildQuery(queryOrExpressions, queryOptions, queryId)
  );
  const [data, setData] = useState<QueryResult | undefined>();
  const [error, setError] = useState<Error | undefined>();
  const [loading, setLoading] = useState(true);

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

  const performQuery = useCallback(async () => {
    if (query) {
      try {
        setData(await queryable.query(query));
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
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
    setLoading(true);
    setQuery(buildQuery(queryOrExpressions, queryOptions, queryId));
  };

  const retry = () => {
    setLoading(true);
    performQuery();
  };

  useEffect(() => {
    performQuery();
  }, [performQuery, query]);

  return { data, error, loading, retry, reset };
}
