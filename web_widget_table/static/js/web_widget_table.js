/* License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define('web_widget_table', function (require) {
    "use strict";

    var registry = require('web.field_registry');
    var AbstractField = require('web.AbstractField');
    var FieldDataTable = AbstractField.extend({
        className: 'oe_form_field_table',
        supportedFieldTypes: ['char'],
        init: function init () {
            this._super.apply(this, arguments);
        },
        _render: function _render () {
            this.$el.empty();
            var field = this.nodeOptions.field_name,
                fieldModel = this.record.data[field].model,
                fieldRecordIds = this.record.data[field].res_ids,
                table = "<table><thead><tr>",
                table_fields = this.nodeOptions.fields,
                headers = this.nodeOptions.headers,
                datatable_params = this.nodeOptions.datatable_params;
            headers.forEach(function (element) {
                table += '<th>' + element + '</th>';
            });
            table += "</tr></thead><tbody>";

            this._rpc({
                model: fieldModel,
                method: 'read',
                args: [fieldRecordIds],
            }).then(function (result) {
                Array.from(result).forEach(function (record) {
                    table += '<tr>';
                    table_fields.forEach(function (key) {
                        table += record[key] ? '<td>' + record[key] +
                                 '</td>' : '<td></td>';
                    });
                    table += '</tr>';
                });
                table += "</tbody></table>";
                this.$el.append(jQuery(table).attr({
                    'id': 'datatable',
                    'class': 'display',
                }));
                jQuery('#datatable').DataTable(datatable_params);
            }.bind(this));
        },
    });

    registry.add('widget_table', FieldDataTable);
    return {
        FieldDataTable: FieldDataTable,
    };
});
