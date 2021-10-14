odoo.define('web_drop_target_mail', function(require) {
    var FormController = require('web.FormController');

    FormController.include({
        start: function() {
            if (this.modelName == 'mail.compose.message'){
                // Image files drag and drop is handled by `html` widget.
                this._drop_excluded_subtypes = ['image'];
                // Dropped attachments will be stored on this field,
                // because transient model is not directly related with
                // attachments (after message is sent, attachment
                // relation is moved on active/parent record).
                this._attachment_fname = 'attachment_ids';
                // Must be disabled, because otherwise, it will block
                // html widget Drag and Drop.
                this._use_drag_events = false;
            }
            return this._super.apply(this, arguments);
        }
    });
});
