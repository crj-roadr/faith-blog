import assert from "node:assert/strict"
import test from "node:test"

import { getPrimaryNavigationKey } from "../src/utils/navigation.ts"

test("marks category routes and their pagination", () => {
  assert.equal(getPrimaryNavigationKey("/category/startup/"), "startup")
  assert.equal(getPrimaryNavigationKey("/category/invest/2/"), "invest")
  assert.equal(getPrimaryNavigationKey("/category/life/12/"), "life")
})

test("marks only article list routes as posts", () => {
  assert.equal(getPrimaryNavigationKey("/posts/"), "posts")
  assert.equal(getPrimaryNavigationKey("/posts/2/"), "posts")
  assert.equal(getPrimaryNavigationKey("/posts/an-article/"), undefined)
})

test("leaves unrelated routes without a primary current item", () => {
  for (const path of [
    "/",
    "/category/",
    "/tags/risk/",
    "/search/",
    "/404/",
  ]) {
    assert.equal(getPrimaryNavigationKey(path), undefined)
  }
})
