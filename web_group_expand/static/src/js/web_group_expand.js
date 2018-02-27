/*
    © 2018 Savoir-faire Linux <https://savoirfairelinux.com>
    License LGPL-3.0 or later (http://www.gnu.org/licenses/LGPL.html).
*/
odoo.define('web_group_expand', function(require) {
    "use strict";

    var QWeb = openerp.web.qweb;
    var ViewManager = require('web.ViewManager');

    ViewManager.include({
        switch_mode: function(view_type, view_options) {
            if (view_type != 'list' && view_type != 'tree' ) {
                $("div#oe_group_by").remove();
            }
            if(view_type == 'tree'){
                this.load_expand_buttons();
                this.$ExpandButtons.find("button#oe_group_by_reset").click(function(){
                    $('.o_open .treeview-tr.o_treeview_first.oe_number').filter(function(){
                        return ($(this).parents('tr').attr('data-level') == 1);
                    }).click()
                });
                this.$ExpandButtons.find("button#oe_group_by_expand").click(function(){
                    $('.treeview-tr.o_treeview_first.oe_number').filter(function(){
                        return !$(this).parents().is('.o_open') && $(this).parents().css( "display" ) !== 'none';
                    }).click();
                });
            }
            return this._super.apply(this, arguments);
        },
        expand: function(domains, contexts, groupbys) {
            $("div#oe_group_by").remove();
            if(groupbys.length && this.active_view.type == 'list') {
                this.load_expand_buttons();
                $("button#oe_group_by_reset").click(function(){
                    $('span.fa-caret-down').click();
                });
                $("button#oe_group_by_expand").click(function(){
                    $('span.fa-caret-right').click();
                });
            }
        },
        load_expand_buttons:function() {
            var self = this;
            this.$ExpandButtons = $(QWeb.render("GroupExpand.Buttons", {'widget':self}));
            $('.o_cp_switch_buttons').after(this.$ExpandButtons);
        },
        setup_search_view: function() {
            var self = this;
            var res = this._super.apply(this, arguments);
            this.searchview.on('search_data', self, this.expand);
            return res;
        },
    });
});
