import SEOHead from './SEOHead';
import { organizationSchema, softwareApplicationSchema, localBusinessSchema, faqSchema } from './SEOHead';

const LandingPageSEO = () => {
    const faqs = [
        {
            question: "What is the best funeral management software in Kenya?",
            answer: "Rest Point is Kenya's #1 funeral home management and welfare management platform. Trusted by 500+ organizations including funeral homes, churches, SACCOs, and companies across Kenya for case management, funeral insurance administration, and member contribution tracking."
        },
        {
            question: "How much does funeral management software cost in Kenya?",
            answer: "Rest Point offers affordable plans starting from KES 9,200/month for small organizations (Single Tenant) and KES 18,900/month for multi-branch organizations (Multi-Tenant). All plans include core features with no hidden fees."
        },
        {
            question: "Can funeral management software integrate with M-Pesa?",
            answer: "Yes! Rest Point seamlessly integrates with M-Pesa for automated premium collection, contribution tracking, and payment processing. This makes it perfect for Kenyan organizations looking to digitize their funeral welfare programs."
        },
        {
            question: "What features does funeral welfare management software need?",
            answer: "Essential features include: member registration and management, beneficiary designation, contribution tracking with M-Pesa integration, claims management, automated approvals workflow, financial reporting, SMS notifications, and family portal access. Rest Point includes all these features and more."
        },
        {
            question: "Is Rest Point suitable for churches and SACCOs?",
            answer: "Absolutely! Rest Point is specifically designed for churches, SACCOs, chamas, companies, and NGOs in Kenya. It offers tailored features like church welfare committee management, SACCO multi-branch support, SASRA compliance reporting, and member contribution tracking."
        },
        {
            question: "How does funeral insurance management software work?",
            answer: "Rest Point streamlines funeral insurance from member enrollment to claims processing. It automates premium collection via M-Pesa, manages beneficiary information, processes claims with digital workflows, calculates benefits automatically, and provides comprehensive reporting for stakeholders."
        }
    ];

    return (
        <SEOHead
            title="Rest Point | Kenya's #1 Funeral Home Management System & Welfare Management Platform"
            description="Complete funeral home management and welfare administration platform for churches, SACCOs, chamas, and organizations in Kenya. Manage cases, process funeral insurance claims, track member contributions, and serve families with dignity. Trusted by 500+ organizations. M-Pesa integrated."
            keywords="funeral management software Kenya, funeral home management system, welfare management software, funeral insurance administration, SACCO funeral software, church welfare management, chama management software, member contribution tracking, M-Pesa integration, funeral claims management, bereavement management, funeral cover administration, group funeral insurance, Kenya funeral software"
            url="/"
            schema={[
                organizationSchema,
                softwareApplicationSchema,
                localBusinessSchema,
                faqSchema(faqs)
            ]}
        />
    );
};

export default LandingPageSEO;