import axios from 'axios'
import { logger } from '../../../utils/logger'
import { Job, Worker } from 'bullmq'
import { JobRecord } from '../../../types/queues'
import { prisma, redisClient } from '../../../db'

const slackChannelId = process.env.SLACK_CHANNEL_ID ?? ''; 
const slackApiToken = process.env.SLACK_API_TOKEN ?? ''
// Post a message to a channel your app is in using ID and message text
export async function sendSlackMessage({
  accountType,
  transferType,
  amount,
  country,
  mobileNumber,
  fee,
  when,
}: {
  accountType: string
  transferType: string
  amount: number
  country: string
  mobileNumber: string
  fee: number
  when: Date
}) {
  const recipient = '*Recipient:*\n" + ' + mobileNumber + ' + "'
  return axios
    .post(
      'https://slack.com/api/chat.postMessage',
      {
        channel: slackChannelId,
        text:
          'New *Transfer Request* for ' +
          accountType +
          ' account' +
          '\n' +
          recipient +
          '\n' +
          '*Amount: *' +
          amount +
          '\n' +
          '*Country: *' +
          country +
          '\n' +
          '*Fee: *' +
          fee +
          '\n' +
          '*When: *' +
          when +
          '\n' +
          '*Transfer Type: *' +
          transferType,
      },
      {
        headers: {
          Authorization: `Bearer ${slackApiToken}`,
          'Content-Type': 'application/json',
        },
      },
    )
    .then((response) => {
      logger.info('Message sent: ', response.data)
    })
    .catch((error) => {
      logger.error('Error sending message: ', error)
    })
}

export default async function (job: Job<JobRecord>) {

    const { quoteId, transferType, fiatAccountId } = job.data //Get data fed from the queue.

    try {
      const stringiFiedQuoteObject = await redisClient.get(quoteId)
      if (!stringiFiedQuoteObject) throw new Error('Quote not found')
      const quote = JSON.parse(stringiFiedQuoteObject)
      const [transfer, account] = await Promise.all([
        prisma.transfer.findFirst({
          where: {
            quoteId: quoteId,
          },
        }),
        prisma.account.findFirst({
          where: {
            fiatAccountId: fiatAccountId,
          },
        }),
      ])

      if (!transfer || !account) {
        throw new Error('Transfer or account not found')
      }

      await sendSlackMessage({
        accountType: account?.fiatAccountType ?? '',
        transferType: transferType,
        amount: quote.fiatAmount,
        country: account?.country ?? '',
        mobileNumber: account?.mobile ?? '',
        fee: quote.fee || '0',
        when: transfer.createdAt,
      })
    } catch (error) {
      logger.error(error)
    }
  }





