import {
    CryptoType,
    FiatType,
    KycSchema,
    KycStatus,
    WebhookEventType,
    TransferStatus,
    TransferType,
  } from '@fiatconnect/fiatconnect-types'
  
  export interface IKYCJobData {
    eventType: WebhookEventType
    provider: string
    eventId: string
    timestamp: string
    address: string | undefined
    payload: {
      kycStatus: KycStatus
      kycSchema: KycSchema
    }
  }
  
  export interface ITransferJobData {
    transferId: string
    quoteId: string
    fiatAccountId: string
  }
  
  export interface ITransferEventData {
    eventType: WebhookEventType
    provider: string
    eventId: string
    timestamp: string
    address: string | undefined
    payload: {
      status: TransferStatus
      transferType: TransferType
      fiatType: FiatType
      cryptoType: CryptoType
      amountProvided: string
      amountReceived: string
      fee: string
      fiatAccountId: string
      transferId: string
      transferAddress: string
    }
  }
  
  export enum JobType {
    'PAYMENT_PROCESSING_COMPLETE' = 'payment.processing.completed',
    'PAYMENT_PROCESSING_STARTED' = 'payment.processing.started',
    'PAYMENT_PROCESSING_NOTIFIER' = 'payment.processing.notified',
    'PAYMENT_PROCESSING_READY_TO_RECEIVE_CRYPTO' = 'payment.processing.ready.to.receive.crypto',
    'PAYMENT_PROCESSING_CRYPTO_RECEIVED' = 'payment.processing.crypto.received',
    'PAYMENT_PROCESSING_FAILED' = 'payment.processing.failed',
  
    'DOCUMENT_UPLOAD_STARTED' = 'document.upload.started',
    'DOCUMENT_UPLOAD_COMPLETE' = 'document.upload.completed',
    'DOCUMENT_UPLOAD_FAILED' = 'document.upload.failed',
  
    'DOCUMENT_PROCESSING_STARTED' = 'document.processing.started',
    'DOCUMENT_PROCESSING_COMPLETE' = 'document.processing.completed',
    'DOCUMENT_PROCESSING_FAILED' = 'document.processing.failed',
  }
  