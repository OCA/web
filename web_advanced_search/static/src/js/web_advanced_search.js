/* Copyright 2015 Therp BV <http://therp.nl>
 * Copyright 2017-2018 Jairo Llopis <jairo.llopis@tecnativa.com>
 * Copyright 2020 Alexandre Díaz
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define("web_advanced_search", function(require) {
    "use strict";

    const config = require("web.config");
    const Domain = require("web.Domain");
    const DomainSelector = require("web.DomainSelector");
    const DomainSelectorDialog = require("web.DomainSelectorDialog");
    const field_registry = require("web.field_registry");
    const FieldManagerMixin = require("web.FieldManagerMixin");
    const FilterMenu = require("web.FilterMenu");
    const human_domain = require("web_advanced_search.human_domain");
    const Widget = require("web.Widget");
    const search_filters_registry = require("web.search_filters_registry");
    const Char = search_filters_registry.get("char");

    /**
     * An almost dummy search proposition, to use with domain widget
     */
    const AdvancedSearchProposition = Widget.extend({
        /**
         * @override
         */
        init: function(parent, model, domain) {
            this._super(parent);
            this.model = model;
            this.domain = new Domain(domain);
            this.domain_array = domain;
            this._createDomainSelector();
        },

        /**
         * Produce a filter descriptor for advanced searches.
         *
         * @returns {Object} In the format expected by `web.FilterMenu`.
         */
        get_filter: function() {
            return {
                attrs: {
                    domain: this.domain_array,
                    string: human_domain.getHumanDomain(this.domain_selector),
                },
                children: [],
                tag: "filter",
            };
        },

        _createDomainSelector: function() {
            this.domain_selector = new DomainSelector(
                this,
                this.model,
                this.domain_array
            );
            this.dummy_parent = $("<div>");
            return this.domain_selector.appendTo(this.dummy_parent);
        },

        destroy: function() {
            this.domain_selector.destroy();
            this.dummy_parent.remove();
            return this._super.apply(this, arguments);
        },
    });

    // Add advanced search features
    FilterMenu.include({
        custom_events: _.extend({}, FilterMenu.prototype.custom_events, {
            domain_selected: "advanced_search_commit",
        }),

        events: _.extend({}, FilterMenu.prototype.events, {
            "click .o_add_advanced_search": "advanced_search_open",
        }),

        /**
         * Handle dropdown hidden event to prevent the menu from closing when using a
         * relational field
         *
         * @override
         */
        start: function() {
            this._super.apply(this, arguments);
            this.$el.on("hide.bs.dropdown", function() {
                var $modal = $(".o_technical_modal.show");
                return !(
                    ($modal.length && !$modal.has($(this)).length) ||
                    $("body.oe_wait").length
                );
            });
        },

        /**
         * @override
         */
        init: function() {
            this._super.apply(this, arguments);

            this._context = this.getParent().context;
            this._modelName = this.getParent().getParent().modelName;
        },

        /**
         * Open advanced search dialog
         *
         * @returns {$.Deferred} The opening dialog itself.
         */
        advanced_search_open: function() {
            const domain_selector_dialog = new DomainSelectorDialog(
                this,
                this._modelName,
                "[]",
                {
                    debugMode: config.isDebug(),
                    readonly: false,
                }
            );
            domain_selector_dialog.opened(() => {
                // Add 1st domain node by default
                domain_selector_dialog.domainSelector._onAddFirstButtonClick();
            });
            return domain_selector_dialog.open();
        },

        /**
         * Apply advanced search on dialog save
         *
         * @param {OdooEvent} event A `domain_selected` event from the dialog.
         */
        advanced_search_commit: function(event) {
            _.invoke(this.propositions, "destroy");
            const proposition = new AdvancedSearchProposition(
                this,
                this._modelName,
                event.data.domain
            );
            // Necessary to ensure that the porposition have the 'fieldSelector'
            // is filled
            _.defer(
                function() {
                    this.propositions = [proposition];
                    this._commitSearch();
                }.bind(this)
            );
        },
    });

    /**
     * A search field for relational fields.
     *
     * It implements and extends the `FieldManagerMixin`, and acts as if it
     * were a reduced dummy controller. Some actions "mock" the underlying
     * model, since sometimes we use a char widget to fill related fields
     * (which is not supported by that widget), and fields need an underlying
     * model implementation, which can only hold fake data, given a search view
     * has no data on it by definition.
     */
    const Relational = Char.extend(FieldManagerMixin, {
        tagName: "div",
        className: "x2x_container",
        attributes: {},

        /**
         * @override
         */
        init: function() {
            this._super.apply(this, arguments);
            // To make widgets work, we need a model and an empty record
            FieldManagerMixin.init.call(this);
            this.trigger_up("get_dataset");
            // Make equal and not equal appear 1st and 2nd
            this.operators = _.sortBy(this.operators, op => {
                switch (op.value) {
                    case "=":
                        return -2;
                    case "!=":
                        return -1;
                    default:
                        return 0;
                }
            });
            // Create dummy record with only the field the user is searching
            const params = {
                fieldNames: [this.field.name],
                modelName: this.field.relation,
                context: this.field.context,
                type: "record",
                viewType: "default",
                fieldsInfo: {
                    default: {},
                },
                fields: {
                    [this.field.name]: _.omit(
                        this.field,
                        // User needs all records, to actually produce a new domain
                        "domain",
                        // Onchanges make no sense in this context, there's no record
                        "onChange"
                    ),
                },
            };
            if (this.field.type.endsWith("2many")) {
                // X2many fields behave like m2o in the search context
                params.fields[this.field.name].type = "many2one";
            }
            params.fieldsInfo.default[this.field.name] = {};
            // Emulate `model.load()`, without RPC-calling `default_get()`
            this.datapoint_id = this.model._makeDataPoint(params).id;
            this.model.applyDefaultValues(this.datapoint_id, {}, params.fieldNames);
            // To generate a new fake ID
            this._fake_id = -1;
        },

        /**
         * @override
         */
        start: function() {
            const result = this._super.apply(this, arguments);
            // Render the initial widget
            result.then($.proxy(this, "show_inputs", $("<input value='='/>")));
            return result;
        },

        /**
         * @override
         */
        destroy: function() {
            if (this._field_widget) {
                this._field_widget.destroy();
            }
            this.model.destroy();
            delete this.record;
            return this._super.apply(this, arguments);
        },

        /**
         * Get record object for current datapoint.
         *
         * @returns {Object}
         */
        _get_record: function() {
            return this.model.get(this.datapoint_id);
        },

        /**
         * @override
         */
        show_inputs: function($operator) {
            // Get widget class to be used
            switch ($operator.val()) {
                case "=":
                case "!=":
                    this._field_widget_name = "many2one";
                    break;
                default:
                    this._field_widget_name = "char";
            }
            const _Widget = field_registry.get(this._field_widget_name);
            // Destroy previous widget, if any
            if (this._field_widget) {
                this._field_widget.destroy();
                delete this._field_widget;
            }
            // Create new widget
            const options = {
                mode: "edit",
                attrs: {
                    options: {
                        no_create_edit: true,
                        no_create: true,
                        no_open: true,
                        no_quick_create: true,
                    },
                },
            };
            this._field_widget = new _Widget(
                this,
                this.field.name,
                this._get_record(),
                options
            );
            this._field_widget.appendTo(this.$el);
            return this._super.apply(this, arguments);
        },

        /**
         * @override
         */
        _applyChanges: function(dataPointID, changes, event) {
            if (this._field_widget_name === "many2one") {
                // Make char updates look like valid x2one updates
                if (_.isNaN(changes[this.field.name].id)) {
                    changes[this.field.name] = {
                        id: this._fake_id--,
                        display_name: event.target.lastSetValue,
                    };
                }
                return FieldManagerMixin._applyChanges.apply(this, arguments);
            }

            return new Promise(resolve => {
                resolve();
            });
        },

        /**
         * @override
         */
        _confirmChange: function(id, fields, event) {
            this.datapoint_id = id;
            return this._field_widget.reset(this._get_record(), event);
        },

        /**
         * @override
         */
        get_value: function() {
            try {
                switch (this._field_widget_name) {
                    case "many2one":
                        return this._field_widget.value.res_id;
                    default:
                        return this._field_widget.$el.val();
                }
            } catch (error) {
                if (error.name === "TypeError") {
                    return false;
                }
            }
        },

        /**
         * Extract the field's value in a human-readable format.
         *
         * @override
         */
        toString: function() {
            try {
                switch (this._field_widget_name) {
                    case "many2one":
                        return this._field_widget.value.data.display_name;
                    default:
                        return this._field_widget.$el.val();
                }
            } catch (error) {
                if (error.name === "TypeError") {
                    return "";
                }
            }
            return this._super.apply(this, arguments);
        },
    });

    // Register search filter widgets
    search_filters_registry
        .add("many2many", Relational)
        .add("many2one", Relational)
        .add("one2many", Relational);

    return {
        AdvancedSearchProposition: AdvancedSearchProposition,
        Relational: Relational,
    };
});
