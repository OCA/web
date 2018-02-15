//-*- coding: utf-8 -*-
//Copyright 2017 Therp BV <http://therp.nl>
//License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

odoo.define('web_listview_custom_column.ListView', function(require)
{
    "use strict";
    var core = require('web.core');
    var ListView = require('web.ListView');
    var Model = require('web.DataModel');
    var session = require('web.session');
    var Widget = require('web.Widget');
    var QWeb = core.qweb;

    ListView.include({
        init: function(parent, dataset, view_id, options)
        {
            this._super.apply(this, arguments)
            debugger;
            this.ViewManager.on('switch_mode', this, function(view_type)
            { if (!this.ViewManager.currently_switching)
                {
                  this.options.$pager.siblings('.oe_view_manager_custom_column').toggle(view_type == 'list');
                }
            });
        },
        load_list: function()
        {
            debugger;
            var self = this;
            this._super.apply(this, arguments);
            this.$custom_column = $(QWeb.render('ListView_CustomColumn', {widget: this }));
            if(this.options.$pager)
            {
                this.options.$pager.siblings('.oe_view_manager_custom_column')
                    .empty()
                    .append(this.$custom_column);
            }
            else
            {
                this.$('.oe_view_manager_custom_column')
                    .empty()
                    .append(this.$custom_column);
            }
            this.$custom_column.filter('.oe_custom_column_activate')
                .click(this.proxy(this._custom_column_activate));
            this.$custom_column.filter('.oe_custom_column_reset')
                .click('reset', this.proxy(this._custom_column_diff));
            this.$custom_column.filter('.oe_custom_column_all')
                .click('to_all', this.proxy(this._custom_column_diff));
            this.$custom_column.filter('.oe_custom_column_user')
                .click('to_user', this.proxy(this._custom_column_diff));
            this.$custom_column.filter('[name="oe_custom_column_field"]')
                .change(this.proxy(this._custom_column_add));
            this.$('th a.oe_custom_column_left')
                .click('left', this.proxy(this._custom_column_diff));
            this.$('th a.oe_custom_column_right')
                .click('right', this.proxy(this._custom_column_diff));
            this.$('th a.oe_custom_column_remove')
                .click('remove', this.proxy(this._custom_column_diff));
            this.$custom_column.filter('[name="oe_custom_column_field"]')
                .find('option')
                .each(function(index, option)
                {
                    jQuery(option).prop(
                        'disabled',
                        _.any(self.columns, function(column)
                        {
                            return column.id == jQuery(option).val();
                        })
                    );
                });
        },
        _custom_column_activate: function()
        {
            if(this.options.custom_column_active)
            {
                return this._custom_column_deactivate();
            }
            var deferred = new jQuery.when(),
                self = this;
            this.options.custom_column_active = true;
            if(!this.options.custom_column_fields)
            {
                deferred = this._custom_column_get_desc();
            }
            return deferred
                .then(this.proxy(this.reload_view))
                .then(this.proxy(this.reload_content));
        },
        _custom_column_get_desc: function()
        {
            var self = this;
            return new instance.web.Model('ir.ui.view')
                .call('custom_column_desc', [this.fields_view.view_id])
                .then(function(desc)
                {
                    self.options.custom_column_fields = desc.fields;
                    self.options.custom_column_type = desc.type;
                });
        },
        _custom_column_deactivate: function()
        {
            this.options.custom_column_active = false;
            return this.reload_view().then(this.proxy(this.reload_content));
        },
        _custom_column_add: function(ev)
        {
            ev.data = 'add';
            return this._custom_column_diff(ev, jQuery(ev.target).val());
        },
        _custom_column_diff: function(ev, field)
        {
            ev.stopPropagation();
            return new instance.web.Model('ir.ui.view').call(
                'custom_column',
                [
                    this.fields_view.view_id,
                    {
                        type: this.options.custom_column_type,
                        operation: ev.data,
                        name:
                        field || jQuery(ev.target).parents('th').data('id'),
                    }
                ]
            )
            .then(this.proxy(this._custom_column_get_desc))
            .then(this.proxy(this.reload_view))
            .then(this.proxy(this.reload_content));
        },
    });
});
