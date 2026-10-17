---
type: source
title: "Agent plan, 17 Oct 2026: delivery and payment tracking"
status: immutable
captured: 2026-10-17
covers: 2026-10-17 08:35 UTC
---

# Agent plan, 17 Oct 2026: delivery and payment tracking

The plan the agent proposed in answer to the founder's brief
([founder-chat-2026-10-17-delivery.md](founder-chat-2026-10-17-delivery.md)), word for word.
It was shown with a mock-up of three phone screens: the father's All bills, Raju's page and
the customer's link. The founder took every recommendation except one, choosing a **live
map** over "status steps only". **Raw source**: never edit it.

## 2026-10-17 08:35 · Agent plan

Here's my plan. It solves the main pain point (cash that never reaches your father) with as little new screen as possible.

**The idea: every bill gets two small statuses, and cash is tracked until it's in your father's hand.**

**1. Payment status on every bill** (one tap, matching your scenarios):
- **Cash**: if Raju collected it, the bill shows "Cash with Raju". All bills shows a banner, "Raju has ₹1,240 cash · 3 bills". When Raju hands it over, your father taps **Got it from Raju** once for all of it. This is the fix for "he came back and didn't hand over the cash".
- **UPI done**: the customer paid by UPI.
- **UPI later**: still to collect, and it shows up in a **To collect** filter.
- **Udhaar**: added to the customer's khata. The Customers tab shows "Due ₹2,450" for the month-end hisaab.
- **Paid at shop**: the customer paid your father directly.

**2. Delivery status:** With Raju → Packed → On the way → Delivered. Assigning is the **Delivery** dropdown that's already at the end of the bill, so there's no new step for your father. He can set every status himself from the bill, so it still works on busy days without the delivery app.

**3. Delivery boy page** at `bansalstore.netlify.app/d`:
- **Login:** once, with his phone number and his own 4-digit PIN. You set the PIN in Settings next to his name.
- **What he sees:** only his orders. Items appear as a checklist as soon as the bill is assigned, even before the rates are in, so your father doesn't have to read them out. There are Call and Map buttons; the map opens the address in Google Maps, which is free.
- **What he taps:** three big buttons, **Packed → On the way → Delivered**, then "पैसे कैसे मिले?" with the four choices.
- **Labels:** Hindi and English.
- **Updates:** about every 30 seconds while the page is open on his screen.

**4. Customer's bill link:** delivery steps with times, Raju's name and number, and "To pay ₹505" or "Paid".

**Live location: I'd skip it for now.**
- **It stops in his pocket.** A website only sends location while his screen is on with the page open; it stops when he locks the phone.
- **It would eat your free database hours.** Your free Neon database gets [100 compute hours a month](https://neon.com/faqs/free-plan-limits-and-quotas) and sleeps after 5 idle minutes. Constant updates would keep it awake all shop hours, about 90 of the 100. If they run out, **saving bills stops** until next month.
- **The colony is small.** Deliveries take minutes, so the steps plus his phone number cover it.
- **If you want it later:** show where he left from, once, on a free [OpenStreetMap](https://operations.osmfoundation.org/policies/tiles/) map, which is fine for light use.

**Running cost:** the delivery page checking every 30 s for a 10-hour day is about 36,000 requests a month. That's roughly 15–20 of your 300 monthly [Netlify credits](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/). It also keeps the database awake while his page is open, so it checks **only while the page is on screen and he has open orders**.

**Left out to keep it simple:** GPS tracking, push notifications, and stock counting.

Each choice will become a decision record in the wiki. This changes the "one shop PIN" rule (D006), because delivery boys get their own PINs, and turns the held Udhaar idea into a feature. Four choices are yours before I build:
