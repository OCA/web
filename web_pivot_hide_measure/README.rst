.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

===========================
Hide measures in pivot view
===========================

This module allows to hide measures in pivot view

Installation
============

It was tested on Odoo 10.0 branch.

Usage
=====

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/162/10.0

Add this method in the res model of the pivot view, where the list named 'fields_to hide'
id a comma separated list of the measures to hide

```python
    @api.model
    def fields_get(self, fields=None, attributes=None):
        fields_to_hide = [
            'field1', 'field2', 'field3'
        ]
        res = super(ModelName, self).fields_get(
            fields, attributes)
        for field in fields_to_hide:
            res[field]['selectable'] = False
        return res

```

Known issues
============
This module depends on the 'dirty' flag that Odoo sets on modified forms. Odoo
only sets this flag when the focus is changed, so if you modified only one
field and the focus is still on that field, you won't be prevented from closing
the browser window.

Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/web/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smash it by providing detailed and welcomed feedback.

Credits
=======

Images
------

* Odoo Community Association: `Icon <https://github.com/OCA/maintainer-tools/blob/master/template/module/static/description/icon.svg>`_.

Contributors
------------

* Janire Olagibel <janolabil@gmail.com>

Maintainer
----------

.. image:: https://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: https://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose
mission is to support the collaborative development of Odoo features and
promote its widespread use.

To contribute to this module, please visit https://odoo-community.org.

