//-*- coding: utf-8 -*-
//© 2016 Therp BV <http://therp.nl>
//License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

openerp.web_pivot_zoom = function(instance)
{
    instance.web_graph.Graph.include({
        start: function()
        {
            this.$el.on(
                'click', 'td.web_pivot_zoom',
                this.proxy('_web_pivot_zoom_on_click_cell')
            );
            return this._super.apply(this, arguments);
        },
        draw_row: function (row, frozen_rows)
        {
            var self = this,
                $result = this._super.apply(this, arguments);
            _.each(this.pivot_options.measures, function(measure, i)
            {
                if(!_.isEmpty(self.graph_view._web_pivot_zoom[measure.field]))
                {
                    jQuery($result.children().get(i + 1))
                    .addClass('web_pivot_zoom');
                }
            });
            return $result;
        },
        draw_measure_row: function(measure_row)
        {
            this._super.apply(this, arguments);
            var self = this,
                $last_headers = this.$thead.children().last().children();
            _.each(this.pivot_options.measures, function(measure, i)
            {
                if(!_.isEmpty(self.graph_view._web_pivot_zoom[measure.field]))
                {
                    jQuery($last_headers.get(i + 1))
                    .addClass('web_pivot_zoom');
                }
            });
        },
        _web_pivot_zoom_on_click_cell: function(e)
        {
            if(!e.currentTarget.cellIndex)
            {
                return;
            }
            var $current_row = jQuery(e.currentTarget).closest('tr'),
                $col_row = jQuery(e.currentTarget).closest('table')
                .find('thead tr:nth-last-child(2)'),
                col_id = $col_row.find('[data-id]').eq(
                    Math.floor(
                        e.currentTarget.cellIndex - 1 /
                        this.pivot.measures.length
                    )
                ).attr('data-id'),
                row_id = $current_row.find('[data-id]').attr('data-id'),
                current_field = this.pivot.measures[
                    (e.currentTarget.cellIndex - 1) %
                    this.pivot.measures.length
                ],
                row_header = this.pivot.get_header(row_id),
                col_header = this.pivot.get_header(col_id),
                measure_values = this.pivot.get_values(
                    Math.min(col_id, row_id), Math.max(col_id, row_id)
                ),
                group_values = {};
            _.each(this.groupby_fields, function(field)
            {
                group_values[field.field] = null;
            });
            _.each(row_header.domain, function(leaf)
            {
                group_values[leaf[0]] = leaf[2];
            });
            _.each(col_header.domain, function(leaf)
            {
                group_values[leaf[0]] = leaf[2];
            });
            _.each(this.pivot_options.measures, function(measure, i)
            {
                group_values[measure.field] = measure_values[i];
            });
            var model = this.graph_view._web_pivot_zoom[current_field.field]
                .model,
                domain = instance.web.pyeval.eval(
                    'domain',
                    this.graph_view._web_pivot_zoom[current_field.field]
                    .domain || [],
                    group_values
                );
            if(!model || !domain)
            {
                return;
            }
            return this._web_pivot_zoom_action(
                model, domain, current_field, row_header, col_header
            );
        },
        _web_pivot_zoom_action: function(
            model, domain, current_field, row_header, col_header
        )
        {
            // we don't need to search again when clicking back
            this.graph_view.ViewManager.action.flags.auto_search = false;
            return this.do_action({
                'type': 'ir.actions.act_window',
                'res_model': model,
                'domain': domain,
                'views': [[false, 'list'], [false, 'form']],
                'name': row_header.title + ': ' + current_field.string,
            });
        },
    });
    instance.web_graph.GraphView.include({
        view_loading: function(fields_view_get)
        {
            var self = this;
            this._web_pivot_zoom = {};
            _.each(fields_view_get.arch.children, function(field)
            {
                self._web_pivot_zoom[field.attrs.name] = instance.web.py_eval(
                    field.attrs.options || '{}'
                ).web_pivot_zoom || {};
            });
            return this._super.apply(this, arguments);
        },
    });
};
