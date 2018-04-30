﻿import createHistory from 'history/createMemoryHistory'
import { NOT_FOUND } from 'redux-first-router'
import configureStore from '~/client/configureStore'
import * as clientStore from '~/client/store'

import * as api from '~/client/api'
import * as models from '~/common/models'
import * as authentication from './authentication'

export default async (req, res) =>
{
    //const jwToken = req.cookies.jwToken // see server/index.js to change jwToken
    //const preLoadedState = { jwToken } // onBeforeChange will authenticate using this


    const history = createHistory({ initialEntries: [req.path] })

    //Check for auth cookie
    let userInfo : models.auth.UserInfo = null;
    let subRedditList = [];
    if (req.cookies && req.cookies.userinfo)
    {
        //Get first call going first
        let subredditListPromise = api.subreddits.fetchSubreddits();

        userInfo = authentication.decodUserInfoCookieToClient(req.cookies.userinfo); 
        if (userInfo)
        {
            userInfo.last_visit = await api.authentication.getAndUpdateLastVisit(userInfo.access_token);
        }

        subRedditList = await subredditListPromise;
    }

    const preLoadedState = clientStore.getDefaultState(userInfo, subRedditList);

    const { store, thunk } = configureStore(history, preLoadedState)

    // if not using onBeforeChange + jwTokens, you can also async authenticate
    // here against your db (i.e. using req.cookies.sessionId)

    let location = store.getState().location
    if (doesRedirect(location, res)) return false

    // using redux-thunk perhaps request and dispatch some app-wide state as well, e.g:
    // await Promise.all([store.dispatch(myThunkA), store.dispatch(myThunkB)])

    await thunk(store) // THE PAYOFF BABY!

    location = store.getState().location // remember: state has now changed
    if (doesRedirect(location, res)) return false // only do this again if ur thunks have redirects

    const status = location.type === NOT_FOUND ? 404 : 200
    res.status(status)


    return store
}

const doesRedirect = ({ kind, pathname }, res) =>
{
    if (kind === 'redirect')
    {
        res.redirect(302, pathname)
        return true
    }
}