'use strict';
openerp.web_widget_boolean_switch = function(instance){

    var inst = instance;
    instance.web.form.widgets.add('boolean_switch',
                                  'instance.web.form.FieldBooleanSwitch');

    $.fn.bootstrapSwitch.defaults.size = 'mini';
    $.fn.bootstrapSwitch.defaults.onColor = 'success';

    instance.web.form.FieldBooleanSwitch = instance.web.form.AbstractField.extend(
            instance.web.form.ReinitializeFieldMixin, {

        template: 'FieldBooleanSwitch',
        init: function(field_manager, node) {
            this._super(field_manager, node);
        },
        start: function() {
            var self = this;
            this.$checkbox = $("input", this.$el);
            this.$checkbox.bootstrapSwitch({
                onSwitchChange: _.bind(function(event, state) {
                    this.internal_set_value(this.$checkbox.is(':checked'));
                    event.preventDefault();
                }, this)
            });

            this.setupFocus(this.$checkbox);
//            var check_readonly = function() {
//                self.$checkbox.prop('disabled', self.get("effective_readonly"));
//            };
//            this.on("change:effective_readonly", this, check_readonly);
//            check_readonly.call(this);
            this._super.apply(this, arguments);
        },
        render_value: function() {
            this.$checkbox.bootstrapSwitch('state', this.get('value'), true);
            //this.$checkbox[0].checked =
        },
        focus: function() {
            var input = this.$checkbox && this.$checkbox[0];
            return input ? input.focus() : false;
        }
    });

    /*instance.web.ListView.Groups.include({
        render: function(post_render){
            var self = this;
            var prender = function(){
                self.init_widget_boolean_switch();
                if (post_render) { post_render(); }
            };
            return this._super(prender);
        },
        init_widget_boolean_switch: function(){
                var switch_fields = this.columns.filter(function(c){
                    return c.widget === 'boolean_switch';
                });
                if(switch_fields.length > 0){
                    // details lines
                    var checkboxes = this.view.$el.find(
                        '.oe_list_field_boolean_switch > input[type="checkbox"]');
                    checkboxes.bootstrapSwitch({'readonly': false,
                                                });
                    // TODO: the Group-by line
                }
        },
    });*/
    instance.web.list.columns.add('field.boolean_switch', 'instance.web.list.FieldBooleanSwitch');

    instance.web.list.FieldBooleanSwitch = instance.web.list.Column.extend({

        _format: function (row_data, options) {
            var quick_edit = false;
            quick_edit = py.eval(this.options).quick_edit ? py.eval(this.options).quick_edit : false;
            return _.str.sprintf('<input type="checkbox" %s %s/>',
                     row_data[this.id].value ? 'checked="checked"' : '',
                     quick_edit ? '' : 'readonly="readonly"');
        }
    });
    instance.web.ListView.include({
        reload_record: function(record){
            var self = this;
            return this._super(record).then(function(){
                self.init_widget_boolean_switch();
            });
        },
        reload_content: function(){
            var self = this;
            return this._super.apply(this, arguments).always( function (){
                self.init_widget_boolean_switch();
            });
        },

        init_widget_boolean_switch:function(){
            var switch_fields = this.columns.filter(function(c){
                return c.widget === 'boolean_switch';
            });
            if(switch_fields.length > 0){
                // details lines
                var checkboxes = this.$el.find(
                    '.oe_list_field_boolean_switch > input[type="checkbox"]');
                checkboxes.bootstrapSwitch({'readonly': false,
                                            });
                // TODO: the Group-by line
            }
        },

    });
};
