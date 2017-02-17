/*
Copyright (C) 2015-Today Akretion (http://www.akretion.com)
@author: Sylvain LE GAL (https://twitter.com/legalsylvain)
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

odoo.define('web.web_listview_custom_element_number',function (require) {
    "use strict";

    var core = require('web.core');
    var ListView = require('web.ListView');

    var _t = core._t;

    /***************************************************************************
    Extend the widget 'web.ListView' to replace the select tag by an
    input with datalist option.
    ***************************************************************************/
    ListView.include({

        render_pager: function($node) {
            // Call Original function
            var self = this;
            this._super($node);

            // unbind previous function that added a select tag
            this.$pager.find('.oe_list_pager_state').unbind("click");

            // bind a new function on click, that add a input type select
            this.$pager.find('.oe_list_pager_state').click(function (e) {
                e.stopPropagation();
                var $this = $(this);
                var $select = $('<input list="page_value" class="custom_element_number" type="text" placeholder="' + (self._limit || '0') + '">')
                    .appendTo($this.empty())
                    .click(function (e) {e.stopPropagation();})
                    .append(
                    '<datalist id="page_value">' +
                    '<option value="80">' +
                    '<option value="200">' + 
                    '<option value="500">' +
                    '<option value="2000">' +
                    '<option value="0" label="'+_t("Unlimited") + '">' +
                    '</datalist>')
                    .change(function () {
                        var val = parseInt($select.val(), 10);
                        if (!isNaN(val)){
                            if (val == 0){
                                self._limit = null;
                            }
                            else{
                                self._limit = val;
                            }
                            self.page = 0;
                            self.reload_content();
                        }
                    })
                    .blur(function() {
                        $(this).trigger('change');
                    })
                    .keypress(function(e) {
                        if(e.which == 13) {
                            $(this).trigger('change');
                        }
                    })
                    .bind('select', function () {
                        $(this).trigger('change');
                    })
                    .focus()
            });
        },
    });
});
