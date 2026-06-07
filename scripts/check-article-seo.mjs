import { existsSync, readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const htmlPath = join(root, "dist/en/posts/20150714-agiot/index.html")
const articleSourcePath = join(root, "src/pages/[lang]/posts/[...slug].astro")
const samplePostPath = join(root, "src/content/posts/en/20150714-agiot.mdx")

function fail(message) {
  throw new Error(message)
}

function attr(content, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const pattern = new RegExp(
    `<meta\\s+(?:name|property)=["']${escaped}["']\\s+content=["']([^"']+)["']`,
    "i"
  )
  return content.match(pattern)?.[1] ?? null
}

function jsonLdItems(content) {
  const match = content.match(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i
  )
  if (!match) fail("Missing application/ld+json script")
  return JSON.parse(match[1])
}

function frontmatterValue(content, key) {
  return content.match(new RegExp(`^${key}:\\s*["'](.+)["']\\s*$`, "m"))?.[1]
}

if (!existsSync(htmlPath)) {
  fail("Missing built sample article. Run `pnpm build` before this check.")
}

const html = readFileSync(htmlPath, "utf8")
const articleSource = readFileSync(articleSourcePath, "utf8")
const layoutSource = readFileSync(join(root, "src/layouts/main.astro"), "utf8")
const samplePost = readFileSync(samplePostPath, "utf8")
const expectedAlt = frontmatterValue(samplePost, "heroImageAlt")

if (!expectedAlt) fail("Sample post is missing heroImageAlt")

const requiredMeta = [
  "article:published_time",
  "article:modified_time",
  "article:author",
  "article:section",
]

for (const name of requiredMeta) {
  if (!attr(html, name)) fail(`Missing ${name} meta tag`)
}

const tagMatches = html.match(/<meta\s+property=["']article:tag["']\s+content=["'][^"']+["']/gi)
if (!tagMatches?.length) fail("Missing article:tag meta tags")

if (attr(html, "og:image:alt") !== expectedAlt) {
  fail("og:image:alt must use post heroImageAlt")
}

if (attr(html, "twitter:image:alt") !== expectedAlt) {
  fail("twitter:image:alt must use post heroImageAlt")
}

const items = jsonLdItems(html)
const article = items.find((item) => item["@type"] === "BlogPosting")
if (!article) fail("Missing BlogPosting JSON-LD item")
if (!article["@id"]?.endsWith("#article")) fail("BlogPosting JSON-LD needs stable @id")
if (!article.articleSection) fail("BlogPosting JSON-LD missing articleSection")
if (!Array.isArray(article.keywords) || article.keywords.length === 0) {
  fail("BlogPosting JSON-LD missing keywords")
}
if (!Number.isInteger(article.wordCount) || article.wordCount <= 0) {
  fail("BlogPosting JSON-LD missing positive wordCount")
}
if (article.thumbnailUrl !== attr(html, "og:image")) {
  fail("BlogPosting thumbnailUrl should match og:image")
}

const alternateMatches = [
  ...html.matchAll(/<link\s+rel=["']alternate["']\s+hreflang=["']([^"']+)["']\s+href=["']([^"']+)["']/gi),
]
if (!alternateMatches.length) fail("Missing hreflang alternates")

for (const [, hrefLang, href] of alternateMatches) {
  if (hrefLang === "x-default") continue
  const url = new URL(href)
  const localPath = join(root, "dist", url.pathname, "index.html")
  if (!existsSync(localPath)) {
    fail(`hreflang ${hrefLang} points to missing page: ${url.pathname}`)
  }
}

if (!articleSource.includes("canonicalOverride={post.data.canonical}")) {
  fail("Article page must pass post frontmatter canonical to Layout")
}

if (!layoutSource.includes("canonicalOverride ?? canonicalUrl(lang, path)")) {
  fail("Layout must prefer canonicalOverride over the generated canonical URL")
}

console.log("Article SEO checks passed")
