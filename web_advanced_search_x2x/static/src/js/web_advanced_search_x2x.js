/* Copyright 2015 Therp BV <http://therp.nl>
 * Copyright 2017 Jairo Llopis <jairo.llopis@tecnativa.com>
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define('web_advanced_search_x2x.search_filters', function (require) {
    "use strict";

    require('web.form_relational');
    require('web.form_widgets');
    var search_filters = require('web.search_filters');
    var form_common = require('web.form_common');
    var SearchView = require('web.SearchView');
    var data = require('web.data');
    var core = require('web.core');
    var pyeval = require('web.pyeval');

    var X2XAdvancedSearchPropositionMixin = {
        template: "web_advanced_search_x2x.proposition",

        init: function () {
            // Make equal and not equal appear 1st and 2nd
            this.operators = _.sortBy(
                this.operators,
                function(op)
                {
                    switch(op.value)
                    {
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
            // Avoid hiding filter when using special widgets
            this.events["click"] = function (event) {
                event.stopPropagation();
            }
            return this._super.apply(this, arguments);
        },

        get_field_desc: function()
        {
            return this.field;
        },

        /**
         * Add x2x widget after rendering.
         */
        renderElement: function() {
            var result = this._super.apply(this, arguments);
            if (this.x2x_widget_name()) {
                this.x2x_field().appendTo(this.$el);
                this._x2x_field.$el.on(
                    "autocompleteopen",
                    this.proxy('x2x_autocomplete_open')
                );
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

            var field_domain = this.field.domain;
            if (typeof field_domain === 'string') {
                try {
                    pyeval.eval('domain', field_domain);
                } catch(e) {
                    this.field.domain = "[]";
                }
            }

            this._x2x_field = new widget(
                this,
                this.x2x_field_create_options()
            );
            this._x2x_field.on(
                "domain_selected",
                this,
                this.proxy("x2x_value_changed")
            );
            return this._x2x_field;
        },

        x2x_field_create_options: function () {
            return {
                attrs: {
                    name: this.field.name,
                    options: JSON.stringify({
                        no_create: true,
                        no_open: true,
                        model: this.field.relation,
                    }),
                },
            };
        },

        x2x_value_changed: function () {
            switch (this.x2x_widget_name()) {
                case "char_domain":
                    // Apply domain when selected
                    this.getParent().getParent().commit_search();
                    break;
            }
        },

        x2x_widget: function () {
            var name = this.x2x_widget_name();
            return name && core.form_widget_registry.get(name);
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
                    return "many2one";
                case "domain":
                    return "char_domain";
            }
        },

        x2x_autocomplete_open: function()
        {
            var widget = this._x2x_field.$input.autocomplete("widget");
            widget.on('click', 'li', function(event) {
                event.stopPropagation();
            });
        },

        get_domain: function () {
            // Special way to get domain if user chose "domain" filter
            if (this.get_operator() == "domain") {
                var value = this._x2x_field.get_value();
                var domain = new data.CompoundDomain(),
                    name = this.field.name;
                $.map(value, function (el) {
                    var leaf = el;
                    if (typeof el !== "string") {
                        leaf = [
                            _.str.sprintf("%s.%s", name, el[0]),
                            el[1],
                            el[2],
                        ];
                    }
                    domain.add([leaf]);
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
                return this._x2x_field.get_value();
            } catch (error) {
                return this._super.apply(this, arguments);
            }
        },

        format_label: function (format, field, operator) {
            if (this.x2x_widget()) {
                var value = String(this._x2x_field.get_value());
                if (this._x2x_field.display_value) {
                    value = this._x2x_field.display_value[value];
                }
                return _.str.sprintf(
                    format,
                    {
                        field: field.string,
                        operator: operator.label || operator.text,
                        value: value,
                    }
                );
            } else {
                return this._super.apply(this, arguments);
            }
        },
    };

    var ExtendedSearchProposition = search_filters.ExtendedSearchProposition,
        Char = ExtendedSearchProposition.Char,
        affected_types = ["one2many", "many2one", "many2many"],
        X2XAdvancedSearchProposition = Char.extend(
            form_common.FieldManagerMixin,
            X2XAdvancedSearchPropositionMixin
        );

    // Register this search proposition for relational fields
    $.each(affected_types, function (index, value) {
        core.search_filters_registry.add(value, X2XAdvancedSearchProposition);
    });

    SearchView.include({
        build_search_data: function()
        {
            //Advanced.commit_search can only cope with propositions
            //(=domain leaves),
            //so we need to rebuild the domain if one of our CompoundDomains
            //is involved
            var result = this._super.apply(this, arguments);
            _.each(result.domains, function(domain, index)
            {
                if(!_.isArray(domain))
                {
                    return;
                }
                var compound_domains = [], leaves = [];
                _.each(domain, function(leaf)
                {
                    if(leaf instanceof data.CompoundDomain)
                    {
                        compound_domains.push(leaf);
                    }
                    if(_.isArray(leaf))
                    {
                        leaves.push(leaf);
                    }
                });
                if(compound_domains.length)
                {
                    var combined = new data.CompoundDomain();
                    _.each(compound_domains, function(domain)
                    {
                        combined.add(domain.eval());
                    });
                    _.each(leaves, function(leaf)
                    {
                        combined.add([leaf]);
                    });
                    result.domains[index] = combined;
                }
            });
            return result;
        },
    });

    return {
        X2XAdvancedSearchPropositionMixin: X2XAdvancedSearchPropositionMixin,
        X2XAdvancedSearchProposition: X2XAdvancedSearchProposition,
    };
});
