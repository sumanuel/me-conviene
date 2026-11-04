import test from "node:test";
import assert from "node:assert/strict";
import { compare } from "../src/logic/calc.js";
import { buildShareText } from "../src/logic/share.js";

test("texto para compartir (ejemplo base)", () => {
  const result = compare({ mode: "buy", priceVes: 100000, priceUsd: 75, rate: 1100 });
  const t = buildShareText({
    result, mode: "buy", priceVes: 100000, priceUsd: 75, rate: 1100, source: "binance",
  });
  assert.match(t, /Me conviene pagar en dólares/);
  assert.match(t, /Bs 17\.500,00 \(17,5 %\)/);
  assert.match(t, /Bs 1\.333,33/);
  assert.match(t, /Binance/);
  assert.equal(buildShareText({ result: null }), "");
});

test("texto para compartir con precio de lista en USD y tasa BCV", () => {
  const result = compare({ mode: "buy", priceVes: 89322, priceUsd: 75, rate: 1013 });
  const t = buildShareText({
    result, mode: "buy", priceVes: 89322, priceUsd: 75, rate: 1013, source: "binance",
    listUsd: 100, storeRate: 893.22, storeRateLabel: "BCV",
  });
  assert.match(t, /Precio de lista: US\$ 100\.00 a tasa BCV Bs 893,22/);
  assert.match(t, /Precio en Bs: Bs 89\.322,00/);
  assert.match(t, /con descuento/);
});
