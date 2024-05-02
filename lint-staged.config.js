export default {
  "api/**/*.ts?(x)": () => "npm run tsc",
  "*.{ts,tsx}": ["npm run format --", "npm run lint --"],
  "*.md": "npm run format --list-different",
};
