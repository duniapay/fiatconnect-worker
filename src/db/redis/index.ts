import { createClient } from 'redis'
import { logger } from '../../utils/logger'


// Load from environment variable
const redisClient = createClient({
  url: process.env.REDIS_URL ?? '',
})


const initCacheServer = async () => {
  try {
    // check if redis socket is opened
    if (redisClient) {
      redisClient.on('error', (error: any) => logger.error(`Error : ${error}`))

      await redisClient.connect().catch((error: any) => {
        logger.error(error)
      })

      redisClient.on('ready', () => {
        logger.info('Redis client connected successfully')
      })
    }
  } catch (error) {
    logger.error(error)
    setTimeout(initCacheServer, 5000)
  }
}


export { redisClient,
initCacheServer }
