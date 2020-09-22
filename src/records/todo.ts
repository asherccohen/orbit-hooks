// import Record from '@orbit/data';

import { Record } from '@orbit/data';

export interface Todo extends Record {
  attributes: {
    description: string;
    completed: boolean;
  };
}
