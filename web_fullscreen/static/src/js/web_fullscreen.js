openerp.web_fullscreen = function(instance, local) {
    var _t = instance.web._t,
        _lt = instance.web._lt;
    var QWeb = instance.web.qweb;
    
    local.FullscreenButton = instance.Widget.extend({
        template: 'FullscreenButton',
        events: {
            "click a": "toggle"
        },
        toggle: function() {
            $("#oe_main_menu_navbar").toggle();
            $(".oe_leftbar").toggle();
        },
        start: function() {
            this.$el.find('a').tooltip();
        }
    });
    
    instance.web.ViewManager.include({
        start: function() {
            this._super.apply(this, arguments);
            var btn = new local.FullscreenButton(this);
            return btn.appendTo(this.$el.find('.oe_view_manager_switch'));
        }
    });
}
