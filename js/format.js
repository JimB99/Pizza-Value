const euroFormatter = new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const areaFormatter = new Intl.NumberFormat('nl-NL', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const percentFormatter = new Intl.NumberFormat('nl-NL', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const rateFormatter = new Intl.NumberFormat('nl-NL', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});

/**
 * @param {number} value
 * @returns {string}
 */
export function formatEuro(value) {
  return euroFormatter.format(value);
}

/**
 * @param {number} value
 * @returns {string}
 */
export function formatArea(value) {
  return `${areaFormatter.format(value)} cm²`;
}

/**
 * @param {number} value
 * @returns {string}
 */
export function formatPercent(value) {
  return `${percentFormatter.format(value)}%`;
}

/**
 * @param {number} value
 * @returns {string}
 */
export function formatRatePerCm2(value) {
  return `€${rateFormatter.format(value)}/cm²`;
}

/**
 * @param {number} value
 * @returns {string}
 */
export function formatCm(value) {
  return `${areaFormatter.format(value)} cm`;
}
