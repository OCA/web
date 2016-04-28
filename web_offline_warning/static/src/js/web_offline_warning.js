openerp.web_offline_warning = function(openerp) {
    var _t     = openerp.web._t;
    var QWeb   = openerp.web.qweb;

    /**
     * Handle general XmlHttpRequestErrors, which occur when the server cannot be reached.
     */
    openerp.web.GenericXmlHttpRequestErrorHandler = openerp.web.Dialog.extend(openerp.web.ExceptionHandler, {
        init: function(parent, error) {
            this._super(parent);
            this.error = error;
        },
        display: function() {
            var self = this;

            new openerp.web.Dialog(this, {
                size: 'medium',
                title: "Odoo " + _t("Warning"),
                buttons: [
                    {text: _t("Ok"), click: function() { self.$el.parents('.modal').modal('hide');  self.destroy();}}
                ],
            }, QWeb.render('CrashManager.warning',
                           {message: _t("The server cannot be reached. You are probably offline.")})
            ).open();
        }
    });
    openerp.web.crash_manager_registry.add(void(0), 'openerp.web.GenericXmlHttpRequestErrorHandler');
}
