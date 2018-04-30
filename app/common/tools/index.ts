export import store = require('./store');
export import time = require('./time');
export import url = require('./url');
export import number = require('./number');
export import query = require('./query');

export function removeNullChars(str : string)
{
    return str.replace('\u0000', '');
}