# Flipper Expressions

> A schema for Flipper Expressions

The structure for flipper Expressions is defined in [`schemas/schema.json`](./schemas/schema.json) using [JSON Schema](https://json-schema.org) ([draft-07](https://json-schema.org/specification-links.html#draft-7)).

To learn more about JSON Schema, read [Understanding JSON Schema](https://json-schema.org/understanding-json-schema/) or the [Ajv JSON schema validator docs](https://ajv.js.org/json-schema.html).

## Adding a new expression

1. Describe arguments by creating a new file in [`schemas/`](schemas/) named `NewName.schema.json`. You can copy an existing function that has similar semantics to get started.
2. Add the new function in [`schemas/schema.json`](schemas/schema.json) to `definitions/function`.
3. Create a new file in [`examples/`](./examples) named `NewName.json` with valid and invalid examples for the new function. See other examples for inspiration.
4. Run `yarn test` and ensure tests pass.

Implement the expression in [@flippercloud/flipper](https://github.com/flippercloud/flipper):

1. Add `lib/flipper/expressions/new_name.rb` to [@flippercloud/flipper](https://github.com/flippercloud/flipper/tree/main/lib/flipper/expressions).
2. Run `rspec` to ensure tests pass.

See [this commit that adds Min/Max functions](https://github.com/jnunemaker/flipper/commit/ee46fab0cda21a32c3a921a8ed1fb94b0842b6b4) for a concrete example.

## Releasing

Published to npm as [`@flippercloud/expressions`](https://www.npmjs.com/package/@flippercloud/expressions).

1. Install dependencies if you haven't: `npm install`. **This is required** — without `node_modules`, `npm run build` resolves `vite` from your `PATH` (e.g. a `vite_ruby` shim) instead of the project's Vite, and the build fails with confusing Ruby errors.
2. Bump `version` in [`package.json`](./package.json).
3. Publish: `npm publish`. The build runs automatically (via `prepack`/`prepare`), and `publishConfig.access` is set to `public`, so no `--access public` flag is needed.
4. Verify: `npm view @flippercloud/expressions version` should match the version you bumped to.
5. Tag the release: `git tag v$(node -p "require('./package.json').version")` and `git push --tags`.

### Authentication

The `@flippercloud` org requires two-factor auth to publish. If you have a TOTP authenticator, `npm publish --otp=<code>` works. If you only have a passkey (no TOTP code), create a [granular access token](https://www.npmjs.com/settings/~/tokens) with **read/write** on the `@flippercloud` scope and **"bypass two-factor authentication"** enabled, then put it in `~/.npmrc`:

```
//registry.npmjs.org/:_authToken=npm_xxxxxxxx
```

Never commit a token — keep it in `~/.npmrc`, not the project's `.npmrc`.
