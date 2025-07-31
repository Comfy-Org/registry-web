/** @type {import('tailwindcss').Config} */
module.exports = {
    // important: true,
    darkMode: 'class',
    content: [
        './pages/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
        'node_modules/flowbite-react/lib/esm/**/*.js',
    ],
    theme: {
        extend: {},
        colors: {
            'button-rose': '#E6BCB5',
            'button-grass': '#E4E3AC',
            'button-sky': '#B8C8CB',
            'background-tint': '#FAF7F2',
            'comfy-bg': '#202020',
            'secondary-dirt': '#EDDCC0',
            'secondary-pink': '#FFD3B8',
            'secondary-grey': '#D9D9D9',
            'black-regular': '#000000',
            'primary-regular': '#1A56DB',
            'primary-dark': '#C76D7E',
            black: '#000000',
            'grey-regular': '#2D353F',
            'bright-charcoal': '#A4C4D2',
            primary: '#1A56DB',
            'gray-300': '#D1D5DB',
            // don't import tailwindcss/colors as it's default in Tailwind CSS v3
        },
        fontFamily: {
            sans: ['"Inter"', 'sans-serif'],
            title: ['"Inter"', 'sans-serif'],
        },
        fontWeight: {
            'extra-light': 100,
            thin: 200,
            light: 300,
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
            'extra-bold': 800,
            black: 900,
        },
        screens: {
            xs: '320px',
            sm: '640px',
            // => @media (min-width: 640px) { ... }

            md: '768px',
            // => @media (min-width: 768px) { ... }

            lg: '1024px',
            // => @media (min-width: 1024px) { ... }

            xl: '1280px',
            // => @media (min-width: 1280px) { ... }

            '2xl': '1536px',
            // => @media (min-width: 1536px) { ... }
        },
    },
    plugins: [require('flowbite/plugin')],
}
