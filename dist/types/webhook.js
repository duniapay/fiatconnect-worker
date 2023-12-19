"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobType = void 0;
var JobType;
(function (JobType) {
    JobType["PAYMENT_PROCESSING_COMPLETE"] = "payment.processing.completed";
    JobType["PAYMENT_PROCESSING_STARTED"] = "payment.processing.started";
    JobType["PAYMENT_PROCESSING_NOTIFIER"] = "payment.processing.notified";
    JobType["PAYMENT_PROCESSING_READY_TO_RECEIVE_CRYPTO"] = "payment.processing.ready.to.receive.crypto";
    JobType["PAYMENT_PROCESSING_CRYPTO_RECEIVED"] = "payment.processing.crypto.received";
    JobType["PAYMENT_PROCESSING_FAILED"] = "payment.processing.failed";
    JobType["DOCUMENT_UPLOAD_STARTED"] = "document.upload.started";
    JobType["DOCUMENT_UPLOAD_COMPLETE"] = "document.upload.completed";
    JobType["DOCUMENT_UPLOAD_FAILED"] = "document.upload.failed";
    JobType["DOCUMENT_PROCESSING_STARTED"] = "document.processing.started";
    JobType["DOCUMENT_PROCESSING_COMPLETE"] = "document.processing.completed";
    JobType["DOCUMENT_PROCESSING_FAILED"] = "document.processing.failed";
})(JobType || (exports.JobType = JobType = {}));
//# sourceMappingURL=webhook.js.map