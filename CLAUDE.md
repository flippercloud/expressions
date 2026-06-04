# Flipper Expressions

JSON Schema (`schemas/*.json`) and JS library for Flipper Expressions. The schemas are the canonical spec; the Ruby gem reimplements the expressions and vendors these schemas + examples for its tests.

## Keep flipper in sync when schemas or examples change

Any time `schemas/*.json` or `examples/*.json` change here, the vendored copies in the [flippercloud/flipper](https://github.com/flippercloud/flipper) gem must be re-synced and its specs re-run — otherwise Ruby and JS drift apart.

In a flipper checkout:

```sh
# Copies schemas/*.json and examples/*.json from this repo into flipper
# (lib/flipper/expression/schemas + spec/fixtures/expressions/examples).
# Defaults to a sibling ../expressions checkout; override with SOURCE.
rake expressions:vendor SOURCE=/path/to/expressions

# Then run flipper's specs to confirm Ruby agrees with the schema/examples.
bundle exec rspec spec/flipper/expression/schema_spec.rb
```

See the README's "Adding a new expression" section for the full cross-repo workflow.
