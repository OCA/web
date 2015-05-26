.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: License

Extended Email Widget
======================

Features
========

* This module allows to change the default behaviour of email widgets with the possibility to add cc, bcc and subject fields.

* It also adds the possibility to create a button (from the object with a client action) to send a email to specified addresses, that is useful in tree views or to send a email to all contacts

Usage
=====

In the view declaration add an options attribute to an email widget field with the reference to the fields in view to include::

    <field name="email" widget="email" options="{'cc': 'email_cc', 'subject': 'name'}/>

This code will use the field email_cc from the view as the cc, and the field name to use as email subject.

Allowed options are:

* cc
* bcc (May not work with all email clients)
* replyto (May not work with all email clients)
* subject

For use the button its possible to declare a new function in the object that will be used::

    def send_email_button(self, cr, uid, ids, context=None):
        assert len(ids) == 1
        partner = self.browse(cr, uid, ids[0], context=context)
        bcc_address = self.pool['res.user'].browse(cr, uid, uid).email
        return {
            'type': 'ir.actions.client',
            'name': 'Send Email',
            'tag': 'email_button.mail_link',
            'params': {
                'email': partner.email,
                'bcc': bcc_address,
                'subject': partner.name
            }
        }

Credits
=======

Contributors
------------

* Hugo Santos <hugo.santos@factorlibre.com>

Maintainer
----------

.. image:: http://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: http://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose mission is to support the collaborative development of Odoo features and promote its widespread use.

To contribute to this module, please visit http://odoo-community.org.
