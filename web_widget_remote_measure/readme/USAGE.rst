The remote device has to be in the users network so their web clients can reach them.

In order to test a device you can:

#. Go to *Settings > Technical > Devices > Remote devices*
#. In the Kanban view you'll wich devices can be reached as they'll have a green dot in
   their card.
#. Go to one of those and click *Edit*.
#. You can start measuring from the remote device in the *Test measure* field.

On the technical side, you can use the widget in your own `Float``. You'll need to
provide an uom field so records that aren't in that UoM don't measure from the device.

.. code:: xml

    <field name="float_field" widget="remote_measure" options="{'remote_device_field': 'measure_device_id', 'uom_field': 'uom_id'}" />
