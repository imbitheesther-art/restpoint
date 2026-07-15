import { Helmet } from 'react-helmet-async';

/**
 * SEO Head Component
 * Dynamically sets meta tags for each page
 */
const SEOHead = ({
    title = 'RestPoint - Funeral Management System',
    description = 'Professional funeral management and memorial services platform. Streamline operations, manage bookings, and provide compassionate care.',
    keywords = 'funeral, memorial, management, services, restpoint',
    image = '/og-image.png',
    url = '/',
    type = 'website'
}) => {
    const fullUrl = `https://restpoint.co.ke${url}`;
    const fullImageUrl = `https://restpoint.co.ke${image}`;

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{title}</title>
            <meta name="title" content={title} />
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={fullImageUrl} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:site_name" content="RestPoint" />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={fullUrl} />
            <meta property="twitter:title" content={title} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={fullImageUrl} />

            {/* Canonical URL */}
            <link rel="canonical" href={fullUrl} />

            {/* Language */}
            <html lang="en" />
        </Helmet>
    );
};

export default SEOHead;
export { SEOHead };