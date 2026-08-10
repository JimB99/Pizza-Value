import assert from 'node:assert/strict';
import {
  comparePizzas,
  computePizza,
  savingsPercent,
} from '../js/calculator.js';

function testEqualPizzasTie() {
  const comparison = comparePizzas(
    { diameterCm: 30, priceEur: 12, crustCm: 2 },
    { diameterCm: 30, priceEur: 12, crustCm: 2 },
  );
  assert.equal(comparison.valid, true);
  assert.equal(comparison.toppingWinner, 'tie');
  assert.equal(comparison.totalWinner, 'tie');
}

function testLargerPizzaWinsOnToppingValue() {
  const comparison = comparePizzas(
    { diameterCm: 30, priceEur: 12, crustCm: 2 },
    { diameterCm: 35, priceEur: 15, crustCm: 2 },
  );
  assert.equal(comparison.valid, true);
  assert.equal(comparison.toppingWinner, 'B');
  assert.ok(comparison.pizzaB.pricePerToppingCm2 < comparison.pizzaA.pricePerToppingCm2);
}

function testThickCrustCanFlipWinner() {
  const comparison = comparePizzas(
    { diameterCm: 30, priceEur: 12, crustCm: 2 },
    { diameterCm: 35, priceEur: 15, crustCm: 6 },
  );
  assert.equal(comparison.valid, true);
  assert.equal(comparison.toppingWinner, 'A');
  assert.notEqual(comparison.toppingWinner, comparison.totalWinner);
}

function testCrustThickerThanRadiusFails() {
  const pizza = computePizza({ diameterCm: 20, priceEur: 10, crustCm: 12 });
  assert.equal(pizza.valid, false);
  assert.match(pizza.errors.join(' '), /radius/i);
}

function testToppingAreaNeverExceedsTotalArea() {
  const pizza = computePizza({ diameterCm: 32, priceEur: 14, crustCm: 1.5 });
  assert.equal(pizza.valid, true);
  assert.ok(pizza.toppingAreaCm2 <= pizza.totalAreaCm2);
}

function testInvalidInputsFail() {
  const comparison = comparePizzas(
    { diameterCm: 0, priceEur: 12, crustCm: 2 },
    { diameterCm: 35, priceEur: 15, crustCm: 2 },
  );
  assert.equal(comparison.valid, false);
  assert.ok(comparison.errors.length > 0);
}

function testSavingsPercent() {
  const comparison = comparePizzas(
    { diameterCm: 30, priceEur: 12, crustCm: 2 },
    { diameterCm: 35, priceEur: 15, crustCm: 2 },
  );
  assert.equal(comparison.valid, true);
  const savings = savingsPercent(
    comparison.toppingWinner,
    comparison.pizzaA,
    comparison.pizzaB,
  );
  assert.ok(savings > 0);
}

const tests = [
  testEqualPizzasTie,
  testLargerPizzaWinsOnToppingValue,
  testThickCrustCanFlipWinner,
  testCrustThickerThanRadiusFails,
  testToppingAreaNeverExceedsTotalArea,
  testInvalidInputsFail,
  testSavingsPercent,
];

for (const test of tests) {
  test();
}

console.log(`All ${tests.length} calculator tests passed.`);
