openerp.web_widget_radio_tree = function (instance) {

    var QWeb = instance.web.qweb;

    instance.web.list.columns.add('field.radio_tree', 'instance.web.list.RadioTreeColumn');

    instance.web.list.RadioTreeColumn = instance.web.list.Column.extend({
        _format: function (row_data, options) {
            return _.template(
                '<input type="radio" name="<%-name%>" <%-checked%> readonly="readonly"></input>', {
                    name: options.model + '_' + this.id,
                    checked: row_data[this.id].value ? 'checked' : '',
                });
        }
    });

    instance.web.form.widgets.add('radio_tree', 'instance.web.form.RadioTree');

    instance.web.form.RadioTree = instance.web.form.FieldBoolean.extend({
        template: 'RadioTree',
        start: function() {
            var _super = this._super.apply(this, arguments);
            this.$checkbox = $('input', this.$el);
            var radio_name = this.getParent().model + '_' + this.$checkbox[0].name;
            this.$checkbox.attr('name', radio_name);

            var self = this;
            this.$el.click(_.bind(function() {
                self.clean_radio_in_records();
                this.internal_set_value(true);
            }, this));
            return _super;
        },
        click_disabled_boolean: function(){
            var $disabled = this.$el.find('input[type=radio]:disabled');
            $disabled.each(function (){
                $(this).next('div').remove();
                $(this).closest('span').append($('<div class="boolean"></div>'));
            });
        },
        clean_radio_in_records: function() {
            var parent = this.getParent();
            var name = (this.$checkbox[0].name).split('_')[1];
            _.each(parent.dataset.ids, function(id) {
                values = {}
                values[name] = false;
                parent.dataset.write(id, values);
            });
        }
    });

};
