/* Copyright 2015 Therp BV <http://therp.nl>
 * Copyright 2017 Jairo Llopis <jairo.llopis@tecnativa.com>
 * Copyright 2018 Jose Mª Bernet <josemaria.bernet@guadaltech.es>
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define('web_advanced_search_x2x', function (require) {
    "use strict";

    var core = require('web.core');
    var DomainSelector = require('web.DomainSelector');
    var Domain = require("web.Domain");
    var FieldManagerMixin = require('web.FieldManagerMixin');
    var Char = core.search_filters_registry.get("char");

    var X2XAdvancedSearchPropositionMixin = {
        template: "web_advanced_search_x2x.proposition",
        events: {
            // If click on the node add or delete button, notify the parent and let
            // it handle the addition/removal
            "click .o_domain_tree_operator_caret": "_openCaret"
        },

        _openCaret: function (e) {
            var selectorClass = $('.o_domain_tree_operator_selector');
            if (selectorClass.hasClass('open')) {
                selectorClass.removeClass('open');
            } else {
                selectorClass.addClass('open');
            }
        },

        init: function (parent, options) {
            // Make equal and not equal appear 1st and 2nd
            this.relation = options.relation;
            this.type = options.type;
            this.field_name = options.name;
            this.name = parent.name;

            this.operators = _.sortBy(
                this.operators,
                function (op) {
                    switch (op.value) {
                        case '=':
                            return -2;
                        case '!=':
                            return -1;
                        default:
                            return 0;
                    }
                });

            // Append domain operator
            this.operators.push({
                'value': 'domain', 'text': core._lt('is in selection'),
            });

            return this._super.apply(this, arguments);
        },

        get_field_desc: function () {
            return this.field;
        },

        /**
         * Add x2x widget after rendering.
         */
        renderElement: function () {
            var result = this._super.apply(this, arguments);
            if (this.x2x_widget_name()) {
                this.x2x_field().appendTo(this.$el);
            }
            return result;
        },

        /**
         * Re-render widget when operator changes.
         */
        show_inputs: function () {
            this.renderElement();
            return this._super.apply(this, arguments);
        },

        /**
         * Create a relational field for the user.
         *
         * @return {Field}
         */
        x2x_field: function () {
            if (this._x2x_field) {
                this._x2x_field.destroy();
                delete this._x2x_field;
            }
            var widget = this.x2x_widget();
            if (!widget) return;
            this._x2x_field = new DomainSelector(this, this.relation, [], {readonly: false});
            return this._x2x_field;
        },
        x2x_value_changed: function () {
            switch (this.x2x_widget_name()) {
                case "char":
                    // Apply domain when selected
                    this.getParent().getParent().commit_search();
                    break;
            }
        },

        x2x_widget: function () {
            var name = this.x2x_widget_name();
            return name && core.search_filters_registry.get(name);
        },

        /**
         * Return the widget that should be used to render this proposition.
         *
         * If it returns `undefined`, it means you should use a simple
         * `<input type="text"/>`.
         */

        x2x_widget_name: function () {
            switch (this.get_operator()) {
                case "=":
                case "!=":
                    return undefined;
                case "domain":
                    return "many2one";
            }
        },

        get_domain: function () {
            // Special way to get domain if user chose "domain" filter
            if (this.get_operator() == "domain") {
                var domain = this._x2x_field.getDomain();
                var field_name = this.field_name;

                $.each(domain, function (index, value) {
                    if (domain[index].constructor == Array) {
                        domain[index][0] = field_name + '.' + domain[index][0]
                    }
                });

                return domain;
            } else {
                return this._super.apply(this, arguments);
            }
        },

        get_operator: function () {
            return !this.isDestroyed() &&
                this.getParent().$('.o_searchview_extended_prop_op').val();
        },

        get_value: function () {
            try {
                if (!this.x2x_widget_name()) {
                    throw "No x2x widget, fallback to default";
                }
                var domain = this._x2x_field.getDomain();
                return Domain.prototype.arrayToString(domain)
            } catch (error) {
                return this._super.apply(this, arguments);
            }
        }
    };

    var affected_types = ["one2many", "many2one", "many2many"],
        X2XAdvancedSearchProposition = Char.extend(
            FieldManagerMixin,
            X2XAdvancedSearchPropositionMixin
        );

    // Register this search proposition for relational fields
    $.each(affected_types, function (index, value) {
        core.search_filters_registry.add(value, X2XAdvancedSearchProposition);
    });

    return {
        X2XAdvancedSearchPropositionMixin: X2XAdvancedSearchPropositionMixin,
        X2XAdvancedSearchProposition: X2XAdvancedSearchProposition,
    };
});
