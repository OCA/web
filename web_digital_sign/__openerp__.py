# -*- coding: utf-8 -*-
# See LICENSE file for full copyright and licensing details.
{
    "name" : "Web Digital Signature 9.0",
    "version" : "9.0.1.0.0",
    'author': 'Serpent Consulting Services Pvt. Ltd.',
    "category": '',
    'license': 'AGPL-3',
    'complexity': "easy",
    'depends': ['web'],
    'description': '''
     This module provides the functionality to store digital signature
     for a record.
        -> This  module is helpfull to make your business process a little
           bit more faster & makes it more user friendly by providing you
           digital signature functionality on your documents.
        -> It is touch screen enable so user can add signature with touch
           devices.
        -> Digital signature can be very usefull for documents such as
           sale orders, purchase orders, inovoices, payslips, procurement
           receipts, etc.
        The example can be seen into the User's form view where we have
        added a test field under signature.
    ''',
    'data': [
        'views/we_digital_sign_view.xml',
        'users_view.xml'
    ],
    'website': 'http://www.serpentcs.com',
    'qweb': ['static/src/xml/digital_sign.xml'],
    'installable': True,
    'auto_install': False,
}

