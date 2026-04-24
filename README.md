Floux - Architectural & Product Documentation
1. Product Vision & Philosophy
Floux is a Progressive Web App (PWA) focused on eliminating financial anxiety through mathematical objectivity. It rejects traditional, rigid budget models that induce guilt, utilizing dynamic, auto-adjusting parameters for short-term survival and deep opportunity-cost analysis for long-term wealth preservation. The Golden Rule is "Zero Friction": the app must never force the user to re-enter known data, navigate unnecessary clicks, or wait for responses.
+1


2. Core Engines
A. LTracker (Liquidity Tracker)
Calculates spending capacity on a millisecond basis rather than assigning a fixed daily limit.


 Math: (Today's Limit) = (Total Remaining Budget) / (Remaining Days in Month).  
 Behavior: Spending less today increases tomorrow's limit automatically.  
B. LSim (Liquidity Simulator) - Implemented
Evaluates major purchases through the lens of "Invisible Loss".


 Logic: Calculates the opportunity cost of a purchase by projecting what that capital would be worth if invested over a specific timeframe.  
Formula: FV=P(1+r)t, where P is the cost, r is the annual return rate, and t is the years projected.

3. Data & Storage
 Data Structure: Uses a flat JSON array (historialGlobal) for transactions.  
 Persistence: 100% Client-Side, persisted exclusively via Web Browser LocalStorage.  
 Privacy: Zero cloud backend or external API dependencies.  

4. Critical Architectural Rules
 Native ES Modules: No micro-frontends, bundlers (Webpack), or libraries (React/Vue/Tailwind) to maintain a "zero-setup" nature.  
 Security: Strict use of escapeHTML() on all user-generated strings (descriptions, category names, emojis) to prevent XSS during DOM manipulation.  
 Performance: Event delegation is used to handle dynamic elements (like history list actions) to avoid memory leaks and maintain speed.  

5. File Structure
 index.html: UI Shell and layout.  
 css/style.css: Custom layout and dark mode support.  
 js/main.js: Entry point and application logic.  
 js/store.js: LocalStorage management.  
 js/i18n.js: Multi-language dictionary (ES, EN, PT).  
 js/categories.js: Default and custom category definitions.  
 js/ui.js: DOM rendering and interface updates.  

6. Next Steps
 PWA Manifest & Service Workers: Implement the offline-first manifest to allow native-like installation on iOS and Android.  
 UI Integrity: Finalize animations for the LSim interface transitions.  
 Data Resilience: Improve error handling during JSON imports. 
