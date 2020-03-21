/* Copyright 2015 Therp BV <http://therp.nl>
 * Copyright 2017-2018 Jairo Llopis <jairo.llopis@tecnativa.com>
 * Copyright 2020 Brainbean Apps (https://brainbeanapps.com)
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define("web_advanced_search", function (require) {
    "use strict";

    var core = require("web.core");
    var Domain = require("web.Domain");
    var DomainSelectorDialog = require("web.DomainSelectorDialog");
    var field_registry = require("web.field_registry");
    var FieldManagerMixin = require("web.FieldManagerMixin");
    var FiltersMenu = require("web.FiltersMenu");
    var human_domain = require("web_advanced_search.human_domain");
    var SearchView = require("web.SearchView");
    var Widget = require("web.Widget");
    var Char = core.search_filters_registry.get("char");

    var _lt = core._lt;

    SearchView.include({
        custom_events: _.extend({}, SearchView.prototype.custom_events, {
            "get_dataset": "_on_get_dataset",
        }),

        /**
         * Add or update a `dataset` attribute in event target
         *
         * The search view dataset includes things such as the model, which
         * is required to make some parts of search views smarter.
         *
         * @param {OdooEvent} event The target will get the dataset.
         */
        _on_get_dataset: function (event) {
            event.target.dataset = this.dataset;
            event.stopPropagation();
        },
    });

    /**
     * An almost dummy search proposition, to use with domain widget
     */
    var AdvancedSearchProposition = Widget.extend({

        /**
         * @override
         */
        init: function (parent, model, domain) {
            this._super(parent);
            this.model = model;
            this.domain = new Domain(domain);
            this.domain_array = domain;
        },

        /**
         * Produce a filter descriptor for advanced searches.
         *
         * @returns {Object} In the format expected by `web.FiltersMenu`.
         */
        get_filter: function () {
            return {
                attrs: {
                    domain: this.domain_array,
                    // TODO Remove when merged
                    // https://github.com/odoo/odoo/pull/25922
                    string: human_domain.getHumanDomain(
                        this,
                        this.model,
                        this.domain_array
                    ),
                },
                children: [],
                tag: "filter",
            };
        },
    });

    // Add advanced search features
    FiltersMenu.include({
        custom_events: _.extend({}, FiltersMenu.prototype.custom_events, {
            "domain_selected": "advanced_search_commit",
        }),

        events: _.extend({}, FiltersMenu.prototype.events, {
            "click .o_add_advanced_search": "advanced_search_open",
        }),

        /**
         * @override
         */
        init: function () {
            this._super.apply(this, arguments);
            this.trigger_up("get_dataset");
        },

        /**
         * Open advanced search dialog
         *
         * @returns {$.Deferred} The opening dialog itself.
         */
        advanced_search_open: function () {
            var domain_selector_dialog = new DomainSelectorDialog(
                this,
                this.dataset.model,
                "[]",
                {
                    debugMode: core.debug,
                    readonly: false,
                }
            );
            domain_selector_dialog.opened(function () {
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
        advanced_search_commit: function (event) {
            _.invoke(this.propositions, "destroy");
            var proposition = new AdvancedSearchProposition(
                this,
                this.dataset.model,
                event.data.domain
            );
            this.propositions = [proposition];
            this._commitSearch();
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
    var Relational = Char.extend(FieldManagerMixin, {
        tagName: "div",
        className: "x2x_container",
        attributes: {},

        /**
         * @override
         */
        init: function () {
            this._super.apply(this, arguments);
            // To make widgets work, we need a model and an empty record
            FieldManagerMixin.init.call(this);
            this.trigger_up("get_dataset");
            // Unfortunately, it's impossible to check if model supports these
            this.operators = this.operators.concat([
                {value: "child_of", text: _lt("is child of")},
                {value: "parent_of", text: _lt("is parent of")}
            ])
            // Prioritize equal, not equal, child_of, parent_of
            this.operators = _.sortBy(
                this.operators,
                function (op) {
                    switch (op.value) {
                    case "=":
                        return -4;
                    case "!=":
                        return -3;
                    case "child_of":
                        return -2;
                    case "parent_of":
                        return -1;
                    default:
                        return 0;
                    }
                });
            // Create dummy record with only the field the user is searching
            var params = {
                fieldNames: [this.field.name],
                modelName: this.dataset.model,
                context: this.dataset.context,
                fields: {},
                type: "record",
                viewType: "default",
                fieldsInfo: {
                    default: {},
                },
            };
            // See https://stackoverflow.com/a/11508530/1468388
            // to know how to include this in the previous step in ES6
            params.fields[this.field.name] = _.omit(
                this.field,
                // User needs all records, to actually produce a new domain
                "domain",
                // Onchanges make no sense in this context, there's no record
                "onChange"
            );
            if (this.field.type.endsWith("2many")) {
                // X2many fields behave like m2o in the search context
                params.fields[this.field.name].type = "many2one";
            }
            params.fieldsInfo.default[this.field.name] = {};
            // Emulate `model.load()`, without RPC-calling `default_get()`
            this.datapoint_id = this.model._makeDataPoint(params).id;
            this.model.applyDefaultValues(
                this.datapoint_id,
                {},
                params.fieldNames
            );
            // To generate a new fake ID
            this._fake_id = -1;
        },

        /**
         * @override
         */
        start: function () {
            var result = this._super.apply(this, arguments);
            // Render the initial widget
            result.done($.proxy(this, "show_inputs", $("<input value='='/>")));
            return result;
        },

        /**
         * @override
         */
        destroy: function () {
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
        _get_record: function () {
            return this.model.get(this.datapoint_id);
        },

        /**
         * @override
         */
        show_inputs: function ($operator) {
            // Get widget class to be used
            switch ($operator.val()) {
            case "=":
            case "!=":
            case "child_of":
            case "parent_of":
                this._field_widget_name = "many2one";
                break;
            default:
                this._field_widget_name = "char";
            }
            var _Widget = field_registry.get(this._field_widget_name);
            // Destroy previous widget, if any
            if (this._field_widget) {
                this._field_widget.destroy();
                delete this._field_widget;
            }
            // Create new widget
            var options = {
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
        _applyChanges: function (dataPointID, changes, event) {
            if (this._field_widget_name === 'many2one') {
                // Make char updates look like valid x2one updates
                if (_.isNaN(changes[this.field.name].id)) {
                    changes[this.field.name] = {
                        id: this._fake_id--,
                        display_name: event.target.lastSetValue,
                    };
                }
                return FieldManagerMixin._applyChanges.apply(this, arguments);
            }

            return $.Deferred().resolve();
        },

        /**
         * @override
         */
        _confirmChange: function (id, fields, event) {
            this.datapoint_id = id;
            return this._field_widget.reset(this._get_record(), event);
        },

        /**
         * @override
         */
        get_value: function () {
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
        toString: function () {
            try {
                switch (this._field_widget_name) {
                case "many2one":
                    return this._field_widget.value.data.display_name;
                default:
                    return this._field_widget.$el.val();
                }
                return this._super.apply(this, arguments);
            } catch (error) {
                if (error.name === "TypeError") {
                    return "";
                }
            }
        },
    });

    // Register search filter widgets
    core.search_filters_registry
        .add("many2many", Relational)
        .add("many2one", Relational)
        .add("one2many", Relational);

    return {
        AdvancedSearchProposition: AdvancedSearchProposition,
        Relational: Relational,
    };
});
