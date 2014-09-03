# -*- coding: utf-8 -*-
# This file is part of OpenERP. The COPYRIGHT file at the top level of
# this module contains the full copyright notices and license terms.
{
    'name': 'Web Warning Sounds',
    'version': '0.1',
    'author': 'HacBee UAB',
    'category': 'Custom',
    'website': 'http://www.hbee.eu',
    'summary': '',
    'description': """
This plugin allows to create modules that can play sound files.
It can be used in on_change methods or when raising an orm_except.

The sound files need to be located in the module's static directory:

module_name/static/path/to/audio/file/mysound.wav

Then the web client can access these files using the url path:

/module_name/static/path/to/audio/file/mysound.wav


To use it in on_change methods just add the the url path of the
audio file in the result dictionary under the key 'sound'. Example::

    res['sound'] = '/module_name/static/path/to/audio/file/mysound.wav'
    res['warning'] = {
        'title': _('Cannot do something'),
        'message': _('The reason why...'),
    }
    return res

On orm_except put the url path of the file inside '{{}}' as in this example::

    raise orm_except(
        'Cannot do something',
        'The reason why... {{ sound: /module_name/static/path/to/audio/file/mysound.wav }}'
    )
""",
    'depends': [
    ],
    'data': [
    ],
    'js': [
        'static/src/js/sound_extend.js'
    ],
    'installable': True,
    'application': True,
    'auto_install': False,
}
