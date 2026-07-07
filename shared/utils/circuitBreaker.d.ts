/**
 * @file shared/utils/circuitBreaker.ts
 * CIRCUIT BREAKER PATTERN
 */
export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';
export interface CircuitBreakerOptions {
    failureThreshold?: number;
    recoveryTimeout?: number;
    name?: string;
}
export declare class CircuitBreaker {
    private options;
    private state;
    private name;
    constructor(name?: string, options?: CircuitBreakerOptions);
    constructor(options?: CircuitBreakerOptions);
    getState(): CircuitState;
    getFailureCount(): number;
    reset(): void;
    call<T>(action: () => Promise<T>): Promise<T>;
    callWithFallback<T>(action: () => Promise<T>, fallback: T | (() => T | Promise<T>)): Promise<T>;
    private onSuccess;
    private onFailure;
    private evaluateHalfOpen;
    private transitionTo;
    private normalizeOptions;
}
export declare class CircuitBreakerError extends Error {
    constructor(message: string);
}
export declare function getCircuitBreaker(serviceName: string, options?: CircuitBreakerOptions): CircuitBreaker;
declare const _default: {
    CircuitBreaker: typeof CircuitBreaker;
    CircuitBreakerError: typeof CircuitBreakerError;
    getCircuitBreaker: typeof getCircuitBreaker;
};
export default _default;
//# sourceMappingURL=circuitBreaker.d.ts.map