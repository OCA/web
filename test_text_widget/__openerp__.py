# -*- coding: utf-8 -*-
{
    'name' : 'Test',
    'version' : '0.11',
    'author' : 'initOS GmbH & Co. KG',
    'category' : '',
    'description': """

* Add new 'text_limited' widget for TextField, but data are limited to
10 lines or 500 characters (by default).
You can change default values by context varibles 'limit_lines' and 'limit_chars'.
If data contains more characters or lines, it will be cut.
Example of usage:
<field name="some_text_field"
       widget="text_limited"
       context="{'limit_lines': 8, 'limit_chars': 400}"
/>
""",
    'website': 'http://xpansa.com/',
    'license': 'AGPL-3',
    'images' : [],
    'depends' : [
        'web_widget_fieldtext_options',
    ],
    'data': [
        'views/test_view.xml',
    ],
    'update_xml': [],
	'active': False,
    'installable': True,
    'auto_install': True,
}