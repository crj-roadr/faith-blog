import { describe, expect, test } from "vitest"

import { formatPageViewCount } from "../src/utils/page-view-counter"

describe("formatPageViewCount", () => {
  test("formats only the numeric text next to the project eye icon", () => {
    expect(formatPageViewCount(1234)).toBe("1,234")
    expect(formatPageViewCount(1234)).not.toContain("👁️")
    expect(formatPageViewCount(1234)).not.toContain("浏览量")
    expect(formatPageViewCount(1234)).not.toContain(" ")
  })
})
