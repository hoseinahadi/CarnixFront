# P1 checkout contract

- Shipping totals are accepted only after a successful `/Shipping/quote` response. A persisted quote is invalidated after reload and requested again.
- Checkout navigation is handled by `checkoutMachine.ts`; cart, delivery and payment state survive login and browser navigation in `sessionStorage`.
- Guest login and OTP keep the guest session ID, merge the guest cart, reload the authenticated cart and return to `/cart?step=2`.
- Online orders call `/Payment/initiate`, store only the temporary pending payment identifiers, and redirect to `/payment/callback` for server verification.
- Payment verification is idempotent and checks both payment ownership and the transaction gateway token.
- Shared loading, error and empty presentation lives in `components/common/AsyncState`.
