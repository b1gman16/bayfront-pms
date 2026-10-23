# Bayfront PMS: before real guests

## Set up
- [ ] Every real room and room type is entered, with real base rates (Rooms page)
- [ ] Seasonal and weekend rates entered and checked with "Check a price" (Settings → Room rates)
- [ ] Tax, service charge and discount rules entered and checked on the ₱10,000 example (Settings → Taxes & fees)
- [ ] Resort name, address, phone and TIN line set for receipts
- [ ] Your accountant has seen a sample receipt and said what an official receipt needs
- [ ] Real staff accounts created; each person has changed their temporary password
- [ ] Test accounts disabled; the admin password changed from the one you set while testing

## Clear the demo data
- [ ] Backup taken
- [ ] App stopped, then `npx tsx scripts/reset-demo-data.ts`, then the app started again
- [ ] Rooms page shows every room as Clean; Dashboard shows no guests

## Keep it running
- [ ] Auto-start and nightly backups installed (OPERATIONS.md), and a restore tested on a spare PC
- [ ] A backup copy kept off the laptop (USB drive or cloud folder)
- [ ] Laptop plugged in, set to never sleep, on a UPS if possible; fixed IP address in the router
- [ ] Windows Update "active hours" set so it doesn't restart during the day
- [ ] Wi-Fi uses WPA2 or WPA3 with a strong password; guests are on a separate network

## The first week
- [ ] Run it alongside the paper process for a few days
- [ ] A paper sheet ready for outages: guest name, room, dates, amount paid (enter it later)
- [ ] One person in charge of questions; write down every confusing screen and every wrong number

## Privacy
- [ ] Someone has checked what the Data Privacy Act (RA 10173) requires for guest and ID information: a privacy notice, who is responsible for data protection, how long data is kept, and what to do after a breach