'use strict';
openerp.web_widget_boolean_switch = function(instance){

    instance.web.form.widgets.add('boolean_switch',
                                  'instance.web.form.FieldBooleanSwitch');

    $.fn.bootstrapSwitch.defaults.size = 'mini';
    $.fn.bootstrapSwitch.defaults.onColor = 'success';

    instance.web.BooleanSwitchWidget = instance.web.Class.extend({

        init: function(checkboxes, options){
            var options = options ? options : {};
            this.checkboxes = checkboxes;
            var switchOptions = {
                'readonly': options.hasOwnProperty('readonly') ? options.readonly : true,
            };
            if(options.hasOwnProperty('readonly')){
                switchOptions.onSwitchChange = options.onSwitchChange
            }
                'onSwitchChange'
            this.checkboxes.bootstrapSwitch(switchOptions);
        },
        start: function(){
            debugger;
        },
        set_value: function(value){
            // the third parameter tell if we should skip to fire evnets
            this.checkboxes.bootstrapSwitch('state', value, false);
        },
//        set_readonly: function(value){
//            // the third parameter tell if we should skip to fire evnets
//            this.checkboxes.bootstrapSwitch({'readonly': value});
//        },
    });

    // Form view

    instance.web.form.FieldBooleanSwitch = instance.web.form.AbstractField.extend(
            instance.web.form.ReinitializeFieldMixin, {

        template: 'FieldBooleanSwitch',

        start: function() {
            var self = this;
            //TODO: Get options from xmlview to init widget
            this.$checkbox = $("input", this.$el);
            this.widget = new openerp.instances.instance0.web.BooleanSwitchWidget(
                this.$checkbox, {
                onSwitchChange: _.bind(function(event, state) {
                    this.internal_set_value(this.$checkbox.is(':checked'));
                    event.preventDefault();
                }, this)
            });

            this.setupFocus(this.$checkbox);
            //TODO: use initialize_content to change
//            var check_readonly = function() {
//                self.$checkbox.prop('disabled', self.get("effective_readonly"));
//            };
//            this.on("change:effective_readonly", this, check_readonly);
//            check_readonly.call(this);
            this._super.apply(this, arguments);
        },
        render_value: function() {
            this.widget.set_value(this.get('value'));
            //this.$checkbox.bootstrapSwitch('state', this.get('value'), true);
        },
        focus: function() {
            var input = this.$checkbox && this.$checkbox[0];
            return input ? input.focus() : false;
        }
    });

    // List view

    function apply_helper(view, columns){
        var switch_fields = columns.filter(function(c){
            return c.widget === 'boolean_switch';
        });
        switch_fields.forEach(function(field){
            if(view.grouped){
                //Manage if it's grouped by boolean_switch widget field
                var checkboxes = view.$el.find('th.oe_list_group_name input[type="checkbox"]');
                new openerp.instances.instance0.web.BooleanSwitchWidget(checkboxes, {'readonly': true});
            }
            var quick_edit = false;
            quick_edit = py.eval(field.options).quick_edit ? py.eval(field.options).quick_edit : false;
            var checkboxes = view.$el.find(
                'td[data-field=' + field.name + '].oe_list_field_boolean_switch > input[type="checkbox"]');
            new openerp.instances.instance0.web.BooleanSwitchWidget(checkboxes, {'readonly': !quick_edit});
        });
    }

    instance.web.ListView.Groups.include({
        render: function(post_render){
            var self = this;
            var prender = function(){
                apply_helper(self.view, self.columns);
                if (post_render) { post_render(); }
            };
            return this._super(prender);
        },
    });

    instance.web.ListView.include({
        reload_record: function(record){
            // in case of editable list, only update record is reloaded
            // after edition
            var self = this;
            return this._super(record).then(function(){
                apply_helper(self, self.columns);
            });
        },
    });
};
