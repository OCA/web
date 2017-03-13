.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
    :alt: License: AGPL-3

================
Onchange actions
================

This module allows you to return an action (``ir.actions.*``) from an onchange handler.

Whit way, you can have much more elaborate message boxes or simply show a whole wizard or do whatever else is possible with actions on the client side.

Usage
=====

Depend on this module and in your onchange handler, add a key ``action`` to the ``warning`` dictionary of the result which contains the definition of an action to execute:

.. code:: python

    {
        'value': ....,
        'domain': ....,
        'warning': {
            'title': 'This will be shown if this module is not available',
            'message': 'Fallback message, see above',
            # this module picks up this key and shows it *instead* of the
            # warning above
            'action': {
                'type': 'ir.actions.act_window',
                'res_model': 'my.wizard',
                ...
            },
    }

The module ``web_ir_actions_act_window_message`` can be quite helpful here.

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
    :alt: Try me on Runbot
    :target: https://runbot.odoo-community.org/runbot/162/8.0

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

* Holger Brunn <hbrunn@therp.nl>

Do not contact contributors directly about help with questions or problems concerning this addon, but use the `community mailing list <mailto:community@mail.odoo.com>`_ or the `appropriate specialized mailinglist <https://odoo-community.org/groups>`_ for help, and the bug tracker linked in `Bug Tracker`_ above for technical issues.

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
