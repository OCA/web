/* Copyright 2016 Onestein
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define('web_x2many_delete_all.Mixin', function (require) {
    "use strict";
    var core = require('web.core');
    var _t = core._t;
    var ListRenderer = require('web.ListRenderer');

    ListRenderer.include({
        events: _.extend({}, ListRenderer.prototype.events, {
            'click thead .o_list_record_delete_all': '_onTrashAllIconClick',
        }),
        _renderHeader: function () {
            var $header = this._super.apply(this, arguments);
            if (this.addTrashIcon) {
                $header.find('tr').append(this._renderDeleteAll('th'));
            }
            return $header;
        },
        _renderDeleteAll: function (tag) {
            var $icon = $('<button>', {class: 'fa fa-trash-o o_list_record_delete_all_btn', name: 'delete all',
                'aria-label': _t('Delete All')});
            return $('<' + tag + ' width="1">')
                    .addClass('o_list_record_delete_all')
                    .append($icon);
        },
        _onTrashAllIconClick: function (event) {
            event.stopPropagation();
            var self = this;
            var resIDs = _.map(self.$('tbody  tr.o_data_row'), function(rowID) {
                return $(rowID).data('id')
            });
            _.each(resIDs, function(row_id){
                self.trigger_up('list_record_delete', {id: row_id});
            })
        },
    })
});
