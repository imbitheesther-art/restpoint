import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SEOHead = ({
    title,
    description,
    keywords,
    image = '/og-image.jpg',
    url,
    type = 'website',
    schema,
    localBusiness = false
}) => {
    const location = useLocation();
    const baseUrl = 'https://restpoint.co.ke';
    const fullUrl = url ? `${baseUrl}${url}` : `${baseUrl}${location.pathname}`;

    useEffect(() => {
        // Update document title
        document.title = title;

        // Update or create meta tags
        const updateMetaTag = (name, content, isProperty = false) => {
            const attribute = isProperty ? 'property' : 'name';
            let tag = document.querySelector(`meta[${attribute}="${name}"]`);
            if (!tag) {
                tag = document.createElement('meta');
                tag.setAttribute(attribute, name);
                document.head.appendChild(tag);
            }
            tag.setAttribute('content', content);
        };

        // Basic SEO
        updateMetaTag('description', description);
        updateMetaTag('keywords', keywords);
        updateMetaTag('author', 'Rest Point Technologies');
        updateMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
        updateMetaTag('googlebot', 'index, follow');

        // Open Graph / Facebook
        updateMetaTag('og:title', title, true);
        updateMetaTag('og:description', description, true);
        updateMetaTag('og:image', image, true);
        updateMetaTag('og:url', fullUrl, true);
        updateMetaTag('og:type', type, true);
        updateMetaTag('og:site_name', 'Rest Point', true);
        updateMetaTag('og:locale', 'en_KE');

        // Twitter
        updateMetaTag('twitter:card', 'summary_large_image');
        updateMetaTag('twitter:title', title);
        updateMetaTag('twitter:description', description);
        updateMetaTag('twitter:image', image);

        // Canonical URL
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', fullUrl);

        // Add structured data
        if (schema) {
            let structuredData = document.querySelector('script[type="application/ld+json"]');
            if (!structuredData) {
                structuredData = document.createElement('script');
                structuredData.setAttribute('type', 'application/ld+json');
                document.head.appendChild(structuredData);
            }
            structuredData.textContent = JSON.stringify(schema);
        }

        // Cleanup function
        return () => {
            // Optionally remove meta tags on unmount
        };
    }, [title, description, keywords, image, fullUrl, type, schema]);

    return null;
};

export const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Rest Point',
    description: 'Kenya\'s #1 Funeral Home Management System & Welfare Management Platform',
    url: 'https://restpoint.co.ke',
    logo: 'https://restpoint.co.ke/logo.png',
    foundingDate: '2020',
    founders: [
        {
            '@type': 'Person',
            name: 'Rest Point Team'
        }
    ],
    address: {
        '@type': 'PostalAddress',
        streetAddress: 'Nairobi, Kenya',
        addressLocality: 'Nairobi',
        addressCountry: 'KE'
    },
    contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+254-700-000-000',
        contactType: 'sales',
        availableLanguage: ['English', 'Swahili']
    },
    sameAs: [
        'https://twitter.com/restpointke',
        'https://linkedin.com/company/restpointke',
        'https://facebook.com/restpointke'
    ],
    areaServed: {
        '@type': 'Country',
        name: 'Kenya'
    },
    knowsAbout: [
        'Funeral Management Software',
        'Welfare Management System',
        'Funeral Insurance Administration',
        'SACCO Management Software',
        'Church Management Software'
    ]
};

export const softwareApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Rest Point',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: 'Complete funeral home management and welfare administration platform for churches, SACCOs, and organizations in Kenya',
    url: 'https://restpoint.co.ke',
    screenshot: 'https://restpoint.co.ke/dashboard-preview.png',
    aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '150',
        bestRating: '5',
        worstRating: '1'
    },
    offers: [
        {
            '@type': 'Offer',
            name: 'Single Tenant Plan',
            price: '9200',
            priceCurrency: 'KES',
            billingIncrement: 'P1M'
        },
        {
            '@type': 'Offer',
            name: 'Multi-Tenant Plan',
            price: '18900',
            priceCurrency: 'KES',
            billingIncrement: 'P1M'
        }
    ],
    featureList: [
        'Funeral Case Management',
        'Funeral Insurance Administration',
        'Member Contribution Tracking',
        'M-Pesa Integration',
        'Claims Management',
        'Family Portal',
        'SMS Notifications',
        'Financial Reporting'
    ]
};

export const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Rest Point Technologies',
    description: 'Funeral Home Management Software & Welfare Management System Provider in Kenya',
    image: 'https://restpoint.co.ke/logo.png',
    url: 'https://restpoint.co.ke',
    telephone: '+254-740-045-355',
    email: 'info@restpoint.co.ke',
    address: {
        '@type': 'PostalAddress',
        addressLocality: 'Nairobi',
        addressCountry: 'KE'
    },
    geo: {
        '@type': 'GeoCoordinates',
        latitude: '-1.2921',
        longitude: '36.8219'
    },
    openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday'
        ],
        opens: '08:00',
        closes: '18:00'
    },
    priceRange: 'KES 9,200 - 189,000/month',
    areaServed: [
        {
            '@type': 'City',
            name: 'Nairobi'
        },
        {
            '@type': 'City',
            name: 'Mombasa'
        },
        {
            '@type': 'City',
            name: 'Kisumu'
        },
        {
            '@type': 'Country',
            name: 'Kenya'
        }
    ]
};

export const faqSchema = (faqs) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer
        }
    }))
});

export const breadcrumbSchema = (items) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url
    }))
});

export default SEOHead;