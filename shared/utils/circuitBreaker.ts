/**
 * @file shared/utils/circuitBreaker.ts
 * CIRCUIT BREAKER PATTERN
 */

import logger from '@montezuma/shared-logger';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  recoveryTimeout?: number;
  name?: string;
}

interface CircuitBreakerState {
  state: CircuitState;
  failureCount: number;
  lastFailureTime: number | null;
  lastStateChange: number;
}

export class CircuitBreaker {
  private options: Required<CircuitBreakerOptions>;
  private state: CircuitBreakerState;
  private name: string;

  constructor(name?: string, options?: CircuitBreakerOptions);
  constructor(options?: CircuitBreakerOptions);
  constructor(nameOrOptions?: string | CircuitBreakerOptions, maybeOptions?: CircuitBreakerOptions) {
    if (typeof nameOrOptions === 'string') {
      this.name = nameOrOptions;
      this.options = this.normalizeOptions(maybeOptions);
    } else {
      this.name = nameOrOptions?.name ?? 'unknown';
      this.options = this.normalizeOptions(nameOrOptions);
    }
    this.state = { state: 'CLOSED', failureCount: 0, lastFailureTime: null, lastStateChange: Date.now() };
    logger.info({ message: `[CircuitBreaker] ${this.name} initialized` });
  }

  getState(): CircuitState { this.evaluateHalfOpen(); return this.state.state; }
  getFailureCount(): number { return this.state.failureCount; }

  reset(): void {
    this.state = { state: 'CLOSED', failureCount: 0, lastFailureTime: null, lastStateChange: Date.now() };
    logger.info({ message: `[CircuitBreaker] ${this.name} manually reset to CLOSED` });
  }

  async call<T>(action: () => Promise<T>): Promise<T> {
    this.evaluateHalfOpen();
    if (this.state.state === 'OPEN') {
      throw new CircuitBreakerError(`[CircuitBreaker] ${this.name} is OPEN - rejected`);
    }
    try { const result = await action(); this.onSuccess(); return result; }
    catch (error: any) { this.onFailure(error); throw error; }
  }

  async callWithFallback<T>(action: () => Promise<T>, fallback: T | (() => T | Promise<T>)): Promise<T> {
    try { return await this.call(action); }
    catch { return typeof fallback === 'function' ? await (fallback as any)() : fallback; }
  }

  private onSuccess(): void {
    if (this.state.state === 'HALF_OPEN') { this.transitionTo('CLOSED'); }
    this.state.failureCount = 0;
  }

  private onFailure(error: Error): void {
    this.state.failureCount++;
    this.state.lastFailureTime = Date.now();
    logger.warn({ message: `[CircuitBreaker] ${this.name} failure #${this.state.failureCount}/${this.options.failureThreshold}: ${error.message}` });
    if (this.state.state === 'HALF_OPEN' || this.state.failureCount >= this.options.failureThreshold) {
      this.transitionTo('OPEN');
    }
  }

  private evaluateHalfOpen(): void {
    if (this.state.state === 'OPEN' && this.state.lastFailureTime !== null &&
        Date.now() - this.state.lastFailureTime >= this.options.recoveryTimeout) {
      this.transitionTo('HALF_OPEN');
    }
  }

  private transitionTo(newState: CircuitState): void {
    this.state.state = newState;
    this.state.lastStateChange = Date.now();
    if (newState === 'CLOSED') { this.state.failureCount = 0; this.state.lastFailureTime = null; }
  }

  private normalizeOptions(options?: CircuitBreakerOptions): Required<CircuitBreakerOptions> {
    return { failureThreshold: options?.failureThreshold ?? 3, recoveryTimeout: options?.recoveryTimeout ?? 30000, name: options?.name ?? 'unknown' };
  }
}

export class CircuitBreakerError extends Error {
  constructor(message: string) { super(message); this.name = 'CircuitBreakerError'; }
}

const instances = new Map<string, CircuitBreaker>();

export function getCircuitBreaker(serviceName: string, options?: CircuitBreakerOptions): CircuitBreaker {
  if (instances.has(serviceName)) return instances.get(serviceName)!;
  const breaker = new CircuitBreaker({ ...options, name: serviceName });
  instances.set(serviceName, breaker);
  return breaker;
}

export default { CircuitBreaker, CircuitBreakerError, getCircuitBreaker };
