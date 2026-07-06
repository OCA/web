This module improves the usability of translating **HTML** fields.

The standard translation dialog of an HTML field splits its content into
individual source terms (chunks) and asks the user to translate each one
separately. This is technical and hard to use for end users, especially on
rich content.

With this module, the translation button next to an HTML field opens a dialog
that shows one **full rich-text editor per installed language**. The user reads
and edits the whole translation of each language as a single block, exactly as
the field is edited in the form.

Each language can be toggled between the rich-text editor and a raw **HTML
source** ("technical") view, so content the editor cannot handle safely can
still be translated. Values that contain markup the editor cannot round-trip
(full documents, `<style>` blocks or QWeb directives such as those found in
email templates) open in the HTML source view by default.

The standard term-by-term dialog is kept untouched for `char` and `text`
translatable fields.
