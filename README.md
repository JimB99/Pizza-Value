# Pizza-Value

Compare pizzas by **topping area per euro**, not just diameter—accounting for crust width you do not eat.

**Status:** Static PWA on GitHub Pages. **Demo:** https://jimb99.github.io/Pizza-Value/

Install via **Add to Home Screen** for offline use after the first visit.

---

## Model

For diameter `D`, crust thickness `c`, and price `P` (same units as area):

- Radius `r = D/2`
- Topping radius `r_t = r - c` (must be positive)
- Total area `A = π r²`
- Topping area `A_t = π r_t²`
- Crust ring area `A - A_t`
- **Topping value:** `P / A_t` (€ per cm² of edible topping)
- **Whole-pizza value:** `P / A` (includes crust)

The app compares two pizzas and can show when the cheaper **total** area winner differs from the **topping** winner.

---

## Run locally

```bash
python -m http.server 8080
# Open http://localhost:8080
```

Or use any static server; logic lives in `js/calculator.js` (unit tested).

---

## Tests

```bash
npm test
```

---

## Deploy (GitHub Pages)

1. Push to GitHub
2. Repo → Settings → Pages → deploy from `main` branch, `/` root
3. Open `https://jimb99.github.io/Pizza-Value/`

---

## License

MIT — see [LICENSE](LICENSE).
