"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
class UserModel {
    async findByEmail(email) {
        return null; // Simplified for now
    }
    async create(data) {
        return 1; // Simplified for now
    }
    async updateLastLogin(id) {
        return true; // Simplified for now
    }
    async findByOrganizationId(organizationId) {
        return []; // Simplified for now
    }
}
exports.UserModel = UserModel;
