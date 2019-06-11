.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

================================================
Web freeze table columns and rows on matrix view
================================================

This module extends the functionality of `web_widget_x2many_2d_matrix`
to add the option of making the first matrix column or row sticky,
for easy viewing when user scrolls through the matrix.

Usage
=====

On the field definition, add sticky="true" option to enable stickiness on the matrix::

<field name="planning_ids" widget="widget="x2many_2d_matrix" ... sticky="True"/>

When user navigates to the matrix view, the table header and first column are frozen
on X and Y axis scroll.

It is possible to specify how many columns to stick by configuring it::

<field ... sticky="True" sticky_x="2"/>

Credits
=======

Uses library jquery.stickytableheaders.js by Jonas Mosbech
(https://github.com/jmosbech/StickyTableHeaders)

Contributors
------------

* Terrence Nzaywa, Sunflower IT <terrence@sunflowerweb.nl>
* Tom Blauwendraat, Sunflower IT <tom@sunflowerweb.nl>

Maintainer
----------

This module is maintained by Therp BV <https://therp.nl/>
