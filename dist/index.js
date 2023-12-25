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
const factory_1 = require("./workers/factory");
const queue_1 = require("./utils/queue");
const types_1 = require("./workers/types");
const ready_to_send_1 = __importDefault(require("./workers/workflows/ready-to-send"));
const tx_complete_1 = __importDefault(require("./workers/workflows/tx-complete"));
const funds_received_1 = __importDefault(require("./workers/workflows/funds-received"));
const tx_started_1 = __importDefault(require("./workers/workflows/tx-started"));
const send_slack_message_1 = __importDefault(require("./workers/workflows/slack/send-slack-message"));
const { worker: paymentStartedWorker } = (0, factory_1.createWorker)(types_1.paymentStartedQueueName, tx_started_1.default, queue_1.optsDefault);
const { worker: paymentReceivedWorker } = (0, factory_1.createWorker)(types_1.paymentReceivedQueueName, funds_received_1.default, queue_1.optsDefault, 8);
const { worker: paymentReadyToSendWorker } = (0, factory_1.createWorker)(types_1.paymentsReadyQueueName, ready_to_send_1.default, queue_1.optsDefault);
const { worker: paymentCompleteWorker } = (0, factory_1.createWorker)(types_1.paymentCompleteQueueName, tx_complete_1.default, queue_1.optsDefault);
const { worker: notificationsWorker } = (0, factory_1.createWorker)(types_1.notificationsQueueName, send_slack_message_1.default, queue_1.optsDefault);
process.on("SIGTERM", () => __awaiter(void 0, void 0, void 0, function* () {
    console.info("SIGTERM signal received: closing queues");
    yield paymentStartedWorker.close();
    yield paymentReceivedWorker.close();
    yield paymentReadyToSendWorker.close();
    yield paymentCompleteWorker.close();
    yield notificationsWorker.close();
    console.info("All closed");
}));
//# sourceMappingURL=index.js.map