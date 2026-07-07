"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const pino_1 = __importDefault(require("pino"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const logLevel = process.env.LOG_LEVEL || 'info';
// Configure Pino logger with high-performance defaults
const logger = (0, pino_1.default)({
    level: logLevel,
    timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
});
exports.logger = logger;
exports.default = logger;
//# sourceMappingURL=logger.js.map