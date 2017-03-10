openerp.web_add_button_position = function(instance) {



    /*
    instance.web.form.AddAnItemList.include({
        prepend_add_row: function(columns) {
            var self = this;
            var $cell = $('<td>', {
                colspan: columns,
                'class': this._add_row_class+'1' || ''
            }).append(
                $('<a>', {href: '#'}).text(_t("Add an item"))
                    .mousedown(function () {
                        if (self.view.editor.is_editing()) {
                            self.view.__ignore_blur = true;
                        }
                    })
                    .click(function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        if (self.view.editor.form.__blur_timeout) {
                            clearTimeout(self.view.editor.form.__blur_timeout);
                            self.view.editor.form.__blur_timeout = false;
                        }
                        self.view.ensure_saved().done(function () {
                            self.view.do_add_record();
                            //Keep it up
                            //TODO: Can be more efficient - Dennis Sluijk 20-01-2016
                            self.$current.find('.oe_add_item_row').remove();
                            self.prepend_add_row(columns); 
                        });
                    }));
            var $padding = this.$current.find('tr:first');
            var $newrow = $('<tr>').addClass('oe_add_item_row').append($cell);
            if ($padding.length) {
                $padding.before($newrow);
            } else {
                this.$current.append($newrow);
            }
        },
        pad_table_to: function (count) {
            if (!this.view.is_action_enabled('create') || this.is_readonly()) {
                this._super(count);
                return;
            }
                
            this._super(count);
            
            var self = this;
            var columns = _(this.columns).filter(function (column) {
                return column.invisible !== '1';
            }).length;
            if (this.options.selectable) { columns++; }
            if (this.options.deletable) { columns++; }
            
            this.prepend_add_row(columns); //Added to list to keep the natural feeling of normal Odoo behaviour / view. - Dennis Sluijk 20-01-2016

        }
    });
    */
}
