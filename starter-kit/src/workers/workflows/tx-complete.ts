import { Worker } from 'bullmq'
import { logger } from '../../utils/logger'

import {
  WebhookEventType,
  TransferStatus,
  CryptoType,
  FiatType,
  TransferType,
} from '@fiatconnect/fiatconnect-types'
import { JobRecord, JobType } from '../../types'
import apiCall, { optsDefault } from '../../utils/queue'
import { formatAndSendPaymentEvent } from '../../utils/webhook'
import { prisma, redisClient } from '../../db'

export const txCompleteWorker = new Worker<JobRecord>(
  JobType.PAYMENT_PROCESSING_COMPLETE, //Define a queue for the worker
  async (job) => {
    const {
      quoteId,
      transferAddress,
      userAddress,
      transferType,
      fiatAccountId,
    } = job.data //Get data fed from the queue.
    const status = TransferStatus.TransferComplete

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

      logger.warn(`Transfer status updated: ${entity.transferStatus}`)

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

      if (response.status !== 200) {
        throw Error(`Webhook failed with status ${response.status}`)
      }
      return entity.status
    } catch (error) {
      logger.warn('Could not create a record in Route53', error)
      throw error
    }
  },
  { connection: optsDefault.connection },
)
