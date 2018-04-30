

//Reducer for options, currently empty
export function optionsReducer(state = getDefaultOptionsState(), action)
{
    return state;
}

export function getDefaultOptionsState()
{
    return {
        isClient: false
    };
}