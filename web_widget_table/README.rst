.. image:: https://img.shields.io/badge/license-AGPL--3-blue.png
   :target: https://www.gnu.org/licenses/agpl
   :alt: License: AGPL-3

================
Web Widget Table
================

A module to add datatable https://datatables.net/ as a widget

**Table of contents**

.. contents::
   :local:

Usage
=====

Use this widget by saying:

.. code-block:: xml

    <field name="my_table" widget="widget_table" options="{
                                'field_name': 'child_ids',
                                'datatable_params':{'searching': False,
                                'paging': False,
                                'info': False},
                                'fields': ['name','date_start', 'date_end', 'real_date_start', 'real_date_end', 'total_time'],
                                'headers': ['Name','Date Start', 'Date End', 'Real Date Start', 'Real Date End', 'Total Time']}"/>

"my_table" field must be of type char, it is only used to display the table. For example:

.. code-block:: python

    my_table = fields.Char(
            store=False)

You need to pass the following parameters:

field_name
    This required parameter indicates a One2many field present in the model from which
    the fields parameter will refer
fields
    This required parameter is a list that indicates the fields from child_ids records
    that will be displayed in the datatable
headers
    The required parameter is a list of used string to display in the table header, 
    they should be in the same order as the fields
datatable_params
    This is to pass the datatable parameters https://datatables.net/manual/options, like:
        paging;
        info;
        searching;
        scrollY;
        etc.


Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/web/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smash it by providing detailed and welcomed feedback.


Credits
=======

Authors
~~~~~~~

* Savoir-faire Linux

Contributors
~~~~~~~~~~~~

* Luis Garcia (luis.garcia@savoirfairelinux.com)
* Rim Ben Dhaou (rim.bendhaou@savoirfairelinux.com)
* Larbi Gharib (larbi.gharib@savoirfairelinux.com)
* William Beverly (william.beverly@savoirfairelinux.com)
* Jananjoy Rajkumar (jananjoy.rajkumar@savoirfairelinux.com)
* Pierre Gault (pierre.gault@savoirfairelinux.com)

Maintainers
~~~~~~~~~~~

* Luis Garcia (luis.garcia@savoirfairelinux.com)
* Larbi Gharib (larbi.gharib@savoirfairelinux.com)
