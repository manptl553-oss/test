/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        maastrichtblue: "#0b1739",
        primary: "#7ec040",
        charcoal: "#343b4f",
        gunmetal: "#293138",
      },
      boxShadow: {
        sidebar: "0 8px 28px rgba(35, 54, 112, 0.3)",
        inputout: "-1px 3px 11px 0px #0000002b",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

