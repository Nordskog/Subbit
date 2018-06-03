import * as Toastify from "react-toastify";

import * as styles from 'css/toast.scss'
import * as React from 'react';
import { CountdownToast } from "~/client/components/tools";

export namespace ToastType
{
    export const INFO : Toastify.ToastType = "info";
    export const SUCCESS : Toastify.ToastType = "success";
    export const WARNING : Toastify.ToastType = "warning";
    export const ERROR : Toastify.ToastType = "error";
    export const DEFAULT : Toastify.ToastType = "default";
}

export function toast( type : Toastify.ToastType, timeout : number | false, ...message : string[] ) 
{
    let elements = [];
    message.forEach( (message : string, index : number) => 
    {
        elements.push( <span key={index}  >{message}</span> )
    } )

    let container = <div className={styles.columnContainer}>
                        {elements}
                    </div>

    Toastify.toast(container, {
        type: type,
        className: styles.text,
        autoClose: timeout
    });
}

export function toastReact( type : Toastify.ToastType, timeout : number | false,  message : React.ReactNode ) 
{
    Toastify.toast(message, {
        type: type,
        className: styles.text,
        autoClose: timeout
    });
}

export function countdownToast( type : Toastify.ToastType, timeout : number | false, start : number, message : string, countdownMessage? : string, postCountdownMessage? : string)
{
    let countdown = <CountdownToast
                        start={start}
                        message={message}
                        countdownMessage={countdownMessage}
                        countdownPostMessage={postCountdownMessage}  />

    toastReact( type, timeout, countdown );
}