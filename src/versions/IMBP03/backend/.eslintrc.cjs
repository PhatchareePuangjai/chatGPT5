module.exports = {
  env: {
    node: true,
    es2021: true
  },
  extends: ["eslint:recommended", "prettier"],
  parserOptions: {
    ecmaVersion: "latest"
  },
  rules: {
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
  }
};
