import * as Redux from 'redux';
import { State } from '~/client/store';
import { Action } from '~/common/models';
import * as ReduxFirstRouter from 'redux-first-router';

// There are a few different types spread between redux, redux-react, and redux-thunk,
// but it's easier to just define them ourselves here.

type Thunk = ( dispatch: Dispatch, getState: GetState) => any;
type Dispatchable = Thunk | Action<any> |  ReduxFirstRouter.RouteThunk;

export type Dispatch = ( action: Dispatchable ) => any;
export type GetState = () => State;
