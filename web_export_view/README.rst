.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: License

Export Current View
===================

One of the best Odoo's features is exporting custom data to CSV/XLS. You can
do it by clicking on the export link in the sidebar. The export action allows
us to configure what to be exported by selecting fields, etc, and allows you
to save your export as a template so that you can export it once again without
having to configure it again.

That feature is as great and advanced as limited for an everyday experience.
A lot of customers want simply to export the tree view they are looking to.

If you miss this feature as us, probably you'll find an answer into our
web_export_view module.


Usage
=====

After you installed it, you'll find an additional link 'Export current view'
right on the sidebar. By clicking on it you'll get a XLS file contains
the same data of the tree view you are looking at, headers included.


Known Issues
============

Pedro M. Baeza (pedro.baeza@gmail.com):
When you have groups, they are not exported to Excel. It would be desirable to have this option.
One of the problems with this module is that you can't export data from a view with mode="tree".
Changing the approach to have the button always visible (we should relocate it also to another place,
as the current location is not visible for these views), and digging correctly in the DOM elements
for this view (very similar to the normal tree view one) will do the trick. This will also help users
to locate the feature, as it's hidden now by default and users don't think about selecting records.
The behavior will be: nothing selected > you export all (including groups).
Something or all selected: export the selection.


Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/web/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smashing it by providing a detailed and welcomed feedback.

Credits
=======

Contributors
------------

 * Henry Zhou (MAXodoo) <zhouhenry@live.com>
 * Rodney <https://github.com/rv-clearcorp>
 * Simone Orsi <simahawk@gmail.com>
 * Lorenzo Battistini <lorenzo.battistini@agilebg.com>
 * Stefan Rijnhart <stefan@therp.nl>
 * Leonardo Pistone <leonardo.pistone@camptocamp.com>
 * Jose Maria Bernet <josemaria.bernet@guadaltech.es>

Maintainer
----------

.. image:: http://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: http://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose mission is to support the collaborative development of Odoo features and promote its widespread use.

To contribute to this module, please visit http://odoo-community.org.
