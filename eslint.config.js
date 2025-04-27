import tseslint from "typescript-eslint";

export default tseslint.config({
    files: ["src/**/*.ts", "stacks/**/*.ts", "sst.config.ts"],
    ignores: ["node_modules/**"],
    languageOptions: {
        parser: tseslint.parser,
        parserOptions: {
            sourceType: "module",
        },
    },
    plugins: {
        "@typescript-eslint": tseslint.plugin,
    },
    rules: {
        semi: ["error", "always"],
        quotes: ["error", "double"],
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": ["warn"],
        "no-console": "off"
    }
});
