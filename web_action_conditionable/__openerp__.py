# -*- coding: utf-8 -*-
# © 2015 Cristian Salamea, Clovis Nzouendjou, Odoo Community Association (OCA)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": 'web_action_conditionable',
    "version": "7.0.1.0.0",
    "license": "AGPL-3",
    "category": "Usability",
    "summary": """Web Action Conditionable: This module was written to extend the \
functionality of actions in tree views""",
    "description": """
========================
Web Action Conditionable
========================

This module was written to extends the functionality of actions in tree views. \
Odoo by default support::

    <tree delete="false" create="false">

with this module you can::

    <tree delete="state=='draft'">
or
    <tree create="state in ('draft', 'confirm')">

It works in any tree view, so you can use it in One2many.

Installation
------------

To install this module, just follow basic steps to install an odoo module.

    """,
    "depends": [
        'base',
        'web',
    ],
    'data': [],
    'js': [
        'static/src/js/views.js'
    ],
    "author": "Cristian Salamea, Clovis Nzouendjou, Odoo Community Association (OCA)",
    "installable": True,
    "application": False,
}
