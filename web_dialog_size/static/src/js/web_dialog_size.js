odoo.define('web_dialog_size.web_dialog_size', function (require) {
'use strict';

var Model = require('web.DataModel');
var Dialog = require('web.Dialog');

Dialog.include({

    init: function (parent, options) {
        var self = this;
        this._super.apply(this, arguments);
        self.$modal.find('.dialog_button_extend').on('click', self.proxy('_extending'));
        self.$modal.find('.dialog_button_restore').on('click', self.proxy('_restore'));

        new Model('ir.config_parameter').query(['key', 'value']).
        filter([['key', '=', 'web_dialog_size.default_maximize']]).all().then(function(default_maximize) {
            if (default_maximize.length && default_maximize[0].value === 1) {
                self._extending();
            } else {
                self._restore();
            }
        });
    },

    open: function() {
        var res = this._super.apply(this, arguments);
        this.$modal.draggable({
            handle: '.modal-header',
            helper: false
        });
        return res;
    },

    close: function() {
        var draggable = this.$modal.draggable( "instance" );
        if (draggable) {
            this.$modal.draggable("destroy");
        }
        var res = this._super.apply(this, arguments);
        return res;
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
