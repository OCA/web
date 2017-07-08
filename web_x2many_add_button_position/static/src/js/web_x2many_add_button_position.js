/* Copyright 2017 Onestein
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

openerp.web_x2many_add_button_position = function(instance) {
    instance.web.form.AddAnItemList.include({
        pad_table_to: function() {
            var self = this;
            this._super.apply(this, arguments);
            if (this.view.fields_view.arch.attrs.editable &&
                this.view.fields_view.arch.attrs.editable == 'top') {
                    this.move_add_item_button();
                    this.$current.find('.' + this._add_row_class + ' a').click(function() {
                        self.move_add_item_button();
                    });
                }
        },
        move_add_item_button: function() {
            $btn_row = this.$current.find('.' + this._add_row_class).parent();
            $btn_row.detach();
            this.$current.find('tr:first').before($btn_row);
        }
    });
}
