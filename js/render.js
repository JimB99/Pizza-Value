import { formatArea, formatCm, formatPercent, formatRatePerCm2 } from './format.js';

const PIZZA_COLORS = {
  crust: '#d4a574',
  crustStroke: '#b8894f',
  topping: '#c0392b',
  toppingStroke: '#922b21',
};

/**
 * @param {import('./calculator.js').PizzaResult} pizza
 * @param {number} maxDiameter
 * @param {number} size
 * @returns {string}
 */
export function renderPizzaSvg(pizza, maxDiameter, size = 180) {
  const padding = 16;
  const drawable = size - padding * 2;
  const scale = drawable / maxDiameter;
  const outerRadius = (pizza.diameterCm / 2) * scale;
  const innerRadius = pizza.toppingRadiusCm * scale;
  const cx = size / 2;
  const cy = size / 2;

  return `
    <svg class="pizza-svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="${pizza.label} cross section">
      <circle cx="${cx}" cy="${cy}" r="${outerRadius}" fill="${PIZZA_COLORS.crust}" stroke="${PIZZA_COLORS.crustStroke}" stroke-width="1.5" />
      <circle cx="${cx}" cy="${cy}" r="${innerRadius}" fill="${PIZZA_COLORS.topping}" stroke="${PIZZA_COLORS.toppingStroke}" stroke-width="1.5" />
      <text x="${cx}" y="${size - 4}" text-anchor="middle" class="svg-label">${pizza.label}</text>
    </svg>
    <dl class="pizza-svg-meta">
      <div><dt>Diameter</dt><dd>${formatCm(pizza.diameterCm)}</dd></div>
      <div><dt>Crust</dt><dd>${formatCm(pizza.crustCm)}</dd></div>
      <div><dt>Topping Ø</dt><dd>${formatCm(pizza.toppingDiameterCm)}</dd></div>
    </dl>
  `;
}

/**
 * @param {import('./calculator.js').ComparisonResult} comparison
 * @returns {string}
 */
export function renderPizzaComparison(comparison) {
  if (!comparison.valid || !comparison.pizzaA || !comparison.pizzaB) {
    return '';
  }

  const maxDiameter = Math.max(
    comparison.pizzaA.diameterCm,
    comparison.pizzaB.diameterCm,
  );

  return `
    <div class="pizza-visual-grid">
      <div class="pizza-visual-card">
        ${renderPizzaSvg(comparison.pizzaA, maxDiameter)}
      </div>
      <div class="pizza-visual-card">
        ${renderPizzaSvg(comparison.pizzaB, maxDiameter)}
      </div>
    </div>
  `;
}

/**
 * @param {import('./calculator.js').ComparisonResult} comparison
 * @returns {string}
 */
export function renderValueBarChart(comparison) {
  if (!comparison.valid || !comparison.pizzaA || !comparison.pizzaB) {
    return '';
  }

  const { pizzaA, pizzaB, toppingWinner } = comparison;
  const maxRate = Math.max(pizzaA.pricePerToppingCm2, pizzaB.pricePerToppingCm2);
  const width = 280;
  const barMaxWidth = width - 90;

  const barA = (pizzaA.pricePerToppingCm2 / maxRate) * barMaxWidth;
  const barB = (pizzaB.pricePerToppingCm2 / maxRate) * barMaxWidth;

  const ghostMax = Math.max(pizzaA.pricePerTotalCm2, pizzaB.pricePerTotalCm2);
  const ghostA = (pizzaA.pricePerTotalCm2 / ghostMax) * barMaxWidth;
  const ghostB = (pizzaB.pricePerTotalCm2 / ghostMax) * barMaxWidth;

  return `
    <section class="chart-card" aria-label="Price per topping area comparison">
      <h3>Price per topping cm²</h3>
      <p class="chart-note">Shorter bar = better value. Faint bars show full-area rate (ignoring crust).</p>
      <svg viewBox="0 0 ${width} 110" width="100%" height="110" role="img">
        <text x="0" y="18" class="svg-axis">A</text>
        <rect x="24" y="6" width="${ghostA}" height="8" class="bar-ghost" rx="4" />
        <rect x="24" y="18" width="${barA}" height="16" class="bar ${toppingWinner === 'A' ? 'bar-winner' : ''}" rx="6" />
        <text x="${width - 4}" y="30" text-anchor="end" class="svg-value">${formatRatePerCm2(pizzaA.pricePerToppingCm2)}</text>

        <text x="0" y="68" class="svg-axis">B</text>
        <rect x="24" y="56" width="${ghostB}" height="8" class="bar-ghost" rx="4" />
        <rect x="24" y="68" width="${barB}" height="16" class="bar ${toppingWinner === 'B' ? 'bar-winner' : ''}" rx="6" />
        <text x="${width - 4}" y="80" text-anchor="end" class="svg-value">${formatRatePerCm2(pizzaB.pricePerToppingCm2)}</text>
      </svg>
    </section>
  `;
}

/**
 * @param {import('./calculator.js').PizzaResult} pizza
 * @param {number} width
 * @returns {string}
 */
function renderShareBar(pizza, width = 280) {
  const toppingWidth = (pizza.toppingPercent / 100) * width;
  const crustWidth = width - toppingWidth;

  return `
    <div class="share-row">
      <span class="share-label">${pizza.label}</span>
      <svg viewBox="0 0 ${width} 18" width="100%" height="18" role="img" aria-label="${pizza.label} topping share">
        <rect x="0" y="0" width="${toppingWidth}" height="18" class="share-topping" rx="4" />
        <rect x="${toppingWidth}" y="0" width="${crustWidth}" height="18" class="share-crust" rx="4" />
      </svg>
      <span class="share-value">${formatPercent(pizza.toppingPercent)} topping</span>
    </div>
  `;
}

/**
 * @param {import('./calculator.js').ComparisonResult} comparison
 * @returns {string}
 */
export function renderToppingShareChart(comparison) {
  if (!comparison.valid || !comparison.pizzaA || !comparison.pizzaB) {
    return '';
  }

  return `
    <section class="chart-card" aria-label="Topping area share">
      <h3>Topping vs crust area</h3>
      ${renderShareBar(comparison.pizzaA)}
      ${renderShareBar(comparison.pizzaB)}
    </section>
  `;
}

/**
 * @param {import('./calculator.js').PizzaResult} pizza
 * @returns {string}
 */
export function renderStatsCard(pizza, isWinner) {
  return `
    <article class="stats-card ${isWinner ? 'stats-card-winner' : ''}">
      <h3>${pizza.label}</h3>
      <dl class="stats-list">
        <div><dt>Total area</dt><dd>${formatArea(pizza.totalAreaCm2)}</dd></div>
        <div><dt>Topping area</dt><dd>${formatArea(pizza.toppingAreaCm2)}</dd></div>
        <div><dt>Crust area</dt><dd>${formatArea(pizza.crustAreaCm2)}</dd></div>
        <div><dt>Topping share</dt><dd>${formatPercent(pizza.toppingPercent)}</dd></div>
        <div><dt>Price / topping cm²</dt><dd>${formatRatePerCm2(pizza.pricePerToppingCm2)}</dd></div>
        <div><dt>Price / total cm²</dt><dd>${formatRatePerCm2(pizza.pricePerTotalCm2)}</dd></div>
      </dl>
    </article>
  `;
}
