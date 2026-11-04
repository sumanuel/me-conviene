import test from "node:test";
import assert from "node:assert/strict";
import {
  parseNumber, formatVes, formatUsd, formatPct, timeAgo,
} from "../src/logic/format.js";

test("parseNumber: formatos habituales", () => {
  assert.equal(parseNumber("75"), 75);
  assert.equal(parseNumber("1.100,50"), 1100.5);
  assert.equal(parseNumber("1100,5"), 1100.5);
  assert.equal(parseNumber("1100.5"), 1100.5);
  assert.equal(parseNumber("1.100"), 1100);
  assert.equal(parseNumber("100.000"), 100000);
  assert.equal(parseNumber("1.234.567"), 1234567);
  assert.equal(parseNumber("1,234.50"), 1234.5);
  assert.equal(parseNumber("0,5"), 0.5);
  assert.equal(parseNumber("Bs 2.500,00"), 2500);
});

test("parseNumber: vacío o basura → NaN", () => {
  assert.ok(Number.isNaN(parseNumber("")));
  assert.ok(Number.isNaN(parseNumber("abc")));
  assert.ok(Number.isNaN(parseNumber(null)));
});

test("formateo", () => {
  assert.equal(formatVes(208170), "Bs 208.170,00");
  assert.equal(formatVes(1333.333), "Bs 1.333,33");
  assert.equal(formatVes(82500, 0), "Bs 82.500");
  assert.equal(formatUsd(1387.8), "US$ 1,387.80");
  assert.equal(formatPct(17.456), "17,5 %");
});

test("timeAgo", () => {
  const now = 1_000_000_000;
  assert.equal(timeAgo(now - 20_000, now), "hace un momento");
  assert.equal(timeAgo(now - 5 * 60_000, now), "hace 5 min");
  assert.equal(timeAgo(now - 3 * 3_600_000, now), "hace 3 h");
  assert.equal(timeAgo(now - 86_400_000, now), "hace 1 día");
  assert.equal(timeAgo(0, now), "");
});

import { formatAmountInput } from "../src/logic/format.js";

test("formatAmountInput: miles mientras se escribe", () => {
  assert.equal(formatAmountInput("100000"), "100.000");
  assert.equal(formatAmountInput("1.0000", "1.000"), "10.000");
  assert.equal(formatAmountInput("1234567"), "1.234.567");
  assert.equal(formatAmountInput("75"), "75");
  assert.equal(formatAmountInput(""), "");
});

test("formatAmountInput: decimales", () => {
  assert.equal(formatAmountInput("1100,5"), "1.100,5");
  assert.equal(formatAmountInput("1100,567"), "1.100,56");
  assert.equal(formatAmountInput(","), "0,");
  assert.equal(formatAmountInput("1,2,3"), "1,23");
  // Un punto recién escrito (teclado sin coma) cuenta como decimal
  assert.equal(formatAmountInput("1.100.", "1.100"), "1.100,");
  assert.equal(formatAmountInput("0007"), "7");
});
