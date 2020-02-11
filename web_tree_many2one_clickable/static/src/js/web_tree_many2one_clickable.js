/* Copyright 2013 Therp BV (<http://therp.nl>).
 * Copyright 2015 Pedro M. Baeza <pedro.baeza@serviciosbaeza.com>
 * Copyright 2016 Antonio Espinosa <antonio.espinosa@tecnativa.com>
 * Copyright 2017 Sodexis <dev@sodexis.com>
 * Copyright 2018 Camptocamp SA
 * Copyright 2019 Alexandre Díaz <alexandre.diaz@tecnativa.com>
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define('web_tree_many2one_clickable.many2one_clickable', function (require) {
    'use strict';

    var ListRenderer = require('web.ListRenderer');
    var ListFieldMany2One = require('web.relational_fields').ListFieldMany2One;
    var rpc = require('web.rpc');

    ListRenderer.include({
        _renderBodyCell: function (record, node, colIndex, options) {
            if (!node.attrs.widget && node.attrs.name &&
                this.state.fields[node.attrs.name] &&
                this.state.fields[node.attrs.name].type === 'many2one') {
                // No explicit widget provided on a many2one field,
                // force `many2one` widget
                node.attrs.widget = 'many2one';
            }
            return this._super(record, node, colIndex, options);
        },
    });

    ListFieldMany2One.include({
        _renderReadonly: function () {
            this._super.apply(this, arguments);
            var self = this;

            if (!this.noOpen && this.value) {
                // Replace '<a>' element
                this.$el.removeClass('o_form_uri');
                this.$el = $('<span/>', {
                    html: this.$el.html(),
                    class: this.$el.attr('class') + ' o_field_text',
                    name: this.$el.attr('name'),
                });

                // Append button
                var $a = $('<a/>', {
                    href: '#',
                    class: 'o_form_uri btn btn-sm btn-secondary' +
                           ' fa fa-angle-double-right',
                }).on('click', function (ev) {
                    ev.preventDefault();
                    ev.stopPropagation();

                    rpc.query({
                        model: self.field.relation,
                        method: 'get_formview_action',
                        args: [[self.value.res_id]],
                    }).then(function (action) {
                        return self.do_action(action);
                    });
                });
                this.$el.append($a);
            }
        },
    });
});
