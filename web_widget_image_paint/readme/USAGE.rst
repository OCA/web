Add the widget to your module as follows:

* __manifest__.py

.. code-block::

   'depends': ['web_widget_image_paint'],

* ORM model

.. code-block::

   my_paint_image = fields.Binary()

* Form View :

.. code-block::

   <field name="my_paint_image"
          widget="image_paint"
          width="500"
          height="650"
          readonly="0"
          background="/my_module/static/img/my_background.png"
          options="{'drawing_mode': True,
                    'edit_background_image': True,
                    'background_image_field': 'my_background_image_field',
                    'add_marker': True,
                    'marker_shape': 'x-sign',
                    'marker_color': 'red',
                    'marker_size': 20}"/>

Options
-------

xml field tag attributes:

* width (default: 500)
* height (default: 376)
* background (default: \web_widget_image_paint\static\src\img\image-placeholder.png)

widget options:

* drawing_mode : True | False (default: True)

  When False the ‘Enter Drawing Mode’ button becomes invisible, hence only moving mode available
  
* edit_background_image : True | False (default: True)

  Set this option to False if you do not want the end-user to upload his own background image

* background_image_field

  You can specify another binary field on the same model for the background image.

* add_marker : True | False (default: True)

  When False the ‘Add Marker’ button is not available

* marker_shape : x-sign | diamond | circle | square (default: x-sign)

* marker_color (default 'red')

* marker_size (default 20)