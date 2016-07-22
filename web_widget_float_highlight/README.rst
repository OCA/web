.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

=====================
Highlight Float Field
=====================

This module extends the functionality of web backend to allow user to highlight
any numeric field when its value belongs to a given interval.

.. figure:: static/description/widget_highlight_screenshot-1.png
   :alt: Example of highlight for positive and negative numbers.

Usage
=====

To use the functionality implemented by this module on a numeric field in a
form view, you need to enable it by setting the option 'highlight' to True.

    <field name="my_numeric_field" options="{'highlight':True}"/>

For working, this module defines 3 distinct numeric intervals separated by two
values which are called thresholds. If we call T1 and T2 the two thresholds,
assuming that T1 <= T2, the three intervals are so defined:

- Lower:  each number < T1;
- Middle: each number included between T1 and T2 (including T1 and T2 as well);
- Upper:  each number > T2;

For each of these intervals is setted a background-color and a text-color;
for numeric fields which use the highlight functionality, whenever their value
belongs to one of these three intervals, it's shown with the interval-related
color combination.

By default, T1 and T2 are set to 0, the lower-interval colors are red/white;
the middle-interval colors are white/grey and the upper interval colors are
green/white.
Therefore, by default, a numeric field with this option has a red background
(with white text) if it's a negative number, a green background (with white
text) if it's a positive number and keep the basic odoo style if it's equal to
0. By default, the highlight works only when the form view is not in edit mode.

Anyway it's possible to customize this behavior through several options you
can provide to the field. Such options are:

- lower_threshold (0 by default): T1, the lowest number into middle-interval;
- upper_threshold (0 by default): T2, the highest number into middle-interval;
- lower_bg_color (red by default): Background-color for lower-interval;
- middle_bg_color (white by default): Background-color for middle-interval;
- upper_bg_color (green by default): Background-color for upper-interval;
- lower_txt_color (white by default): Text-color for lower-interval;
- middle_txt_color (grey - by default): Text-color for middle-interval;
- upper_txt_color (white by default): Text-color for upper-interval;
- always_work (False by default): If True the highlight works also in edit mode;

.. figure:: static/description/widget_highlight_screenshot-2.png
   :alt: Example of highlight for positive and negative numbers.

To avoid errors, don't use garbage values for the options above. In particular,
be aware that the function won't work if T1 > T2.

Known issues / Roadmap
======================

It's under analysis the improvement of this module. The idea is to condition
the highlight of a field to a more general condition than the mere belonging to
an interval. In order to achieve this, it's necessary to provide the user a
tool to write its own conditions.

Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/web/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smashing it by providing a detailed and welcomed feedback.

Credits
=======

Images
------

* Odoo Community Association: `Icon <https://github.com/OCA/maintainer-tools/blob/master/template/module/static/description/icon.svg>`_.

Contributors
------------

* Antonio Esposito <a.esposito@onestein.nl>

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
