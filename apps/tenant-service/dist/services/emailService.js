"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EmailService {
    async sendWelcomeEmail(to, organizationName, adminEmail) {
        console.log(`📧 Welcome email would be sent to: ${to}`);
        console.log(`   Organization: ${organizationName}`);
        console.log(`   Admin: ${adminEmail}`);
        // In production, implement actual email sending here
    }
}
exports.default = new EmailService();
