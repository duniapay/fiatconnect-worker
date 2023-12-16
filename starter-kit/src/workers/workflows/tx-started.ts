import { Worker } from 'bullmq'

import {
  CryptoType,
  FiatType,
  TransferType,
  WebhookEventType,
  TransferStatus,
} from '@fiatconnect/fiatconnect-types'

import { logger } from '../../utils/logger'
import apiCall, { optsDefault } from '../../utils/queue'
import { formatAndSendPaymentEvent } from '../../utils/webhook'
import { prisma, redisClient } from '../../db'
import { JobRecord } from '../../types/queues'
import { JobType } from '../../types/webhook'

/**
 * Worker for processing started payment transactions.
 * @param job - The job containing data for the transaction.
 * @returns The status of the transaction processing.
 */
export const TxStartedWorker = new Worker<JobRecord>(
  JobType.PAYMENT_PROCESSING_STARTED, //Define a queue for the worker
  async (job: any) => {
    const {
      quoteId,
      transferAddress,
      userAddress,
      transferType,
      fiatAccountId,
    } = job.data //Get data fed from the queue.
    const status = TransferStatus.TransferStarted

    try {
      /// Load Repository
      const stringiFiedQuoteObject = await redisClient.get(quoteId)
      if (!stringiFiedQuoteObject) throw new Error('Quote not found')
      const quote = JSON.parse(stringiFiedQuoteObject)
      const entity = await prisma.transfer.upsert({
        where: {
          quoteId: quoteId,
        },
        update: {
          transferType: transferType,
          transferAddress: transferAddress,
          quoteId: quoteId,
          fiatAccountId: fiatAccountId,
          transferStatus: status,
          status: status,
        },
        create: {
          transferType: transferType,
          transferAddress: transferAddress,
          quoteId: quoteId,
          accountId: fiatAccountId,
          fiatAccountId: fiatAccountId,
          transferStatus: status,
          fiatType: quote.fiatType as FiatType,
          cryptoType: quote.cryptoType as CryptoType,
          status: status,
          amountProvided: quote.cryptoAmount ?? '0',
          amountReceived: quote.fiatAmount ?? '0',
          txHash: '',
          fee: quote.fee || '0',
          events: [status],
        },
      })
      logger.warn(
        `Processing Transfer status update complete: ${entity.transferStatus}`,
      )

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
      logger.warn('Could not update transfer', error)
      throw error
    }
  },
  { connection: optsDefault.connection },
)

TxStartedWorker.on('completed', (job: any) => {
  logger.info(`Job completed with result ${job.returnvalue}`)
})
TxStartedWorker.on('waiting', (job: any) => {
    // Job is waiting to be processed.
  logger.info(`Job waiting`)
})
TxStartedWorker.on('drained', () => {
    // Queue is drained, no more jobs left
  logger.info(`Queue is drained, no more jobs left`)
})
TxStartedWorker.on('failed', (job: any) => {
    // job has failed
  logger.info(`job has failed`)
})


