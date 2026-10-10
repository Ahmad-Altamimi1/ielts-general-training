# The logo slot

Put a logo in this folder and it appears beside the course name in the
sidebar and the top bar. Nothing else needs changing.

- One file named `logo.png` (or `.svg`, `.jpg`, `.webp`, `.gif`) — it sits
  in front of the course name.
- No file at all — the course name stands on its own, which is not an
  error.

`school/` next to this file holds the four emblems of the letterhead on the
front page. Those are not part of this slot: they are placed by
`components/brand/school-header.tsx`, which states each one's size.

A transparent PNG or an SVG looks best, because the banner has a background
of its own and changes colour with the theme. Anything around 400 pixels
wide is more than enough; the site scales it to the height it needs.
