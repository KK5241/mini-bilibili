/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    // 配置自定义样式
    extend: {
      container: {
        center: true,
        padding: {
          DEFAULT: '165px'
        },
      },
    },
  },
  plugins: [],
}