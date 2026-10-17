---
type: product
title: Users and journeys
updated: 2026-10-17
last-verified: 2026-10-17
sources: [../sources/founder-chat-2026-10-16.md]
---

# Users and journeys

## People

| Who | What they do | Device | Notes |
|---|---|---|---|
| **The father** (shopkeeper) | Makes every bill, finishes drafts, sends bills | His phone (Android or iPhone not confirmed) | The primary user. Item names on his bills are in Hindi and English (अरहर दाल तूर, Sugar). Started using the rebuilt app on 17 Oct 2026. |
| **The founder** (repo owner) | Decides features, reviews every change, tries it on bansalstore after each release | Phone + Mac | Talks to agents, approves commits and merges. |
| **Customers** | Receive the bill on WhatsApp, open the link, pay by UPI | Their phones | Known by address ("A-135") or phone more than name. |
| **Delivery people** (e.g. Raju) | Pick the items, deliver, collect payment, hand cash to the shop | Their phones, `/d` | Own mobile + PIN set in Settings ([D055](../decisions/D055-delivery-boy-page-own-pin.md)). Name and phone printed on the bill. |
| **AI agents** | Build, test and document changes | — | Follow [AGENTS.md](../../../AGENTS.md). |

## Journey 1: a normal bill (father, phone)

1. Opens bansalstore.netlify.app from the home screen. The PIN was asked once, the first time.
2. Types the **address** ("A1…"). A chip "A 135 Madhu Vihar · Sharma · 98100…" appears, and one tap fills address, phone and name.
3. Types items. After 2 letters, up to 3 chips appear ("चीनी · 1 kg · ₹48"). A tap fills name, details and last rate, and the cursor jumps to Qty.
4. Typing in the last row adds two empty rows. About a second after the first item, the top bar shows **Bill #N** with "Saved · made …" under it.
5. Checks **Payment QR** (the default is pre-filled) and picks **Delivery** if someone is delivering (it starts as "No delivery").
6. Taps **View & Send**, checks the picture, then either taps the green **WhatsApp** button (text bill + link + UPI) or **Send picture** and picks the customer in WhatsApp.
7. Sees "✓ Bill #N sent", then taps **Make a new bill**.

## Journey 2: draft now, finish later (the father's real routine)

> "The bill is not final and is a draft. He will just save it and then we go and make another
> customer bill. … go to that old bill, edit that, add the rates and everything, and then
> send that bill to the customer." (founder, 16 Oct)

1. Types the items without rates, then taps **New bill**. The button says "saves as draft".
2. Serves the next customer.
3. Later: **All bills** → **Drafts** filter. The card shows "2 rates missing". He taps **Edit**, adds rates, then **View & Send**.

## Journey 3: weekly clean-up (on a computer)

The founder: "we can combine them on a weekly basis. He can sit on a computer and do it",
meaning the father. Whether the founder helps is an [open question](../knowledge/open-questions.md).

1. Opens **All bills → Items**. Ticks चीनी, चिनी and Sugar, then **Merge**. From then on one name is suggested.
2. **Rename** an item, or **Hide** junk from suggestions.
3. **Customers**: merge "A-135 Madhu Vihar" and the same customer typed with a different phone. Fix an address. **See bills** to check.

## Journey 4: the customer

1. Gets the picture, or the text with a link `bansalstore.netlify.app/b/<token>`.
2. The link opens the bill with **Call shop**, **Save picture** and **Download PDF**. They scan the QR to pay; with a UPI ID, the amount is pre-filled.

## Journey 5: the founder ships a change

Local demo → "Commit it, push and merge" → one PR into `main-dev` → bansalstore updates → the
founder tries it on the phone ([D050](../decisions/D050-one-live-site-main-dev-only.md)). See [release process](../operations/release-process.md).

## Journey 6: a delivery with Raju ([delivery and payments](../architecture/delivery-and-payments.md))

1. The father types the order and picks **Delivery: Raju** at the end of the bill. Rates can wait.
2. Within about 30 s, Raju's page (`/d`) shows the order with its items. He ticks each item as he picks it ("सामान निकालो"). No calling out "sugar 1 kg nikal" any more.
3. He taps **Packed**, then **On the way**. While his page is open, the customer's link shows the steps and where he is on a map.
4. At the door he taps **Delivered** and answers **पैसे कैसे मिले?**: Cash ₹ (amount), UPI done, UPI later, or Udhaar.
5. Back at the shop, All bills shows **Raju has ₹1,240 cash · Got it**. The father taps it when Raju hands the money over. UPI the boy reported shows under **UPI to check** until the father sees it in his UPI app and taps **received**.
6. Busy day, no app for Raju? The father marks the same steps and payment himself on the bill.

## Journey 7: month-end hisaab (udhaar)

1. **Customers** tab → sort **Most udhaar due** → open the customer: "Udhaar due ₹2,450", with the bills listed.
2. The customer pays ₹2,000: type it, tap **Cash received** (or UPI). The oldest bills are cleared first and the rest stays due ("₹450 left").
3. A mistake can be removed from the list.
