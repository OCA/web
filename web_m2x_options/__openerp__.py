# -*- coding: utf-8 -*-

{
    "name": 'web_m2x_options',
    "version": "0.1",
    "description": """
=====================================================
Add new options for many2one and many2manytags field:
=====================================================

- create: true/false -> disable "create" entry in dropdown panel
- create_edit: true/false -> disable "create and edit" entry in dropdown panel
- limit: 10 (int) -> change number of selected record return in dropdown panel
- m2o_dialog: true/false -> disable quick create M20Dialog triggered on error.
- search_more: true/false -> force disable/enable search more button.
- field_color -> define the field used to define color.
- colors -> link field values to a HTML color.


Example:
--------

``<field name="partner_id" options="{'limit': 10, 'create': false,
'create_edit': false, 'field_color':'state', 'colors':{'active':'green'}}"/>``

Note:
-----

If one of those options are not set, many2one field uses default many2one
field options.

Thanks to:
----------

- Nicolas JEUDY <njeudy@tuxservices.com>
- Valentin LAB <valentin.lab@kalysto.org>

""",
    "depends": [
        'base',
        'web',
    ],
    "js": [
        'static/src/js/form.js',
    ],
    "author": "Tuxservices,initOS GmbH,Odoo Community Association (OCA)",
    "installable": True,
    "active": False,
}
