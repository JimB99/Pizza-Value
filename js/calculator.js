const EPSILON = 1e-9;

/**
 * @typedef {Object} PizzaInput
 * @property {number} diameterCm
 * @property {number} priceEur
 * @property {number} crustCm
 * @property {string} [label]
 */

/**
 * @typedef {Object} PizzaResult
 * @property {boolean} valid
 * @property {string[]} errors
 * @property {string} label
 * @property {number} diameterCm
 * @property {number} priceEur
 * @property {number} crustCm
 * @property {number} radiusCm
 * @property {number} toppingRadiusCm
 * @property {number} toppingDiameterCm
 * @property {number} totalAreaCm2
 * @property {number} toppingAreaCm2
 * @property {number} crustAreaCm2
 * @property {number} toppingPercent
 * @property {number} pricePerTotalCm2
 * @property {number} pricePerToppingCm2
 */

/**
 * @typedef {Object} ComparisonResult
 * @property {boolean} valid
 * @property {string[]} errors
 * @property {PizzaResult|null} pizzaA
 * @property {PizzaResult|null} pizzaB
 * @property {'A'|'B'|'tie'|null} toppingWinner
 * @property {'A'|'B'|'tie'|null} totalWinner
 * @property {boolean} verdictsDiffer
 */

/**
 * @param {unknown} value
 * @returns {number|null}
 */
export function parseNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * @param {PizzaInput} input
 * @returns {PizzaResult}
 */
export function computePizza({ diameterCm, priceEur, crustCm, label = 'Pizza' }) {
  const errors = [];

  if (diameterCm === null || diameterCm <= 0) {
    errors.push('Diameter must be greater than 0');
  }
  if (priceEur === null || priceEur <= 0) {
    errors.push('Price must be greater than 0');
  }
  if (crustCm === null || crustCm < 0) {
    errors.push('Crust thickness cannot be negative');
  }

  const radiusCm = diameterCm !== null ? diameterCm / 2 : 0;
  if (crustCm !== null && diameterCm !== null && crustCm >= radiusCm) {
    errors.push('Crust thicker than pizza radius');
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
      label,
      diameterCm: diameterCm ?? 0,
      priceEur: priceEur ?? 0,
      crustCm: crustCm ?? 0,
      radiusCm: 0,
      toppingRadiusCm: 0,
      toppingDiameterCm: 0,
      totalAreaCm2: 0,
      toppingAreaCm2: 0,
      crustAreaCm2: 0,
      toppingPercent: 0,
      pricePerTotalCm2: 0,
      pricePerToppingCm2: 0,
    };
  }

  const toppingRadiusCm = radiusCm - crustCm;
  const toppingDiameterCm = toppingRadiusCm * 2;
  const totalAreaCm2 = Math.PI * radiusCm ** 2;
  const toppingAreaCm2 = Math.PI * toppingRadiusCm ** 2;
  const crustAreaCm2 = totalAreaCm2 - toppingAreaCm2;
  const toppingPercent = totalAreaCm2 > 0 ? (toppingAreaCm2 / totalAreaCm2) * 100 : 0;

  return {
    valid: true,
    errors: [],
    label,
    diameterCm,
    priceEur,
    crustCm,
    radiusCm,
    toppingRadiusCm,
    toppingDiameterCm,
    totalAreaCm2,
    toppingAreaCm2,
    crustAreaCm2,
    toppingPercent,
    pricePerTotalCm2: priceEur / totalAreaCm2,
    pricePerToppingCm2: priceEur / toppingAreaCm2,
  };
}

/**
 * @param {number} a
 * @param {number} b
 * @returns {'A'|'B'|'tie'}
 */
function compareLowerIsBetter(a, b) {
  const diff = a - b;
  if (Math.abs(diff) <= EPSILON) {
    return 'tie';
  }
  return diff < 0 ? 'A' : 'B';
}

/**
 * @param {PizzaInput} pizzaA
 * @param {PizzaInput} pizzaB
 * @returns {ComparisonResult}
 */
export function comparePizzas(pizzaA, pizzaB) {
  const resultA = computePizza({ ...pizzaA, label: pizzaA.label ?? 'Pizza A' });
  const resultB = computePizza({ ...pizzaB, label: pizzaB.label ?? 'Pizza B' });

  const errors = [...resultA.errors, ...resultB.errors];
  if (!resultA.valid || !resultB.valid) {
    return {
      valid: false,
      errors,
      pizzaA: resultA,
      pizzaB: resultB,
      toppingWinner: null,
      totalWinner: null,
      verdictsDiffer: false,
    };
  }

  const toppingWinner = compareLowerIsBetter(
    resultA.pricePerToppingCm2,
    resultB.pricePerToppingCm2,
  );
  const totalWinner = compareLowerIsBetter(
    resultA.pricePerTotalCm2,
    resultB.pricePerTotalCm2,
  );

  return {
    valid: true,
    errors: [],
    pizzaA: resultA,
    pizzaB: resultB,
    toppingWinner,
    totalWinner,
    verdictsDiffer: toppingWinner !== totalWinner,
  };
}

/**
 * @param {'A'|'B'|'tie'} winner
 * @param {PizzaResult} pizzaA
 * @param {PizzaResult} pizzaB
 * @returns {number}
 */
export function savingsPercent(winner, pizzaA, pizzaB) {
  if (winner === 'tie') {
    return 0;
  }
  const winnerPrice = winner === 'A' ? pizzaA.pricePerToppingCm2 : pizzaB.pricePerToppingCm2;
  const loserPrice = winner === 'A' ? pizzaB.pricePerToppingCm2 : pizzaA.pricePerToppingCm2;
  if (loserPrice <= 0) {
    return 0;
  }
  return ((loserPrice - winnerPrice) / loserPrice) * 100;
}
