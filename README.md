Floux - Architectural & Product Documentation
1. Vision & Philosophy
Floux is a Progressive Web App (PWA) focused on eliminating financial anxiety through mathematical objectivity. It actively rejects traditional, rigid budget models that induce guilt, instead utilizing dynamic, auto-adjusting parameters for short-term survival and deep opportunity-cost analysis for long-term wealth preservation.

The Golden Rule: "Zero Friction". The app must never force the user to re-enter known data, navigate unnecessary clicks, or wait for responses. The interface and underlying calculations must be instantaneous.

2. Core Engines & UI Flow
Entry: Onboarding

Modo Direto: Para usuários que já conhecem seu número final e querem apenas inserir o orçamento direto no Tracker.

Modo Calculadora: Assistência à metodologia de porcentagens, deduz custos fixos em dinheiro/PIX e entrega o limite exato sugerido.

A. L-Engine (Liquidity Engine)
Instead of assigning static monthly limits to abstract categories, it evaluates spending capacity on a millisecond basis rather than a fixed daily limit (Today's Limit = Total Remaining / Days).

Behavioral Impact: Saving money today invisibly increases tomorrow's limit; this gamifies frugality, rewarding immediate compliance without strict envelope systems.

B. LSim (Invisible Loss Simulator)
Evaluates major purchases through the lens of opportunity cost.

Logic: Reveals the true cost of an item by projecting what it would be worth if it were invested over a specific timeframe, confronting the user with the loss.

Formula: FV = P(1+r)^t (P = Purchase Cost, r = Annual Return Rate, t = Years)

C. Historical Data Navigation & Monthly Summaries
Users can navigate through past months using a view-state mechanism decoupled from the current date.

Read-Only Integrity: When viewing past months, data entry forms (Registrar Gasto) and daily limits are hidden to prevent accidental modifications to historical data.

Monthly Summary: Automatically calculates and displays end-of-month performance (Ahorro/Déficit), the single largest transaction, and the average daily spend for the selected historical period.

i18n Integration: Summary metrics and labels are fully integrated into the native translation engine.

3. Technology & Architecture
Setup:
It uses modern Vanilla JavaScript. There are no micro-frontends, bundlers (Webpack/Vite), and no heavy UI libraries (React/Vue/Tailwind).

Zero-Build Pipeline (Vibe-Coding): Do not migrate to Svelte or React. Learn the ES6 syntax. Setting up a required Node.js environment will slow you down. Stick to JS modules, but prevent messy DOM updates that usually plague vanilla JS to keep the zero-build magic with a double-index.html app.

No Build Step: Skip it. Write raw ES modules (import { x } from './y.js'). For the PWA Service Worker, a standalone file doesn't need a build step!

Integer-Based Math (Moeda guardada em inteiros):

Problem: Standard IEEE 754 floating-point numbers introduce precision errors (e.g., 0.1 + 0.2 != 0.3).

Solution: All financial operations are strictly implemented in Integers. Ingest: multiply input by 100 and wrap in Math.round() before saving state.

Storage: historialGlobal and presupuestoMensual are stored in integer (cents).

Display: Divide by 100 on the view layer (UI) using Intl.NumberFormat to render.

High-Performance DOM (Alta Performance):
Using list.innerHTML in loops causes thrashing, layout jank, and memory leaks. Attaching elements to hundreds of nodes degrades performance.

DocumentFragment: Evita reflows (re-renders) e garantir 60fps. When updating UI (like transaction history), build new DOM fragments. Get nodes by document.getElementById to avoid repeatedly querying the DOM.

Centralized Persistent Sync (Local-First Data & Privacidade):

Client-Side: Stored exclusively via localStorage. O armazenamento é feito no dispositivo. Sem bancos de dados em nuvem, sem APIs externas por design. (No Firebase, Supabase or CouchDB). Escalation and cloud storage speed is instantly fast.

To maintain sync and enhance existing features, use seamless Backup/Restore. Magic string keys are forbidden; reference the STORAGE_KEYS object.

Strict Separation of Concerns:
Semantic HTML, CSS styled by classes, JS for behavior. Inline style="..." attributes are prohibited.

Security & Sanitization:
Functions must allow emojis while escaping HTML tags to avoid XSS vectors.

4. UI Shell & i18n
CSS: Uses css/style.css variables for native dark mode execution.

JS Boot Layer: js/i18n.js handles language detection and native translation mapping (ES, EN, PT). Defaults back to English.

5. Roadmap & Next Steps
Convert web application to manifest & service worker for offline capabilities.

iOS and Android platform optimization.

Improve UI responsiveness.
