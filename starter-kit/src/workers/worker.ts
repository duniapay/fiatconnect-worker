import { logger } from '../utils/logger'
import { PrismaClient } from '@prisma/client'
import { TxStartedWorker } from './workflows/tx-started'
import { cryptoReceivedWorker } from './workflows/funds-received'
import { readyToSendTxWorker } from './workflows/ready-to-send'
import { txCompleteWorker } from './workflows/tx-complete'
import { slackNotifierWorker } from './workflows/slack/send-slack-message'
const prisma = new PrismaClient()

async function start() {
  try {
    // Connect to the named work queue
    TxStartedWorker.on('completed', (job) => {
      logger.info(`Job completed with result ${job.returnvalue}`)
    })
    readyToSendTxWorker.on('completed', (job) => {
      logger.info(`Job completed with result ${job.returnvalue}`)
    })
    cryptoReceivedWorker.on('completed', (job) => {
      logger.info(`Job completed with result ${job.returnvalue}`)
    })
    txCompleteWorker.on('completed', (job) => {
      logger.info(`Job completed with result ${job.returnvalue}`)
    })
    slackNotifierWorker.on('completed', (job) => {
      logger.info(`Job completed with result ${job.returnvalue}`)
    })
  } catch (error) {
    throw error
  }
}

start()
  .then(async () => {
    // Log a warning message when the Promise resolves successfully
    logger.warn('Worker started')
  })
  .catch(async (err) => {
    // Log an error message and exit the process with an error code when the Promise rejects
    logger.error(err)
    await prisma.$disconnect()
    process.exit(1)
  })
  .finally(async () => {
    // Disconnect from the Prisma client when the Promise either resolves or rejects
    await prisma.$disconnect()
  })
