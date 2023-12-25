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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSlackMessage = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../../../utils/logger");
const db_1 = require("../../../db");
const slackChannelId = (_a = process.env.SLACK_CHANNEL_ID) !== null && _a !== void 0 ? _a : '';
const slackApiToken = (_b = process.env.SLACK_API_TOKEN) !== null && _b !== void 0 ? _b : '';
// Post a message to a channel your app is in using ID and message text
function sendSlackMessage({ accountType, transferType, amount, country, mobileNumber, fee, when, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const recipient = '*Recipient:*\n" + ' + mobileNumber + ' + "';
        return axios_1.default
            .post('https://slack.com/api/chat.postMessage', {
            channel: slackChannelId,
            text: 'New *Transfer Request* for ' +
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
        }, {
            headers: {
                Authorization: `Bearer ${slackApiToken}`,
                'Content-Type': 'application/json',
            },
        })
            .then((response) => {
            logger_1.logger.info('Message sent: ', response.data);
        })
            .catch((error) => {
            logger_1.logger.error('Error sending message: ', error);
        });
    });
}
exports.sendSlackMessage = sendSlackMessage;
function default_1(job) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const { quoteId, transferType, fiatAccountId } = job.data; //Get data fed from the queue.
        try {
            const stringiFiedQuoteObject = yield db_1.redisClient.get(quoteId);
            if (!stringiFiedQuoteObject)
                throw new Error('Quote not found');
            const quote = JSON.parse(stringiFiedQuoteObject);
            const [transfer, account] = yield Promise.all([
                db_1.prisma.transfer.findFirst({
                    where: {
                        quoteId: quoteId,
                    },
                }),
                db_1.prisma.account.findFirst({
                    where: {
                        fiatAccountId: fiatAccountId,
                    },
                }),
            ]);
            if (!transfer || !account) {
                throw new Error('Transfer or account not found');
            }
            yield sendSlackMessage({
                accountType: (_a = account === null || account === void 0 ? void 0 : account.fiatAccountType) !== null && _a !== void 0 ? _a : '',
                transferType: transferType,
                amount: quote.fiatAmount,
                country: (_b = account === null || account === void 0 ? void 0 : account.country) !== null && _b !== void 0 ? _b : '',
                mobileNumber: (_c = account === null || account === void 0 ? void 0 : account.mobile) !== null && _c !== void 0 ? _c : '',
                fee: quote.fee || '0',
                when: transfer.createdAt,
            });
        }
        catch (error) {
            logger_1.logger.error(error);
        }
    });
}
exports.default = default_1;
//# sourceMappingURL=send-slack-message.js.map