# -*- coding: utf-8 -*-

{
    "name": 'web_datetime_options',
    "version": "0.1",
    "description": """
===========================================
Allow passing options to datepicker widgets
===========================================

This will set all options specified in the "datepicker" option of datetime
fields to the datepicker.

See http://api.jqueryui.com/datepicker/ for options

Example:
--------

  <field name="birthdate" options="{'datepicker':{'yearRange': 'c-100:c+0'}}"/>

Contributors:
-------------

- Vincent vinet <vincent.vinet@savoirfairelinux.com>

""",
    "depends": [
        'base',
        'web',
    ],
    "js": [
        'static/src/js/datepicker.js',
    ],
    "author": "Vincent Vinet",
    "installable": True,
    "active": False,
}
