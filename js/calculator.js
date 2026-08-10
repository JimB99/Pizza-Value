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
 * @property {number} edibleRadiusCm
 * @property {number} edibleDiameterCm
 * @property {number} totalAreaCm2
 * @property {number} edibleAreaCm2
 * @property {number} crustAreaCm2
 * @property {number} ediblePercent
 * @property {number} pricePerTotalCm2
 * @property {number} pricePerEdibleCm2
 */

/**
 * @typedef {Object} ComparisonResult
 * @property {boolean} valid
 * @property {string[]} errors
 * @property {PizzaResult|null} pizzaA
 * @property {PizzaResult|null} pizzaB
 * @property {'A'|'B'|'tie'|null} edibleWinner
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
      edibleRadiusCm: 0,
      edibleDiameterCm: 0,
      totalAreaCm2: 0,
      edibleAreaCm2: 0,
      crustAreaCm2: 0,
      ediblePercent: 0,
      pricePerTotalCm2: 0,
      pricePerEdibleCm2: 0,
    };
  }

  const edibleRadiusCm = radiusCm - crustCm;
  const edibleDiameterCm = edibleRadiusCm * 2;
  const totalAreaCm2 = Math.PI * radiusCm ** 2;
  const edibleAreaCm2 = Math.PI * edibleRadiusCm ** 2;
  const crustAreaCm2 = totalAreaCm2 - edibleAreaCm2;
  const ediblePercent = totalAreaCm2 > 0 ? (edibleAreaCm2 / totalAreaCm2) * 100 : 0;

  return {
    valid: true,
    errors: [],
    label,
    diameterCm,
    priceEur,
    crustCm,
    radiusCm,
    edibleRadiusCm,
    edibleDiameterCm,
    totalAreaCm2,
    edibleAreaCm2,
    crustAreaCm2,
    ediblePercent,
    pricePerTotalCm2: priceEur / totalAreaCm2,
    pricePerEdibleCm2: priceEur / edibleAreaCm2,
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
      edibleWinner: null,
      totalWinner: null,
      verdictsDiffer: false,
    };
  }

  const edibleWinner = compareLowerIsBetter(
    resultA.pricePerEdibleCm2,
    resultB.pricePerEdibleCm2,
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
    edibleWinner,
    totalWinner,
    verdictsDiffer: edibleWinner !== totalWinner,
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
  const winnerPrice = winner === 'A' ? pizzaA.pricePerEdibleCm2 : pizzaB.pricePerEdibleCm2;
  const loserPrice = winner === 'A' ? pizzaB.pricePerEdibleCm2 : pizzaA.pricePerEdibleCm2;
  if (loserPrice <= 0) {
    return 0;
  }
  return ((loserPrice - winnerPrice) / loserPrice) * 100;
}
