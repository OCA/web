openerp.web_menu_collapsible = function(instance) {
    instance.web.Menu.include({
        self: this,
        start: function() {
            //Secondary menu
            $(".oe_secondary_submenu").hide();
            $(".oe_secondary_menu_section").unbind("click");
            $(".oe_secondary_menu_section").click(this.section_clicked);

            return this._super.apply(this, arguments);
        },
        section_clicked: function() {
            $(this).next().toggle(100);
        }
    });
};
