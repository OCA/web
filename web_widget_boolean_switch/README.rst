.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

=========================
Web widget boolean switch
=========================

This module add a widget ``boolean_switch`` to render boolean fields. One
of it's main features is to quick edit that field without enter in edit mode.


Configuration
=============

In the view (test on tree view and form view), you can declare any boolean
field using this widget.

Example
-------

```
   <field name="active"
          widget="boolean_switch"
          context="{'fake_parameter': 'foo'}"
          options="{'quick_edit': True, 'extra': {'onText': 'Yes', 'offText': 'No' }}"/>
```

.. note::

   ``context`` is sent to the ``write`` method of the field model in case of
   special needs with the quick edition.

Options
-------


quick_edit
~~~~~~~~~~

extra
~~~~~
``extra`` is used to set
`bootstrap-switch <http://www.bootstrap-switch.org/options.html>`_ options.

*Available options*:

   * **size**: The checkbox size - default: `null` - values: null, 'mini', 'small', 'normal', 'large'
   * **animate**: Animate the switch - default: `true`
   * **indeterminate**: Indeterminate state - default: `false`
   * **inverse**: Inverse switch direction - default: `false`
   * **onColor**: Color of the left side of the switch - default: `"primary"` - values: 'primary', 'info', 'success', 'warning', 'danger', 'default'
   * **offColor**: Color of the right side of the switch - default: `default` - values: 'primary', 'info', 'success', 'warning', 'danger', 'default'
   * **onText**: Text of the left side of the switch - default: `"ON"`
   * **offText**: Text of the right side of the switch - default: `"OFF"`,
   * **labelText**: Text of the center handle of the switch - default: `"&nbsp;"`,
   * **handleWidth**: Width of the left and right sides in pixels - default:  `"auto"`,
   * **labelWidth**: Width of the center handle in pixels - default: `"auto"`,
   * **baseClass**: Global class prefix - default: `"bootstrap-switch"`,
   * **wrapperClass**: Container element class(es) - default: `"wrapper"`,


..warning::

    Those parameters are overwritten by this module or highly discouraged:

    * **radioAllOff**: Allow this radio button to be unchecked by the user - default: `false`
    * **state**: The checkbox state - default: `true`
    * **disabled**: Disable state - default: `false`
    * **readonly**: Readonly state - default: `false`
    * **onInit**: Callback function to execute on initialization - default: `function() {}`,
    * **onSwitchChange**: Callback function to execute on switch state change - default: `function() {}`


.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/162/7.0

Known issues / Roadmap
======================

* Manage Null values
*

Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/web/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and
welcomed feedback `here <https://github.com/OCA/web/issues/new?body=module:%20
web_widget_boolean_switch%0Aversion:%207.0%0A%0A**Steps%20to%20reproduce**%0A-
%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.


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
