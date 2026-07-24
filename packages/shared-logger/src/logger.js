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
// Loki configuration
const lokiUrl = process.env.LOKI_URL || 'http://restpoint_loki:3100';
const serviceName = process.env.SERVICE_NAME || 'unknown-service';
const targets = [];
// Always send to stdout for Docker/Promtail
targets.push({
    target: 'pino/file',
    level: logLevel,
    options: {},
});
// Optionally send directly to Loki via pino-loki
if (process.env.LOKI_ENABLED === 'true') {
    targets.push({
        target: 'pino-loki',
        level: logLevel,
        options: {
            host: lokiUrl,
            labels: {
                service_name: serviceName,
                app: 'restpoint'
            },
            batching: true,
            interval: 5,
        },
    });
}
const transport = pino_1.default.transport({
    targets,
});
const logger = (0, pino_1.default)({
    level: logLevel,
    timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
}, transport);
exports.logger = logger;
exports.default = logger;
//# sourceMappingURL=logger.js.map