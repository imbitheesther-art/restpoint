/**
 * @file apps/global/types/index.ts
 * Central shared TypeScript interfaces and DTO contracts.
 * All services import from this file for type consistency.
 */

import type { Request, Response } from 'express';

// ============================================================
// GENERIC API RESPONSE WRAPPER
// ============================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedApiResponse<T = unknown> extends ApiResponse<T[]> {
  total?: number;
  limit?: number;
  offset?: number;
}

// ============================================================
// PAGINATION
// ============================================================

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

// ============================================================
// DATABASE
// ============================================================

/** Base type for raw database rows returned by safeQuery */
export type DatabaseRow = Record<string, unknown>;

export interface QueryResult {
  affectedRows?: number;
  insertId?: number;
  changedRows?: number;
}

// ============================================================
// USER INTERFACES
// ============================================================

/** Raw user row as stored in the database */
export interface UserRecord {
  user_id: string;
  anonymous_username: string;
  real_name: string | null;
  password_hash: string;
  personal_email: string;
  gender: string | null;
  age_bracket: string | null;
  generation: string | null;
  county: string | null;
  ward: string | null;
  voter_card: 0 | 1;
  will_vote: string | null;
  political_party: string | null;
  employment_status: string | null;
  role: UserRole;
  is_verified: 0 | 1;
  is_active: 0 | 1;
  avatar: string | null;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  last_login_ip: string | null;
  last_login_user_agent: string | null;
}

/** Alias for clarity when returning partial user data */
export type UserPublicRecord = Omit<UserRecord, 'password_hash'>;

export type UserRole =
  | 'user'
  | 'aspirant'
  | 'leader'
  | 'market_admin'
  | 'admin'
  | 'super_admin'
  | 'ceo';

// ============================================================
// REFRESH TOKEN
// ============================================================

export interface RefreshTokenRecord {
  id: number;
  user_id: string;
  token: string;
  user_agent: string | null;
  ip_address: string | null;
  expires_at: string;
  created_at: string;
}

// ============================================================
// JWT TOKEN PAYLOAD
// ============================================================

/** Shape of the decoded JWT access token payload */
export interface UserPayload {
  userId: string;
  username: string;
  real_name?: string | null;
  email: string;
  county?: string | null;
  ageBracket?: string | null;
  generation?: string | null;
  role: UserRole;
  voterCard?: boolean;
  willVote?: string | null;
  political_party?: string | null;
  employment_status?: string | null;
  permissions?: string[];
  /** JWT standard claim */
  exp?: number;
  /** JWT standard claim */
  iat?: number;
}

/** Shape of req.user after authentication middleware */
export interface AuthenticatedUser extends UserPayload {
  user_id?: string;
}

// ============================================================
// TENANT INTERFACES
// ============================================================

export interface TenantRecord {
  id: number;
  slug: string;
  organization_name: string;
  is_active: 0 | 1;
  subscription_status: string | null;
  subscription_expires_at: string | null;
}

export interface TenantValidationResult {
  active: boolean;
  reason?: string;
  tenant?: TenantRecord;
}

// ============================================================
// REQUEST DTOs
// ============================================================

export interface LoginRequestDTO {
  identifier: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterRequestDTO {
  username: string;
  email: string;
  password: string;
  real_name?: string;
  gender?: string;
  county?: string;
  ward?: string;
  age_bracket?: string;
  generation?: string;
  voter_card?: boolean;
  will_vote?: string;
  political_party?: string;
  employment_status?: string;
}

export interface ChangePasswordRequestDTO {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface RefreshTokenRequestDTO {
  /** Optional body token — normally retrieved from cookie */
  refresh_token?: string;
}

// ============================================================
// RESPONSE DTOs
// ============================================================

/** Public user info sent to clients (no password hash) */
export interface UserInfoDTO {
  user_id: string;
  session_id?: string;
  username: string;
  real_name: string | null;
  email: string;
  county: string | null;
  ward: string | null;
  age_bracket: string | null;
  role: UserRole;
  political_party: string | null;
  employment_status: string | null;
  is_verified: boolean;
  avatar: string | null;
  last_login?: string;
}

export interface LoginResponseDTO {
  success: true;
  message: string;
  user: UserInfoDTO;
  accessToken: string;
  csrfToken: string;
  sessionId: string;
  expiresIn: number;
  rememberMe: boolean;
}

export interface RefreshTokenResponseDTO {
  success: true;
  message: string;
  accessToken: string;
  csrfToken: string;
  user: Omit<UserInfoDTO, 'session_id' | 'avatar' | 'last_login'>;
  expiresIn: number;
}

export interface AuthStatusResponseDTO {
  success: true;
  isAuthenticated: boolean;
  needsRefresh?: boolean;
  user?: UserInfoDTO;
  role?: UserRole;
  permissions?: string[];
  message?: string;
}

export interface SessionRecord {
  token: string;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
  expires_at: string;
  isCurrent?: boolean;
}

// ============================================================
// EXPRESS REQUEST AUGMENTATION
// ============================================================

declare module 'express-serve-static-core' {
  interface Request {
    user?: UserPayload;
    userId?: string;
    role?: string;
    tenantId?: number;
    tenantSlug?: string;
    tenant?: TenantRecord;
  }
}
