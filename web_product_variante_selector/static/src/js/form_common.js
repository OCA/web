odoo.define('web_product_variante_selector.form_common_extended', function(require) {
    "use strict";

    var FormCommon = require('web.form_common');
    var core = require('web.core');
    var data = require('web.data');
    var data_manager = require('web.data_manager');
    var _t = core._t;
    var form_relational = require('web.form_relational')
    var ViewDialog = FormCommon.ViewDialog;

    form_relational.FieldMany2One.include({
        _search_variante: function(view, ids, context) {
            var self = this;
            var current_product_id = 0;
            if (!(self.current_display === '')) {
                var product_ids = self.display_value;
                for (var product_id in product_ids) {
                    current_product_id = parseInt(product_id);
                    break;
                }
            }
            new SelectProductVariante(this, _.extend({}, (this.options || {}), {
                res_model: "web.product.variante.selector",
                domain: self.build_domain(),
                target: "new",
                context: {
                    'select_variante_domain': self.build_domain().eval(),
                    'current_product_id': current_product_id
                },
                title: _t("Product Variante Selector"),
                initial_ids: ids ? _.map(ids, function(x) {
                    return x[0];
                }) : undefined,
                initial_view: "form",
                on_selected: function(element_ids) {
                    self.add_id(element_ids[0]);
                    self.focus();
                }
            })).open();
        },

        get_search_result: function(search_val) {
            var self = this;

            var dataset = new data.DataSet(this, this.field.relation, self.build_context());
            this.last_query = search_val;
            var exclusion_domain = [],
                ids_blacklist = this.get_search_blacklist();
            if (!_(ids_blacklist).isEmpty()) {
                exclusion_domain.push(['id', 'not in', ids_blacklist]);
            }

            return this.orderer.add(dataset.name_search(
                search_val, new data.CompoundDomain(self.build_domain(), exclusion_domain),
                'ilike', this.limit + 1, self.build_context())).then(function(_data) {
                self.last_search = _data;
                // possible selections for the m2o
                var values = _.map(_data, function(x) {
                    x[1] = x[1].split("\n")[0];
                    return {
                        label: _.str.escapeHTML(x[1].trim()) || data.noDisplayContent,
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
                            dataset.name_search(search_val, self.build_domain(), 'ilike', 160).done(function(_data) {
                                self._search_create_popup("search", _data);
                            });
                        },
                        classname: 'o_m2o_dropdown_option'
                    });
                }
                // quick create
                var raw_result = _(_data.result).map(function(x) {
                    return x[1];
                });
                if (search_val.length > 0 && !_.include(raw_result, search_val) &&
                    !(self.options && (self.options.no_create || self.options.no_quick_create))) {
                    self.can_create && values.push({
                        label: _.str.sprintf(_t('Create "<strong>%s</strong>"'),
                            $('<span />').text(search_val).html()),
                        action: function() {
                            self._quick_create(search_val);
                        },
                        classname: 'o_m2o_dropdown_option'
                    });
                }
                // create...
                if (!(self.options && (self.options.no_create || self.options.no_create_edit)) && self.can_create) {
                    values.push({
                        label: _t("Create and Edit..."),
                        action: function() {
                            self._search_create_popup("form", undefined, self._create_context(search_val));
                        },
                        classname: 'o_m2o_dropdown_option'
                    });
                } else if (values.length === 0) {
                    values.push({
                        label: _t("No results to show..."),
                        action: function() {},
                        classname: 'o_m2o_dropdown_option'
                    });
                }

                // select variante
                if (self.field.relation === "product.product" && !((self.options && self.options.no_select_variante))) {
                    values.push({
                        label: _t("Variante Selector..."),
                        action: function() {
                            self._search_variante("form", _data);
                        },
                        classname: 'o_m2o_dropdown_option'
                    });
                }
                return values;
            });
        },
    });
    /**
     * Variante Selector (displays a form view record and leave once saved)
     */
    var SelectProductVariante = ViewDialog.extend({
        init: function(parent, options) {
            var self = this;

            if (!options || !options.buttons) {
                options = options || {};
                options.buttons = [{
                    text: _t("Discard"),
                    classes: "btn-default o_form_button_cancel",
                    close: true,
                    click: function() {
                        self.view_form.trigger('on_button_cancel');
                    }
                }];

                options.buttons.splice(0, 0, {
                    text: _t("Select"),
                    classes: "btn-primary",
                    click: function() {
                        var product_ids = self.view_form.fields.product_id.display_value
                        for (var product_id in product_ids) {
                            self.on_selected([parseInt(product_id)]);
                            self.close();
                            break;
                        }
                    }
                });
            }

            this._super(parent, options);
        },

        open: function() {
            var self = this;
            var _super = this._super.bind(this);
            this.init_dataset();

            if (this.res_id) {
                this.dataset.ids = [this.res_id];
                this.dataset.index = 0;
            } else {
                this.dataset.index = null;
            }
            var options = _.clone(this.options.form_view_options) || {};
            if (this.res_id !== null) {
                options.initial_mode = this.options.readonly ? "view" : "edit";
            }
            _.extend(options, {
                $buttons: this.$buttons,
            });
            var FormView = core.view_registry.get('form');
            var fields_view_def;
            if (this.options.alternative_form_view) {
                fields_view_def = $.when(this.options.alternative_form_view);
            } else {
                fields_view_def = data_manager.load_fields_view(this.dataset, this.options.view_id, 'form', false);
            }
            fields_view_def.then(function(fields_view) {
                self.view_form = new FormView(self, self.dataset, fields_view, options);
                var fragment = document.createDocumentFragment();
                self.view_form.appendTo(fragment).then(function() {
                    self.view_form.do_show().then(function() {
                        _super().$el.append(fragment);
                        self.view_form.autofocus();
                    });
                });
            });

            return this;
        },
    });

    return {
        SelectProductVariante: SelectProductVariante,
    };

});
