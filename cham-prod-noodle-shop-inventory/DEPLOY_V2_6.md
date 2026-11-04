# Stock Check ERP v2.6 — deployment checklist

This branch is for testing. Do not merge it into production before the backend has been deployed.

## One source of truth
- `catalog`: item definitions, shop/location, unit, min/max and translations.
- `บันทึกสต๊อก`: append-only transactions. A count (`เช็คสต็อก`) is an absolute snapshot; a receipt (`รับเข้า`) is an increment after the most recent count.
- Column L of the transaction sheet is `Transaction ID` (deduplication). Existing columns A–K remain unchanged.
- Pending transactions remain in browser localStorage until server confirmation; clearing browser data loses pending transactions.

## Backend upgrade
1. Open the Google Sheet linked to the test app, then Extensions → Apps Script.
2. Replace the old deployed backend with `backend/Code.gs`, and deploy a **new version** of the Web App. Keep the original deployment permissions in mind: a public deployment has no server-side user authorization.
3. In the app's Settings, set the new Web App URL and test the connection.
4. Do not use the old backend with the new frontend: old responses do not support safe replay/deduplication.

## Test cases before merging
1. Record a count and verify a single row in `บันทึกสต๊อก`.
2. Receive stock and verify the balance increases only after the latest count.
3. Disconnect network, save, and confirm that the app displays pending transactions rather than cloud success.
4. Reconnect and retry; confirm the pending indicator disappears.
5. Replay the same transaction ID and verify the sheet does not gain a duplicate row.
6. Compare the low-stock badge and purchase list.
7. Check same item name with multiple locations and different units.

## Known limitations (must address before real rollout)
- Manager PIN is local-browser protection only, not server authentication.
- Catalog editing is still local-only and not synchronized between devices.
- SettingsView currently displays a legacy Apps Script snippet; use `backend/Code.gs` as the canonical backend.
- Server writes have not yet been end-to-end tested against the actual Google Sheet.
- There is no verified build/test result for this branch yet.
- If multiple devices edit the same stock item, snapshot conflicts still need a business rule.
