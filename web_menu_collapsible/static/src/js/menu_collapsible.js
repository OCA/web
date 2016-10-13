openerp.web_menu_collapsible = function(instance) {
    instance.web.Menu.include({
        self: this,
        start: function() {
            $(".oe_secondary_submenu").hide();
            $(".oe_secondary_menu_section").unbind("click");
            $(".oe_secondary_menu_section").click(this.section_clicked);
            $(".oe_secondary_menu_section").each(function() {
                if($(this).next().hasClass('oe_secondary_submenu')) {
                    $(this).addClass('oe_menu_toggler');
                }
            });
            return this._super.apply(this, arguments);
        },
        section_clicked: function() {
            $(this).toggleClass('oe_menu_opened').next().toggle();
        }
    });
};
