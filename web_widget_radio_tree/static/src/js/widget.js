openerp.web_widget_radio_tree = function (instance) {

    var QWeb = instance.web.qweb;

    instance.web.list.columns.add('field.radio_tree', 'instance.web.list.RadioTreeColumn');

    instance.web.list.RadioTreeColumn = instance.web.list.Column.extend({
        _format: function (row_data, options) {
            var name = options.model + '_' + this.id;
            return _.template(
                '<input type="radio" name="<%-name%>" <%-checked%> readonly="readonly"></input>', {
                    name: name,
                    checked: row_data[this.id].value ? 'checked' : '',
                });
        }
    });

    instance.web.form.widgets.add('radio_tree', 'instance.web.form.RadioTree');

    instance.web.form.RadioTree = instance.web.form.FieldBoolean.extend({
        template: 'RadioTree',
        start: function() {
            var self = this;
            this.$checkbox = $('input', this.$el);
            var radio_name = this.__parentedParent.model + '_' + this.$checkbox[0].name;
            this.$checkbox.attr('name', radio_name);
            this.setupFocus(this.$checkbox);
            this.$el.click(_.bind(function() {
                self.clean_radio_in_records();
                this.internal_set_value(true);
            }, this));
            var check_readonly = function() {
                self.$checkbox.prop('disabled', self.get('effective_readonly'));
                self.click_disabled_boolean();
            };
            this.on('change:effective_readonly', this, check_readonly);
            check_readonly.call(this);
            this._super.apply(this, arguments);
        },
        click_disabled_boolean: function(){
            var $disabled = this.$el.find('input[type=radio]:disabled');
            $disabled.each(function (){
                $(this).next('div').remove();
                $(this).closest('span').append($('<div class="boolean"></div>'));
            });
        },
        clean_radio_in_records: function() {
            var name = (this.$checkbox[0].name).split('_')[1];
            var ids = this.__parentedParent.dataset.ids;
            var current_id = this.__parentedParent.datarecord.id;

            // updating write hash
            var already_added = [];
            var to_write = this.__parentedParent.dataset.to_write;
            for (var j=0; j<to_write.length; ++j) {
                if (to_write[j]['id'] == current_id) {
                    to_write[j]['values'][name] = true;
                }
                else {
                    to_write[j]['values'][name] = false;
                }
                if (ids.includes(to_write[j]['id'])) {
                    already_added.push(to_write[j]['id']);
                }
            }
            for (var j=0; j<ids.length; ++j) {
                if (!already_added.includes(ids[j]) && ids[j] != current_id) {
                    values = {};
                    values[name] = false;
                    this.__parentedParent.dataset.to_write.push({
                        id: ids[j],
                        values: values
                    });
                }
            }

            // updating create hash
            var to_create = this.__parentedParent.dataset.to_create;
            for (var j=0; j<to_create.length; ++j) {
                if (to_create[j]['id'] == current_id) {
                    to_create[j]['values'][name] = true;
                }
                else {
                    to_create[j]['values'][name] = false;
                }
            }
        }
    });

};
