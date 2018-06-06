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
    })

    ViewManager.include({

        _process_search_data: function () {
            var res = this._super.apply(this, arguments);
            if (this.active_view && this.active_view.type == 'list' && this.searchview) {
                if(this.searchview.groupby_expand_menu){
                    var has_groups = res.groupBy.length > 0
                    this.searchview.groupby_expand_menu.do_toggle_visibility(has_groups)
                }
            }else{
                this.searchview.groupby_expand_menu.do_toggle_visibility(false)
            }
            return res;
        },
    });
});
