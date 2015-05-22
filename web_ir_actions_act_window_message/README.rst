Client side message boxes
=========================

This module allows to show a message popup on the client side as result of a button.

Usage
=====

Depend on this module and return

.. code:: python

    {
        'type': 'ir.actions.act_window.message',
        'title': _('My title'),
        'message': _('My message'),
    }

You are responsible for translating the messages.

Known issues / Roadmap
======================

* add `message_type` to differenciate between warnings, errors, etc.
* have one `message_type` to show a nonmodal warning on top right
* have `button_title` to set the button title
* have `buttons` containing button names and action definitions for triggering actions from the message box


Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/web/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and welcomed feedback
`here <https://github.com/OCA/web/issues/new?body=module:%20web_ir_actions_act_window_message%0Aversion:%208.0%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.


Credits
=======

Contributors
------------

* Holger Brunn <hbrunn@therp.nl>

Maintainer
----------

.. image:: http://odoo-community.org/logo.png
    :alt: Odoo Community Association
    :target: http://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose mission is to support the collaborative development of Odoo features and promote its widespread use.

To contribute to this module, please visit http://odoo-community.org.
