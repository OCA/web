- The widget stores Markdown in text fields: rendering such a field elsewhere (for
  example in a report) needs a conversion to HTML.
- An html mode could load and save HTML through Toast UI (`setHTML` / `getHTML`), so
  that html fields can be edited in Markdown. Toast UI only keeps Markdown-compatible
  HTML: colors, styles and Odoo classes of existing content would be lost.
- Toast UI Editor is shipped minified in `static/src/lib` (version 3.2.2).
- The preview is always shown as a tab: the `preview_style` option is read but not
  applied yet.
