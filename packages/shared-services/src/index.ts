/**
 * @file packages/shared-services/src/index.ts
 * CENTRALIZED: Exports all shared services
 */

export { fileStorageService } from './fileStorageService';
export * from './redisService';
export * from './rabbitmqService';

export default {
  fileStorageService: require('./fileStorageService').fileStorageService,
};