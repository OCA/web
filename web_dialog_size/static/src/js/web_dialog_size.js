odoo.define('web_dialog_size.web_dialog_size', function (require) {
'use strict';

var rpc = require('web.rpc');
var Dialog = require('web.Dialog');

Dialog.include({

    willStart: function () {
        var self = this;
        return this._super.apply(this, arguments).then(function () {
            self.$modal.find('.dialog_button_extend').on('click', self.proxy('_extending'));
            self.$modal.find('.dialog_button_restore').on('click', self.proxy('_restore'));
            return rpc.query({
                model: 'ir.config_parameter',
                method: 'get_param',
                args: ['web_dialog_size.default_maximize',],
            }).then(function(default_maximize) {
                if (default_maximize === "True" || default_maximize === 1) {
                    self._extending();
                } else {
                    self._restore();
                }
            });
        });
    },

    open: function() {
        this._super.apply(this, arguments);
        if (this.$modal) {
            this.$modal.draggable({
                handle: '.modal-header',
                helper: false
            });
        };
        return this;
    },

    close: function() {
        if (this.$modal) {
            var draggable = this.$modal.draggable("instance");
            if (draggable) {
                this.$modal.draggable("destroy");
            }
        }
        return this._super.apply(this, arguments);
    },

    _extending: function() {
        var dialog = this.$modal.find('.modal-dialog');
        dialog.addClass('dialog_full_screen');
        dialog.find('.dialog_button_extend').hide();
        dialog.find('.dialog_button_restore').show();
    },

    _restore: function() {
        var dialog = this.$modal.find('.modal-dialog');
        dialog.removeClass('dialog_full_screen');
        dialog.find('.dialog_button_restore').hide();
        dialog.find('.dialog_button_extend').show();
    },

});

});
