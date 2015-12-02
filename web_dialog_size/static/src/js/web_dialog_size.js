openerp.web_dialog_size= function (instance) {

    instance.web.Dialog =  instance.web.Dialog.extend({

        init_dialog: function () {
            var self = this;
            this._super();
            self.$dialog_box.find('.dialog_button_restore').addClass('dialog_button_hide');
            if (this.dialog_options.size !== 'large'){
                self.$dialog_box.find('.dialog_button_extend').addClass('dialog_button_hide');
            }
            else{
                self.$dialog_box.find('.dialog_button_extend').on('click', self._extending);
                self.$dialog_box.find('.dialog_button_restore').on('click', self._restore);
            }
            $(".modal-dialog").draggable();
        },

        _extending: function() {
            var self = this;
            $(this).parents('.modal-dialog').addClass('dialog_full_screen');
            $(this).addClass('dialog_button_hide');

            $(this).parents('.modal-dialog').find('.dialog_button_restore').removeClass('dialog_button_hide')
        },

        _restore: function() {
            var self = this;
            $(this).parents('.modal-dialog').removeClass('dialog_full_screen');
            $(this).addClass('dialog_button_hide');

            $(this).parents('.modal-dialog').find('.dialog_button_extend').removeClass('dialog_button_hide')
        },

    });

};

