odoo.define('web_selection_autocomplete.autocomplete', function (require) {
    'use strict';

    var registry = require('web.field_registry');
    var SelectionField = require('web.relational_fields').FieldSelection;

    registry.add(
        'selection_autocomplete',
        SelectionField.extend({
            template: 'SelectionAutocomplete',
            specialData: null,
            supportedFieldTypes: ['selection'],
            _renderEdit: function () {
                // Set value on internal property and on dom element
                if (this.value) {
                    var value = this.get_sel_string(this.value) || this.value;
                    this.$el.val(value);
                    this.value = value;
                }

                var self = this;
                if (!this.is_initialized()) {
                    this.$el.autocomplete({
                        source: _.flatten(
                            _.map(this.values, _.last)),
                        minLength: 0,
                        close: function (e) {
                            // Needed in some cases,
                            // eg. blur event with tab key click
                            // while focus on autocomplete values
                            // which set the focused value on the input element
                            // but does not trigger the 'change' event.
                            if (e.target.value) {
                                self._onChange(e);
                            }
                        },
                    });
                }

            },
            _renderReadonly: function () {
                this.$el.text(this.get_sel_string(this.value));
            },
            _onChange: function () {
                this._setValue(arguments[0].target.value);
            },
            getFocusableElement: function () {
                return this.$el.is('input') ? this.$el : $();
            },
            _setValue: function (value, options) {
                this._isValid = this.check_validity(value);

                if (value) {
                    this.value = this.get_sel_value(value);


                    var def = $.Deferred();
                    var changes = {};
                    changes[this.name] = this.value;

                    this.trigger_up('field_changed', {
                        dataPointID: this.dataPointID,
                        changes: changes,
                        viewType: this.viewType,
                        doNotSetDirty: options && options.doNotSetDirty,
                        notifyChange: !options ||
                            options.notifyChange !== false,
                        allowWarning: options && options.allowWarning,
                        onSuccess: def.resolve.bind(def),
                        onFailure: def.reject.bind(def),
                    });
                    return def;
                }
                return $.when();
            },
            is_initialized: function () {
                return this.$el.hasClass('ui-autocomplete-input');
            },
            check_validity: function (val) {
                var isValid = this.is_selection_valid(val);
                this.$el.parent().toggleClass(
                    'o_selection_autocomplete_invalid',
                    !isValid);

                return isValid;
            },
            is_selection_valid: function (val) {
                return !_.isEmpty(_.find(this.values, function (v) {
                    return v[1] === val;
                }));
            },
            get_sel_string: function (value) {
                return this._get_value(0, 1, value);
            },
            get_sel_value: function (value) {
                return this._get_value(1, 0, value);
            },
            _get_value: function (i, j, value) {
                var match = _.find(this.values, function (v) {
                    return v[i] === value;
                });
                return match ? match[j] : null;
            },
        }));
});
