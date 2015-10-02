.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

=========================
Web widget boolean switch
=========================

This module add a widget to render boolean fields

Installation
============

To install this module, you need to:

* do this ...

Configuration
=============

Example
-------

```xml
   <field name="active"
          widget="boolean_switch"
          options="{'quick_edit': True, extra: {'onText': 'Yes', 'offText': 'No' }"/>
```

Options
-------


quick_edit
~~~~~~~~~~

extra
~~~~~
``extra`` is used to set
`bootstrap-switch <http://www.bootstrap-switch.org/options.html>`_ options.

Available::

   * **size**: - default: `null`
   * **animate**: - default: `true`
   * **indeterminate**: `false`
   * **inverse**: `false`
   * **radioAllOff**: `false`
   * **onColor**: `"primary"`
   * **offColor**: `default`
   * **onText**: `"ON"`,
   * **offText**: `"OFF"`,
   * **labelText**: `"&nbsp;"`,
   * **handleWidth**: `"auto"`,
   * **labelWidth**: `"auto"`,
   * **baseClass**: `"bootstrap-switch"`,
   * **wrapperClass**: `"wrapper"`,


.. warning::

   Those parameters are overwritten by this module or highly discourage::

      * **state**: true,
      * **disabled**: `false`
      * **readonly**: `false`
      * **onInit**: `function() {}`,
      * **onSwitchChange**: `function() {}`


Usage
=====

To use this module, you need to:

* go to ...

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/{repo_id}/{branch}

.. repo_id is available in https://github.com/OCA/maintainer-tools/blob/master/tools/repos_with_ids.txt
.. branch is "8.0" for example

Known issues / Roadmap
======================

* ...

Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/
{project_repo}/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and welcomed feedback `here <https://github.com/OCA/
{project_repo}/issues/new?body=module:%20
{module_name}%0Aversion:%20
{version}%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.


Credits
=======

Contributors
------------

* Pierre Verkest <pverkest@anybox.fr>

Maintainer
----------

.. image:: https://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: https://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose
mission is to support the collaborative development of Odoo features and
promote its widespread use.

To contribute to this module, please visit http://odoo-community.org.
