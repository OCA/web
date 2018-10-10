
To send a notification to the user you just need to call one of the new methods defined on res.users:

.. code-block:: python
  
   self.env.user.notify_info('My information message')

or 

.. code-block:: python
  
   self.env.user.notify_warning('My marning message') 

.. figure:: static/description/notifications_screenshot.png
   :scale: 80 %
   :alt: Sample notifications