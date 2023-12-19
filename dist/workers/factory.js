"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWorker = void 0;
const bullmq_1 = require("bullmq");
function createWorker(name, processor, connection, concurrency = 1) {
    const worker = new bullmq_1.Worker(name, processor, {
        connection,
        concurrency,
    });
    worker.on("completed", (job, err) => {
        console.log(`Completed job on queue ${name}`);
    });
    worker.on("failed", (job, err) => {
        console.log(`Faille job on queue ${name}`, err);
    });
    return { worker };
}
exports.createWorker = createWorker;
//# sourceMappingURL=factory.js.map