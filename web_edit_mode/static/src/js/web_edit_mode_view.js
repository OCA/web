odoo.define('web_edit_mode', function (require) {
    "use strict";

    var FormView = require('web.FormView');
    var FormController = require('web.FormController');

    FormView.include({
        /**
        * On opening a record in form view enable edit mode.
        */
        init: function (viewInfo, params) {
            if (typeof params.context !== 'undefined' && params.context.default_view_mode === 'edit') {
                var mode = 'edit';
                params.mode = mode;
            }
            this._super(viewInfo, params);
        },
    });

    FormController.include({
        /**
        * Method is triggered by CreateButton.
        * If in edit mode check if model is dirty and ask to discard the changes.
        */
        _onCreate: function () {
            var myself = this;
            this.canBeDiscarded(this.handle)
            .then(function () {
                myself.createRecord();
            });
        },
        /**
        * If view mode is edit set mode for Buttons to edit so the correct buttons are visible.
        */
        _updateButtons: function () {
            if (this.$buttons && this.renderer.state.context.default_view_mode === 'edit') {
                this.mode = 'edit';
            }
            this._super();
        },
        /**
        * If view mode is edit show the sidebar.
        */
        _updateSidebar: function () {
            this._super();
            if (this.sidebar && this.renderer.state.context.default_view_mode === 'edit') {
                this.sidebar.do_toggle(true);
            }
        },
        /**
        * _setMode is triggered after saving a record, so we don't want back to read mode and stay in edit.
        */
        _setMode: function (mode, recordID) {
            if (this.renderer.state.context.default_view_mode === 'edit') {
                mode = 'edit';
            }
            return this._super(mode, recordID);
        },
    });
});
