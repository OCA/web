odoo.define('web_groupby_expand.web_groupby_expand', function (require) {
"use strict";

var ViewManager = require('web.ViewManager');

ViewManager.include({
    render_view_control_elements: function (){
        var res = this._super.apply(this, arguments);
        if (this.searchview_elements) {
            var searchview = this.searchview_elements.$searchview_buttons
            var expand_button = searchview.find('#oe_group_by_expand');
            var reset_button = searchview.find('#oe_group_by_reset');
            expand_button.on('click', this.proxy('expand_records'));
            reset_button.on('click', this.proxy('reset_records'));
            this.do_toggle_visibility(false)
        }
        return res;
    },

    _process_search_data: function () {
        var res = this._super.apply(this, arguments);
        if (this.active_view && this.active_view.type == 'list' && this.searchview_elements) {
            var searchview = this.searchview_elements.$searchview_buttons
            var has_groups = res.groupBy.length > 0
            this.do_toggle_visibility(has_groups)
        }
        return res;
    },

    get_search_groups: function (groups) {
        var current_search_group = {};
        for (var group in groups) {
            if (groups[group].count > 0 && groups[group].data.length > 0) {
                current_search_group[groups[group].id] = groups[group].data;
            }
        }
        return current_search_group;
    },

    do_toggle_visibility: function (show) {
        var searchview = this.searchview_elements.$searchview_buttons
        var buttons = searchview.find('.toggle_buttons');
        if (show) {
            buttons.show()
        }
        else {
            buttons.hide()
        }
    },

    toggle_group_records: function (op, controller) {
        var current_search_group = this.get_search_groups(controller.model.localData);
        if (current_search_group) {
            for (var group in current_search_group) {
                for (var gp in current_search_group[group]) {
                    var cur_group = controller.model.localData[current_search_group[group][gp]]
                    if ((op && !cur_group.isOpen) || (!op && cur_group.isOpen)) {
                        controller.trigger_up('toggle_group', { group: cur_group })
                    }
                }
            }
        }
    },
    
    reset_records: function () {
        var controller = this.active_view.controller;
        this.toggle_group_records(false, controller)
    },
    
    expand_records: function () {
        var controller = this.active_view.controller;
        this.toggle_group_records(true, controller)
    },
});
});
