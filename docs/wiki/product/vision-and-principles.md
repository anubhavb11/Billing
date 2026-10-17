---
type: product
title: Vision and principles
updated: 2026-10-17
last-verified: 2026-10-17
sources: [../sources/founder-chat-2026-10-16.md]
---

# Vision and principles

**Vision.** The father should be able to bill a customer, finish it later, and send it on
WhatsApp from his phone, faster than writing it on paper. Every number he types is saved,
and the shop gets a little smarter (items, rates, customers) with each bill.

These principles come from the founder's own requests during the build. Each one links to
the decisions that came from it. When a new idea conflicts with one of them, ask the founder.

## 1. The father is the user, and he is on a phone

> "This app is very, very, very curated for my father to use. … he usually uses it on his
> mobile, and he wants to see whatever he is typing on one screen." (founder, 16 Oct)

- Design at **360px** first. No sideways scrolling, and long Hindi item names wrap downward ([D011](../decisions/D011-phone-fit-rules.md), [D018](../decisions/D018-wrap-long-item-names.md)).
- "Everything is mobile-first. He is only going to use this app on mobile, so we need to give as much context on that screen." ([D020](../decisions/D020-all-bills-cards-with-edit.md))
- Clean-up work that needs care (merging spellings) happens weekly **on a computer**, not mid-bill ("He can sit on a computer and do it") ([D040](../decisions/D040-inventory-from-bills-items-customers-tabs.md)).

## 2. Usable without glasses, never overwhelming

> "It should be a user-friendly UI and should be a bit bigger, even so it can be operated
> without specs." (founder, 16 Oct)

- One accent colour per screen. Green only for WhatsApp and Sent, red only for delete and errors ([D032](../decisions/D032-calm-bigger-ui.md)).
- Big text, 52px buttons, and icons next to words.
- No dropdown suggestions: at most **3 chips**, only after 2 letters ([D038](../decisions/D038-chips-not-dropdowns.md)).
- Labels say what happens: "New bill · saves as draft", not "Clear" ([D036](../decisions/D036-details-bin-new-bill.md)).

## 3. Never lose a bill, never make him press Save

- Bills save themselves; the bill on screen survives a reload ([D031](../decisions/D031-auto-save.md), [D017](../decisions/D017-bill-survives-refresh.md)).
- Deleting only hides ([D013](../decisions/D013-soft-delete.md)).
- Unfinished bills are normal: they're **Drafts**, flagged with missing rates ([D019](../decisions/D019-draft-and-sent-status.md)).

## 4. The bill picture is the product

> "I want to send that image, the beautiful image that we have built, as a bill." (founder, 16 Oct)

- What he previews is exactly what the customer receives ([D030](../decisions/D030-bill-picture-html-to-image.md)).
- Exactly two ways to send: WhatsApp text to the number, or the picture ([D033](../decisions/D033-view-and-send-two-options.md)).
- The customer's page offers only Call shop, Save picture and Download PDF ([D024](../decisions/D024-customer-page-three-actions.md)).
- It looks like Bansal Store everywhere, never like "a React app" ([D028](../decisions/D028-bansal-store-branding.md)).

## 5. Customers are known by address and phone

> "The customer is more referred to by the address or the phone number rather than the
> customer name." (founder, 17 Oct)

- Address first, matched however it was typed: A-135 = A135 = a 135 ([D039](../decisions/D039-address-first-customer-box.md), [D044](../decisions/D044-fuzzy-matching-own-normaliser.md)).

## 6. Learn from his own bills; never rewrite them

- Items, rates and customers come from past bills, with nothing to set up ([D040](../decisions/D040-inventory-from-bills-items-customers-tabs.md)).
- Clean-ups are reversible rules. Bills stay exactly as typed and sent ([D041](../decisions/D041-cleanup-as-rules-bills-never-change.md)).

## 7. Small, safe and nearly free

- Free tiers only: Netlify Free credits and the founder's free Neon project ([D008](../decisions/D008-own-neon-not-netlify-database.md)).
- No logins, one shop PIN ([D006](../decisions/D006-no-login-shop-pin.md)). Nothing secret in this public repo ([D048](../decisions/D048-agent-access-and-secrets.md)).
- Few dependencies; small modules written in-house where a library wouldn't fit ([D044](../decisions/D044-fuzzy-matching-own-normaliser.md)).

## 8. The founder sees it before the father does

- Every change is shown locally, then on billingbansal, then on the father's site ([D047](../decisions/D047-branch-demo-ship-workflow.md), [D009](../decisions/D009-two-sites-one-database.md)).
- Prioritise, then build in small rounds. "Try to do them step by step, or prioritize them or something, and then we will do them." (founder, 16 Oct)
- Hold extras until the core is used: "For now, nothing." ([D045](../decisions/D045-no-extras-in-first-build.md))

## How the principles changed

On 16 Oct at 16:38 the founder said "Don't change it too much". At 18:56 and 19:02 the same
day, after seeing the colourful button row, they asked for a simpler UX: "Maybe sit with a UI/UX designer
yourself, figure out what the best flow is". Principle 2 replaced "keep the old buttons" ([D010](../decisions/D010-keep-fathers-buttons.md)
→ [D032](../decisions/D032-calm-bigger-ui.md)). **The constant is the father's experience,
not the layout.**
