/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#1E3A5F',
                    light: '#2C5282',
                    dark: '#162C47',
                },

                secondary: {
                    DEFAULT: '#F4F6F8',
                    dark: '#E5E7EB',
                },

                success: {
                    DEFAULT: '#2E7D32',
                    light: '#E8F5E9',
                    dark: '#1B5E20',
                },

                warning: {
                    DEFAULT: '#F57C00',
                    light: '#FFF3E0',
                    dark: '#E65100',
                },

                error: {
                    DEFAULT: '#C62828',
                    light: '#FFEBEE',
                    dark: '#8E0000',
                },

                text: {
                    DEFAULT: '#1F2937',
                    muted: '#6B7280',
                    light: '#9CA3AF',
                },

                surface: {
                    DEFAULT: '#FFFFFF',
                    muted: '#F4F6F8',
                },
            },
        },
    },
    plugins: [],
}
