 /*
 * Copyright 2019 Kevin Kamau <kevkamaa96@gmail.com>
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
 */

 /*eslint no-undef: "google", "drawChart" */

odoo.define('web.HierarchyView', function (require) {
    'use strict';

    var core = require("web.core");
    var View = require('web.View');
    var _lt = core._lt;
    var qweb = core.qweb;

    var HierarchyView = View.extend({
        template: 'HierarchyView',
        icon: "fa-sitemap",
        searchable: false,
        mobile_friendly: true,
        require_fields: true,
        display_name: _lt('Hierarchy'),
        render_chart: function (size) {
            var self = this;
            var size_val = size ? "medium": size;
            var parent_name = this.options.action.display_name;
            google.charts.load('current', {packages: ["orgchart"]});
            google.charts.setOnLoadCallback(drawChart);

            function drawChart() {
                var vals = [];
                var data = new google.visualization.DataTable();
                data.addColumn('string', 'ID');
                data.addColumn('string', 'Name');
                data.addColumn('string', 'ToolTip');
                self.dataset.read_slice(self.fields_view.fields, {}).then(
                    function (results) {
                        var root = parent_name || "Root";
                        vals.push([{v: root, f: root}, '', 'root element']);
                        for (var i = 0; i < results.length; i++) {
                            if (results[i].parent_id) {
                                if (results[i].parent_id[1].search("/")) {
                                    var x = results[i].parent_id[1].split("/");
                                    var parent = x[x.length - 1];
                                    vals.push([results[i].name, parent.trim(),
                                        results[i].name]);
                                } else {
                                    vals.push([results[i].name,
                                        results[i].parent_id[1].trim(),
                                        results[i].name]);
                                }
                            } else {
                                vals.push([results[i].name, root, root]);
                            }
                        }
                        data.addRows(vals);
                        // Create the chart.
                        var chart = new google.visualization.OrgChart(
                            document.getElementById('chart_div'));
                        // Draw the chart, setting the allowHtml option to
                        // true for the tooltips.
                        chart.draw(data, {allowHtml: true, size: size_val});
                    });
            }
        },
        do_show: function () {
            this.do_push_state({});
            this.render_chart();
            this._super.apply(this, arguments);
        },
        do_add_record: function () {
            this.dataset.index = null;
            _.delay(_.bind(function () {
                this.do_switch_view('form');
            }, this));
        },
        render_buttons: function ($node) {
            var self = this;
            if (!this.$buttons) {
                this.$buttons = $(qweb.render("HierarchyView.buttons",
                    {'widget': this}));
                this.$buttons.on('click', '.o_org_button_add',
                    this.proxy('do_add_record'));
                this.$buttons.on('change', '.o_select_btn',
                    function () {
                        var val = $('.o_select_btn').val();
                        self.render_chart(val);
                    });
                this.$buttons.appendTo($node);
            }
        }
    });

    core.view_registry.add("hierarchy", HierarchyView);
    return HierarchyView;
});

