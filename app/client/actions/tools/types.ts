import * as Redux from 'redux'
import { State } from '~/client/store';

export type Dispatch = Redux.Dispatch;
export type GetState = () => State;