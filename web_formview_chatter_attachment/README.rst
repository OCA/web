============================
Form View Chatter Attachment
============================

This module allows you to use the Odoo attachment widget as a standalone element, perfect for embedding inside specific form view notebook pages without the rest of the chatter UI. 

In Odoo 18, this module extends the native `<chatter>` tag to accept custom attributes, while also maintaining backward compatibility with the legacy `<div class="oe_chatter">` structure.

|

Usage
=====

Method 1: Native Odoo 18 Tag (Recommended)
------------------------------------------
You can use the standard `<chatter/>` element anywhere in your form view and pass our custom attributes directly to it.

.. code:: xml

       <chatter 
            open_attachments="True" 
            hide_attachments_topbar="True" 
            readonly_attachments="True"
       />


Method 2: Legacy Div Options (Backward Compatibility)
-----------------------------------------------------
If you are migrating from older versions, the legacy div method is still fully supported via a custom OWL compiler.

.. code:: xml

       <div class="oe_chatter"
            options="{'render_attachments': True, 'open_attachments': True, 'hide_attachments_topbar': True, 'readonly': True}"
       />

|

Widget Options / Attributes
---------------------------

* **render_attachments**: (Legacy Div Only) Set to True to trigger the custom OWL compiler and show the attachment widget.
* **open_attachments**: Set to True (or `open_attachments="True"`) to automatically expand the files view when the form loads.
* **hide_attachments_topbar**: Set to True to hide the composer buttons ("Send message", "Log note", "Activities"), turning the widget into a pure attachment list.
* **readonly_attachments** (or `readonly` in legacy div): Set to True to hide the "Attach Files" button and the delete icons next to files, locking the attachment list.

|

Remarks
-------

The attachment topbar natively contains the buttons for the chatter composer. By hiding it via `hide_attachments_topbar`, you effectively restrict the user to only interacting with attachments. If `readonly_attachments` is also used, the attachment list becomes entirely view-only.
