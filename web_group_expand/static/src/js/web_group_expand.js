odoo.define('web_group_expand.web_group_expand',function(require){
    "use strict";
    var core = require('web.core');
    var ViewManager = require('web.ViewManager');
    var _t = core._t;
    var QWeb = core.qweb;

    ViewManager.include({
        switch_mode: function(view_type, no_store, view_options) {
            if (view_type !== 'list' && view_type !== 'tree' ) {
                $("div#oe_group_by").remove();
            }
            if(view_type === 'tree'){
                $("div#oe_group_by").remove();
                this.load_expand_buttons();
                this.$ExpandButtons.find("li#oe_group_by_reset").click(function(){
                    $('.oe_open .treeview-tr.oe-treeview-first').filter(function(){
                        return parseInt($(this).parents('tr').attr('data-level'),10) === 1;
                    }).click();
                });
                this.$ExpandButtons.find("li#oe_group_by_expand").click(function(){
                    $('.treeview-tr.oe-treeview-first').filter(function(){
                        return !$(this).parents().is('.oe_open') && $(this).parents().css( "display" ) !== 'none';
                    }).click();
                });
            }
            return this._super(view_type, no_store, view_options);
        },
        expand: function(domains, contexts, groupbys) {
            $("div#oe_group_by").remove();
            if(groupbys.length && this.active_view.type === 'list') {
                this.load_expand_buttons();
                $("li#oe_group_by_reset").click(function(){
                    $('span.ui-icon-triangle-1-s').click();
                });
                $("li#oe_group_by_expand").click(function(){
                    $('span.ui-icon-triangle-1-e').click();
                });
            }
        },
        load_expand_buttons:function() {
            var self = this;
            this.$ExpandButtons = $(QWeb.render("GroupExpand.Buttons", {'widget':self}));
            $(".oe-cp-switch-buttons.btn-group.btn-group-sm").before(this.$ExpandButtons);
        },
        setup_search_view: function() {
            var self = this;
            var res = this._super();
            this.searchview.on('search_data', self, this.expand);
            return res;
        },
    });
});
