Behaviour of the module and best practices
==========================================

This module implements a Markdown editor on Html fields, in contrast to web_widget_text_markdown, which implements it on Text fields. In readonly mode, the widget displays HTML, but when editing, the widget offers you an option to edit in Markdown or in HTML. If you edit markdown, it will save as the rendered HTML, but with the source Markdown embedded inside a <script> tag. When editing again, it will show you the Markdown source. If you edit HTML, you will lose the Markdown and the content will just behave as a regular HTML field with an HTML widget.

Utility of this module vs web_widget_text_markdown
==================================================
The benefit of this module over web_widget_text_html is that it allows markdown-editing of HTML fields such as for example the mail.message body for the chatter, or HTML fields that end up in printed reports such as the Quotation description. Such fields cannot be converted to Text fields because it will cause problems for their functionality. But with this widget, they can still be edited as Markdown.

A difficulty with this module is that once you start editing a field as HTML, whether with this Markdown widget in HTML mode, or through a view that has the normal HTML editor, you will lose the Markdown source and you will have to keep editing the field as HTML, or do a backconversion to Markdown. This backconversion is always lossy to a certain extent and we did not bother implementing it - but it's something for the roadmap.
.
