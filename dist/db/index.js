"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = exports.initCacheServer = exports.prisma = void 0;
const index_1 = require("./prisma/index");
Object.defineProperty(exports, "prisma", { enumerable: true, get: function () { return index_1.prisma; } });
const index_2 = require("./redis/index");
Object.defineProperty(exports, "redisClient", { enumerable: true, get: function () { return index_2.redisClient; } });
Object.defineProperty(exports, "initCacheServer", { enumerable: true, get: function () { return index_2.initCacheServer; } });
//# sourceMappingURL=index.js.map