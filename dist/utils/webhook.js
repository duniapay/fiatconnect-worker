"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatAndSendPaymentEvent = exports.formatAndSendKYCEvent = exports.timestamp = void 0;
const fiatconnect_types_1 = require("@fiatconnect/fiatconnect-types");
const nanoid_1 = require("nanoid");
exports.timestamp = Math.round(new Date().getTime() / 1000).toString();
function formatAndSendKYCEvent(address, schema, status) {
    const d = {
        eventType: fiatconnect_types_1.WebhookEventType.KycStatusEvent,
        provider: 'dunia-payment',
        eventId: (0, nanoid_1.nanoid)(),
        timestamp: exports.timestamp,
        address: address,
        payload: {
            kycStatus: status,
            kycSchema: schema,
        },
    };
    return d;
}
exports.formatAndSendKYCEvent = formatAndSendKYCEvent;
function formatAndSendPaymentEvent(eventType, address, status, fiatType, cryptoType, amountProvided, transferAddress, amountReceived, fee, fiatAccountId, transferId, transferType) {
    const timestamp = Math.round(new Date().getTime() / 1000).toString();
    const d = {
        eventType: eventType,
        provider: 'dunia-payment',
        eventId: (0, nanoid_1.nanoid)(),
        timestamp: timestamp,
        address: address,
        payload: {
            status: status,
            transferType: transferType,
            fiatType: fiatType,
            cryptoType: cryptoType,
            amountProvided: amountProvided,
            amountReceived: amountReceived,
            fee: fee,
            fiatAccountId: fiatAccountId,
            transferId: transferId,
            transferAddress: transferAddress,
        },
    };
    return d;
}
exports.formatAndSendPaymentEvent = formatAndSendPaymentEvent;
//# sourceMappingURL=webhook.js.map