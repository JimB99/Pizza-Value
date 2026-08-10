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
  assert.equal(comparison.edibleWinner, 'tie');
  assert.equal(comparison.totalWinner, 'tie');
}

function testLargerPizzaWinsOnEdibleValue() {
  const comparison = comparePizzas(
    { diameterCm: 30, priceEur: 12, crustCm: 2 },
    { diameterCm: 35, priceEur: 15, crustCm: 2 },
  );
  assert.equal(comparison.valid, true);
  assert.equal(comparison.edibleWinner, 'B');
  assert.ok(comparison.pizzaB.pricePerEdibleCm2 < comparison.pizzaA.pricePerEdibleCm2);
}

function testThickCrustCanFlipWinner() {
  const comparison = comparePizzas(
    { diameterCm: 30, priceEur: 12, crustCm: 2 },
    { diameterCm: 35, priceEur: 15, crustCm: 6 },
  );
  assert.equal(comparison.valid, true);
  assert.equal(comparison.edibleWinner, 'A');
  assert.notEqual(comparison.edibleWinner, comparison.totalWinner);
}

function testCrustThickerThanRadiusFails() {
  const pizza = computePizza({ diameterCm: 20, priceEur: 10, crustCm: 12 });
  assert.equal(pizza.valid, false);
  assert.match(pizza.errors.join(' '), /radius/i);
}

function testEdibleAreaNeverExceedsTotalArea() {
  const pizza = computePizza({ diameterCm: 32, priceEur: 14, crustCm: 1.5 });
  assert.equal(pizza.valid, true);
  assert.ok(pizza.edibleAreaCm2 <= pizza.totalAreaCm2);
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
    comparison.edibleWinner,
    comparison.pizzaA,
    comparison.pizzaB,
  );
  assert.ok(savings > 0);
}

const tests = [
  testEqualPizzasTie,
  testLargerPizzaWinsOnEdibleValue,
  testThickCrustCanFlipWinner,
  testCrustThickerThanRadiusFails,
  testEdibleAreaNeverExceedsTotalArea,
  testInvalidInputsFail,
  testSavingsPercent,
];

for (const test of tests) {
  test();
}

console.log(`All ${tests.length} calculator tests passed.`);
