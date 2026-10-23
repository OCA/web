Go to company record and set a logo. Can see/modify applied colors on the "Navbar"
section.

For optimal results use images with alpha channel.

Only the colour groups you fill in (navbar, buttons, links, submenu) are styled; empty
groups keep Odoo's native look, and empty hover/text colours are derived from the colour
you chose.

Other modules can follow the active company's button colour through the
`--web-company-color-primary` and `--web-company-color-primary-hover` CSS variables, for
example `var(--web-company-color-primary, $o-brand-primary)`.
