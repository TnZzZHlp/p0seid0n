# p0seid0n

Install p0seid0n UI components into a Vue and Tailwind v4 project. Components are
copied into your source tree, so you own them from the first write.

## Usage

```bash
# once per project: write components.json
npx p0seid0n init

# copy a component and everything it depends on
npx p0seid0n add button
```

`add` accepts three kinds of item:

```bash
p0seid0n add button                              # a name from the registry
p0seid0n add https://example.com/r/button.json    # a registry item URL
p0seid0n add ./vendor/button.json                 # a local item file
```

A dependency of a URL or file item is resolved next to its source, so a
self-hosted registry keeps working without being named on the command line.

## Requirements

- Node 20.19 or newer
- a `components.json` written by `init`
- `compilerOptions.paths` in `tsconfig.json` (including JSONC comments, `extends`,
  or Vite `references` such as `tsconfig.app.json`), for example `"@/*": ["./src/*"]`

`add` reads the alias mapping to decide where files go and rewrites `@/...`
imports inside installed `.vue` and `.ts` files to match your `aliases` when
customised. Without a path mapping the command stops rather than writing to a
guessed directory.

## Options

| Option             | Effect                                                                 |
| ------------------ | ---------------------------------------------------------------------- |
| `--cwd <dir>`      | project directory, defaults to the current one                         |
| `--registry <url>` | base used for item names; a directory works for offline runs           |
| `--overwrite`      | replace files whose content differs                                    |
| `--no-install`     | write files but skip the package manager; the command is still printed |
| `--force`          | replace an existing `components.json` (init only)                      |

## What gets written

| Item kind                       | Destination                                                                      |
| ------------------------------- | -------------------------------------------------------------------------------- |
| `registry:ui`                   | the `aliases.ui` directory, one folder per component                             |
| `registry:lib`                  | the `aliases.lib` directory (or `aliases.utils` for `lib/utils.ts`)              |
| `registry:file` with a `target` | relative to the alias root, or the project root when the target starts with `~/` |

A file that already exists with different content is never replaced silently: the
command lists it as a conflict, leaves it alone and exits non-zero.

## Exit codes

- `0` everything requested was written
- `1` a conflict, an unresolvable alias, a cycle in `registryDependencies`, a
  missing item or a failed dependency install

Files written before a failure are kept on purpose; a rollback could delete edits
you made yourself.
