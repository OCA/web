## Banner presentation inside \<group\>

Placing a full-width inline banner inside a \<group\> is only partially
supported. Depending on the target XPath (especially when targeting a
\<field/\> rendered by certain widgets), the banner or surrounding
fields may render distorted.

## Limitations of draft eval context variable

- draft is always available in the eval context, but for new records
  (record_id = False) it only contains the trigger fields from the
  banner rules.
- For existing records, draft overlays the trigger field values on top
  of the persisted record; all other fields come from Model.new defaults
  rather than the database.
- Only simple field types are included: char, text, html, selection,
  boolean, integer, float, monetary, date, datetime, many2one, and
  many2many. **one2many/reference/other types are omitted.**
