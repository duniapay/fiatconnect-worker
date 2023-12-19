import path from 'path';
import dotenv from 'dotenv';

const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

import { createWorker } from "./workers/factory";
import { optsDefault } from "./utils/queue";
import { notificationsQueueName, paymentCompleteQueueName, paymentReceivedQueueName, paymentStartedQueueName, paymentsReadyQueueName } from "./workers/types";

import paymentsReadyProcessor from "./workers/workflows/ready-to-send";
import paymentCompleteProcessor from "./workers/workflows/tx-complete";
import paymentReceivedProcessor from "./workers/workflows/funds-received";
import paymentStartedProcessor from "./workers/workflows/tx-started";
import notificationsProcessor from "./workers/workflows/slack/send-slack-message";


const { worker: paymentStartedWorker } = createWorker(
  paymentStartedQueueName,
  paymentStartedProcessor,
  optsDefault
);

const { worker: paymentReceivedWorker } =
  createWorker(paymentReceivedQueueName, paymentReceivedProcessor, optsDefault, 8);

const { worker: paymentReadyToSendWorker } = createWorker(
  paymentsReadyQueueName,
  paymentsReadyProcessor,
  optsDefault
);

const { worker: paymentCompleteWorker } = createWorker(
  paymentCompleteQueueName,
  paymentCompleteProcessor,
  optsDefault
);

const { worker: notificationsWorker } = createWorker(
  notificationsQueueName,
  notificationsProcessor,
  optsDefault
);

process.on("SIGTERM", async () => {
  console.info("SIGTERM signal received: closing queues");

  await paymentStartedWorker.close();
  await paymentReceivedWorker.close();
  await paymentReadyToSendWorker.close();
  await paymentCompleteWorker.close();
  await notificationsWorker.close();

  console.info("All closed");
});