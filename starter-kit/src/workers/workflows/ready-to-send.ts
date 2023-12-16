import { Worker } from 'bullmq'
import { logger } from '../../utils/logger'
import {
  CryptoType,
  FiatType,
  TransferType,
  WebhookEventType,
  TransferStatus,
} from '@fiatconnect/fiatconnect-types'
import { JobRecord } from '../../types/queues'
import { JobType } from '../../types/webhook'
import { formatAndSendPaymentEvent } from '../../utils/webhook'
import apiCall, { optsDefault } from '../../utils/queue'
import { prisma, redisClient } from '../../db'

export const readyToSendTxWorker = new Worker<JobRecord>(
  JobType.PAYMENT_PROCESSING_READY_TO_RECEIVE_CRYPTO, //Define a queue for the worker
  async (job) => {
    const {
      quoteId,
      transferAddress,
      userAddress,
      transferType,
      fiatAccountId,
    } = job.data //Get data fed from the queue.
    const status = TransferStatus.TransferReadyForUserToSendCryptoFunds

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

