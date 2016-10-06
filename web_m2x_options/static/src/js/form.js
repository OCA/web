/*global openerp, _, $ */

openerp.web_m2x_options = function (instance) {

    "use strict";

    var QWeb = instance.web.qweb,
        _t  = instance.web._t,
        _lt = instance.web._lt;

    var OPTIONS = ['web_m2x_options.create',
                   'web_m2x_options.create_edit',
                   'web_m2x_options.limit',
                   'web_m2x_options.search_more',
                   'web_m2x_options.m2o_dialog',];

    instance.web.form.FieldMany2One = instance.web.form.FieldMany2One.extend({

        start: function() {
            this._super.apply(this, arguments);
            return this.get_options();
        },

        get_options: function() {
            var self = this;
            if (!_.isUndefined(this.view) && _.isUndefined(this.view.ir_options_loaded)) {
            this.view.ir_options_loaded = $.Deferred();
            this.view.ir_options = {};
            (new instance.web.Model("ir.config_parameter"))
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
                new instance.web.form.M2ODialog(this).open();
            }
        },

        get_search_result: function (search_val) {
            var Objects = new instance.web.Model(this.field.relation);
            var def = $.Deferred();
            var self = this;
            // add options limit used to change number of selections record
            // returned.
            if (_.isUndefined(this.view))
                    return this._super.apply(this, arguments);
                if (!_.isUndefined(this.view.ir_options['web_m2x_options.limit'])) {
                this.limit = parseInt(this.view.ir_options['web_m2x_options.limit']);
            }

            if (typeof this.options.limit === 'number') {
                this.limit = this.options.limit;
            }

            // add options search_more to force enable or disable search_more button
            if (this.is_option_set(this.options.search_more) || _.isUndefined(this.options.search_more) && this.is_option_set(self.view.ir_options['web_m2x_options.search_more'])) {
                this.search_more = true
            }

            // add options field_color and colors to color item(s) depending on field_color value
            this.field_color = this.options.field_color
            this.colors = this.options.colors

            var dataset = new instance.web.DataSet(this, this.field.relation,
                                                   self.build_context());
            var blacklist = this.get_search_blacklist();
            this.last_query = search_val;

            var search_result = this.orderer.add(dataset.name_search(
                search_val,
                new instance.web.CompoundDomain(
                    self.build_domain(), [["id", "not in", blacklist]]),
                'ilike', this.limit + 1,
                self.build_context()));

            var create_rights;
            if (!(self.options && (self.options.no_create || self.options.no_create_edit))) {
                // check quick create options
                var target_model = this.field.relation
                create_rights = new instance.web.Model('ir.model').
                    query(['disable_quick_create']).
                    filter([['model', '=', target_model]]).
                    first().
                    then(function(result){
                        if(result.disable_quick_create)
                            return $.when(false);
                        else
                            return new instance.web.Model(target_model).call(
                                "check_access_rights", ["create", false]);
                    });
            }

            $.when(search_result, create_rights).then(function (data, can_create) {

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

                if (values.length > self.limit || self.search_more) {
                    values = values.slice(0, self.limit);
                    values.push({
                        label: _t("Search More..."),
                        action: function () {
                            // limit = 80 for improving performance, similar
                            // to Odoo implementation here:
                            // https://github.com/odoo/odoo/commit/8c3cdce539d87775b59b3f2d5ceb433f995821bf
                            dataset.name_search(
                                search_val, self.build_domain(),
                                'ilike', 80).done(function (data) {
                                    self._search_create_popup("search", data);
                                });
                        },
                        classname: 'oe_m2o_dropdown_option'
                    });
                }

                // quick create

                var raw_result = _(data.result).map(function (x) {
                    return x[1];
                });
                var can_quick_create = _.isUndefined(self.view.ir_options['web_m2x_options.create']) ||
                                       (self.view.ir_options['web_m2x_options.create'].toLowerCase() == "true");
                if (self.options) {
                   if (typeof self.options.create === 'boolean') {
                     // field value is stronger than global settings
                     can_quick_create = self.options.create;
                   } else if (self.options.no_create || self.options.no_quick_create) {
                     // undocumented features, try to keep compatibility
                     can_quick_create = false;
                   }
                }

                if (can_create && can_quick_create) {

                    if (search_val.length > 0 &&
                        !_.include(raw_result, search_val)) {

                        values.push({
                            label: _.str.sprintf(
                                _t('Create "<strong>%s</strong>"'),
                                $('<span />').text(search_val).html()),
                            action: function () {
                                self._quick_create(search_val);
                            },
                            classname: 'oe_m2o_dropdown_option'
                        });
                    }
                }

                // create...
                var can_create_edit = _.isUndefined(self.view.ir_options['web_m2x_options.create_edit']) ||
                                       ( self.view.ir_options['web_m2x_options.create_edit'].toLowerCase() == "true");
                if (self.options) {
                   if (typeof self.options.create_edit === 'boolean') {
                     // field value is stronger than global settings
                     can_create_edit = self.options.create_edit;
                   } else if (self.options.no_create || self.options.no_create_edit) {
                     // undocumented features, try to keep compatibility
                     can_create_edit = false;
                   }
                }

                if (can_create && can_create_edit) {

                    values.push({
                        label: _t("Create and Edit..."),
                        action: function () {
                            self._search_create_popup(
                                "form", undefined,
                                self._create_context(search_val));
                        },
                        classname: 'oe_m2o_dropdown_option'
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

    instance.web.form.FieldMany2ManyTags.include({

        show_error_displayer: function () {
            if ((typeof this.options.m2o_dialog === 'undefined' && this.can_create) ||
                this.options.m2o_dialog) {
                new instance.web.form.M2ODialog(this).open();
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
                (new instance.web.Model("ir.config_parameter"))
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

        /**
        * Call this method to search using a string.
        */

        get_search_result: function(search_val) {
            var self = this;

            // add options limit used to change number of selections record
            // returned.

            if (!_.isUndefined(this.view.ir_options['web_m2x_options.limit'])) {
                this.limit = parseInt(this.view.ir_options['web_m2x_options.limit']);
            }

            if (typeof this.options.limit === 'number') {
                this.limit = this.options.limit;
            }

            var dataset = new instance.web.DataSet(this, this.field.relation, self.build_context());
            var blacklist = this.get_search_blacklist();
            this.last_query = search_val;

            return this.orderer.add(dataset.name_search(
                    search_val, new instance.web.CompoundDomain(self.build_domain(), [["id", "not in", blacklist]]),
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
                        classname: 'oe_m2o_dropdown_option'
                    });
                }
                // quick create
                var can_quick_create = _.isUndefined(self.view.ir_options['web_m2x_options.create']) ||
                                       (self.view.ir_options['web_m2x_options.create'].toLowerCase() == "true");
                if (self.options) {
                   if (typeof self.options.create === 'boolean') {
                     // field value is stronger than global settings
                     can_quick_create = self.options.create;
                   } else if (self.options.no_create || self.options.no_quick_create) {
                     // undocumented features, try to keep compatibility
                     can_quick_create = false;
                   }
                }

                if (can_quick_create) {

                    var raw_result = _(data.result).map(function(x) {return x[1];});
                    if (search_val.length > 0 && !_.include(raw_result, search_val)) {
                        values.push({
                            label: _.str.sprintf(_t('Create "<strong>%s</strong>"'),
                                $('<span />').text(search_val).html()),
                            action: function() {
                                self._quick_create(search_val);
                            },
                            classname: 'oe_m2o_dropdown_option'
                        });
                    }
                }

                // create...
                var can_create_edit = _.isUndefined(self.view.ir_options['web_m2x_options.create_edit']) ||
                                       ( self.view.ir_options['web_m2x_options.create_edit'].toLowerCase() == "true");
                if (self.options) {
                   if (typeof self.options.create_edit === 'boolean') {
                     // field value is stronger than global settings
                     can_create_edit = self.options.create_edit;
                   } else if (self.options.no_create || self.options.no_create_edit) {
                     // undocumented features, try to keep compatibility
                     can_create_edit = false;
                   }
                }

                if (can_create_edit) {

                    values.push({
                        label: _t("Create and Edit..."),
                        action: function() {
                            self._search_create_popup("form", undefined, self._create_context(search_val));
                        },
                        classname: 'oe_m2o_dropdown_option'
                    });
                }

                return values;
            })
        },

        render_value: function()
        {
            var self = this;
            return jQuery.when(this._super.apply(this, arguments))
            .then(function()
            {
                if(self.options.open)
                {
                    self.$el.find('.oe_tag')
                    .css('cursor', 'pointer')
                    .click(function(e)
                    {
                        var id = parseInt(jQuery(this).attr('data-id'));
                        self.do_action({
                            type: 'ir.actions.act_window',
                            res_model: self.field.relation,
                            views: [[false, 'form']],
                            res_id: id,
                        });
                    });
                }
            });
        },
    });
};

