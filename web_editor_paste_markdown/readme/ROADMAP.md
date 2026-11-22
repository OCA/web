- The conversion to Markdown drops what Markdown cannot express: colors, font sizes,
  alignment, underline, merged table cells, mentions.
- A round trip (HTML to Markdown to HTML) normalizes the layout: list markers, line
  breaks and table alignment may change.
- An image written as a data: address in the pasted Markdown stays embedded in the HTML
  field.
- Raw HTML in the pasted Markdown is kept only once sanitized by DOMPurify, which the
  Odoo editor loads; otherwise it is inserted as text.
