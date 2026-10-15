# Mastra: `/api/openapi.json` contains unresolvable `$ref`s

Minimal reproduction for a Mastra bug: the OpenAPI document served at `/api/openapi.json` contains `$ref`s that don't resolve, so Swagger UI shows resolver errors and validators/client generators reject the spec.

Created with `npx create-mastra@latest --empty`. The only change is a custom route in `src/mastra/index.ts` whose response schema has a zod id (`.meta({ id: 'Invoice' })`). The built-in routes are already broken without it.

## Steps to reproduce

```bash
npm install
npm run dev
```

In another terminal:

```bash
npm run check
```

`scripts/check-openapi.mjs` fetches `http://localhost:4111/api/openapi.json`, counts the `$ref`s that don't resolve inside the document and validates it with `@apidevtools/swagger-parser`.

You can also open http://localhost:4111/swagger-ui and expand `POST /agents/{agentId}/generate`: Swagger UI shows a resolver error for `#/definitions/__schema0`.

## Actual behavior

```
openapi 3.1.0, components: false
$refs: 168, dangling: 168
dangling targets: #/definitions/__schema0, #/definitions/__schema1, #/definitions/__schema2, #/$defs/Invoice
swagger-parser: invalid (Missing $ref pointer "#/definitions/__schema0". Token "definitions" does not exist.)
```

Each route's zod schema is converted to JSON Schema on its own and embedded as is, so its nested `definitions` / `$defs` and the refs pointing to them end up somewhere `#` doesn't reach (`#` is the document root, which has no `definitions`, `$defs` or `components`).

## Expected behavior

All `$ref`s in `/api/openapi.json` resolve, so the spec works in Swagger UI and can be used directly with client generators.

## Environment

- @mastra/core 1.77.0, mastra CLI 1.34.1, zod 4.6.7
- Node v23.9.0, npm 10.9.2, macOS
