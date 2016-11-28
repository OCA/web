.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

==============
BI View Editor
==============

BI View Editor is a tool integrated in Odoo that allows users define and
execute their own reports without the need to code.

Purpose:

* The BI View Editor is used to create reports not already contained in the
  standard Odoo, combining data from existing sources.

* It has been designed to be used by users with little or no knowledge of
  the technical architecture of Odoo. Users visually link business objects
  and select the fields to visualize.

* The BI View Editor offers users different types of representations,
  including tree, graph, pivot views.


Usage
=====


To graphically design your analysis data-set:

- From the Dashboards menu, select "Custom BI Views"
- Browse through the business objects in the Query tab, double click the business object(model) to show the fields under it
- Pick the interesting fields (Drag & Drop)
- For each selected field, right-click on the Options column and select whether it's a row, column or measure
- Save and click "Generate BI View"
- Open the newly created Custom BI views in form view mode, there will be a new Open BI View button, click this button lauch this new report
- if need to change the view definition, first click the Reset to Draft button, then click Edit.


.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/143/9.0

Known issues / Roadmap
======================

* Non-stored fields are not supported
* Provide graph view for table relations
* Extend the capabilities of the tree views (e.g. add sums)
* Add possibility to store the BI view in user dashboard, like any other graph or cross table
* Provide a tutorial (eg. a working example of usage)


Credits
=======

Images
------

* Odoo Community Association: `Icon <https://github.com/OCA/maintainer-tools/blob/master/template/module/static/description/icon.svg>`_.

Contributors
------------

* Simon Janssens <s.janssens@onestein.nl>
* Diego Luis Neto <diegoluis.neto@gmail.com>
* Dennis Sluijk <d.sluijk@onestein.nl>
* Kevin Graveman <k.graveman@onestein.nl>
* Richard Dijkstra <r.dijkstra@onestein.nl>
* Andrea Stirpe <a.stirpe@onestein.nl>
* Antonio Esposito <a.esposito@onestein.nl>
* Jordi Ballester Alomar <jordi.ballester@eficent.com>
* Fisher Yu yuxinyong@163.com  (migrate to 10.0, support duplicate)

Maintainer
----------

.. image:: https://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: https://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose
mission is to support the collaborative development of Odoo features and
promote its widespread use.

To contribute to this module, please visit https://odoo-community.org.
