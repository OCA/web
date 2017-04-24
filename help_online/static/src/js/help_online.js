odoo.define('oca.HelpOnline', function (require) {
    "use strict";

    var core = require('web.core');
    var QWeb = core.qweb;
    var _t = core._t;
    var ViewManager = require('web.ViewManager');
    var ControlPanel = require('web.ControlPanel');
    var Dialog = require('web.Dialog');

    ControlPanel.include({
        start: function(){
            this._super.apply(this, arguments);
            this._toggle_visibility(true);
            this.nodes = _.extend(
                this.nodes,
                {$help_online_buttons: this.$('.o_help_online_buttons')});
            this._toggle_visibility(false);
        },
    });

    ViewManager.include({

        /**
         * This function render the help button with the informations received
         * from the call to the method build_url from the help_online controller 
         */
        render_help_button: function(url_info){
            var $helpButton = $(QWeb.render("HelpOnline.Button", {'view_manager':this, 'url_info': url_info}));
            $helpButton.tooltip();
            if (url_info.exists === false) {
                $helpButton.on('click', function (event) {
                    var evt = event;
                    evt.preventDefault();
                    Dialog.confirm(
                        self,
                        _t('Page does not exist. Do you want to create?'),
                        {confirm_callback:  function() {
                            var form = $("<form></form>");
                            form.attr({
                                    id     : "formform",
                                    // The location given in the link itself
                                    action : evt.target.href, 
                                    method : "GET",
                                    // Open in new window/tab
                                    target : evt.target.target
                            });
                            $("body").append(form);
                            $("#formform").submit();
                            $("#formform").remove();
                            return false;
                        }
                    });
                });
            }
            return $helpButton;
        },

        /**
         * This function render the help buttons container on the view.
         * It should be called after start() by render_view_control_elements.
         * @param {control_elements} the list of control elements to display into the ControlPanel
         */
        render_help_buttons: function(control_elements){
            if (! control_elements.$help_online_buttons){
                control_elements.$help_online_buttons = $('<div/>'); 
            }
            var self = this;
            this.rpc('/help_online/build_url', {model: this.dataset.model, view_type: this.active_view.type}).then(function(result) {
                if (result && ! _.isEmpty(result)) {
                    var $helpButton =  self.render_help_button(result);
                    control_elements.$help_online_buttons = $helpButton;
                    // update the control panel with the new help button
                    self.update_control_panel({cp_content: _.extend({}, self.searchview_elements, control_elements)}, {clear: false});
                }
            });
        },

        render_view_control_elements: function() {
            var control_elements = this._super.apply(this, arguments);
            this.render_help_buttons(control_elements);
            return control_elements;
        },

    });
});
