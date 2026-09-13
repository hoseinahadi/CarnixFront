import axiosClient from '@/services/api/common/axiosClient';
export interface WholesaleRequestInput { phone:string; firstName:string; lastName:string; products:string; category:string; city:string; province:string; description:string }
export interface WholesaleRequestResult extends WholesaleRequestInput { wholesaleRequestId:number; trackingCode:string; status:'pending'|'reviewing'|'contacted'|'completed'|'cancelled'; createdAt:string; updatedAt?:string }
export const wholesaleApi={
 create:async(input:WholesaleRequestInput)=>(await axiosClient.post<WholesaleRequestResult>('/wholesale',input)).data,
 track:async(trackingCode:string,phone:string)=>(await axiosClient.get<WholesaleRequestResult>(`/wholesale/track/${encodeURIComponent(trackingCode)}`,{params:{phone}})).data,
 mine:async()=>(await axiosClient.get<WholesaleRequestResult[]>('/wholesale/mine')).data,
};
