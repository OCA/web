"use strict";
openerp.web_group_expand = function(openerp) {
    var QWeb = openerp.web.qweb;
    openerp.web.ViewManager.include({
        switch_mode: function(view_type, no_store, view_options) {
            if (view_type != 'list' && view_type != 'tree' ) {
                this.$el.find("ul#oe_group_by").remove();
            }
            if(view_type == 'tree'){
                this.$el.find("ul#oe_group_by").remove();
                this.load_expand_buttons();
                this.$ExpandButtons.find("a#oe_group_by_reset").click(function(){
                    $('.oe_open .treeview-tr.oe-treeview-first').filter(function(){return ($(this).parents('tr').attr('data-level') == 1)}).click()
                });
                this.$ExpandButtons.find("a#oe_group_by_expand").click(function(){
                    $('.treeview-tr.oe-treeview-first').filter(function(){return (!$(this).parents().is('.oe_open')) & ($(this).parents().css( "display" ) != 'none')}).click();
                });
            }
            return this._super.apply(this, arguments);
        },
        expand: function(domains, contexts, groupbys) {
            this.$el.find("ul#oe_group_by").remove();
            if(groupbys.length && this.active_view == 'list') {
                this.load_expand_buttons();
                this.$el.find("a#oe_group_by_reset").click(function(){
                    $('span.ui-icon-triangle-1-s').click()
                });
                this.$el.find("a#oe_group_by_expand").click(function(){
                    $('span.ui-icon-triangle-1-e').click()
                });
            }
        },
        load_expand_buttons:function() {
            var self = this;
            this.$ExpandButtons = $(QWeb.render("GroupExpand.Buttons", {'widget':self}));
            this.$el.find("ul.oe_view_manager_switch.oe_button_group.oe_right").before(this.$ExpandButtons);
        },
        setup_search_view: function(view_id, search_defaults) {
            var self = this;
            var res = this._super.apply(this, arguments);
            this.searchview.on('search_data', self, this.expand);
            return res
        },
    })
}
