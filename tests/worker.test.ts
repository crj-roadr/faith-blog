import { describe, expect, test } from "vitest"

import {
  handlePageViewRequest,
  normalizePageViewPath,
  type AnalyticsEnv,
} from "../src/worker"

class FakeD1Database {
  counts = new Map<string, number>()

  prepare() {
    return {
      bind: (path: string) => ({
        first: async () => {
          const views = (this.counts.get(path) ?? 0) + 1
          this.counts.set(path, views)
          return { views }
        },
      }),
    }
  }
}

function makeEnv(): AnalyticsEnv {
  return {
    ANALYTICS_DB: new FakeD1Database() as unknown as AnalyticsEnv["ANALYTICS_DB"],
    ASSETS: { fetch: async () => new Response("asset") },
  }
}

function makePageViewRequest(path: string): Request {
  return new Request("https://polyglow.realrip.com/api/page-view", {
    method: "POST",
    body: JSON.stringify({ path }),
  })
}

describe("normalizePageViewPath", () => {
  test("keeps only a normalized page pathname", () => {
    expect(
      normalizePageViewPath("https://polyglow.realrip.com/zh/posts/example/?utm=1#intro")
    ).toBe("/zh/posts/example/")
    expect(normalizePageViewPath("en/about")).toBe("/en/about/")
  })

  test("rejects API and static asset paths", () => {
    expect(normalizePageViewPath("/api/page-view")).toBeNull()
    expect(normalizePageViewPath("/favicon.svg")).toBeNull()
    expect(normalizePageViewPath("/_astro/app.abc123.js")).toBeNull()
  })
})

describe("handlePageViewRequest", () => {
  test("increments and returns page views for a valid page path", async () => {
    const env = makeEnv()

    const first = await handlePageViewRequest(makePageViewRequest("/zh/"), env)
    const second = await handlePageViewRequest(makePageViewRequest("/zh/"), env)

    await expect(first.json()).resolves.toEqual({ path: "/zh/", count: 1 })
    await expect(second.json()).resolves.toEqual({ path: "/zh/", count: 2 })
  })

  test("rejects non-POST requests", async () => {
    const response = await handlePageViewRequest(
      new Request("https://polyglow.realrip.com/api/page-view"),
      makeEnv()
    )

    expect(response.status).toBe(405)
  })
})
