Demo of `web_widget_sub_view_form`.

A partner can be a teacher or a student (`kind`), each type having
its own detail model:

- `partner.teacher`: subject, hire date
- `partner.student`: level, enrollment date

The partner form shows this detail in a `Details` tab, through the
`sub_view_form` widget fed by the computed `detail_ref` reference field.
