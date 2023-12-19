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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.guaranteedUntil = exports.optsDefault = void 0;
const crypto_1 = require("crypto");
const axios_1 = __importDefault(require("axios"));
const constant_1 = require("./constant");
const logger_1 = require("./logger");
const webhookUrl = (_a = process.env.WEBHOOK_URL) !== null && _a !== void 0 ? _a : '';
const webhookProviderId = (_b = process.env.PROVIDER_ID) !== null && _b !== void 0 ? _b : '';
const webhookSecret = (_c = process.env.WEBHOOK_SECRET) !== null && _c !== void 0 ? _c : '';
const redisHost = (_d = process.env.REDIS_HOST) !== null && _d !== void 0 ? _d : '';
const redisPort = 6379;
function apiCall(params) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            logger_1.logger.info(`Sending webhook event ${JSON.stringify(params)}`);
            if (process.env.NODE_ENV === 'development') {
                return { status: 200, data: {} };
            }
            else {
                const hmac = (0, crypto_1.createHmac)('sha256', webhookSecret)
                    .update(`${params.timestamp}.${Buffer.from(JSON.stringify(params))}`)
                    .digest('hex');
                const signature = `t=${params.timestamp},v1=${hmac}`;
                const headers = {
                    'Content-Type': 'application/json',
                    'FiatConnect-Signature': signature,
                };
                const response = yield (0, axios_1.default)({
                    method: 'post',
                    url: `${webhookUrl}/${webhookProviderId}`,
                    data: JSON.stringify(params),
                    headers: headers,
                });
                logger_1.logger.info(`webhook response: ${JSON.stringify(response.status)}`);
                return { status: response.status, data: {} };
            }
        }
        catch (error) {
            logger_1.logger.error(error);
            throw new Error(`${error.response.status}.${error.response.data.error}}`);
        }
    });
}
exports.optsDefault = {
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
};
exports.default = apiCall;
const guaranteedUntil = () => {
    const guaranteedUntil = new Date();
    guaranteedUntil.setSeconds(guaranteedUntil.getSeconds() + constant_1.FIVE_MINUTES);
    const formatguaranteedUntil = guaranteedUntil.toISOString();
    return formatguaranteedUntil;
};
exports.guaranteedUntil = guaranteedUntil;
//# sourceMappingURL=queue.js.map