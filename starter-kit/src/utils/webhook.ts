import {
    FiatType,
    KycSchema,
    KycStatus,
    WebhookEventType,
    CryptoType,
    TransferStatus,
    TransferType,
  } from '@fiatconnect/fiatconnect-types'
  import { nanoid } from 'nanoid'
import { ITransferEventData } from '../types'
  
  
  export const timestamp = Math.round(new Date().getTime() / 1000).toString()
  export function formatAndSendKYCEvent(
    address: string,
    schema: KycSchema,
    status: KycStatus,
  ) {
    const d = {
      eventType: WebhookEventType.KycStatusEvent,
      provider: 'dunia-payment',
      eventId: nanoid(),
      timestamp: timestamp,
      address: address,
      payload: {
        kycStatus: status,
        kycSchema: schema,
      },
    }
    return d
  }
  
  export function formatAndSendPaymentEvent(
    eventType: WebhookEventType,
    address: string,
    status: TransferStatus,
    fiatType: FiatType,
    cryptoType: CryptoType,
    amountProvided: string,
    transferAddress: string,
    amountReceived: string,
    fee: string,
    fiatAccountId: string,
    transferId: string,
    transferType: TransferType,
  ): ITransferEventData {
    const timestamp = Math.round(new Date().getTime() / 1000).toString()
  
    const d = {
      eventType: eventType,
      provider: 'dunia-payment',
      eventId: nanoid(),
      timestamp: timestamp,
      address: address,
      payload: {
        status: status,
        transferType: transferType,
        fiatType: fiatType,
        cryptoType: cryptoType,
        amountProvided: amountProvided,
        amountReceived: amountReceived,
        fee: fee,
        fiatAccountId: fiatAccountId,
        transferId: transferId,
        transferAddress: transferAddress,
      },
    }
    return d
  }
  