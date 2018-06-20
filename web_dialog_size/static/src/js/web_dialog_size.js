openerp.web_dialog_size= function (instance) {

    instance.web.Dialog =  instance.web.Dialog.extend({
        init_dialog: function () {
            var self = this,
                result = this._super();
            self.$dialog_box.find('.dialog_button_extend')
                .on('click', self.proxy('_extending'));
            self.$dialog_box.find('.dialog_button_restore')
                .on('click', self.proxy('_restore'));
            return jQuery.when(result).then(function()
            {
                var deferred = null;
                if(openerp.web_dialog_size.default_maximize === undefined)
                {
                    deferred = (new openerp.web.Model('ir.config_parameter'))
                        .call('get_param',
                              ['web_dialog_size.default_maximize'])
                        .then(function(default_maximize)
                        {
                            openerp.web_dialog_size.default_maximize =
                                default_maximize;
                        });
                }
                return jQuery.when(deferred).then(function()
                {
                    if(openerp.web_dialog_size.default_maximize)
                    {
                        self._extending();
                    }
                    else
                    {
                        self._restore();
                    }
                });
            });
        },

        _extending: function(e) {
            var dialog = this.$el.parents('.modal-dialog');
            dialog.addClass('dialog_full_screen');
            dialog.find('.dialog_button_extend').hide();
            dialog.find('.dialog_button_restore').show();
        },

        _restore: function(e) {
            var dialog = this.$el.parents('.modal-dialog');
            dialog.removeClass('dialog_full_screen');
            dialog.find('.dialog_button_restore').hide();
            dialog.find('.dialog_button_extend').show();
        },

    });

};

