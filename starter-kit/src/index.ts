import { PrismaClient } from "@prisma/client"
import { logger } from "./utils/logger"
import { cryptoReceivedWorker } from "./workers/workflows/funds-received"
import { readyToSendTxWorker } from "./workers/workflows/ready-to-send"
import { slackNotifierWorker } from "./workers/workflows/slack/send-slack-message"
import { txCompleteWorker } from "./workers/workflows/tx-complete"
import { TxStartedWorker } from "./workers/workflows/tx-started"

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
