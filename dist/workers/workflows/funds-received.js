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
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../utils/logger");
const fiatconnect_types_1 = require("@fiatconnect/fiatconnect-types");
const webhook_1 = require("../../utils/webhook");
const queue_1 = __importDefault(require("../../utils/queue"));
const db_1 = require("../../db");
function default_1(job) {
    return __awaiter(this, void 0, void 0, function* () {
        const { quoteId, transferAddress, userAddress, transferType, fiatAccountId, } = job.data;
        //Get data fed from the queue.
        const status = fiatconnect_types_1.TransferStatus.TransferReceivedCryptoFunds;
        // Add event to processed events list
        // const eventId = `event:${transferType}:${quoteId}:${status}`
        try {
            const stringiFiedQuoteObject = yield db_1.redisClient.get(quoteId);
            if (!stringiFiedQuoteObject)
                throw new Error('Quote not found');
            const quote = JSON.parse(stringiFiedQuoteObject);
            const entity = yield db_1.prisma.transfer.update({
                where: {
                    quoteId: quoteId,
                },
                data: {
                    status: status,
                    transferStatus: status,
                    events: [status],
                },
            });
            logger_1.logger.warn(`Transfer status updated to: ${entity.status}`);
            const webhookPayload = (0, webhook_1.formatAndSendPaymentEvent)(transferType === fiatconnect_types_1.TransferType.TransferIn
                ? fiatconnect_types_1.WebhookEventType.TransferInStatusEvent
                : fiatconnect_types_1.WebhookEventType.TransferOutStatusEvent, userAddress, status, quote.fiatType, quote.cryptoType, quote.cryptoAmount, transferAddress, quote.fiatAmount, quote.fee || '0', fiatAccountId, entity.transferId, transferType);
            const response = yield (0, queue_1.default)(webhookPayload);
            // await redisClient.set(eventId, eventId)
            if (response.status !== 200) {
                throw Error(`Webhook failed with status ${response.status}`);
            }
            return entity.status;
        }
        catch (error) {
            logger_1.logger.warn('Could not update transfer', error);
            throw error;
        }
    });
}
exports.default = default_1;
//# sourceMappingURL=funds-received.js.map