Client side message boxes
=========================

This module allows to show a message popup on the client side as result of a button.

Usage
=====

Depend on this module and return

.. code:: python

    {
        'type': 'ir.actions.act_window.message',
        'title': 'My title',
        'message': 'My message'
    }

You are responsible for translating the messages.

* https://www.odoo.com/forum/help-1

Known issues / Roadmap
======================

* add `message_type` to differenciate between warnings, errors, etc.
* have one `message_type` to show a nonmodal warning on top right
* have `button_title` to set the button title
* have `buttons` containing button names and action definitions for triggering actions from the message box

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
