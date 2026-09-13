# P3 UI delivery

- Backend runtime is normalized to `https://localhost:7191` and local certificate handling is development-only.
- Corrupted Persian JSON is repaired centrally at the API boundary.
- About, privacy and rules routes back every footer link.
- Search has a dedicated results route, keyboard submit and product quick view.
- Bundle list/detail routes expose bundle items, product links, compatibility guidance and add-all-to-cart.
- Reorder adds available order items to the cart; bulk purchase opens a complete, prefilled sales request.

Run `npm run check:p3` for the P3 acceptance checks.
