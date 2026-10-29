This module allows to change the font of the backend web client.

The available fonts are the same as the ones of the Document Layout (_Lato_, _Roboto_,
_Open Sans_, ...), shipped with Odoo, so no external service is called.

Any font added to the Document Layout by another module (extending the `font` selection
field of `res.company` and declaring the font with `@font-face` in the
`web.report_assets_common` bundle, as Odoo does) can be used in the backend as well,
without any change in that module. Only the chosen font is loaded in the backend.

Fonts do not look as big at the same size. The chosen font is scaled automatically, so
that it looks as big as the default Odoo fonts on the user's device, in the user's
language.

The default Odoo fonts are kept as fallback, so characters not covered by the chosen
font are still displayed.
