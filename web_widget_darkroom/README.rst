.. image:: https://img.shields.io/badge/license-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/lgpl-3.0-standalone.html
   :alt: License: LGPL-3

======================
Odoo DarkroomJS Widget
======================

This module provides a `DarkroomJS`_ web widget for use with images fields.

.. _DarkroomJS: https://github.com/MattKetmo/darkroomjs 

This widget will allow you to perform the following actions on images:

 * Zoom
 * Rotate
 * Crop
 * Step back in history client-side (before save)
 

Usage
=====

To use this module, you need to:

* Install web_widget_darkroom
* Add the to any One2many image relation by using the `darkroom` widget. Options can be passed through to Darkroom using the `options` key::

    <field name="image_id" widget="darkroom"
                           options="{'minWidth': 100}" />

The Odoo DarkroomJS widget passes options directly through to Darkroom, which are copied from the source below::

  // Default options
  defaults: {
    // Canvas properties (dimension, ratio, color)
    minWidth: null,
    minHeight: null,
    maxWidth: null,
    maxHeight: null,
    ratio: null,
    backgroundColor: '#fff',

    // Plugins options
    plugins: {},

    // Post-initialisation callback
    initialize: function() { /* noop */ }
  },



Known Issues/Roadmap
====================

* Plugins are not able to be added without inheriting, then redefining the widget in the registry due to JS inheritance.
  ** This is not scalable because there would need to be an explicit dependency chain in order to avoid registry overwrite.



Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/{project_repo}/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smashing it by providing a detailed and welcomed feedback.

Credits
=======

Images
------

* Odoo Community Association: `Icon <https://github.com/OCA/maintainer-tools/blob/master/template/module/static/description/icon.svg>`_.

Contributors
------------

* Dave Lasley <dave@laslabs.com>

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
