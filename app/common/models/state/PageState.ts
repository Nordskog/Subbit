import { LoadingStatus } from "~/common/models";

export default interface ScrollState
{
    status : LoadingStatus;
    loadingCount : number;
    loadingProgress : number;
}
