Insert `widget='image'` in your field view definition in any image field

.. code:: xml

    <field name="image_field" widget="image"/>


If the model has different fields of the same image with different size
(as ``product.product`` for instance with ``image``, ``image_medium``, ``image_small``),
you can write the following code to reduce the load duration of the tree view.

.. code:: xml

    <field name="image_small" widget="image" options="{'tooltip_image': 'image'}"/>