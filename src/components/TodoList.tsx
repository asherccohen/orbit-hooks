import React, { useRef, RefObject, useState, useEffect } from 'react';
import { Todo } from '../records/todo';
import TodoItem from './TodoItem';
import memorySource from '../orbit/memorySource';
import { Record } from '@orbit/data';
import { useDebounce } from 'use-debounce';

import useSyncLiveQuery from '../hooks/useSyncLiveQuery';
import useQuery from '../hooks/useQuery';
import useSyncQuery from '../hooks/useSyncQuery';

import {
  useQuery as useReactQuery,
  useMutation,
  queryCache,
} from 'react-query';

// interface TodoListProps {}
// const addTodo = (description: string) => (t: any) =>
//   t.addRecord({
//     type: 'todo',
//     id: memorySource.schema.generateId(),
//     attributes: {
//       description,
//       completed: false,
//       created: Date.now(),
//     },
//   });
// retry();
// reset((q) => q.findRecords('todo').sort('-created'));

const fetchTodos = (q: any) => q.findRecords('todo').sort('created');
const fetchTodosFn = () =>
  memorySource.query((t: any) => t.findRecords('todo').sort('created'));

function TodoList() {
  // Sync liveQuery of memorySource.cache
  // const { data: todos = [] as Todo[], reset } = useSyncLiveQuery(
  //   memorySource.cache,
  //   fetchTodos
  // );

  // Async query of memorySource
  // const { data: todos = [] as Todo[], retry, reset } = useQuery(
  //   memorySource,
  //   (q) => q.findRecords('todo').sort('created')
  // );

  // Async query with react-query
  const {
    isLoading,
    data: todos,
    error,
  }: { isLoading: any; data: Todo[]; error: any } = useReactQuery(
    'todos',
    // () => memorySource.query((t: any) => t.findRecords('todo').sort('created'))
    // OR
    // () => memorySource.query(fetchTodos)
    // OR
    fetchTodosFn
  );

  // Sync query of memorySource.cache
  // const { data: todos, retry, reset } = useSyncQuery(memorySource.cache, (q) =>
  //   q.findRecords('todo').sort('created')
  // );

  // Sync query of memorySource.cache with react-query
  // const {
  //   status,
  //   data: todos,
  //   error,
  // }: {
  //   status: any;
  //   data: Record | Record[] | any[] | null | undefined;
  //   error: any;
  // } = useReactQuery(
  //   'todos',
  //   () =>
  //     memorySource.cache.query((t: any) =>
  //       t.findRecords('todo').sort('created')
  //     )
  //   // OR
  //   // () => memorySource.query(fetchTodos)
  //   // OR
  //   // fetchTodosFn
  // );

  // Direct sync query of memorySource.cache (with no hook)
  // const todos = memorySource.cache.query((q) =>
  //   q.findRecords('todo').sort('created')
  // );

  const [addTodo, result] = useMutation(
    (description: string) =>
      memorySource.update((t: any) =>
        t.addRecord({
          type: 'todo',
          id: memorySource.schema.generateId(),
          attributes: {
            description,
            completed: false,
            created: Date.now(),
          },
        })
      ),
    {
      onSuccess: () => {
        // read again from react-query cache
        // queryCache.refetchQueries('todos');
        // OR
        memorySource.cache.liveQuery(fetchTodos);
      },
    }
  );

  // Just a quick way to avoid every keypress to shoot a change
  const [text, setText] = useState<string | undefined>(undefined);
  const [value] = useDebounce(text, 2000);

  useEffect(() => {
    if (value) {
      addTodo(value);
    }
  }, [addTodo, value]);

  console.log('TodoList -> todos', todos);
  // console.log('TodoList -> mutate', mutate);

  if (isLoading) return <span>'Loading...'</span>;

  if (error) return <span>{'An error has occurred: ' + error.message}</span>;

  return (
    <div>
      <header className="header">
        <input
          className="new-todo"
          placeholder="What needs to be done?"
          onChange={(e) => {
            setText(e.target.value);
          }}
        />
      </header>
      <section className="main">
        <ul className="todo-list">
          {todos &&
            Object.values(todos).map((todo, index) => (
              <TodoItem key={todo?.attributes.description} todo={todo} />
            ))}
        </ul>
      </section>
    </div>
  );
}

export default TodoList;
