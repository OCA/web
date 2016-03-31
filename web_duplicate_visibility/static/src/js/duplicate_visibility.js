odoo.define('web.DuplicateVisibility',function (require) {
    "use strict";

    var core = require('web.core');
    var Sidebar = require('web.Sidebar');
    var FormView = require('web.FormView');

    var _t = core._t;

    var DuplicateVisibility = FormView.include({
        /**
         * Instantiate and render the sidebar if a sidebar is requested
         * Sets this.sidebar
         * @param {jQuery} [$node] a jQuery node where the sidebar should be inserted
         * $node may be undefined, in which case the FormView inserts the sidebar in a
         * div of its template
         **/
        render_sidebar: function($node) {
            if (!this.sidebar && this.options.sidebar) {
                this.sidebar = new Sidebar(
                    this,
                    {editable: this.is_action_enabled('edit')}
                );
                if (this.fields_view.toolbar) {
                    this.sidebar.add_toolbar(this.fields_view.toolbar);
                }
                this.sidebar.add_items('other', _.compact([
                    this.is_action_enabled('delete') &&
                    {label: _t('Delete'), callback: this.on_button_delete},
                    this.is_action_enabled('duplicate') &&
                    this.is_action_enabled('create') &&
                    {label: _t('Duplicate'), callback: this.on_button_duplicate}
                ]));

                $node = $node || this.$('.oe_form_sidebar');
                this.sidebar.appendTo($node);

                // Show or hide the sidebar according to the view mode
                this.toggle_sidebar();
            }
        },
    });

});
