/* -----------------------------------------------------------\ 
 * web functions for web_hide_buttons
 * --------------------------------------------------------- */

/* comments to control jslint */
/*jslint nomen: true, white: true, */
/*global window, openerp, $, _ */

openerp.web_hide_buttons = function (openerp) {
    'use strict';

    /** Change ListView to not show Create and Delete buttons when that
    has been requested through the context passed from the action.
    */
    openerp.web.ListView.include({

        on_loaded : function (record) {
            var result, context;
            result = this._super.apply(this, arguments);
            if (this.groups.datagroup.context) {
                context = this.groups.datagroup.context;
                if (context.nocreate) {
                    this.$element.find('.oe-list-add')
                        .attr('disabled', true).hide();
                }
                if (context.nodelete) {
                    this.$element.find('.oe-list-delete')
                        .attr('disabled', true).hide();
                }
            }
            return result;
        }
    });

    openerp.web.FormView.include({

        on_loaded : function (record) {
            var result, context;
            result = this._super.apply(this, arguments);
            context = this.dataset.get_context();
            if (context) {
                if (context.nocreate) {
                    this.$element.find('.oe_form_button_create')
                        .attr('disabled', true).hide();
                    this.$element.find('.oe_form_button_duplicate')
                        .attr('disabled', true).hide();
                }
                if (context.nodelete) {
                    this.$element.find('.oe_form_button_delete')
                        .attr('disabled', true).hide();
                }
            }
            return result;
        }
    });

};
