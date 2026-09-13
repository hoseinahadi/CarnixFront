import axiosClient from '@/services/api/common/axiosClient';
import { unwrapApiData } from '@/services/api/common/apiError';
export interface WalletTransaction { id:number; transactionType:string; amount:number; description:string; transactionDate:string; orderId?:number; }
export interface WalletData { walletId:number; currentBalance:number; totalDeposits:number; totalWithdrawals:number; status:string; transactions:WalletTransaction[]; }
export const WalletApi={get:async()=>({data:unwrapApiData<WalletData>((await axiosClient.get('/Wallet')).data)}),payOrder:(id:number)=>axiosClient.post(`/Wallet/pay-order/${id}`),initiateTopUp:async(amount:number,callbackUrl:string)=>({data:unwrapApiData<{token:string;paymentUrl:string}>((await axiosClient.post('/Wallet/top-up/initiate',{amount,callbackUrl})).data)}),verifyTopUp:(token:string)=>axiosClient.post('/Wallet/top-up/verify',{token})};
