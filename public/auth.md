# auth.md - Polyglow Agent Authentication

Polyglow publishes public editorial pages and optional x402 protected API probes.

## Current Access Model

- Public pages do not require account authentication.
- `/api` and `/api/v1` require x402 payment when the runtime gateway is enabled.
- Payment requirements are returned in the HTTP 402 `payment-required` header.
- No pre-registration is required for public content discovery.

## x402 Flow

1. Request `/api` or `/api/v1`.
2. Read the `payment-required` header from the HTTP 402 response.
3. Complete payment through an x402-compatible facilitator and network supported by the deployment.
4. Retry the same endpoint with the payment proof headers required by the x402 protocol.

## Agent Registration

Polyglow accepts anonymous agent discovery and x402-paid API access. No human account, dashboard account, or pre-registration is required for read-only content discovery.

Agents that require a registration document can use this file as the registration entrypoint:

- Registration URI: `https://polyglow.realrip.com/auth.md`
- Supported identity type: `anonymous`
- Credential type: `x402`
- Protected API probes: `/api`, `/api/v1`
- Payment challenge location: HTTP 402 `payment-required` response header

## OAuth and OIDC Discovery

Polyglow publishes static OAuth/OIDC discovery metadata so agents can distinguish OAuth discovery from x402 payment discovery. The current public deployment does not issue bearer tokens for content access.

Use the x402 payment challenge on the protected API endpoints for paid access.
