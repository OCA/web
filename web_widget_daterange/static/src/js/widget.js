odoo.define('web.web_widget_daterange', function(require) {
    "use strict";

    var basic_fields = require('web.basic_fields');
    var field_registry = require('web.field_registry');

    var session = require('web.session');
    var field_utils = require('web.field_utils');
    var time = require('web.time');

    var core = require('web.core');
    var _t = core._t;

    var FieldDateRange = basic_fields.InputField.extend({
        className: 'o_field_date_range',
        tagName: 'span',
        jsLibs: [
            '/web_widget_daterange/static/lib/daterangepicker/daterangepicker.js',
            '/web_widget_daterange/static/src/js/libs/daterangepicker.js',
        ],
        cssLibs: [
            '/web_widget_daterange/static/lib/daterangepicker/daterangepicker.css',
        ],
        supportedFieldTypes: ['date', 'datetime'],
        /**
         * @override
         */
        init: function () {
            this._super.apply(this, arguments);
            this.isDateField = this.formatType === 'date';
            this.dateRangePickerOptions = _.defaults(
                {},
                this.nodeOptions.picker_options || {},
                {
                    timePicker: !this.isDateField,
                    timePicker24Hour: _t.database.parameters.time_format.search('%H') !== -1,
                    autoUpdateInput: false,
                    timePickerIncrement: 5,
                    locale: {
                        format: this.isDateField ? time.getLangDateFormat() : time.getLangDatetimeFormat(),
                    },
                }
            );
            this.relatedEndDate = this.nodeOptions.related_end_date;
            this.relatedStartDate = this.nodeOptions.related_start_date;
        },
        /**
         * @override
         */
        destroy: function () {
            if (this.$pickerContainer) {
                this.$pickerContainer.remove();
            }
            this._super.apply(this, arguments);
        },

        //--------------------------------------------------------------------------
        // Private
        //--------------------------------------------------------------------------

        /**
         * @private
         * @param {Event} ev
         * @param {Object} picker
         */
        _applyChanges: function (ev, picker) {
            var changes = {};
            var displayStartDate = field_utils.format[this.formatType](picker.startDate, {}, {timezone: false});
            var displayEndDate = field_utils.format[this.formatType](picker.endDate, {}, {timezone: false});
            var changedStartDate = picker.startDate;
            var changedEndDate = picker.endDate;
            if (this.isDateField) {
                // In date mode, the library will give moment object of start and end date having
                // time at 00:00:00. So, Odoo will consider it as UTC. To fix this added browser
                // timezone offset in dates to get a correct selected date.
                changedStartDate = picker.startDate.add(session.getTZOffset(picker.startDate), 'minutes');
                changedEndDate = picker.endDate.startOf('day').add(session.getTZOffset(picker.endDate), 'minutes');
            }
            if (this.relatedEndDate) {
                this.$el.val(displayStartDate);
                changes[this.name] = this._parseValue(changedStartDate);
                changes[this.relatedEndDate] = this._parseValue(changedEndDate);
            }
            if (this.relatedStartDate) {
                this.$el.val(displayEndDate);
                changes[this.name] = this._parseValue(changedEndDate);
                changes[this.relatedStartDate] = this._parseValue(changedStartDate);
            }
            this.trigger_up('field_changed', {
                dataPointID: this.dataPointID,
                viewType: this.viewType,
                changes: changes,
            });
        },
        /**
         * @override
         */
        _renderEdit: function () {
            this._super.apply(this, arguments);
            var self = this;
            var startDate;
            var endDate;
            if (this.relatedEndDate) {
                startDate = this._formatValue(this.value);
                endDate = this._formatValue(this.recordData[this.relatedEndDate]);
            }
            if (this.relatedStartDate) {
                startDate = this._formatValue(this.recordData[this.relatedStartDate]);
                endDate = this._formatValue(this.value);
            }
            this.dateRangePickerOptions.startDate = startDate || moment();
            this.dateRangePickerOptions.endDate = endDate || moment();

            this.$el.daterangepicker(this.dateRangePickerOptions);
            this.$el.on('apply.daterangepicker', this._applyChanges.bind(this));
            this.$el.off('keyup.daterangepicker');
            this.$pickerContainer = this.$el.data('daterangepicker').container;

            // Prevent from leaving the edition of a row in editable list view
            this.$pickerContainer.on('click', function (ev) {
                ev.stopPropagation();
                if ($(ev.target).hasClass('applyBtn')) {
                    self.$el.data('daterangepicker').hide();
                }
            });

            // Prevent bootstrap from focusing on modal (which breaks hours drop-down in firefox)
            this.$pickerContainer.on('focusin.bs.modal', 'select', function (ev) {
                ev.stopPropagation();
            });
        },
    });
    field_registry.add('daterange', FieldDateRange);
});
