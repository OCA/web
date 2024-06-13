To insert a Bokeh chart in a view proceed as follows:

## Using a Char field

1.  Declare a text computed field like this:

        bokeh_chart = fields.Text(
            string='Bokeh Chart',
            compute='_compute_bokeh_chart',
        )

2.  At the top of the module add the following imports:

        from bokeh.plotting import figure
        from bokeh.embed import components
        import json

3.  In its computed method do:

        def _compute_bokeh_chart(self):
            for rec in self:
                # Design your bokeh figure:
                p = figure()
                line = p.line([0, 2], [1, 8], line_width=5)
                # (...)
                # fill the record field with both markup and the script of a chart.
                script, div = components(p, wrap_script=False)
                rec.bokeh_chart = json.dumps({"div": div, "script": script})

4.  In the view, add something like this wherever you want to display
    your bokeh chart:

        <div>
            <field name="bokeh_chart" widget="bokeh_chart" nolabel="1"/>
        </div>

## Using a Json field

1.  Declare a json computed field like this:

        bokeh_chart = fields.Json(
            string='Bokeh Chart',
            compute='_compute_bokeh_chart',
        )

2.  At the top of the module add the following imports:

        from bokeh.plotting import figure
        from bokeh.embed import components

3.  In its computed method do:

        def _compute_bokeh_chart(self):
            for rec in self:
                # Design your bokeh figure:
                p = figure()
                line = p.line([0, 2], [1, 8], line_width=5)
                # (...)
                # fill the record field with both markup and the script of a chart.
                script, div = components(p, wrap_script=False)
                rec.bokeh_chart = {"div": div, "script": script}

4.  In the view, add something like this wherever you want to display
    your bokeh chart:

        <div>
            <field name="bokeh_chart" widget="bokeh_chart_json
