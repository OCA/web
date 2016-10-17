# -*- coding: utf-8 -*-
# © initOS GmbH 2016
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    'name': 'Web text limited widget',
    'version': '8.0.1.0.0',
    'author': 'initOS GmbH, OCA',
    'category': 'web',
    'description': """

* Add new functionality for TextField.
You can change default values by context varibles 'maxlines' and
'maxlength'.
If data contains more characters or lines, it will be cut.
Example of usage:
<field name="some_text_field"
       context="{'maxlines': 8, 'maxlength': 400}"
/>
""",
    'website': 'http://www.initos.com',
    'license': 'AGPL-3',
    'depends': [
        'web',
    ],
    'data': [
        'views/templates.xml',
    ],
    'qweb': ['static/src/xml/text_limited.xml', ],
    'installable': True,
    'auto_install': True,
}
