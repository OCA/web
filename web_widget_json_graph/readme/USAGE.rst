Use this widget by including::

    <field name="field_text_json" widget="json_graph" />

For example::

    <field name="values_data" widget="json_graph"/>

The JSON needs to be like::

    info = {
        "type": "line",
        "data": {"datasets": [], "labels": []},
        "options": {
            "scales": {
                "yAxes": [
                    {
                        "ticks": {"beginAtZero": True, "stacked": False},
                        "scaleLabel": {"display": True, "labelString": "Quantity"},
                    }
                ],
                "xAxes": [
                    {
                        "scaleLabel": {"display": True, "labelString": "Date"},
                    }
                ],
            },
            "elements": {"point": {"radius": 3}},
            "legend": {"labels": {"usePointStyle": True}},
            "tooltips": {"intersect": False, "axis": "xy", "mode": "index"},
        },
    }
    self.field_text_json = json.dumps(info)

For example::

    plot_dataset = [1, 2, 3, 4, 3, 2]
    labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    info = {
        "type": "line",
        "data": {"datasets": plot_dataset, "labels": labels},
        "options": {
            "scales": {
                "yAxes": [
                    {
                        "ticks": {"beginAtZero": True, "stacked": False},
                        "scaleLabel": {"display": True, "labelString": "Quantity"},
                    }
                ],
                "xAxes": [
                    {
                        "scaleLabel": {"display": True, "labelString": "Date"},
                    }
                ],
            },
            "elements": {"point": {"radius": 3}},
            "legend": {"labels": {"usePointStyle": True}},
            "tooltips": {"intersect": False, "axis": "xy", "mode": "index"},
        },
    }
    self.values_data = json.dumps(info)

For more information, please see `Chart Js Documentation <https://www.chartjs.org/docs/2.9.4/>`.
