import { LoadingStatus, SiteMode } from "~/common/models";

export default interface ScrollState
{
    mode : SiteMode;
    status : LoadingStatus;
    loadingCount : number;
    loadingProgress : number;
}
