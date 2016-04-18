openerp.web_graph_radar = function(instance) {
    
    var _t = instance.web._t;
    
    instance.web_graph.Graph.include({
        template: 'GraphWidgetRadar',
        radar: function() {
            var self = this,
                dim_x = this.pivot.rows.groupby.length,
                dim_y = this.pivot.cols.groupby.length,
                data;

            // No groupby 
            if ((dim_x === 0) && (dim_y === 0)) {
                data = [{key: _t('Total'), values:[{
                    label: _t('Total'),
                    value: this.pivot.get_total()[0],
                }]}];
            // Only column groupbys 
            } else if ((dim_x === 0) && (dim_y >= 1)){
                data =  _.map(this.pivot.get_cols_with_depth(1), function (header) {
                    return {
                        key: header.title,
                        values: [{label:header.title, value: self.pivot.get_total(header)[0]}]
                    };
                });
            // Just 1 row groupby 
            } else if ((dim_x === 1) && (dim_y === 0))  {
                data = _.map(self.pivot.measures, function(measure, i) {
                    var series = _.map(self.pivot.main_row().children, function (pt) {
                        var value = self.pivot.get_total(pt)[i],
                        title = (pt.title !== undefined) ? pt.title : _t('Undefined');
                        return {label: title, value: value};
                    });
                    return {key: self.pivot.measures[i].string, values:series};
                });
            // 1 row groupby and some col groupbys
            } else if ((dim_x === 1) && (dim_y >= 1))  {
                data = _.map(this.pivot.get_cols_with_depth(1), function (colhdr) {
                    var values = _.map(self.pivot.get_rows_with_depth(1), function (header) {
                        return {
                            label: header.title || _t('Undefined'),
                            value: self.pivot.get_values(header.id, colhdr.id)[0] || 0
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
                            label: hdr.title || _t('Undefined'),
                            value: (subhdr) ? self.pivot.get_total(subhdr)[0] : 0
                        };
                    });
                    return {key:key, values: values};
                });
            }
            nv.addGraph(function () {
                var chart = nv.models.radarChart();

                chart.margin({left:200, top:20, bottom:20});

                d3.select(self.svg)
                    .datum(data)
                    .attr('width', self.width)
                    .attr('height', self.height)
                    .call(chart);

                return chart;
            });

        }
    });
}
