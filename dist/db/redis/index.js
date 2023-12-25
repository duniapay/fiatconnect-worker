"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCacheServer = exports.redisClient = void 0;
const redis_1 = require("redis");
const logger_1 = require("../../utils/logger");
// Load from environment variable
const redisClient = (0, redis_1.createClient)({
    url: (_a = process.env.REDIS_URL) !== null && _a !== void 0 ? _a : '',
});
exports.redisClient = redisClient;
const initCacheServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // check if redis socket is opened
        if (redisClient) {
            redisClient.on('error', (error) => logger_1.logger.error(`Error : ${error}`));
            yield redisClient.connect().catch((error) => {
                logger_1.logger.error(error);
            });
            redisClient.on('ready', () => {
                logger_1.logger.info('Redis client connected successfully');
            });
        }
    }
    catch (error) {
        logger_1.logger.error(error);
        setTimeout(initCacheServer, 5000);
    }
});
exports.initCacheServer = initCacheServer;
//# sourceMappingURL=index.js.map