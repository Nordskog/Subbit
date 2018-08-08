//Svgs may be handled by svg-sprite-loader or file-loader.
//The former outputs a module, the other just the filepath.
declare module '*.svg';
declare module '*.png';
declare module '*.scss';

declare module 'victory'
{
    export class VictoryVoronoiContainer extends React.Component<any, any> {}
    //export class VictoryTooltip extends React.Component<any, any> {}


    export interface VictoryAxisProps
    {
        fixLabelOverlap? : boolean;
    }
}


declare var RFY_VERSION: string;