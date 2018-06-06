odoo.define('web_group_expand.GroupByExpandMenu', function (require) {
    "use strict";

    var core = require('web.core');
    var Widget = require('web.Widget');

    var QWeb = core.qweb;

    return Widget.extend({
        template: 'SearchView.GroupByExpandMenu',
        events: {
            'click .o_group_by_expand': function (event) {
                event.preventDefault();
                this.expand_records();
            },
            'click .o_group_by_shrink': function (event) {
                event.preventDefault();
                this.reset_records();
            },
        },
        init: function (parent, groups) {
            var self = this;
            this._super(parent);
            this.searchview = parent;
        },
        start: function () {
            this._super()
            var self = this;
            this.do_toggle_visibility(false)
        },
        do_toggle_visibility: function (show) {
            var self = this;
            var $expand_button = this.$('.o_group_by_expand');
            var $shrink_button = this.$('.o_group_by_shrink');
            if (show) {
                $expand_button.show()
                $shrink_button.show()
            }
            else {
                $expand_button.hide()
                $shrink_button.hide()
            }
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
        expand_records: _.debounce(function () {
            var controller = this.searchview.getParent().active_view.controller;
            this.toggle_group_records(true, controller)
        }, 200, true),
        reset_records: _.debounce(function () {
            var controller = this.searchview.getParent().active_view.controller;
                this.toggle_group_records(false, controller)
        }, 200, true),
    });

});
