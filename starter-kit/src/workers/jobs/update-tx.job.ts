import { FlowJob, FlowProducer } from 'bullmq'
import { JobRecord } from '../../types/queues'
import { JobType } from '../../types/webhook'
import { optsDefault } from '../../utils/queue'


const flowProducer = new FlowProducer({ connection: optsDefault.connection })

export const UpdateTxStatusRequest = async ({
  quoteId,
  fiatAccountId,
  transferType,
  transferAddress,
  status,
  userAddress,
}: JobRecord) => {
  // Step 1. Create or upsert the transaction in the database
  const addTxToDbRecord: FlowJob = {
    name: `addDbRecord:${userAddress}-${quoteId}`, //Set up unique name for each job
    queueName: JobType.PAYMENT_PROCESSING_STARTED, //Set a queue name. It will be used as a part of job name unless you configure it manually
    data: {
      quoteId,
      fiatAccountId,
      transferType,
      transferAddress,
      status,
      userAddress,
    } as JobRecord,
    opts: {
      removeOnComplete: true,
      failParentOnFailure: true, //If any one of the job fails, the whole flow will fail
      attempts: 5, //Retry 5 times
      backoff: {
        //Wait for 15 seconds when retrying. Each retry wait will be exponentially increased.
        type: 'exponential',
        delay: 15_000,
      },
    },
  }
  // Step 2. Updates the transaction status from TransactionStatus.TransactionStarted to TransactionStatus.TransactionComplete
  const readyToSendTxStatusRecord: FlowJob = {
    name: `readyToSendTxStatus:${userAddress}-${quoteId}`, //Set up unique name for each job
    queueName: JobType.PAYMENT_PROCESSING_READY_TO_RECEIVE_CRYPTO, //Set a queue name. It will be used as a part of job name unless you configure it manually
    children: [addTxToDbRecord], //This job needs one child job to be completed

    data: {
      quoteId,
      fiatAccountId,
      transferType,
      transferAddress,
      status,
      userAddress,
    } as JobRecord,
    opts: {
      removeOnComplete: true,

      failParentOnFailure: true, //If any one of the job fails, the whole flow will fail
      attempts: 5, //Retry 5 times
      backoff: {
        //Wait for 15 seconds when retrying. Each retry wait will be exponentially increased.
        type: 'exponential',
        delay: 15_000,
      },
    },
  }
  // Step 3. Updates the transaction status from TransactionStatus.TransactionStarted to TransactionStatus.TransactionComplete
  const receivedCryptoTxStatusRecord: FlowJob = {
    name: `receivedCryptoTxStatus:${userAddress}-${quoteId}`, //Set up unique name for each job
    queueName: JobType.PAYMENT_PROCESSING_CRYPTO_RECEIVED, //Set a queue name. It will be used as a part of job name unless you configure it manually
    children: [readyToSendTxStatusRecord], //This job needs one child job to be completed
    data: {
      quoteId,
      fiatAccountId,
      transferType,
      transferAddress,
      status,
      userAddress,
    } as JobRecord,
    opts: {
      removeOnComplete: true,
      failParentOnFailure: true, //If any one of the job fails, the whole flow will fail
      attempts: 5, //Retry 5 times
      backoff: {
        //Wait for 15 seconds when retrying. Each retry wait will be exponentially increased.
        type: 'exponential',
        delay: 15_000,
      },
    },
  }
  // Step 4. Updates the transaction status from TransactionStatus.TransactionStarted to TransactionStatus.TransactionComplete
  const txCompleteStatusRecord: FlowJob = {
    name: `txCompleteStatus:${userAddress}-${quoteId}`, //Set up unique name for each job
    queueName: JobType.PAYMENT_PROCESSING_COMPLETE, //Set a queue name. It will be used as a part of job name unless you configure it manually
    children: [receivedCryptoTxStatusRecord], //This job needs one child job to be completed
    data: {
      quoteId,
      fiatAccountId,
      transferType,
      transferAddress,
      status,
      userAddress,
    } as JobRecord,
    opts: {
      removeOnComplete: true,

      failParentOnFailure: true, //If any one of the job fails, the whole flow will fail
      attempts: 5, //Retry 5 times
      backoff: {
        //Wait for 15 seconds when retrying. Each retry wait will be exponentially increased.
        type: 'exponential',
        delay: 15_000,
      },
    },
  }

  const txNotifierRequest: FlowJob = {
    name: `SlackNotification:${userAddress}-${quoteId}`, //Set up unique name for each job
    queueName: JobType.PAYMENT_PROCESSING_NOTIFIER, //Set a queue name. It will be used as a part of job name unless you configure it manually
    children: [txCompleteStatusRecord], //This job needs one child job to be completed
    data: {
      quoteId,
      fiatAccountId,
      transferType,
      transferAddress,
      status,
      userAddress,
    } as JobRecord,
    opts: {
      removeOnComplete: true,

      failParentOnFailure: true, //If any one of the job fails, the whole flow will fail
      attempts: 5, //Retry 5 times
      backoff: {
        //Wait for 15 seconds when retrying. Each retry wait will be exponentially increased.
        type: 'exponential',
        delay: 15_000,
      },
    },
  }

  return await flowProducer.add(txNotifierRequest)
}
