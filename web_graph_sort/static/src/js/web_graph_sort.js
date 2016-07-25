/*
    © 2015 NDP Systèmes (<http://www.ndp-systemes.fr>).
    © 2016 Savoir-faire Linux
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
*/

openerp.web_graph_sort = function(instance) {
    var _lt = openerp.web._lt;
    var _t = openerp.web._t;

    var graph_events = instance.web_graph.Graph.events;

    instance.web_graph.Graph.include({

        init: function(){
            this.events['click thead th.oe_sortable[data-id]'] = 'sort_by_column';
            this._super.apply(this, arguments);
        },

        draw_measure_row: function (measure_row) {
            var $row = $('<tr>').append('<th>');
            var self = this;
            _.each(measure_row, function (cell) {
                _.each(self.measure_list,function(item){
                    if(item.string === cell.text) {
                        var data_id;
                        if (
                            self.pivot.sort !== null &&
                            self.pivot.sort[0].indexOf(item.field) >= 0 &&
                            self.pivot.sort[0].indexOf('-') === -1
                        ){
                            data_id = "-" + item.field;
                        }
                        else {
                            data_id = item.field;
                        }

                        var $cell = $('<th>')
                            .addClass('measure_row')
                            .addClass('oe_sortable')
                            .attr('data-id', data_id)
                            .append("<div>" + cell.text + "</div>");

                        if (cell.is_bold) {
                            $cell.css('font-weight', 'bold');
                        }
                        if (self.pivot.sort !== null && self.pivot.sort[0].indexOf(item.field) >= 0) {
                            $cell.addClass((self.pivot.sort[0].indexOf('-') === -1) ? "sortdown":"sortup");
                        }
                        $row.append($cell);
                    }
                });
            });
            this.$thead.append($row);
        },

        sort_by_column: function (e) {
            e.stopPropagation();
            var $column = $(e.currentTarget);
            var col_name = $column.data('id');
            this.pivot.sort = [col_name];
            this.pivot.update_data().then(this.proxy('display_data'));
        }
    });

    instance.web_graph.PivotTable.include({
        sort : null,
        get_groups: function (groupbys, fields, domain) {
            var self = this;
            var result = this.model.query(_.without(fields, '__count'));
            if(this.sort !== null) {
                result=result.order_by(this.sort);
            }
            return result.filter(domain)
                .context(this.context)
                .lazy(false)
                .group_by(groupbys)
                .then(function (groups) {
                    return groups.filter(function (group) {
                        return group.attributes.length > 0;
                    }).map(function (group) {
                        var attrs = group.attributes,
                            grouped_on = attrs.grouped_on instanceof Array ? attrs.grouped_on : [attrs.grouped_on],
                            raw_grouped_on = grouped_on.map(function (f) {
                                return self.raw_field(f);
                            });
                        if (grouped_on.length === 1) {
                            attrs.value = [attrs.value];
                        }
                        attrs.value = _.range(grouped_on.length).map(function (i) {
                            var grp = grouped_on[i],
                                field = self.fields[grp];

                            // This part was modified from original function in the web_graph module.
                            if (attrs.value[i] === false) {
                                return _t('Undefined');
                            } else if (attrs.value[i] instanceof Array) {
                                return attrs.value[i][1];
                            } else if (field && field.type === 'selection') {
                                var selected = _.where(field.selection, {0: attrs.value[i]})[0];
                                return selected ? selected[1] : attrs.value[i];
                            }
                            return attrs.value[i];
                        });
                        attrs.aggregates.__count = group.attributes.length;
                        attrs.grouped_on = raw_grouped_on;
                        return group;
                    });
                });
        }
    });
};
