# Staff button in header, extra Staff PIN step, menu visibility option

## 1. Staff Access button in the header
- Move the "Staff Access" button into the public header, next to the Call button (desktop and mobile).
- Keep it small and neat so the header doesn't grow. Remove the duplicate link from the footer.

## 2. Extra security step: Staff PIN before email and password
Login will have 2 steps:
1. **Staff PIN screen** (6 digits). Only owner and staff know it.
2. After the correct PIN, the **email and password** screen opens.

How it stays safe:
- The PIN is checked on the server, never inside the page, so nobody can read it from the browser.
- The PIN is stored scrambled (hashed), not as plain text.
- 5 wrong tries lock the PIN screen for 15 minutes.
- A correct PIN works for 12 hours on that device. After that, the PIN is asked again.
- Email and password login stays the same. Public signup stays off.
- A temporary 6-digit PIN will be set. I will send it to you in chat after building.
- **Settings > Owner login** gets a "Change Staff PIN" box. It needs the current password.

Note: no system can be 100% unhackable. This setup (PIN + email + password, server checks, lockout) is strong and normal for a restaurant POS.

## 3. Menu Management: where an item shows
When adding or editing any item or deal, there will be 2 checkboxes:
- **Show in POS** (counter billing)
- **Show on public website** (digital menu)
- Both are on by default. New items and deals will then also show on the public homepage menu, with their photo, price and WhatsApp order button.
- Hidden items still never show on the website.

## Message for client (no emoji)

> Assalam-o-alaikum bhai, kaise ho?
>
> Aapka POS system almost ready hai. Iske saath customers online apna order track bhi kar sakte hain, aur aapka digital menu bhi is mein shamil kar diya hai.
>
> Aap isko yahan dekh sakte hain: https://demo-mimi-pizza.ebpk.site
> Staff login ke liye upar "Staff Access" button dabayein. Pehle Staff PIN, phir email aur password.
>
> Mazeed, InshaAllah kal main aapke paas chakkar lagaunga. Please apna printer aur tablet arrange kar lein taake aap is par kaam shuru kar sakein. Hamari recommendation hai ke aap Windows wala tablet lein, yeh aapke liye sab se behtar rahega.
>
> Login details alag message mein bhej raha hoon.

## Technical details
- New table `pos_security` (single row): `pin_hash`, `failed_attempts`, `locked_until`. RLS on, no anon/auth access; only server functions with admin client touch it.
- `verifyStaffPin` server fn: SHA-256 + salt compare with timingSafeEqual, lockout counter, sets encrypted httpOnly session cookie (`useSession`, `SESSION_SECRET` via generate_secret, 12h).
- `getPinStatus` server fn read by `OwnerLoginGate`; shows PIN step before the existing email form.
- `changeStaffPin` server fn with `requireSupabaseAuth`; validates 6 digits.
- Seed temporary PIN hash in migration.
- Menu overrides gain `publicHidden` / `posHidden` id lists; homepage menu and POS filter accordingly; homepage reads custom items + images from saved settings. Tests for the visibility filter and PIN format.
- Header: add Staff Access link in `PublicHeader`, remove from `PublicFooter`.
