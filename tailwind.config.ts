import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}","./components/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { brand: { green:{100:"#E6F5EE",500:"#16A34A",600:"#147D4E"}, gold:{500:"#C9A227"}, slate:{600:"#475569",900:"#0F172A"} }, bg:"#F8FAFC" },
    boxShadow:{ soft:"0 8px 30px rgba(0,0,0,0.06)" }, borderRadius:{ "2xl":"1rem" }
  }},
  plugins: []
};
export default config;
