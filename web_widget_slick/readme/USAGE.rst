Default usage is on a One2many attachment field, as defined below::

    class SlickExample(models.Model):
        _name = 'slick.example'
        _description = 'Slick Example Model'
        image_ids = fields.One2many(
            name='Images',
            comodel_name='ir.attachment',
            inverse_name='res_id',
        )

Assuming the above model, you would add a Slick Carousel on the
``image_ids`` column by using the following field definition in the
model's form view::

    <field name="image_ids" widget="one2many_slick_images" options="{}"/>

Options
-------

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

Example Module
--------------

An example implementation, for instructional purposes as well as convenient
functional testing, is provided in the `web_widget_slick_example` module.

* Install `web_widget_slick_example`.
* Activate Developer Mode.
* Go to Settings / Technical / Slick, and open the record to view the widget.

To try out different Slick settings:

* Go to Settings/User Interface/Views and search for 'slick.example.view.form'.
* Open the form view record.
* Click the Edit button.
* In the Architecture editor, find `options="{'slidesToShow': 2}`, and add
  any desired settings (separated by commas) inside the curly braces.
* Save the changes and browse to the widget, as described above, to see the
  widget with the new settings in effect.
