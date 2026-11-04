export default function manifest() {
    return {
        name: 'AI Powerd HR Management System (OMS)',
        short_name: 'OMS',
        description: 'A simple and easy to use office management system for HR and payroll management.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
            {
                src: '/assets/icons/196.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/assets/icons/512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}