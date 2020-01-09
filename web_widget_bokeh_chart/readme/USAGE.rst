To insert a Bokeh chart in a view proceed as follows:

#. Declare a text computed field like this::

    bokeh_chart = fields.Text(
        string='Bokeh Chart',
        compute='_compute_bokeh_chart',
    )

#. In its computed method do::

    def _compute_bokeh_chart(self):
        for rec in self:
            # Design your bokeh figure:
            p = figure()  # import that as `from bokeh.plotting import figure`
            line = p.line([0, 2], [1, 8], line_width=5)
            # (...)
            # fill the record field with both markup and the script of a chart.
            script, div = components(p)
            rec.bokeh_chart = '%s%s' % (div, script)

#. In the view, add something like this wherever you want to display your
   bokeh chart::

    <div>
        <field name="bokeh_chart" widget="bokeh_chart" nolabel="1"/>
    </div>
