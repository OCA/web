
To send a notification to the user you just need to call one of the new methods defined on res.users:

.. code-block:: python
  
   self.env.user.notify_info(message='My information message')

or 

.. code-block:: python
  
   self.env.user.notify_warning(message='My marning message')

.. figure:: static/description/notifications_screenshot.png
   :scale: 80 %
   :alt: Sample notifications

You can test the behaviour of the notifications by installing this module in a demo database.
   Click in your user logo in the top right corner of the screen then click "Preferences".

.. figure:: static/description/test_notifications_demo.png
   :scale: 80 %
   :alt: Sample notifications
