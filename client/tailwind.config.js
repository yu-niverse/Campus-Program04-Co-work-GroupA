/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
    theme: {
        screens: {
            "2xs": "360px",
            xs: "480px",
            sm: "640px",
            md: "786px",
            lg: "1024px",
            xl: "1280px",
            "2xl": "1536px",
        },
        extend: {
            colors: {
                primary: "#8B572A",
                gray: "#828282",
                lightBlack: "#3F3A3A",
            },
        },
    },
    plugins: [require("@tailwindcss/forms")],
};
