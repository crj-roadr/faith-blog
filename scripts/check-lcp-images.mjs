import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join, relative } from "node:path"

const distDir = join(process.cwd(), "dist")

if (!existsSync(distDir)) {
  console.error("dist directory not found. Run `pnpm build` first.")
  process.exit(1)
}

const htmlFiles = []
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(path)
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      htmlFiles.push(path)
    }
  }
}

const attrValue = (tag, name) => {
  const match = tag.match(new RegExp(`\\s${name}=(["'])(.*?)\\1`, "i"))
  return match?.[2]
}

walk(distDir)

const failures = []
const homepagePattern = /^(en|zh|fr|es|ru|ja|ko|pt|de|id|ar)\/index\.html$/

const checkPriorityImage = (path, label, image) => {
  const src = attrValue(image, "src")
  const loading = attrValue(image, "loading")
  const fetchpriority = attrValue(image, "fetchpriority")

  if (!src) failures.push(`${path}: ${label} has no src`)
  if (loading === "lazy") failures.push(`${path}: ${label} is lazy loaded`)
  if (fetchpriority !== "high") {
    failures.push(`${path}: ${label} missing fetchpriority="high"`)
  }
}

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8")
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1]
  if (!main) continue

  const images = Array.from(main.matchAll(/<img\b[^>]*>/gi), (match) => match[0])
  const firstImage = images[0]
  if (!firstImage) continue

  const path = relative(distDir, file)
  checkPriorityImage(path, "first main image", firstImage)

  if (homepagePattern.test(path) && images[1]) {
    checkPriorityImage(path, "second homepage image", images[1])
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"))
  process.exit(1)
}

console.log(`LCP image check passed for ${htmlFiles.length} HTML files.`)
