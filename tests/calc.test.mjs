import test from "node:test";
import assert from "node:assert/strict";
import { compare } from "../src/logic/calc.js";

const close = (a, b, eps = 0.01) =>
  assert.ok(Math.abs(a - b) <= eps, `${a} no está cerca de ${b}`);

test("buy: comprar dólares a 1.100 conviene (ejemplo base)", () => {
  const r = compare({ mode: "buy", priceVes: 100000, priceUsd: 75, rate: 1100 });
  assert.equal(r.winner, "usd");
  assert.equal(r.unit, "VES");
  close(r.costUsd, 82500);
  close(r.costVes, 100000);
  close(r.savings, 17500);
  close(r.savingsPct, 17.5);
  close(r.breakEven, 1333.33);
  close(r.impliedRate, 1333.33);
});

test("buy: con la tasa por encima del equilibrio conviene pagar en Bs", () => {
  const r = compare({ mode: "buy", priceVes: 100000, priceUsd: 75, rate: 1400 });
  assert.equal(r.winner, "ves");
  close(r.savings, 5000);
  close(r.savingsPct, 4.76);
});

test("buy: comisión e IGTF mueven la tasa de equilibrio", () => {
  const r = compare({
    mode: "buy", priceVes: 100000, priceUsd: 75, rate: 1100,
    commissionPct: 2, igtfPct: 3,
  });
  close(r.breakEven, 100000 / (75 * 1.03 * 1.02), 0.001);
  close(r.costUsd, 75 * 1.03 * 1100 * 1.02, 0.001);
});

test("buy: justo en el equilibrio es empate", () => {
  const r = compare({ mode: "buy", priceVes: 100000, priceUsd: 75, rate: 100000 / 75 });
  assert.equal(r.winner, "tie");
});

test("have: vender dólares barato → pagar en USD", () => {
  const r = compare({ mode: "have", priceVes: 100000, priceUsd: 75, rate: 1000 });
  assert.equal(r.unit, "USD");
  assert.equal(r.winner, "usd");
  close(r.costVes, 100); // habría que vender US$ 100 para juntar los Bs
  close(r.costUsd, 75);
  close(r.savings, 25);
  close(r.savingsPct, 25);
});

test("have: vender dólares caro → pagar en Bs", () => {
  const r = compare({ mode: "have", priceVes: 100000, priceUsd: 75, rate: 1400 });
  assert.equal(r.winner, "ves");
  close(r.costVes, 71.43);
  close(r.savings, 3.57);
});

test("have: la comisión de venta encarece la opción Bs", () => {
  const r = compare({
    mode: "have", priceVes: 100000, priceUsd: 75, rate: 1400, commissionPct: 10,
  });
  close(r.costVes, 100000 / (1400 * 0.9), 0.001);
  assert.equal(r.winner, "usd"); // 79,37 > 75
});

test("datos incompletos o inválidos → null", () => {
  assert.equal(compare({ priceVes: 0, priceUsd: 75, rate: 1100 }), null);
  assert.equal(compare({ priceVes: 100, priceUsd: NaN, rate: 1100 }), null);
  assert.equal(compare({ priceVes: 100, priceUsd: 1, rate: 0 }), null);
  assert.equal(
    compare({ mode: "have", priceVes: 100, priceUsd: 1, rate: 10, commissionPct: 100 }),
    null,
  );
});
