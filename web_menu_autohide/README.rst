Hide menus
==========

This addon hides the top and left menu bars. They become visible again when you move the mouse towards the border of the screen (the distance is configurable). Moving the mouse out of a menu causes it to disappear after a configurable delay.

Configuration
=============

To configure this module, you need to:

* go to Settings / Technical / Parameters / System Parameters
* adjust `web_hide_menu.show_bar_treshold` to set the distance in pixels from the border from which the menu appears (default is 10 pixels)
* adjust `web_hide_menu.hide_delay` to set the amount of milliseconds after which the menu disappears if the mouse left it (default is 10 seconds)

Known issues / Roadmap
======================

* This module heavily relies on mouse events, so it probably messes things up for touchscreens

Credits
=======

Contributors
------------

* Holger Brunn <hbrunn@therp.nl>

Icon
----

* http://commons.wikimedia.org/wiki/File:VisualEditor_-_Icon_-_Menu.svg
* http://commons.wikimedia.org/wiki/File:ProhibitionSign2.svg

Maintainer
----------

.. image:: http://odoo-community.org/logo.png
    :alt: Odoo Community Association
    :target: http://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose mission is to support the collaborative development of Odoo features and promote its widespread use.

To contribute to this module, please visit http://odoo-community.org.
