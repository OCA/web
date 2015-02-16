/*global openerp, _, $ */

openerp.web_m2x_options = function (instance) {

    "use strict";

    var QWeb = instance.web.qweb,
        _t  = instance.web._t,
        _lt = instance.web._lt;

    var OPTIONS = ['web_m2x_options.create',
	           'web_m2x_options.create_edit',
		   'web_m2x_options.limit',];

    instance.web.form.FieldMany2One.include({

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
	
     show_error_displayer: function () {
            if ((typeof this.options.m2o_dialog === 'undefined' && this.can_create) ||
                this.options.m2o_dialog) {
                new instance.web.form.M2ODialog(this).open();
            }
        },

        get_search_result: function (search_val) {
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
            if (typeof this.options.create === "undefined" ||
                typeof this.options.create_edit === "undefined") {
                create_rights = new instance.web.Model(this.field.relation).call(
                    "check_access_rights", ["create", false]);
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

                // search more... if more results that max

                if (values.length > self.limit) {
                    values = values.slice(0, self.limit);
                    values.push({
                        label: _t("Search More..."),
                        action: function () {
                            dataset.name_search(
                                search_val, self.build_domain(),
                                'ilike', false).done(function (data) {
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

                if ((_.isUndefined(self.options.create) && _.isUndefined(self.view.ir_options['web_m2x_options.create']) && can_create) || 
		    (_.isUndefined(self.options.create) && self.view.ir_options['web_m2x_options.create'] == "True") ||
                    self.options.create) {

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

                if ((_.isUndefined(self.options.create_edit) && _.isUndefined(self.view.ir_options['web_m2x_options.create_edit']) && can_create) ||
		    (_.isUndefined(self.options.create) && self.view.ir_options['web_m2x_options.create_edit'] == "True") ||
                    self.options.create_edit) {

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

                def.resolve(values);
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
                            dataset.name_search(search_val, self.build_domain(), 'ilike', false).done(function(data) {
                                self._search_create_popup("search", data);
                            });
                        },
                        classname: 'oe_m2o_dropdown_option'
                    });
                }
                // quick create

                if ((_.isUndefined(self.options.create) && _.isUndefined(self.view.ir_options['web_m2x_options.create'])) ||
		    (_.isUndefined(self.options.create) && self.view.ir_options['web_m2x_options.create'] == 'True') ||
                    self.options.create) {

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

                if ((_.isUndefined(self.options.create_edit === 'undefined') && _.isUndefined(self.view.ir_options['web_m2x_options.create_edit'])) ||
	            (_.isUndefined(self.options.create) && self.view.ir_options['web_m2x_options.create_edit'] == 'True') ||
                    self.options.create_edit) {

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
    });
};

