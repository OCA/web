.. image:: https://img.shields.io/badge/license-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

=================
Odoo Slick Widget
=================

This module provides a Slick Carousel widget for use in Odoo.


Usage
=====

Default usage is on a One2many attachment field, as defined below::

    class SlickExample(models.Model):
        _name = 'slick.example'
        _description = 'Slick Example Model'
        image_ids = fields.One2many(
            name='Images',
            comodel_name='ir.attachment',
            inverse_name='res_id',
        )

Assuming the above model, you would use add a Slick Carousel on the
``image_ids`` column by using the following field definition in the
model's form view::

    <field name="image_ids" widget="one2many_slick_images" options="{}"/>

Example implementation - https://repo.laslabs.com/projects/ODOO/repos/web/browse/web_widget_slick_example

Options
=======

The widget passes options directly through to Slick, so any `setting
available to Slick`_ is available to the widget. Additional options
specific to Odoo are:

+-----------------+--------------+---------------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Name            | Type         | Default             | Description                                                                                                                                                                 |
+=================+==============+=====================+=============================================================================================================================================================================+
| ``fieldName``   | ``String``   | ``datas``           | Field to lookup on relation table. Defaults to ``datas``, which is the data field used in ``ir.attachment`` table. This would be used to define a custom attachment model   |
+-----------------+--------------+---------------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| ``modelName``   | ``String``   | ``ir.attachment``   | Model of attachment relation. This would be used to define a custom attachment model instead of default ``ir.attachment``                                                   |
+-----------------+--------------+---------------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

.. _setting available to Slick: http://kenwheeler.github.io/slick/#settings


Credits
=======

Images
------

* LasLabs: `Icon <https://repo.laslabs.com/projects/TEM/repos/odoo-module_template/browse/module_name/static/description/icon.svg?raw>`_.

Contributors
------------

* Dave Lasley <dave@laslabs.com>

Maintainer
----------

.. image:: https://laslabs.com/logo.png
   :alt: LasLabs Inc.
   :target: https://laslabs.com

This module is maintained by LasLabs Inc.
