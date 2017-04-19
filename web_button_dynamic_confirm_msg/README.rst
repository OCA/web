.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

==============================
Web Button Dynamic Confirm Msg
==============================

When defining a button on a view (i.e form view or a list view) you can specify
a confirmation message to be displayed to the user when the button is clicked.

.. code-block:: xml

   <button name="action_method" type="object" confirm="confirm message"/>

The confirm message is static and independent of the context on which the action
will be executed.

In order to mitigate this limitation, this new addons will allow you to use the value
of a field as the confirmation message in the xml definition of the view.

.. code-block:: xml

   <field name="msg_field" invisible="1"/>
   <button name="action_method" type="object" confirm="msg_field"/>

The field used for the confirmation message must be provided as following

.. code-block:: python

   msg_field = fields.Text(
      compute='_compute_msg_field',
      readonly=True,
   )

   def _compute_msg_field(self):
      for rec in self:
         rec.msg_field = "confirm message"


Usage
=====

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

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/web/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smashing it by providing a detailed and welcomed feedback.

Credits
=======

Images
------

* Odoo Community Association: `Icon <https://github.com/OCA/maintainer-tools/blob/master/template/module/static/description/icon.svg>`_.

Contributors
------------

* Zakaria Makrelouf <z.makrelouf@gmail.com>
* Second Person <second.person@example.org>

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
