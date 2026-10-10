import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTs,
  { ignores: ["out/**", ".next/**", ".next-*/**", "scripts/images/out/**", "design/**", "docs/**"] },
  {
    // React Compiler strictness: hydration-time state init and pointer refs are deliberate in this prototype
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/immutability": "warn",
    },
  },
];
export default config;
