odoo.define('web_widget_radio_tree.radio_tree', function(require){
    'use strict';

    var core = require('web.core');
    var ListView = require('web.ListView');

    function path(element) {
        return element.parents().map(function() {
            return this.id || '';
        }).filter(function() {
            return this.length > 0;
        }).get().reverse().join("_");
    }

    ListView.include({
        setup_columns: function(fields, grouped) {
            this._super(fields, grouped);
            for (var i=0; i<this.columns.length; i++) {
                this.columns[i]['view'] = this.$el;
            }
        }
    });

    var QWeb = core.qweb;
    var Column = core.list_widget_registry.get('field');
    var RadioTreeColumn = Column.extend({
        _format: function (row_data, options) {
            return QWeb.render('RadioTreeColumn', {
                name: [path(this.view), options.model, this.id].join('_'),
                checked: row_data[this.id].value ? {checked: ''} : {},
            });
        }
    });
    core.list_widget_registry.add('field.radio_tree', RadioTreeColumn);

    var FieldBoolean = core.form_widget_registry.get('boolean');
    var RadioTree = FieldBoolean.extend({
        template: 'RadioTree',
        start: function() {
            var _super = this._super.apply(this, arguments);
            this.$checkbox = $('input', this.$el);
            var radio_name = [path(this.view.$el), this.getParent().model, this.$checkbox[0].name].join('_');
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
            var name_parts = (this.$checkbox[0].name).split('_');
            var name = name_parts[name_parts.length - 1];
            _.each(parent.dataset.ids, function(id) {
                var values = {};
                values[name] = false;
                parent.dataset.write(id, values);
            });
        }
    });
    core.form_widget_registry.add('radio_tree', RadioTree);

});
