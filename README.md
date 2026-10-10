# Parramatta Drive Academy — Design Fixes V9.1

This is a static, responsive one-page website concept with independent files.

## Files
- `index.html`: page structure and content
- `assets/css/main.css`, `responsive.css`, `motion.css`, `refined-v9.css`, `layout-fixes.css`: separate style layers
- `assets/js/site.js`: lesson explorer, skills selector and navigation
- `assets/js/booking.js`: interactive lesson-duration enquiry (no real booking)
- `assets/js/motion.js`: modern branded loading transition and reduced-motion-safe reveals
- `assets/img/`: compressed, locally stored unique photographs

## What's new
- Modern, fast typographic intro (no moving car, no fake progress percentage; 0.7–1.25 seconds, then a screen-wipe exit)
- Four visible duration choices: **60 min / 90 min / 120 min / 4 hr**
- Booking form selects **duration and training focus separately** and includes both in the review and copied enquiry
- Responsive duration offers, smooth but restrained scroll reveals, and accessible reduced-motion support

## How to preview
Extract the entire ZIP and open `index.html` in a current browser. If testing clipboard permission, serving the folder on localhost is more reliable than opening via `file://`.

## Before production
- Obtain client's real brand approval, contact details and privacy policy
- Confirm prices, instructor accreditations, transmission options and duration availability; the offerings are **enquiry choices**, not confirmed sessions
- Connect booking/email to a real server or integration; no reservation, payment or email is sent by this demo
- Replace model and service photographs with client-approved images if representing staff or cars as real

Footer credit: Created By 4Business Group.

## V9.1 layout fixes
- Mobile navigation aligned at the right-hand edge
- Mobile hero badge crowding resolved and hero text size refined
- Four duration options become a compact 2×2 layout on mobile, retaining clear selection actions
- Removed duplicate duration text in cards and refined selected booking states
- Sticky header/anchor offsets and booking wizard panel spacing refined
- All duration options and existing booking logic preserved

## V9.2 banner alignment
- Two hero CTA buttons have consistent height, padding, label/arrow alignment.
- Mobile CTA buttons stack cleanly with matching width and spacing.
- Hero bottom strip CTA aligned with neighbouring strip content.
- Existing booking steps, 60/90/120 min and 4-hour choices, animations, and credits preserved.

## V9.3 — Actual hero/banner overlap correction
The former banner used a fixed/minimum height combined with an absolutely positioned bottom feature strip. On short browser windows the headline and CTA row extended underneath that strip.

Changes:
- Added `assets/css/hero-overlap-fix.css` as the **last** stylesheet in `index.html`.
- Switched hero content to content-based height (removes fixed `height: 87vh` override).
- Moved the bottom feature strip into regular document flow; it cannot overlay the CTA buttons.
- Preserved the existing header, branding, animations, duration choices and 4-step enquiry form.
- Layout measured at 1176×583, 1440×900, 768×850, 390×844 and 320×700: buttons no longer intersect the strip; no horizontal overflow.

For best results, upload the complete extracted folder, replacing the old CSS. Avoid serving a cached V9.2 stylesheet.
