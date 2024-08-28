
To send a notification to the user you just need to call one of the new methods defined on res.users:

.. code-block:: python

   self.env.user.notify_success(message='My success message')

or

.. code-block:: python

   self.env.user.notify_danger(message='My danger message')

or

.. code-block:: python

   self.env.user.notify_warning(message='My warning message')

or

.. code-block:: python

   self.env.user.notify_info(message='My information message')

or

.. code-block:: python

   self.env.user.notify_default(message='My default message')

You can also add sound to your notifications by using the sound parameter. The sound parameter expects a string containing the URL path to the audio file that should be played when the notification is displayed.

Example:

.. code-block:: python

    self.env.user.notify_success(message='My success message', sound='/<YOUR_MODULE>/static/audio/success.mp3' )

or

.. code-block:: python

    self.env.user.notify_info( message='My information message', sound='/<YOUR_MODULE>/static/audio/info.mp3' )

The sound parameter can be used with any notification type (success, danger, warning, info, or default). If the sound parameter is not provided, the notification will be displayed without any sound.

The notifications can bring interactivity with some buttons.

* One allowing to refresh the active view
* Another allowing to send a window / client action

The reload button is activated when sending the notification with:

The action can be used using the ``action`` keyword and we can choose which name to
give to our button with the ``button_name`` key in the action context `params` key:

.. code-block:: python

    action = self.env["ir.actions.act_window"]._for_xml_id('sale.action_orders')
    action.update({
       'res_id': self.id,
       'views': [(False, 'form')],
    })
    action["context"].setdefault("params", {})
    action["context"]["params"]["button_name"] = "Sales"
    action["context"]["params"]["button_icon"] = "fa-eye"
    self.env.user.notify_info('My information message', action=action)


.. figure:: ../static/img/notifications_screenshot.gif
   :alt: Sample notifications

You can test the behaviour of the notifications by installing this module in a demo database.
Access the users form through Settings -> Users & Companies. You'll see a tab called "Test web notify", here you'll find two buttons that'll allow you test the module.

.. figure:: ../static/img/test_notifications_demo.png
   :alt: Sample notifications
