## For the whole database

Go to *Settings ▸ General Settings ▸ Lists in Forms ▸ Scrollable Lists* and
set *Visible rows*: the rows a list inside a form shows before it scrolls.
`0` (the default) leaves every list as it is.

The value is kept in the system parameter `web_x2many_list_scroll.rows`
(*Settings ▸ Technical ▸ System Parameters*, developer mode). It is read once
per session: after changing it, reload the page. Anything that is not a
positive integer counts as `0`.

## For one form

On the field of the lines in the form view, add the option `scroll_rows`:

```xml
<field name="order_line" options="{'scroll_rows': 15}">
```

It wins over the database setting. `'scroll_rows': 0` leaves that list as it
is even when the setting is on. The option only applies when the field is
shown as a list.

## Row height

The height of the box is the configured number of rows times the height of a
row as rendered, plus the header, both measured on the list itself, so it
follows the font, the density and the device (rows are taller on a touch
screen). They are exposed as the CSS custom properties
`--o-x2many-list-scroll-row-height` and `--o-x2many-list-scroll-header-height`
on the field. Rows with wrapped text take more room than the first one, so a
page with such rows shows fewer of them.

## Header above the rows

Inside a form Odoo flattens the header of a list, so the tags, badges and
toggles of the rows rolling under it would paint over it. The module lifts the
header and the footer to the level of the CSS custom property
`--o-x2many-list-scroll-zindex` (`2`). Native list widgets do not stack above
that; a custom widget that does can be tuned through that property.
