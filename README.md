# Digital LegacyLink — React frontend

A React + Vite frontend for the LegacyLink capstone project. It connects to the existing Express API; it does not create a backend or database.

## 1. Requirements
- Node.js 20 LTS or a version supported by your team's backend
- npm
- Backend running locally at `http://localhost:5000`

## 2. Install and run
```bash
npm install
copy .env.example .env
npm run dev
```
On macOS/Linux, use `cp .env.example .env` instead of `copy`.

Open the local URL printed by Vite, normally `http://localhost:5173`.

## 3. Configure API
`.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```
Restart Vite after changing `.env`.

## 4. API assumptions that must be confirmed with backend teammates
This UI calls the endpoints in the project brief. It assumes JSON responses, commonly either an array or `{ "data": [...] }`, and that created/updated records have IDs. Confirm the exact response formats with the backend owners.

- Login response should include `token`, `accessToken`, or `jwt`, and optionally `user`.
- Registration sends `{ name, email, password }`; if registration does not return a token, the user is redirected to Login.
- Contacts POST sends `{ email }`.
- Designations POST sends `{ assetId, contactId }`.
- Access request POST sends `{ designationId, assetId }`. Confirm the exact request body and how the API lists assets designated for the current contact.
- Reviewer PATCH sends `{ decision: "approve" | "reject", note: "..." }`. Confirm the exact decision enum and whether notes are supported.
- Check-in POST sends `{}`.
- Document upload and document download are intentionally not implemented until the backend owners confirm routes, multipart field names, metadata response and authorization semantics.

If the backend uses different property names, update the relevant page's request body and response mapping to match the actual contract. Do not bypass API errors with fake data.

## 5. Security notes
- This demo stores a JWT in localStorage to match the supplied Bearer-token contract. A script-injection vulnerability can expose localStorage tokens. For production, prefer a backend-supported HttpOnly secure cookie or another reviewed token-storage design.
- The frontend's route protection is for navigation only. The backend must authorize every API request and every document access.
- Never store passwords, MFA secrets, private keys or document contents in localStorage.
- Inactivity must never automatically release documents without the backend's required verification and approval workflow.

## 6. Test checklist
1. Register a new account; then sign in if registration doesn't automatically sign in.
2. Verify `/auth/me` succeeds after login and refresh the browser.
3. Add, view, edit and delete an asset.
4. Add a contact using an already registered email; remove it.
5. Create and revoke a designation.
6. Test access requests with an account that is genuinely a designated contact.
7. Test reviewer decisions with a reviewer-authorized account; verify normal accounts are denied by the backend.
8. Click Confirm I'm Active and verify the monitoring response changes.
9. Sign out and verify private routes redirect to Login.
10. Run `npm run build` before the demo.

## 7. Troubleshooting
- `Network Error` / cannot reach server: start backend and verify port 5000.
- CORS: backend must allow `http://localhost:5173` and the `Authorization` and `Content-Type` headers. Ask the backend owner to configure Express CORS.
- 401: token missing/expired or backend rejects it. Sign in again and check the login response contains the expected token property.
- 403: the account lacks permission; do not bypass it in the frontend.
- 404: route path or API prefix differs. Confirm `/api` and exact route names with backend owners.
- UI list is empty but API returns data: inspect whether response is an array, `{data: [...]}`, `{items: [...]}`, or `{results: [...]}` and adjust `getList` in `src/api/client.js`.
- Changes to `.env` do not apply: stop and restart `npm run dev`.
# LegacyLink
LegacyLink – Digital Legacy &amp; Asset Management Platform as a web application
