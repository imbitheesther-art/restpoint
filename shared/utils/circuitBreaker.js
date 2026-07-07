"use strict";
/**
 * @file shared/utils/circuitBreaker.ts
 * CIRCUIT BREAKER PATTERN
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreakerError = exports.CircuitBreaker = void 0;
exports.getCircuitBreaker = getCircuitBreaker;
const shared_logger_1 = __importDefault(require("@montezuma/shared-logger"));
class CircuitBreaker {
    constructor(nameOrOptions, maybeOptions) {
        if (typeof nameOrOptions === 'string') {
            this.name = nameOrOptions;
            this.options = this.normalizeOptions(maybeOptions);
        }
        else {
            this.name = nameOrOptions?.name ?? 'unknown';
            this.options = this.normalizeOptions(nameOrOptions);
        }
        this.state = { state: 'CLOSED', failureCount: 0, lastFailureTime: null, lastStateChange: Date.now() };
        shared_logger_1.default.info({ message: `[CircuitBreaker] ${this.name} initialized` });
    }
    getState() { this.evaluateHalfOpen(); return this.state.state; }
    getFailureCount() { return this.state.failureCount; }
    reset() {
        this.state = { state: 'CLOSED', failureCount: 0, lastFailureTime: null, lastStateChange: Date.now() };
        shared_logger_1.default.info({ message: `[CircuitBreaker] ${this.name} manually reset to CLOSED` });
    }
    async call(action) {
        this.evaluateHalfOpen();
        if (this.state.state === 'OPEN') {
            throw new CircuitBreakerError(`[CircuitBreaker] ${this.name} is OPEN - rejected`);
        }
        try {
            const result = await action();
            this.onSuccess();
            return result;
        }
        catch (error) {
            this.onFailure(error);
            throw error;
        }
    }
    async callWithFallback(action, fallback) {
        try {
            return await this.call(action);
        }
        catch {
            return typeof fallback === 'function' ? await fallback() : fallback;
        }
    }
    onSuccess() {
        if (this.state.state === 'HALF_OPEN') {
            this.transitionTo('CLOSED');
        }
        this.state.failureCount = 0;
    }
    onFailure(error) {
        this.state.failureCount++;
        this.state.lastFailureTime = Date.now();
        shared_logger_1.default.warn({ message: `[CircuitBreaker] ${this.name} failure #${this.state.failureCount}/${this.options.failureThreshold}: ${error.message}` });
        if (this.state.state === 'HALF_OPEN' || this.state.failureCount >= this.options.failureThreshold) {
            this.transitionTo('OPEN');
        }
    }
    evaluateHalfOpen() {
        if (this.state.state === 'OPEN' && this.state.lastFailureTime !== null &&
            Date.now() - this.state.lastFailureTime >= this.options.recoveryTimeout) {
            this.transitionTo('HALF_OPEN');
        }
    }
    transitionTo(newState) {
        this.state.state = newState;
        this.state.lastStateChange = Date.now();
        if (newState === 'CLOSED') {
            this.state.failureCount = 0;
            this.state.lastFailureTime = null;
        }
    }
    normalizeOptions(options) {
        return { failureThreshold: options?.failureThreshold ?? 3, recoveryTimeout: options?.recoveryTimeout ?? 30000, name: options?.name ?? 'unknown' };
    }
}
exports.CircuitBreaker = CircuitBreaker;
class CircuitBreakerError extends Error {
    constructor(message) { super(message); this.name = 'CircuitBreakerError'; }
}
exports.CircuitBreakerError = CircuitBreakerError;
const instances = new Map();
function getCircuitBreaker(serviceName, options) {
    if (instances.has(serviceName))
        return instances.get(serviceName);
    const breaker = new CircuitBreaker({ ...options, name: serviceName });
    instances.set(serviceName, breaker);
    return breaker;
}
exports.default = { CircuitBreaker, CircuitBreakerError, getCircuitBreaker };
//# sourceMappingURL=circuitBreaker.js.map