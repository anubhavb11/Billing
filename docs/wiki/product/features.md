---
type: product
title: Feature inventory
updated: 2026-10-17
last-verified: 2026-10-17
sources: [../decisions/README.md]
---

# Feature inventory

What the app does as of 17 Oct 2026 (PR #17), where the code lives, and which decision
explains it. Keep this page in step with the code.

## Bill screen: `#/`, `src/Billing.jsx`

| Feature | Behaviour | Code | Decision |
|---|---|---|---|
| Sticky top bar | Logo, **Bill #N** (or "New bill · Today") and save status; **All bills** button | `Billing.jsx`, `App.js` | [D028](../decisions/D028-bansal-store-branding.md), [D031](../decisions/D031-auto-save.md) |
| Status chips | Draft / Sent / Changed after sending; "N rates missing" | `StatusChips.jsx`, `bill.js` | [D019](../decisions/D019-draft-and-sent-status.md) |
| Customer box | **Address** (full width), then Phone, Name | `Billing.jsx` | [D039](../decisions/D039-address-first-customer-box.md) |
| Customer chips | Up to 3 matches from past bills; a tap fills all three fields | `catalog.js` `suggestCustomers`, `Billing.jsx` `pickCustomer` | [D038](../decisions/D038-chips-not-dropdowns.md), [D044](../decisions/D044-fuzzy-matching-own-normaliser.md) |
| Item table | #, Item, Details, Qty, Rate, Amount, bin. Item and Details wrap downward | `Billing.jsx` | [D011](../decisions/D011-phone-fit-rules.md), [D018](../decisions/D018-wrap-long-item-names.md), [D036](../decisions/D036-details-bin-new-bill.md) |
| Item chips | Up to 3 under the row being typed; a tap fills name, details and rate, then jumps to Qty | `catalog.js` `suggestItems`, `Billing.jsx` `pickItem` | [D038](../decisions/D038-chips-not-dropdowns.md) |
| Known item fill | Leaving an item typed in full fills its last rate and details if empty | `catalog.js` `exactItem`, `Billing.jsx` `fillKnownItem` | [D038](../decisions/D038-chips-not-dropdowns.md) |
| Spare rows | 5 rows minimum; typing in the last row adds 2 | `bill.js` `withSpareRows` | [D035](../decisions/D035-two-spare-rows.md) |
| Number entry | Number keypad; digits and one dot only; Enter moves to the next box | `bill.js` `cleanNumber` | [D011](../decisions/D011-phone-fit-rules.md) |
| Total | Under the table, decimals kept, ₹ with Indian grouping | `bill.js` `billTotal`, `format.js` | [D011](../decisions/D011-phone-fit-rules.md) |
| Payment QR / Delivery | Two dropdowns at the end; the default payment QR is pre-filled, Delivery starts as "No delivery" | `Billing.jsx`, `shopSettings.js` | [D025](../decisions/D025-payment-qr-in-settings.md), [D026](../decisions/D026-delivery-people.md) |
| Auto-save | 1 s after typing stops, once there's an item; one save at a time; retry when online | `App.js` `saveNow` | [D031](../decisions/D031-auto-save.md) |
| New bill | Starts the next bill. Subline "saves as draft" or "kept in All bills" | `Billing.jsx`, `App.js` `newBill` | [D036](../decisions/D036-details-bin-new-bill.md) |
| View & Send | Saves, then opens `#/send` | `App.js` `viewAndSend` | [D033](../decisions/D033-view-and-send-two-options.md) |
| Delete this bill | Small link; asks first; hides the bill | `Billing.jsx` `remove` | [D013](../decisions/D013-soft-delete.md) |

## View & Send: `#/send`, `src/SendPage.jsx`

| Feature | Behaviour | Code | Decision |
|---|---|---|---|
| Picture preview | The exact JPEG the customer gets, made on open | `share.js` `renderBillImage` | [D030](../decisions/D030-bill-picture-html-to-image.md) |
| WhatsApp to number | Green; only with a valid number. Text bill with items, total, delivery, UPI ID, link | `share.js` `waNumber`, `billText`, `waLink` | [D033](../decisions/D033-view-and-send-two-options.md) |
| Send picture | Share menu with the JPEG; caption with link on Android only | `share.js` `shareFile` | [D033](../decisions/D033-view-and-send-two-options.md), [D034](../decisions/D034-iphone-picture-without-caption.md) |
| Done state | "✓ Bill #N sent" + Make a new bill; marks the bill Sent | `SendPage.jsx`, `App.js` `onSent` | [D019](../decisions/D019-draft-and-sent-status.md) |
| Fallbacks | Save picture when sharing isn't supported; Copy bill link | `SendPage.jsx` | [D033](../decisions/D033-view-and-send-two-options.md) |

## All bills: `#/bills`, `src/Bills.jsx`

| Feature | Behaviour | Code | Decision |
|---|---|---|---|
| Cards | Customer, total, #N, friendly time, phone, item preview, status, Edit, View & Send | `Bills.jsx`, `billsFilter.js` `itemPreview` | [D020](../decisions/D020-all-bills-cards-with-edit.md) |
| Filters | All / Drafts / Sent with counts; search (name, phone digits, item, `#N`); date ranges; 5 sorts; count + total | `billsFilter.js` | [D020](../decisions/D020-all-bills-cards-with-edit.md) |
| Customer filter | "Bills of …  · Show all" from Customers → See bills | `billsFilter.js` `filters.customer` | [D046](../decisions/D046-see-bills-by-customer-group.md) |
| Tabs | Bills · Items · Customers, plus the Settings gear | `App.js` `DATA_TABS` | [D040](../decisions/D040-inventory-from-bills-items-customers-tabs.md) |

## Items and Customers: `#/items`, `#/customers`

| Feature | Behaviour | Code | Decision |
|---|---|---|---|
| Items list | Name, details, last rate, bills, last sold, "Also typed as"; search; 3 sorts; show hidden | `ItemsPage.jsx` | [D040](../decisions/D040-inventory-from-bills-items-customers-tabs.md) |
| Item clean-up | Tick + Merge (keeps most-sold name), Rename, Hide, Separate | `catalog.js` `mergeItems` … | [D041](../decisions/D041-cleanup-as-rules-bills-never-change.md) |
| Customers list | Address/name/phone, bills, total, last bill; 3 sorts | `CustomersPage.jsx` | [D040](../decisions/D040-inventory-from-bills-items-customers-tabs.md), [D043](../decisions/D043-customer-identity-key.md) |
| Customer clean-up | Merge, edit details, Hide, Separate, See bills | `catalog.js` `mergeCustomers` … | [D041](../decisions/D041-cleanup-as-rules-bills-never-change.md), [D046](../decisions/D046-see-bills-by-customer-group.md) |

## Settings: `#/settings`, `src/Settings.jsx`

| Feature | Behaviour | Code | Decision |
|---|---|---|---|
| Payment QRs | Add by UPI ID or QR photo (read with jsQR); label; default; remove | `Settings.jsx`, `qrPhoto.js`, `shopSettings.js` | [D025](../decisions/D025-payment-qr-in-settings.md) |
| Delivery people | Name + mobile | `Settings.jsx` | [D026](../decisions/D026-delivery-people.md) |

## Customer page: `/b/<token>`, `src/PublicBill.jsx`

| Feature | Behaviour | Code | Decision |
|---|---|---|---|
| Bill view | No PIN; only that bill | `PublicBill.jsx`, `GET /api/public/bills/:token` | [D021](../decisions/D021-private-bill-link.md) |
| Actions | Call shop, Save picture, Download PDF | `PublicBill.jsx`, `share.js` `downloadPdf` | [D024](../decisions/D024-customer-page-three-actions.md) |

## Everywhere

| Feature | Behaviour | Code | Decision |
|---|---|---|---|
| PIN screen | Once per phone; asked again after a 401 | `PinScreen.jsx`, `api.js` | [D006](../decisions/D006-no-login-shop-pin.md) |
| Branding | Logo, icons, title, manifest, WhatsApp preview card | `public/`, `Logo.jsx` | [D028](../decisions/D028-bansal-store-branding.md) |
| Offline | Bill kept on the phone; settings and catalog cached; "Offline" status; retries | `bill.js`, `shopSettings.js`, `catalog.js`, `App.js` | [D017](../decisions/D017-bill-survives-refresh.md), [D031](../decisions/D031-auto-save.md) |

## Not built (on purpose)

Paid/Udhaar, Today-at-a-glance, Hindi labels, duplicate hints, repeat last order, usual rate,
Excel export, rate-list picture, stock counting, user accounts. Why and when to revisit:
[ideas-and-backlog.md](ideas-and-backlog.md).
