================
MuK Search Panel
================

With Odoo version 13 a new feature is added which allows kanban views to be
extended by a search panel. This can be defined via XML and is then automatically
added to the view. With this module the function is ported back to version 12.

Installation
============

To install this module, you need to:

Download the module and add it to your Odoo addons folder. Afterward, log on to
your Odoo server and go to the Apps menu. Trigger the debug mode and update the
list by clicking on the "Update Apps List" link. Now install the module by
clicking on the install button.

Another way to install this module is via the package management for Python
(`PyPI <https://pypi.org/project/pip/>`_).

To install our modules using the package manager make sure
`odoo-autodiscover <https://pypi.org/project/odoo-autodiscover/>`_ is installed
correctly. Then open a console and install the module by entering the following
command:

``pip install --extra-index-url https://nexus.mukit.at/repository/odoo/simple <module>``

The module name consists of the Odoo version and the module name, where
underscores are replaced by a dash.

**Module:** 

``odoo<version>-addon-<module_name>``

**Example:**

``sudo -H pip3 install --extra-index-url https://nexus.mukit.at/repository/odoo/simple odoo11-addon-muk-utils``

Once the installation has been successfully completed, the app is already in the
correct folder. Log on to your Odoo server and go to the Apps menu. Trigger the 
debug mode and update the list by clicking on the "Update Apps List" link. Now
install the module by clicking on the install button.

The biggest advantage of this variant is that you can now also update the app
using the "pip" command. To do this, enter the following command in your console:

``pip install --upgrade --extra-index-url https://nexus.mukit.at/repository/odoo/simple <module>``

When the process is finished, restart your server and update the application in 
Odoo. The steps are the same as for the installation only the button has changed
from "Install" to "Upgrade".

You can also view available Apps directly in our `repository <https://nexus.mukit.at/#browse/browse:odoo>`_
and find a more detailed installation guide on our `website <https://mukit.at/page/open-source>`_.

For modules licensed under OPL-1, you will receive access data when you purchase
the module. If the modules were not purchased directly from
`MuK IT <https://www.mukit.at/>`_ please contact our support (support@mukit.at)
with a confirmation of purchase to receive the corresponding access data.

Upgrade
============

To upgrade this module, you need to:

Download the module and add it to your Odoo addons folder. Restart the server
and log on to your Odoo server. Select the Apps menu and upgrade the module by
clicking on the upgrade button.

If you installed the module using the "pip" command, you can also update the
module in the same way. Just type the following command into the console:

``pip install --upgrade --extra-index-url https://nexus.mukit.at/repository/odoo/simple <module>``

When the process is finished, restart your server and update the application in 
Odoo, just like you would normally.

Configuration
=============

No additional configuration is needed to use this module.

Usage
=============

This tool allows to quickly filter data on the basis of given fields. The fields
are specified as direct children of the ``searchpanel`` with tag name ``field``,
and the following attributes:

* ``name`` (mandatory) the name of the field to filter on
* ``select`` determines the behavior and display. 
* ``groups``: restricts to specific users
* ``string``: determines the label to display
* ``icon``: specifies which icon is used
* ``color``: determines the icon color

Possible values for the ``select`` attribute are

* ``one`` (default) at most one value can be selected. Supported field types are many2one and selection.
* ``multi`` several values can be selected (checkboxes). Supported field types are many2one, many2many and selection.

Additional optional attributes are available in the ``multi`` case:

* ``domain``: determines conditions that the comodel records have to satisfy.

A domain might be used to express a dependency on another field (with select="one")
of the search panel. Consider

.. code-block:: xml

	<searchpanel>
	  <field name="department_id"/>
	  <field name="manager_id" select="multi" domain="[('department_id', '=', department_id)]"/>
	<searchpanel/>
 
In the above example, the range of values for manager_id (manager names) available at screen
will depend on the value currently selected for the field ``department_id``.

* ``groupby``: field name of the comodel (only available for many2one and many2many fields). Values will be grouped by that field.

* ``disable_counters``: default is false. If set to true the counters won't be computed.

This feature has been implemented in case performances would be too bad.

Another way to solve performance issues is to properly override the ``search_panel_select_multi_range`` method.
	
Credits
=======

Contributors
------------

* Mathias Markl <mathias.markl@mukit.at>

Images
------------

Some pictures are based on or inspired by the icon set of Font Awesome:

* `Font Awesome <https://fontawesome.com>`_

Projects
------------

Parts of the module are based on or inspired by:

* `Odoo <https://github.com/odoo/odoo>`_

Author & Maintainer
-------------------

This module is maintained by the `MuK IT GmbH <https://www.mukit.at/>`_.

MuK IT is an Austrian company specialized in customizing and extending Odoo.
We develop custom solutions for your individual needs to help you focus on
your strength and expertise to grow your business.

If you want to get in touch please contact us via mail
(sale@mukit.at) or visit our website (https://mukit.at).
