This module allows users to show or hide the mail attachment preview panel on forms
that use the standard attachment viewer.

The preference is stored on the user and applies to all supported form views. 
Forms are supported automatically when they inherit from `mail.thread`, contain 
an `o_attachment_preview` element, and have a form header where the toggle buttons
can be inserted.
