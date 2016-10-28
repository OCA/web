/* Copyright 2013 Therp BV (<http://therp.nl>).
 * Copyright 2015 Pedro M. Baeza <pedro.baeza@serviciosbaeza.com>
 * Copyright 2016 Antonio Espinosa <antonio.espinosa@tecnativa.com>
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define('web_tree_many2one_clickable.many2one_clickable', function(require) {
"use strict";

var _ = require('_');
var $ = require('$');

var core = require('web.core');
var ListView = require('web.ListView');
var Model = require('web.DataModel');

var _t = core._t;
var QWeb = core.qweb;
var list_widget_registry = core.list_widget_registry;

var promise;
function clickable_get(callback){
    if (_.isUndefined(promise)) {
        promise = $.Deferred();
        new Model("ir.config_parameter")
            .call("get_param", ["web_tree_many2one_clickable.default", false])
            .done(function(value){
                promise.resolve(String(value).toLowerCase() === "true");
            })
            .fail(function(){
                promise.reject();
            });
    }
    return promise;
}

ListView.Column.include({
    init: function(id, tag, attrs) {
        this._super(id, tag, attrs);
        if (this.widget == 'many2one_clickable') {
            this.use_many2one_clickable = true;
        } else if (this.type == 'many2one') {
            this.use_many2one_clickable = false;
            clickable_get().done($.proxy(function(value){
                this.use_many2one_clickable = value;
            }, this));
        }
    },
    _format: function (row_data, options) {
        if (this.type == 'many2one' &&
            (this.widget == 'many2one_unclickable' || this.use_many2one_clickable) &&
            !!row_data[this.id]) {
            var value = row_data[this.id].value;
            var name = value[1] ? value[1].split("\n")[0] : value[1];
            name = _.escape(name || options.value_if_empty);
            if (this.widget == 'many2one_unclickable') {
                return name;
            } else if (this.use_many2one_clickable) {
                var values = {
                    model: this.relation,
                    id: row_data[this.id].value[0],
                    name: name,
                };
                if(this.type == 'reference' && !!row_data[this.id + '__display']) {
                    values.model = row_data[this.id].value.split(',', 1)[0];
                    values.id = row_data[this.id].value.split(',', 2)[1];
                    values.name = _.escape(row_data[this.id + '__display'].value ||
                                           options.value_if_empty);
                }
                return _.str.sprintf(
                    '<a class="oe_form_uri" data-many2one-clickable-model="%(model)s" data-many2one-clickable-id="%(id)s">%(name)s</a>',
                    values
                );
            }
        } else {
            return this._super(row_data, options);
        }
    },
});

ListView.List.include({
    render: function() {
        var result = this._super(this, arguments),
            self = this;
        this.$current.delegate('a[data-many2one-clickable-model]',
            'click', function() {
                self.view.do_action({
                    type: 'ir.actions.act_window',
                    res_model: $(this).data('many2one-clickable-model'),
                    res_id: $(this).data('many2one-clickable-id'),
                    views: [[false, 'form']],
                });
            });
        return result;
    },

});

list_widget_registry.add('field.many2one_clickable', ListView.Column);
list_widget_registry.add('field.many2one_unclickable', ListView.Column);

}); // odoo.define
