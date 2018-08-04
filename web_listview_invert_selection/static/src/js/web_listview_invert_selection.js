/* Copyright 2017 Onestein
* License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define("web_listview_invert_selection", function (require) {
    "use strict";
    var core = require('web.core');
    var _t = core._t;
    var ListRenderer = require('web.ListRenderer');

    ListRenderer.include(/** @lends instance.web.ListView# */{

        events: _.extend({}, ListRenderer.prototype.events, {
            'click .o_invert_selection': '_onInvertSelection',
        }),

        _onInvertSelection: function (event) {
            event.stopPropagation();
            var checked = self.$("tbody .o_list_record_selector input:checked");
            var unchecked = self.$("tbody .o_list_record_selector input:not(:checked)");
            checked.prop("checked", false);
            unchecked.prop("checked", true);
            this._updateSelection();
        },

        _renderHeader: function (isGrouped) {
            var $header = this._super.apply(this, arguments);
            if (this.hasSelectors) {
                $header.find('th.o_list_record_selector').prepend(this._renderInvertSelection('span'));
            }
            return $header;
        },

        _renderInvertSelection: function (tag) {
            var $icon = $('<i>', {class: 'fa fa-refresh o_invert_selection_btn', name: 'Invert Selection',
                'aria-label': _t('Invert Selection'), 'title': _t('Invert Selection')});
            return $('<' + tag + '>')
                    .addClass('o_invert_selection')
                    .append($icon);
        },

    });
});
