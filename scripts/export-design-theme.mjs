import { execFileSync } from "node:child_process"
import { writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm"

const exported = execFileSync(
  pnpm,
  ["dlx", "@google/design.md", "export", "--format", "tailwind", "DESIGN.md"],
  {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  }
)

const data = JSON.parse(exported)
const extend = data.theme?.extend ?? {}

function kebab(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/_/g, "-")
    .toLowerCase()
}

function declaration(name, value) {
  return `  ${name}: ${value};`
}

const lines = [
  "/* Generated from DESIGN.md by `pnpm design:theme`. Do not edit manually. */",
  "@theme {",
]

for (const [name, value] of Object.entries(extend.colors ?? {})) {
  lines.push(declaration(`--color-${kebab(name)}`, value))
}

for (const [name, value] of Object.entries(extend.fontFamily ?? {})) {
  const font = Array.isArray(value) ? value.join(", ") : value
  lines.push(declaration(`--font-${kebab(name)}`, font))
}

for (const [name, value] of Object.entries(extend.fontSize ?? {})) {
  const [size, options = {}] = Array.isArray(value) ? value : [value, {}]
  const key = kebab(name)
  lines.push(declaration(`--text-${key}`, size))
  if (options.lineHeight) {
    lines.push(declaration(`--leading-${key}`, options.lineHeight))
  }
  if (options.letterSpacing) {
    lines.push(declaration(`--tracking-${key}`, options.letterSpacing))
  }
  if (options.fontWeight) {
    lines.push(declaration(`--font-weight-${key}`, options.fontWeight))
  }
}

for (const [name, value] of Object.entries(extend.borderRadius ?? {})) {
  lines.push(declaration(`--radius-${kebab(name)}`, value))
}

for (const [name, value] of Object.entries(extend.spacing ?? {})) {
  lines.push(declaration(`--spacing-${kebab(name)}`, value))
}

lines.push("}", "")

writeFileSync(resolve(root, "src/styles/design-theme.css"), lines.join("\n"))
