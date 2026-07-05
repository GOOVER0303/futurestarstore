import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./components/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fef7ee", 100: "#fdedd3", 200: "#f9d7a5", 300: "#f5ba6d",
          400: "#f09332", 500: "#ed7912", 600: "#de5f08", 700: "#b84709",
          800: "#92380e", 900: "#762f0f", 950: "#401605",
        },
      },
    },
  },
  plugins: [],
};
export default config;
