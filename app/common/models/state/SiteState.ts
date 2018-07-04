import { LoadingStatus, SiteMode } from "~/common/models";

export default interface SiteState
{
    mode : SiteMode;
    status : LoadingStatus;
    loadingCount : number;
    loadingProgress : number;
}
