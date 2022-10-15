
To send a notification to the user you just need to call one of the new methods defined on res.users:

.. code-block:: python

   self.env.user.notify_success(message='My success message', title="My Title", sticky=False, beep=True)
   @param beep: True -> alert with beep

   self.env.user.swal_notify_success(message='My success message', title="My Title",  notify_ui="sweet", sticky=False, beep=True)
   @param beep: True -> alert with beep
   @param notify_ui: [ sweet | odoo ] -> sweet alert else normal odoo alert

or

.. code-block:: python

   self.env.user.notify_danger(message='My danger message', title="My Title",  notify_ui="sweet", sticky=False, beep=True)
   @param beep: True -> alert with beep

   self.env.user.swal_notify_danger(message='My success message', title="My Title",  notify_ui="sweet", sticky=False, beep=True)
   @param beep: True -> alert with beep
   @param notify_ui: [ sweet | odoo ] -> sweet alert else normal odoo alert

or

.. code-block:: python

   self.env.user.notify_warning(message='My warning message', title="My Title",  notify_ui="sweet", sticky=False, beep=True)
   @param beep: True -> alert with beep

   self.env.user.swal_notify_warning(message='My success message', title="My Title",  notify_ui="sweet", sticky=False, beep=True)
   @param beep: True -> alert with beep
   @param notify_ui: [ sweet | odoo ] -> sweet alert else normal odoo alert

or

.. code-block:: python

   self.env.user.notify_info(message='My information message', title="My Title",  notify_ui="sweet", sticky=False, beep=True)
   @param beep: True -> alert with beep

   self.env.user.swal_notify_info(message='My success message', title="My Title",  notify_ui="sweet", sticky=False, beep=True)
   @param beep: True -> alert with beep
   @param notify_ui: [ sweet | odoo ] -> sweet alert else normal odoo alert

or

.. code-block:: python

   self.env.user.notify_default(message='My default message', title="My Title",  notify_ui="sweet", sticky=False, beep=True)
   @param beep: True -> alert with beep

   self.env.user.swal_notify_default(message='My success message', title="My Title",  notify_ui="sweet", sticky=False, beep=True)
   @param beep: True -> alert with beep
   @param notify_ui: [ sweet | odoo ] -> sweet alert else normal odoo alert

.. figure:: static/description/buttons.png
   :scale: 80 %
   :alt: Test Buttons

.. figure:: static/description/swal-success.png
   :scale: 80 %
   :alt: Test Buttons

You can test the behaviour of the notifications by installing this module in a demo database.
Access the users form through Settings -> Users & Companies. You'll see a tab called "Test web notify", here you'll find two buttons that'll allow you test the module.

.. figure:: static/description/normal-odoo-success.jpeg
   :scale: 80 %
   :alt: Sample notifications
