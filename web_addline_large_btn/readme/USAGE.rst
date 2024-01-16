Install module and in the editable tree view in question add the
required options as show below:

- **use_large_addline_btn** - string *true* small case or string value of JS
  boolean true.
- **use_large_addline_model** - the model you want to affect changes to, majorly
  its the fields model e.g one2many field's comodel.
- **use_large_addline_btn_class** - button string classes e.g bootstrap button
  classes ``btn btn-primary``.

see a format example of setting it in xml code below:

.. code-block:: xml

    <field name="field_inspection_ids">
        <tree use_large_addline_btn="true"use_large_addline_model="asset.inspection.line" use_large_addline_btn_class="btn btn-primary">
           <field name="date_of_inspection" />
           <field name="inspector_id" />
           <field name="inspector_notes" />
        </tree>
    </field>
