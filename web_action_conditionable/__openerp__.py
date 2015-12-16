# -*- coding: utf-8 -*-

{
    "name": 'web_action_conditionable',
    "version": "7.0.0.1.0",
    "summary": """Web Action Conditionable: This module was written to extend the \
functionality of actions in tree views""",
    "description": """
========================
Web Action Conditionable
========================

This module was written to extend the functionality of actions in tree views. \
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

Configuration
-------------

Not needed.

    """,
    "depends": [
        'base',
        'web',
    ],
    'data': [],
    'js': ['static/src/js/views.js'],
    "author": "Cristian Salamea,Odoo Community Association (OCA), Clovis Nzouendjou",
    "installable": True,
}
