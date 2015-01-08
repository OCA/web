openerp.web_graph_improved = function(instance) {

    instance.web_graph.Graph.include({
        bar: function() {
            var self = this,
                dim_x = this.pivot.rows.groupby.length,
                dim_y = this.pivot.cols.groupby.length,
                show_controls = (this.width > 400 && this.height > 300 && dim_x + dim_y >=2),
                data;

            // No groupby 
            if ((dim_x === 0) && (dim_y === 0)) {
                data = [{key: _t('Total'), values:[{
                    x: _t('Total'),
                    y: this.pivot.get_total()[0],
                }]}];
            // Only column groupbys 
            } else if ((dim_x === 0) && (dim_y >= 1)){
                data =  _.map(this.pivot.get_cols_with_depth(1), function (header) {
                    return {
                        key: header.title,
                        values: [{x:header.title, y: self.pivot.get_total(header)[0]}]
                    };
                });
            // Just 1 row groupby 
            } else if ((dim_x === 1) && (dim_y === 0))  {
                data = _.map(self.pivot.measures, function(measure, i) {
                    var series = _.map(self.pivot.main_row().children, function (pt) {
                        var value = self.pivot.get_total(pt)[i],
                        title = (pt.title !== undefined) ? pt.title : _t('Undefined');
                        return {x: title, y: value};
                    });
                    return {key: self.pivot.measures[i].string, values:series};
                });
            // 1 row groupby and some col groupbys
            } else if ((dim_x === 1) && (dim_y >= 1))  {
                data = _.map(this.pivot.get_cols_with_depth(1), function (colhdr) {
                    var values = _.map(self.pivot.get_rows_with_depth(1), function (header) {
                        return {
                            x: header.title || _t('Undefined'),
                            y: self.pivot.get_values(header.id, colhdr.id)[0] || 0
                        };
                    });
                    return {key: colhdr.title || _t('Undefined'), values: values};
                });
            // At least two row groupby
            } else {
                var keys = _.uniq(_.map(this.pivot.get_rows_with_depth(2), function (hdr) {
                    return hdr.title || _t('Undefined');
                }));
                data = _.map(keys, function (key) {
                    var values = _.map(self.pivot.get_rows_with_depth(1), function (hdr) {
                        var subhdr = _.find(hdr.children, function (child) {
                            return ((child.title === key) || ((child.title === undefined) && (key === _t('Undefined'))));
                        });
                        return {
                            x: hdr.title || _t('Undefined'),
                            y: (subhdr) ? self.pivot.get_total(subhdr)[0] : 0
                        };
                    });
                    return {key:key, values: values};
                });
            }

            nv.addGraph(function () {
                var chart = nv.models.multiBarChart()
                // .reduceXTicks(false)
                    .stacked(self.bar_ui === 'stack')
                    .showControls(show_controls);

                // if (self.width / data[0].values.length < 80) {
                //     chart.rotateLabels(-15);
                //     chart.reduceXTicks(true);
                //     chart.margin({bottom:40});
                // }

                d3.select(self.svg)
                    .datum(data)
                    .attr('width', self.width)
                    .attr('height', self.height)
                    .call(chart);

                nv.utils.windowResize(chart.update);
                return chart;
            });

        }
    });
}
