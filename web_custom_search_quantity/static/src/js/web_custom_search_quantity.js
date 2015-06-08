/******************************************************************************
    Web - Custom Search Quantity module for Odoo
    Copyright (C) 2015-Today Akretion (http://www.akretion.com)
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
******************************************************************************/

openerp.web_custom_search_quantity = function (instance) {
    module = instance.web;
    _t = module._t;

    /***************************************************************************
    Extend the widget 'instance.web.ListView' to replace the select tag by an
    input with datalist option.
    ***************************************************************************/
    module.ListView.include({

        /**
         * Overload 'load_list' function:
         */
        load_list: function(data) {
            var self = this;
            this._super.apply(this, arguments);
            
            if (this.$pager){
                // unbind previous function that added a select tag
                this.$pager.find('.oe_list_pager_state').unbind("click");

                // bind a new function on click, that add a input type select
                this.$pager.find('.oe_list_pager_state').click(function (e) {
                    e.stopPropagation();
                    var $this = $(this);
                    var $select = $('<input list="page_value" class="custom_search_quantity" type="text">')
                        .appendTo($this.empty())
                        .click(function (e) {e.stopPropagation();})
                        .append(
                        '<datalist id="page_value">' +
                        '<option value="80">' +
                        '<option value="200">' + 
                        '<option value="500">' +
                        '<option value="2000">' +
                        '<option value="0" label="'+_t("0 (Unlimited)") + '">' +
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
                        }).blur(function() {
                            $(this).trigger('change');
                        })
                        .keypress(function(e) {
                            if(e.which == 13) {
                                $(this).trigger('change');
                            }
                        })
                        .focus()
                        .val(self._limit || '0');
                });
            }
        },
    });
};
