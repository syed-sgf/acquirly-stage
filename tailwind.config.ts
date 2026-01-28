import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}","./components/**/*.{ts,tsx}"],
    theme: { extend: {
        colors: { 
              brand: { 
                      green:{100:"#E6F5EE",500:"#16A34A",600:"#147D4E"}, 
                              gold:{500:"#C9A227"}, 
                                      slate:{600:"#475569",900:"#0F172A"} 
                                            }, 
                                                  bg:"#F8FAFC",
                                                        sgf: {
                                                                green: {
                                                                          50: '#E8F5E9',
                                                                                    100: '#C8E6C9',
                                                                                              200: '#A5D6A7',
                                                                                                        300: '#81C784',
                                                                                                                  400: '#66BB6A',
                                                                                                                            500: '#2E7D32',
                                                                                                                                      600: '#1B5E20',
                                                                                                                                                700: '#145214',
                                                                                                                                                          800: '#0D3D0F',
                                                                                                                                                                    900: '#082808',
                                                                                                                                                                            },
                                                                                                                                                                                    gold: {
                                                                                                                                                                                              50: '#FFF8E1',
                                                                                                                                                                                                        100: '#FFECB3',
                                                                                                                                                                                                                  200: '#FFE082',
                                                                                                                                                                                                                            300: '#FFD54F',
                                                                                                                                                                                                                                      400: '#FFCA28',
                                                                                                                                                                                                                                                500: '#D4AF37',
                                                                                                                                                                                                                                                          600: '#C9A227',
                                                                                                                                                                                                                                                                    700: '#B8860B',
                                                                                                                                                                                                                                                                              800: '#996515',
                                                                                                                                                                                                                                                                                        900: '#7A4F10',
                                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                                                      },
                                                                                                                                                                                                                                                                                                          },
                                                                                                                                                                                                                                                                                                              boxShadow:{ soft:"0 8px 30px rgba(0,0,0,0.06)" }, 
                                                                                                                                                                                                                                                                                                                  borderRadius:{ "2xl":"1rem" }
                                                                                                                                                                                                                                                                                                                    }},
                                                                                                                                                                                                                                                                                                                      plugins: []
                                                                                                                                                                                                                                                                                                                      };
                                                                                                                                                                                                                                                                                                                      export default config;
                                                                                                                                                                                                                                                                                                                      