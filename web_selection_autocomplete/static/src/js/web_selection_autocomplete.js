odoo.define('web_selection_autocomplete.autocomplete', function (require) {
    'use strict';

    var registry = require('web.core').form_widget_registry;

    registry.add(
        'selection_autocomplete',
        registry.get('selection').extend({
            template: 'SelectionAutocomplete',
            render_value: function () {
                var value = this.get('value'),
                    f = this._get_fn();

                // Set value on internal property and on dom element
                if (value) {
                    f.apply(this.$el, [this.get_sel_string(value) || value]);
                    this.set('value', f.apply(this.$el));
                }

                if (!this.get('effective_readonly')) {
                    // Initialize the autocomplete widget
                    if (!this.is_initialized()) {
                        this.$el.autocomplete({
                            source: _.flatten(
                                _.map(this.get('values'), _.last)),
                            minLength: 0,
                            autoFocus: true,
                        });
                    }

                    // Check if the value is valid and
                    // if not give visual feedback
                    this.check_validity();
                }
            },
            get_value: function () {
                // Override to give the selection value instead of the label
                return this.get_sel_value(this._get_fn().apply(this.$el));
            },

            is_initialized: function () {
                return this.$el.hasClass('ui-autocomplete-input');
            },
            check_validity: function () {
                this.$el.parent().toggleClass(
                    'o_selection_autocomplete_invalid',
                    !this.is_selection_valid());
            },
            is_selection_valid: function () {
                var value = this.get('value');
                return !_.isEmpty(_.find(this.get('values'), function (v) {
                    return v[1] === value;
                }));
            },
            _get_fn: function () {
                return this.get('effective_readonly') ? $().text : $().val;
            },
            get_sel_string: function (value) {
                return this._get_value(0, 1, value);
            },
            get_sel_value: function (value) {
                return this._get_value(1, 0, value);
            },
            _get_value: function (i, j, value) {
                var match = _.find(this.get('values'), function (v) {
                    return v[i] === value;
                });
                return match ? match[j] : null;
            },
            store_dom_value: function () {
                var f = this._get_fn(),
                    val = f.apply(this.$el);

                this.set('value', val);
                this.internal_set_value(f.apply(this.$el, [val]));
            },
        }));
});
