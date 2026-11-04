// File: tailwind.config.mjs
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // or your actual source folders
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    // add more if needed
  ],
  theme: {
    extend: {
      screens: {
        xs: "480px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        slidIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
        fadeOut: 'fadeOut 0.3s ease-out',
        slideIn: 'slidIn 0.3s ease-out',
      },
      backdropBlur: {
        sm: '2px',
        DEFAULT: '4px',
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
      },
      variants: {
        extend: {
          opacity: ['responsive', 'hover', 'focus', 'group-hover'],
          transform: ['responsive', 'hover', 'focus', 'group-hover'],
        },
      },
    },
  },
  plugins: [
    // require("flowbite/plugin"),
    // require("flowbite-react/plugin"), // if required by your setup
  ],
  // safelist: [
  //     'btn',
  //     'btn-primary',
  //     'btn-secondary',
  //     'btn-danger',
  //     'btn-success',
  //     'btn-info',
  //     'btn-warning',
  //     'btn-xs',
  //     'btn-sm',
  //     'btn-md',
  //     'btn-lg',
  //     'btn-xl',
  //     'btn-2xl',
  //     'btn-rounded',
  // ],
};
