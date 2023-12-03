import { TransferStatus, TransferType } from '@fiatconnect/fiatconnect-types';

export type JobRecord = {
  quoteId: string;
  fiatAccountId: string;
  transferType: TransferType;
  transferAddress: string;
  status: TransferStatus;
  userAddress: string;
};
