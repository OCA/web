//-*- coding: utf-8 -*-
//Copyright 2017 Therp BV <http://therp.nl>
//License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

odoo.define('web.web_listview_custom_column', function(require)
{
    "use strict";
    var core = require('web.core');
    var ListView = require('web.ListView');
    var ViewManager = require('web.ViewManager');
    var common = require('web.list_common');
    var Sidebar = require('web.Sidebar');
    var list_widget_registry = core.list_widget_registry;
    var QWeb = core.qweb;


    ListView.include({
        init: function(parent, dataset, view_id, options)
        {
            this._super.apply(this, arguments)
            this.ViewManager.on('switch_mode', this, function(view_type)
            { if (!this.ViewManager.currently_switching)
                {
                  this.$pager.siblings('.oe-cp-switch-buttons')
			.children('.oe_view_manager_custom_column').toggle(view.type == 'list');
                }
            });
        },
        render_pager: function($node) {
            var self = this;
	    debugger;
            this._super($node);
	    // unfortunately supers in core have often no returns.
	    this.$custom_column = $(QWeb.render('ListView.CustomColumn', {widget: this }));
	    // add hooks to functions in column
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
	    console.log('---------------------OLDPAGER----------------');
	    console.log(this.$pager);
	    this.$custom_column.appendTo(this.$pager);
	    console.log('---------------------ADDITION----------------');
	    console.log(this.$custom_column);
	    console.log('---------------------NEW PAGER----------------');
	    console.log(this.$pager);
    	    this.$('.oe_list_pager').replaceWith(this.$pager);
	},
        load_list: function()
        {
            var self = this;
            this._super.apply(this, arguments);
	    debugger;
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
