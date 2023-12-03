import { createHmac } from 'crypto'
import axios, { AxiosResponse } from 'axios'
import { IKYCJobData, ITransferEventData } from '../types'
import { QueueOptions } from 'bullmq'
import { FIVE_MINUTES } from './constant';
import { logger } from './logger';

const webhookUrl = process.env.WEBHOOK_URL ?? '';
const webhookProviderId= process.env.PROVIDER_ID ?? '';
const webhookSecret= process.env.WEBHOOK_SECRET ?? '';
const redisHost= process.env.REDIS_HOST ?? '';
const redisPort = 6379

async function apiCall(params: IKYCJobData | ITransferEventData) {
  try {
    logger.info(`Sending webhook event ${JSON.stringify(params)}`)
    if (process.env.NODE_ENV === 'development') {
      return { status: 200, data: {} }
    } else {
      const hmac = createHmac('sha256', webhookSecret)
        .update(`${params.timestamp}.${Buffer.from(JSON.stringify(params))}`)
        .digest('hex')

      const signature = `t=${params.timestamp},v1=${hmac}`
      const headers = {
        'Content-Type': 'application/json',
        'FiatConnect-Signature': signature,
      }
      const response: AxiosResponse = await axios({
        method: 'post',
        url: `${webhookUrl}/${webhookProviderId}`,
        data: JSON.stringify(params),
        headers: headers,
      })
      logger.info(`webhook response: ${JSON.stringify(response.status)}`)
      return { status: response.status, data: {} }
    }
  } catch (error: any) {
    logger.error(error)
    throw new Error(`${error.response.status}.${error.response.data.error}}`)
  }
}


export const optsDefault: QueueOptions = {
  defaultJobOptions: {
    removeOnComplete: false, // this indicates if the job should be removed from the queue once it's complete
    removeOnFail: false, // this indicates if the job should be removed from the queue if it fails
    attempts: 3, // the maximum number of attempts to retry the job
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
  connection: {
    // redis server connection options
    host: redisHost,
    port: redisPort,
  },
}

export default apiCall

export const guaranteedUntil = () => {
  const guaranteedUntil = new Date()
  guaranteedUntil.setSeconds(guaranteedUntil.getSeconds() + FIVE_MINUTES)
  const formatguaranteedUntil = guaranteedUntil.toISOString()
  return formatguaranteedUntil
}
