import { comparePizzas, parseNumber, savingsPercent } from './js/calculator.js';
import { formatRatePerCm2 } from './js/format.js';
import {
  renderToppingShareChart,
  renderPizzaComparison,
  renderStatsCard,
  renderValueBarChart,
} from './js/render.js';

const STORAGE_KEY = 'pizza-value-inputs';

const DEFAULTS = {
  A: { diameter: 30, price: 12, crust: 2 },
  B: { diameter: 35, price: 15, crust: 2 },
};

const verdictPrimary = document.getElementById('verdict-primary');
const verdictSecondary = document.getElementById('verdict-secondary');
const validationErrors = document.getElementById('validation-errors');
const visualizations = document.getElementById('visualizations');
const statsGrid = document.getElementById('stats-grid');
const resetBtn = document.getElementById('reset-btn');

/**
 * @param {'A'|'B'} key
 * @returns {HTMLInputElement[]}
 */
function getInputs(key) {
  const card = document.querySelector(`.pizza-card[data-pizza="${key}"]`);
  if (!card) {
    return [];
  }
  return /** @type {HTMLInputElement[]} */ ([
    card.querySelector('input[name="diameter"]'),
    card.querySelector('input[name="price"]'),
    card.querySelector('input[name="crust"]'),
  ]);
}

/**
 * @param {'A'|'B'} key
 * @returns {{ diameterCm: number|null, priceEur: number|null, crustCm: number|null }}
 */
function readPizzaInput(key) {
  const [diameter, price, crust] = getInputs(key);
  return {
    diameterCm: parseNumber(diameter.value),
    priceEur: parseNumber(price.value),
    crustCm: parseNumber(crust.value),
  };
}

/**
 * @param {'A'|'B'} key
 * @param {{ diameter: number, price: number, crust: number }} values
 */
function setPizzaInput(key, values) {
  const [diameter, price, crust] = getInputs(key);
  diameter.value = String(values.diameter);
  price.value = String(values.price);
  crust.value = String(values.crust);
}

function saveInputs() {
  const payload = {
    A: {
      diameter: getInputs('A')[0].value,
      price: getInputs('A')[1].value,
      crust: getInputs('A')[2].value,
    },
    B: {
      diameter: getInputs('B')[0].value,
      price: getInputs('B')[1].value,
      crust: getInputs('B')[2].value,
    },
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function loadInputs() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return;
  }

  try {
    const saved = JSON.parse(raw);
    if (saved.A) {
      setPizzaInput('A', {
        diameter: saved.A.diameter ?? DEFAULTS.A.diameter,
        price: saved.A.price ?? DEFAULTS.A.price,
        crust: saved.A.crust ?? DEFAULTS.A.crust,
      });
    }
    if (saved.B) {
      setPizzaInput('B', {
        diameter: saved.B.diameter ?? DEFAULTS.B.diameter,
        price: saved.B.price ?? DEFAULTS.B.price,
        crust: saved.B.crust ?? DEFAULTS.B.crust,
      });
    }
  } catch {
    // Ignore invalid saved state.
  }
}

/**
 * @param {'A'|'B'} key
 * @param {string[]} errors
 */
function setFieldError(key, errors) {
  const errorEl = document.querySelector(`[data-error-for="${key}"]`);
  if (!errorEl) {
    return;
  }
  if (errors.length === 0) {
    errorEl.hidden = true;
    errorEl.textContent = '';
    return;
  }
  errorEl.hidden = false;
  errorEl.textContent = errors.join(' ');
}

/**
 * @param {import('./js/calculator.js').ComparisonResult} comparison
 */
function renderVerdict(comparison) {
  verdictSecondary.hidden = true;
  validationErrors.hidden = true;

  if (!comparison.valid) {
    verdictPrimary.textContent = 'Enter valid values for both pizzas to compare.';
    verdictPrimary.className = 'verdict verdict-primary is-tie';

    setFieldError('A', comparison.pizzaA?.errors ?? []);
    setFieldError('B', comparison.pizzaB?.errors ?? []);

    validationErrors.hidden = false;
    validationErrors.innerHTML = `<ul>${comparison.errors.map((error) => `<li>${error}</li>`).join('')}</ul>`;
    visualizations.innerHTML = '';
    statsGrid.innerHTML = '';
    return;
  }

  setFieldError('A', []);
  setFieldError('B', []);

  const { pizzaA, pizzaB, toppingWinner, totalWinner, verdictsDiffer } = comparison;
  if (!pizzaA || !pizzaB) {
    return;
  }

  if (toppingWinner === 'tie') {
    verdictPrimary.textContent = 'Both pizzas offer the same topping value.';
    verdictPrimary.className = 'verdict verdict-primary is-tie';
  } else {
    const winner = toppingWinner === 'A' ? pizzaA : pizzaB;
    const loser = toppingWinner === 'A' ? pizzaB : pizzaA;
    const savings = savingsPercent(toppingWinner, pizzaA, pizzaB);
    verdictPrimary.className = 'verdict verdict-primary';
    verdictPrimary.textContent =
      `${winner.label} has better topping value — ` +
      `${formatRatePerCm2(winner.pricePerToppingCm2)} vs ${formatRatePerCm2(loser.pricePerToppingCm2)} ` +
      `(${Math.round(savings)}% cheaper per topping cm²)`;
  }

  if (verdictsDiffer && totalWinner) {
    const totalWinnerLabel = totalWinner === 'A' ? pizzaA.label : totalWinner === 'B' ? pizzaB.label : 'Both pizzas';
    verdictSecondary.hidden = false;
    verdictSecondary.textContent = totalWinner === 'tie'
      ? 'By full area (ignoring crust): both pizzas tie.'
      : `By full area (ignoring crust): ${totalWinnerLabel} wins.`;
  }

  visualizations.innerHTML =
    renderPizzaComparison(comparison) +
    renderValueBarChart(comparison) +
    renderToppingShareChart(comparison);

  statsGrid.innerHTML =
    renderStatsCard(pizzaA, toppingWinner === 'A') +
    renderStatsCard(pizzaB, toppingWinner === 'B');
}

function recalculate() {
  const pizzaA = readPizzaInput('A');
  const pizzaB = readPizzaInput('B');
  const comparison = comparePizzas(
    { ...pizzaA, label: 'Pizza A' },
    { ...pizzaB, label: 'Pizza B' },
  );
  renderVerdict(comparison);
  saveInputs();
}

function resetDefaults() {
  setPizzaInput('A', DEFAULTS.A);
  setPizzaInput('B', DEFAULTS.B);
  recalculate();
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // Service worker is optional during local file testing.
    });
  });
}

document.querySelectorAll('.pizza-card input').forEach((input) => {
  input.addEventListener('input', recalculate);
});

resetBtn.addEventListener('click', resetDefaults);

loadInputs();
recalculate();
registerServiceWorker();
