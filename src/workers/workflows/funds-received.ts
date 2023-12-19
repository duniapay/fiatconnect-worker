import { Job } from 'bullmq'
import { logger } from '../../utils/logger'
import {
  CryptoType,
  FiatType,
  TransferType,
  WebhookEventType,
  TransferStatus,
} from '@fiatconnect/fiatconnect-types'
import { JobRecord } from '../../types/queues'

import { formatAndSendPaymentEvent } from '../../utils/webhook'
import apiCall from '../../utils/queue'
import { prisma, redisClient } from '../../db'


export default async function (job: Job<JobRecord>) {
  const {
    quoteId,
    transferAddress,
    userAddress,
    transferType,
    fiatAccountId,
  } = job.data 
 //Get data fed from the queue.
  const status = TransferStatus.TransferReceivedCryptoFunds
  // Add event to processed events list
  // const eventId = `event:${transferType}:${quoteId}:${status}`
  try {
    const stringiFiedQuoteObject = await redisClient.get(quoteId)
    if (!stringiFiedQuoteObject) throw new Error('Quote not found')
    const quote = JSON.parse(stringiFiedQuoteObject)
    const entity = await prisma.transfer.update({
      where: {
        quoteId: quoteId,
      },
      data: {
        status: status,
        transferStatus: status,
        events: [status],
      },
    })
    logger.warn(`Transfer status updated to: ${entity.status}`)

    const webhookPayload = formatAndSendPaymentEvent(
      transferType === TransferType.TransferIn
        ? WebhookEventType.TransferInStatusEvent
        : WebhookEventType.TransferOutStatusEvent,
      userAddress,
      status,
      quote.fiatType as FiatType,
      quote.cryptoType as CryptoType,
      quote.cryptoAmount,
      transferAddress,
      quote.fiatAmount,
      quote.fee || '0',
      fiatAccountId,
      entity.transferId,
      transferType,
    )
    const response = await apiCall(webhookPayload)
    // await redisClient.set(eventId, eventId)

    if (response.status !== 200) {
      throw Error(`Webhook failed with status ${response.status}`)
    }
    return entity.status
  } catch (error) {
    logger.warn('Could not update transfer', error)
    throw error
  }

}


