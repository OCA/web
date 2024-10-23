/* License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define('web_widget_mail_list_activity', function (require) {
    'use strict';

    var core = require('web.core');
    var field_registry = require('web.field_registry');
    var mailActivity = require('mail.Activity');
    var _lt = core._lt;
    var KanbanActivity = field_registry.get('kanban_activity');

    // -----------------------------------------------------------------------------
    // Activities Widget for List views ('list_activity' widget)
    // -----------------------------------------------------------------------------
    const ListActivity = KanbanActivity.extend({
        template: 'mail.ListActivity',
        events: Object.assign({}, KanbanActivity.prototype.events, {
            'click .dropdown-menu.o_activity': '_onDropdownClicked',
        }),
        fieldDependencies: _.extend({}, KanbanActivity.prototype.fieldDependencies, {
            activity_state: {type: 'char'},
            activity_summary: {type: 'char'},
            activity_type_id: {type: 'many2one', relation: 'mail.activity.type'},
            activity_type_icon: {type: 'char'},
        }),
        label: _lt('Next Activity'),

        /**
         * @override
         */
        init: function (parent, name, record) {
            this._super.apply(this, arguments);
        },

        //--------------------------------------------------------------------------
        // Private
        //--------------------------------------------------------------------------

        /**
         * @override
         * @private
         */
        _render: async function () {
            await this._super(...arguments);
            // set the 'special_click' prop on the activity icon to prevent from
            // opening the record when the user clicks on it (as it opens the
            // activity dropdown instead)
            this.$('.o_activity_btn > span').prop('special_click', true);
            if (this.value.count) {
                let text = this.recordData.activity_summary || this.recordData.activity_type_id.data.display_name;
                this.$('.o_activity_summary').text(text);
                if (this.nodeOptions.colorize_label) {
                    this.$('.o_activity_summary').addClass('o_activity_color_' + (this.activityState || 'default'));
                }
            }
            if (this.recordData.activity_type_icon) {
                this.el.querySelector('.o_activity_btn > span').classList.replace('fa-clock-o', this.recordData.activity_type_icon);
            }
        },

        //--------------------------------------------------------------------------
        // Handlers
        //--------------------------------------------------------------------------

        /**
         * As we are in a list view, we don't want clicks inside the activity
         * dropdown to open the record in a form view.
         *
         * @private
         * @param {MouseEvent} ev
         */
        _onDropdownClicked: function (ev) {
            ev.stopPropagation();
        },
    });

    field_registry.add('list_activity', ListActivity);

    return {
        ListActivity: ListActivity,
    };
});
