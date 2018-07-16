odoo.define('web_group_expand.web_group_expand', function (require) {
    "use strict";

    var ViewManager = require('web.ViewManager');
    var SearchView = require('web.SearchView');
    var GroupByExpandMenu = require('web_group_expand.GroupByExpandMenu');

    SearchView.include({
        init: function (parent, dataset, fvg, options) {
            this._super.apply(this, arguments);
            this.groupby_expand_menu = undefined;
        },
        start: function () {
            var res = this._super.apply(this, arguments);
            var self = this;
            return res.done(function(){
                var group_by_menu_defs = [];
                if (self.$buttons) {
                    if (!self.options.disable_groupby && self.groupby_menu) {
                        self.groupby_expand_menu = new GroupByExpandMenu(self, self.groupbys);
                        group_by_menu_defs.push(self.groupby_expand_menu.appendTo(self.$buttons));
                    }
                }
            })
        },
    });

    ViewManager.include({
        init: function(parent, dataset, views, flags, options) {
            this._super.apply(this, arguments);
            this._show_group_expand_collapse_buttons = false;
        },
        _process_search_data: function () {
            var res = this._super.apply(this, arguments);
            if (this.searchview && this.searchview.groupby_expand_menu) {
                this._show_group_expand_collapse_buttons = (res.groupBy.length > 0);
                if (this.active_view && this.active_view.type === 'list') {
                    this.searchview.groupby_expand_menu.do_toggle_visibility(this._show_group_expand_collapse_buttons);
                }
            }
            return res;
        },
        switch_mode: function(view_type, view_options) {
            return this._super.apply(this, arguments).then(function(){
                this.searchview.groupby_expand_menu.do_toggle_visibility(view_type === 'list' && this.searchview && this.searchview.groupby_expand_menu && this._show_group_expand_collapse_buttons);
            }.bind(this));
        },
    });
});
