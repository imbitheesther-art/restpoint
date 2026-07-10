
// DEPLOYMENT & BRANCH TYPE DEFINITIONS


export type DeploymentType = 'single' | 'multi';

export interface DeploymentConfig {
    deploymentType: DeploymentType;
    branchCount: number;
    tenantName: string;
    tenantSlug: string;
    country?: string;
    location?: string;
    email?: string;
    loading: boolean;
}

export interface Branch {
    id: number;
    name: string;
    slug: string;
    database: string;
    location?: string;
    phone?: string;
    email?: string;
    isPrimary: boolean;
    isActive: boolean;
}

export interface CurrentBranch {
    id: number;
    name: string;
    slug: string;
    database: string;
    isPrimary: boolean;
}

export interface AppUser {
    id: number;
    email: string;
    fullName: string;
    role: 'admin' | 'manager' | 'staff' | 'user' | 'mortician' | 'driver';
    branchId: number | null;
    branchSlug?: string;
    tenantSlug?: string;
    tenantId?: number;
}

export interface LoginCredentials {
    identifier: string;
    password: string;
    branchSlug?: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    data?: {
        token: string;
        refreshToken?: string;
        tenant: {
            tenantId: number;
            tenantName: string;
            tenantSlug: string;
            country?: string;
        };
        user: {
            userId: number;
            email: string;
            fullName: string;
            role: string;
            branchId: number | null;
        };
    };
}

export interface BranchUser {
    id: number;
    email: string;
    fullName: string;
    role: string;
    branchId: number;
    branchName: string;
    isActive: boolean;
    isVerified: boolean;
    lastLoginAt?: string;
    createdAt: string;
}