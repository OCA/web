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
        # optional title of the close button, if not set, will be _('Close')
        # if set False, no close button will be shown
        # you can create your own close button with an action of type
        # ir.actions.act_window_close
        'close_button_title': 'Make this window go away',
        # this is an optional list of buttons to show
        'buttons': [
            # a button can be any action (also ir.actions.report.xml et al)
            {
                'type': 'ir.actions.act_window',
                'name': 'All customers',
                'res_model': 'res.partner',
                'view_mode': 'form',
                'views': [[False, 'list'], [False, 'form']],
                'domain': [('customer', '=', True)],
            },
            # or if type == method, you need to pass a model, a method name and
            # parameters
            {
                'type': 'method',
                'name': _('Yes, do it'),
                'model': self._name,
                'method': 'myfunction',
                # list of arguments to pass positionally
                'args': [self.ids],
                # dictionary of keyword arguments
                'kwargs': {'force': True},
            }
        ]
    }

You are responsible for translating the messages.

Known issues / Roadmap
======================

* add `message_type` to differenciate between warnings, errors, etc.
* have one `message_type` to show a nonmodal warning on top right


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
