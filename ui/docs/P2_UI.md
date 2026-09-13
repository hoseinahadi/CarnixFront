# P2 UI completion

- Header uses accessible controls and the shared dialog for mobile search.
- Home hero uses a landscape mobile height, reserves space for the vehicle form and respects reduced-motion preferences.
- Home sections remain lazy-mounted and use responsive card skeletons.
- PLP keeps desktop filters in the sidebar and uses a focus-trapped, full-width drawer down to 320px.
- PDP uses a responsive three-column desktop layout and a safe-area-aware sticky purchase section on tablet/mobile.
- Cart and profile shells use dynamic viewport and safe-area spacing; inputs retain a 16px base size to prevent mobile zoom.
- Dialog handles initial focus, Tab/Shift+Tab trapping, Escape, backdrop close, scroll lock, ARIA naming and focus restoration.
- `npm run lint` has zero errors. Legacy typing/style findings remain warnings so they stay visible without breaking CI.
