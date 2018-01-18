.. image:: https://img.shields.io/badge/licence-LGPL--3-blue.svg
    :alt: License LGPL-3

======================
Web Widget Bokeh Chart
======================

This module add the posibility to insert Bokeh charts into Odoo standard views.

.. image:: /web_widget_bokeh_chart/static/description/example.png
   :alt: Bokeh Chart inserted into an Odoo view
   :width: 600 px

`Bokeh <https://bokeh.pydata.org>`_ is a Python interactive visualization
library that targets modern web browsers for presentation. Its goal is to
provide elegant, concise construction of basic exploratory and advanced
custom graphics in the style of D3.js, but also deliver this capability with
high-performance interactivity over very large or streaming datasets. Bokeh
can help anyone who would like to quickly and easily create interactive
plots, dashboards, and data applications.

If you want to see some samples of bokeh's capabilities follow this `link
<https://bokeh.pydata.org/en/latest/docs/gallery.html>`_.

Installation
============

You need to install the python bokeh library::

    pip install bokeh==0.12.7

Usage
=====

To insert a Bokeh chart in a view proceed as follows:

#. Declare a text computed field like this::

    bokeh_chart = fields.Text(
        string='Bokeh Chart',
        compute=_compute_bokeh_chart)

#. In its computed method do::

    def _compute_bokeh_chart(self):
        for rec in self:
            # Design your bokeh figure:
            p = figure()
            line = p.line([0, 2], [1, 8], line_width=5)
            # (...)
            # Get the html components and convert them to string into the field.
            script, div = components(p)
            rec.bokeh_chart = '%s%s' % (div, script)

#. In the view, add something like this wherever you want to display your
   bokeh chart::

    <div>
        <field name="bokeh_chart" widget="bokeh_chart" nolabel="1"/>
    </div>

Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/web/issues>`_.
In case of trouble, please check there if your issue has already been
reported. If you spotted it first, help us smash it by providing detailed and
welcomed feedback.

Credits
=======

* This module uses the library `Bokeh <https://github.com/bokeh/bokeh>`_
  which is under the open-source BSD 3-clause "New" or "Revised" License.
  Copyright (c) 2012, Anaconda, Inc.
* Odoo Community Association (OCA)

Contributors
------------

* Jordi Ballester Alomar <jordi.ballester@eficent.com>
* Lois Rilo Antelo <lois.rilo@eficent.com>

Maintainer
----------

.. image:: http://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: http://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose
mission is to support the collaborative development of Odoo features and
promote its widespread use.

To contribute to this module, please visit http://odoo-community.org.
