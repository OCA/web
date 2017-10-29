/* Copyright 2016 0k.io,ACSONE SA/NV
 *  * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define('web_m2x_options.web_m2x_options', function (require) {
    "use strict";

    var core = require('web.core'),
        data = require('web.data'),
        Dialog = require('web.Dialog'),
        Model = require('web.Model'),
        form_relational = require('web.form_relational'),
        _t  = core._t;

    var OPTIONS = ['web_m2x_options.create',
                   'web_m2x_options.create_edit',
                   'web_m2x_options.limit',
                   'web_m2x_options.search_more',
                   'web_m2x_options.m2o_dialog',];

    // In odoo 9.c FielMany2One is not exposed by form_relational
    // To bypass this limitation we use the widget registry to get the
    // reference to the FielMany2One widget.
    var FieldMany2One = core.form_widget_registry.get('many2one');

    var M2ODialog = Dialog.extend({
        template: "M2ODialog",
        init: function(parent) {
            this.name = parent.string;
            this._super(parent, {
                title: _.str.sprintf(_t("Create a %s"), parent.string),
                size: 'medium',
                buttons: [
                    {text: _t('Create'), classes: 'btn-primary', click: function() {
                        if (this.$("input").val() !== ''){
                            this.getParent()._quick_create(this.$("input").val());
                            this.close();
                        } else {
                            e.preventDefault();
                            this.$("input").focus();
                        }
                    }},

                    {text: _t('Create and edit'), classes: 'btn-primary', close: true, click: function() {
                        this.getParent()._search_create_popup("form", undefined, this.getParent()._create_context(this.$("input").val()));
                    }},

                    {text: _t('Cancel'), close: true}
                ]
            });
        },
        start: function() {
            var text = _.str.sprintf(_t("You are creating a new %s, are you sure it does not exist yet?"), this.name);
            this.$("p").text(text);
            this.$("input").val(this.getParent().$input.val());
        },
    });

    FieldMany2One.include({

        start: function() {
            this._super.apply(this, arguments);
            return this.get_options();
        },

        get_options: function() {
            var self = this;
            if (!_.isUndefined(this.view) && _.isUndefined(this.view.ir_options_loaded)) {
            this.view.ir_options_loaded = $.Deferred();
            this.view.ir_options = {};
            (new Model("ir.config_parameter"))
                .query(["key", "value"]).filter([['key', 'in', OPTIONS]])
                .all().then(function(records) {
                _(records).each(function(record) {
                    self.view.ir_options[record.key] = record.value;
                });
                self.view.ir_options_loaded.resolve();
                });
                return this.view.ir_options_loaded;
            }
            return $.when();
        },

        is_option_set: function(option) {
            if (_.isUndefined(option)) {
                return false
            }
            var is_string = typeof option === 'string'
            var is_bool = typeof option === 'boolean'
            if (is_string) {
                return option === 'true' || option === 'True'
            } else if (is_bool) {
                return option
            }
            return false
        },

        show_error_displayer: function () {
            if(this.is_option_set(this.options.m2o_dialog) ||
               _.isUndefined(this.options.m2o_dialog) && this.is_option_set(this.view.ir_options['web_m2x_options.m2o_dialog']) ||
               this.can_create && _.isUndefined(this.options.m2o_dialog) && _.isUndefined(this.view.ir_options['web_m2x_options.m2o_dialog'])) {
                new M2ODialog(this).open();
            }
        },

        get_search_result: function (search_val) {
            var Objects = new Model(this.field.relation);
            var def = $.Deferred();
            var self = this;
            // add options limit used to change number of selections record
            // returned.
            if (_.isUndefined(this.view))
                    return this._super.apply(this, arguments);
                if (!_.isUndefined(this.view.ir_options['web_m2x_options.limit'])) {
                this.limit = parseInt(this.view.ir_options['web_m2x_options.limit'], 10);
            }

            if (typeof this.options.limit === 'number') {
                this.limit = this.options.limit;
            }

            // add options field_color and colors to color item(s) depending on field_color value
            this.field_color = this.options.field_color
            this.colors = this.options.colors

            var dataset = new data.DataSet(this, this.field.relation,
                                                   self.build_context());
            var blacklist = this.get_search_blacklist();
            this.last_query = search_val;

            function searcher (domain) {
                return self.orderer.add(dataset.name_search(
                    search_val,
                    domain,
                    'ilike', self.limit + 1,
                    self.build_context()));
                }
            try {
                var search_result = searcher(new data.CompoundDomain(
                    self.build_domain(), [["id", "not in", blacklist]]));
            // In search views sometimes the field domain cannot be evaluated
            } catch (error) {
                var search_result = searcher([["id", "not in", blacklist]]);
            }

            if (!(self.options && (self.is_option_set(self.options.create) || self.is_option_set(self.options.create_edit)))) {
                this.create_rights = this.create_rights || (function(){
                return new Model(self.field.relation).call(
                    "check_access_rights", ["create", false]);
                })();
            }

            $.when(search_result, this.create_rights).then(function (data, can_create) {

                self.can_create = can_create;  // for ``.show_error_displayer()``
                self.last_search = data;
                // possible selections for the m2o
                var values = _.map(data, function (x) {
                    x[1] = x[1].split("\n")[0];
                    return {
                        label: _.str.escapeHTML(x[1]),
                        value: x[1],
                        name: x[1],
                        id: x[0],
                    };
                });

                // Search result value colors
                if (self.colors && self.field_color) {
                    var value_ids = [];
                    for (var index in values) {
                        value_ids.push(values[index].id);
                    }
                    // RPC request to get field_color from Objects
                    Objects.query([self.field_color])
                                .filter([['id', 'in', value_ids]])
                                .all().done(function (objects) {
                                    for (var index in objects) {
                                        for (var index_value in values) {
                                            if (values[index_value].id == objects[index].id) {
                                                // Find value in values by comparing ids
                                                var value = values[index_value];
                                                // Find color with field value as key
                                                var color = self.colors[objects[index][self.field_color]] || 'black';
                                                value.label = '<span style="color:'+color+'">'+value.label+'</span>';
                                                break;
                                            }
                                        }
                                    }
                                    def.resolve(values);
                                });
                }

                // search more... if more results that max
                var can_search_more = (self.options && self.is_option_set(self.options.search_more)),
                    search_more_undef = _.isUndefined(self.options.search_more) && _.isUndefined(self.view.ir_options['web_m2x_options.search_more']),
                    search_more = self.is_option_set(self.view.ir_options['web_m2x_options.search_more']);

                if (values.length > self.limit && (can_search_more || search_more_undef || search_more)) {
                    values = values.slice(0, self.limit);
                    values.push({
                        label: _t("Search More..."),
                        action: function () {
                            // limit = 160 for improving performance, similar
                            // to Odoo implementation here:
                            // https://github.com/odoo/odoo/blob/feeac2a4f1cd777770dd2b42534904ac71f23e46/addons/web/static/src/js/views/form_common.js#L213
                            dataset.name_search(
                                search_val, self.build_domain(),
                                'ilike', 160).done(function (data) {
                                    self._search_create_popup("search", data);
                                });
                        },
                        classname: 'oe_m2o_dropdown_option o_m2o_dropdown_option'
                    });
                }

                // quick create

                var raw_result = _(data.result).map(function (x) {
                    return x[1];
                });
                var quick_create = self.is_option_set(self.options.create) || self.is_option_set(self.options.quick_create),
                    quick_create_undef = _.isUndefined(self.options.create) && _.isUndefined(self.options.quick_create),
                    m2x_create_undef = _.isUndefined(self.view.ir_options['web_m2x_options.create']),
                    m2x_create = self.is_option_set(self.view.ir_options['web_m2x_options.create']);
                var show_create = (!self.options && (m2x_create_undef || m2x_create)) || (self.options && (quick_create || (quick_create_undef && (m2x_create_undef || m2x_create))));
                if (self.can_create && show_create){
                    if (search_val.length > 0 &&
                        !_.include(raw_result, search_val)) {

                        values.push({
                            label: _.str.sprintf(
                                _t('Create "<strong>%s</strong>"'),
                                $('<span />').text(search_val).html()),
                            action: function () {
                                self._quick_create(search_val);
                            },
                            classname: 'oe_m2o_dropdown_option o_m2o_dropdown_option'
                        });
                    }
                }

                // create...
                var create_edit = self.is_option_set(self.options.create) || self.is_option_set(self.options.create_edit),
                    create_edit_undef = _.isUndefined(self.options.create) && _.isUndefined(self.options.create_edit),
                    m2x_create_edit_undef = _.isUndefined(self.view.ir_options['web_m2x_options.create_edit']),
                    m2x_create_edit = self.is_option_set(self.view.ir_options['web_m2x_options.create_edit']);
                var show_create_edit = (!self.options && (m2x_create_edit_undef || m2x_create_edit)) || (self.options && (create_edit || (create_edit_undef && (m2x_create_edit_undef || m2x_create_edit))));
                if (self.can_create && show_create_edit){
                    values.push({
                        label: _t("Create and Edit..."),
                        action: function () {
                            self._search_create_popup(
                                "form", undefined,
                                self._create_context(search_val));
                        },
                        classname: 'oe_m2o_dropdown_option o_m2o_dropdown_option'
                    });
                }
                // Check if colors specified to wait for RPC
                if (!(self.field_color && self.colors)){
                    def.resolve(values);
                }
            });

            return def;
        }
    });

    form_relational.FieldMany2ManyTags.include({
        init: function () {
            this.events["click .badge"] = "open_badge";
            return this._super.apply(this, arguments);
        },
        show_error_displayer: function () {
            if ((typeof this.options.m2o_dialog === 'undefined' && this.can_create) ||
                this.options.m2o_dialog) {
                new M2ODialog(this).open();
            }
        },

        start: function() {
            this._super.apply(this, arguments);
            return this.get_options();
        },

        get_options: function() {
            var self = this;
            if (_.isUndefined(this.view.ir_options_loaded)) {
                this.view.ir_options_loaded = $.Deferred();
                this.view.ir_options = {};
                (new Model("ir.config_parameter"))
                        .query(["key", "value"]).filter([['key', 'in', OPTIONS]])
                        .all().then(function(records) {
                        _(records).each(function(record) {
                    self.view.ir_options[record.key] = record.value;
                    });
                self.view.ir_options_loaded.resolve();
            });
            }
            return this.view.ir_options_loaded;
        },

        is_option_set: function(option) {
            if (_.isUndefined(option)) {
                return false
            }
            var is_string = typeof option === 'string'
            var is_bool = typeof option === 'boolean'
            if (is_string) {
                return option === 'true' || option === 'True'
            } else if (is_bool) {
                return option
            }
            return false
        },

        /**
        * Call this method to search using a string.
        */

        get_search_result: function(search_val) {
            var self = this;

            // add options limit used to change number of selections record
            // returned.

            if (!_.isUndefined(this.view.ir_options['web_m2x_options.limit'])) {
                this.limit = parseInt(this.view.ir_options['web_m2x_options.limit'], 10);
            }

            if (typeof this.options.limit === 'number') {
                this.limit = this.options.limit;
            }

            var dataset = new data.DataSet(this, this.field.relation, self.build_context());
            var blacklist = this.get_search_blacklist();
            this.last_query = search_val;

            return this.orderer.add(dataset.name_search(
                    search_val, new data.CompoundDomain(self.build_domain(), [["id", "not in", blacklist]]),
                    'ilike', this.limit + 1, self.build_context())).then(function(data) {
                self.last_search = data;
                // possible selections for the m2o
                var values = _.map(data, function(x) {
                    x[1] = x[1].split("\n")[0];
                    return {
                        label: _.str.escapeHTML(x[1]),
                        value: x[1],
                        name: x[1],
                        id: x[0],
                    };
                });

                // search more... if more results that max
                if (values.length > self.limit) {
                    values = values.slice(0, self.limit);
                    values.push({
                        label: _t("Search More..."),
                        action: function() {

                            // limit = 80 for improving performance, similar
                            // to Odoo implementation here:
                            // https://github.com/odoo/odoo/commit/8c3cdce539d87775b59b3f2d5ceb433f995821bf
                            dataset.name_search(search_val, self.build_domain(), 'ilike', 80).done(function(data) {
                                self._search_create_popup("search", data);
                            });
                        },
                        classname: 'oe_m2o_dropdown_option o_m2o_dropdown_option'
                    });
                }
                // quick create
                var quick_create = self.is_option_set(self.options.create) || self.is_option_set(self.options.quick_create),
                    quick_create_undef = _.isUndefined(self.options.create) && _.isUndefined(self.options.quick_create),
                    m2x_create_undef = _.isUndefined(self.view.ir_options['web_m2x_options.create']),
                    m2x_create = self.is_option_set(self.view.ir_options['web_m2x_options.create']);
                var show_create = (!self.options && (m2x_create_undef || m2x_create)) || (self.options && (quick_create || (quick_create_undef && (m2x_create_undef || m2x_create))));
                if (show_create){

                    var raw_result = _(data.result).map(function(x) {return x[1];});
                    if (search_val.length > 0 && !_.include(raw_result, search_val)) {
                        values.push({
                            label: _.str.sprintf(_t('Create "<strong>%s</strong>"'),
                                $('<span />').text(search_val).html()),
                            action: function() {
                                self._quick_create(search_val);
                            },
                            classname: 'oe_m2o_dropdown_option o_m2o_dropdown_option'
                        });
                    }
                }

                // create...
                var create_edit = self.is_option_set(self.options.create) || self.is_option_set(self.options.create_edit),
                    create_edit_undef = _.isUndefined(self.options.create) && _.isUndefined(self.options.create_edit),
                    m2x_create_edit_undef = _.isUndefined(self.view.ir_options['web_m2x_options.create_edit']),
                    m2x_create_edit = self.is_option_set(self.view.ir_options['web_m2x_options.create_edit']);
                var show_create_edit = (!self.options && (m2x_create_edit_undef || m2x_create_edit)) || (self.options && (create_edit || (create_edit_undef && (m2x_create_edit_undef || m2x_create_edit))));
                if (show_create_edit){

                    values.push({
                        label: _t("Create and Edit..."),
                        action: function() {
                            self._search_create_popup("form", undefined, self._create_context(search_val));
                        },
                        classname: 'oe_m2o_dropdown_option o_m2o_dropdown_option'
                    });
                }

                return values;
            })
        },

        open_badge: function(ev){
            var self = this;
            var open = (self.options && self.is_option_set(self.options.open));
            var no_color_picker = (self.options && self.is_option_set(self.options.no_color_picker));
            if(open){
                self.mutex.exec(function(){
                    var id = parseInt($(ev.currentTarget).data('id'), 10);
                    self.do_action({
                        type: 'ir.actions.act_window',
                        res_model: self.field.relation,
                        views: [[false, 'form']],
                        res_id: id,
                        target: "new"
                    });
                }.bind(this));
            }else if(no_color_picker){
                self.mutex.exec(function(){
                    return
                }.bind(this));
            }else{
                self.open_color_picker(ev);
            }
        },

     });
});
