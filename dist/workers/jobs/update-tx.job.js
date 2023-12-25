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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTxStatusRequest = void 0;
const bullmq_1 = require("bullmq");
const webhook_1 = require("../../types/webhook");
const queue_1 = require("../../utils/queue");
const flowProducer = new bullmq_1.FlowProducer({ connection: queue_1.optsDefault.connection });
const UpdateTxStatusRequest = ({ quoteId, fiatAccountId, transferType, transferAddress, status, userAddress, }) => __awaiter(void 0, void 0, void 0, function* () {
    // Step 1. Create or upsert the transaction in the database
    const addTxToDbRecord = {
        name: `addDbRecord:${userAddress}-${quoteId}`, //Set up unique name for each job
        queueName: webhook_1.JobType.PAYMENT_PROCESSING_STARTED, //Set a queue name. It will be used as a part of job name unless you configure it manually
        data: {
            quoteId,
            fiatAccountId,
            transferType,
            transferAddress,
            status,
            userAddress,
        },
        opts: {
            removeOnComplete: true,
            failParentOnFailure: true, //If any one of the job fails, the whole flow will fail
            attempts: 5, //Retry 5 times
            backoff: {
                //Wait for 15 seconds when retrying. Each retry wait will be exponentially increased.
                type: 'exponential',
                delay: 15000,
            },
        },
    };
    // Step 2. Updates the transaction status from TransactionStatus.TransactionStarted to TransactionStatus.TransactionComplete
    const readyToSendTxStatusRecord = {
        name: `readyToSendTxStatus:${userAddress}-${quoteId}`, //Set up unique name for each job
        queueName: webhook_1.JobType.PAYMENT_PROCESSING_READY_TO_RECEIVE_CRYPTO, //Set a queue name. It will be used as a part of job name unless you configure it manually
        children: [addTxToDbRecord], //This job needs one child job to be completed
        data: {
            quoteId,
            fiatAccountId,
            transferType,
            transferAddress,
            status,
            userAddress,
        },
        opts: {
            removeOnComplete: true,
            failParentOnFailure: true, //If any one of the job fails, the whole flow will fail
            attempts: 5, //Retry 5 times
            backoff: {
                //Wait for 15 seconds when retrying. Each retry wait will be exponentially increased.
                type: 'exponential',
                delay: 15000,
            },
        },
    };
    // Step 3. Updates the transaction status from TransactionStatus.TransactionStarted to TransactionStatus.TransactionComplete
    const receivedCryptoTxStatusRecord = {
        name: `receivedCryptoTxStatus:${userAddress}-${quoteId}`, //Set up unique name for each job
        queueName: webhook_1.JobType.PAYMENT_PROCESSING_CRYPTO_RECEIVED, //Set a queue name. It will be used as a part of job name unless you configure it manually
        children: [readyToSendTxStatusRecord], //This job needs one child job to be completed
        data: {
            quoteId,
            fiatAccountId,
            transferType,
            transferAddress,
            status,
            userAddress,
        },
        opts: {
            removeOnComplete: true,
            failParentOnFailure: true, //If any one of the job fails, the whole flow will fail
            attempts: 5, //Retry 5 times
            backoff: {
                //Wait for 15 seconds when retrying. Each retry wait will be exponentially increased.
                type: 'exponential',
                delay: 15000,
            },
        },
    };
    // Step 4. Updates the transaction status from TransactionStatus.TransactionStarted to TransactionStatus.TransactionComplete
    const txCompleteStatusRecord = {
        name: `txCompleteStatus:${userAddress}-${quoteId}`, //Set up unique name for each job
        queueName: webhook_1.JobType.PAYMENT_PROCESSING_COMPLETE, //Set a queue name. It will be used as a part of job name unless you configure it manually
        children: [receivedCryptoTxStatusRecord], //This job needs one child job to be completed
        data: {
            quoteId,
            fiatAccountId,
            transferType,
            transferAddress,
            status,
            userAddress,
        },
        opts: {
            removeOnComplete: true,
            failParentOnFailure: true, //If any one of the job fails, the whole flow will fail
            attempts: 5, //Retry 5 times
            backoff: {
                //Wait for 15 seconds when retrying. Each retry wait will be exponentially increased.
                type: 'exponential',
                delay: 15000,
            },
        },
    };
    const txNotifierRequest = {
        name: `SlackNotification:${userAddress}-${quoteId}`, //Set up unique name for each job
        queueName: webhook_1.JobType.PAYMENT_PROCESSING_NOTIFIER, //Set a queue name. It will be used as a part of job name unless you configure it manually
        children: [txCompleteStatusRecord], //This job needs one child job to be completed
        data: {
            quoteId,
            fiatAccountId,
            transferType,
            transferAddress,
            status,
            userAddress,
        },
        opts: {
            removeOnComplete: true,
            failParentOnFailure: true, //If any one of the job fails, the whole flow will fail
            attempts: 5, //Retry 5 times
            backoff: {
                //Wait for 15 seconds when retrying. Each retry wait will be exponentially increased.
                type: 'exponential',
                delay: 15000,
            },
        },
    };
    return yield flowProducer.add(txNotifierRequest);
});
exports.UpdateTxStatusRequest = UpdateTxStatusRequest;
//# sourceMappingURL=update-tx.job.js.map