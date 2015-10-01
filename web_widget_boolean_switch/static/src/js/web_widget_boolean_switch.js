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
                'readonly': options.hasOwnProperty('readonly') ?
                    options.readonly : false,
                'disabled': options.hasOwnProperty('disabled') ?
                    options.disabled : false,
            };
            if(options.hasOwnProperty('onSwitchChange')){
                switchOptions.onSwitchChange = options.onSwitchChange
            }
            this.checkboxes.bootstrapSwitch(switchOptions);
        },
        set_value: function(value){
            // the third parameter tell if we should skip to fire evnets
            this.checkboxes.bootstrapSwitch('state', value, true);
        },
        set_readonly: function(value){
            this.checkboxes.bootstrapSwitch('readonly', value);
        },
        set_disabled: function(value){
            this.checkboxes.bootstrapSwitch('disabled', value);
        },
    });

    // Form view

    instance.web.form.FieldBooleanSwitch = instance.web.form.AbstractField.extend({

        template: 'FieldBooleanSwitch',

        init: function(field_manager, node){
            this._super(field_manager, node);
        },
        start: function(){
            this.$checkbox = $("input", this.$el);
            var readonly = this.modifiers &&
                this.modifiers.hasOwnProperty('readonly') ?
                this.modifiers.readonly : false;
            this.quick_edit = this.options &&
                this.options.hasOwnProperty('quick_edit') ?
                this.options.quick_edit : false;
            this.switcher = new openerp.instances.instance0.web.BooleanSwitchWidget(
                this.$checkbox, {
                'readonly': readonly,
                'disabled': !this.quick_edit,
                onSwitchChange: _.bind(function(event, state) {
                    this.internal_set_value(this.$checkbox.is(':checked'));
                    event.preventDefault();
                }, this)
            });
            this.on("change:effective_readonly", this, this.switcher_states);
            this._super();
        },
        switcher_states: function () {
            if (this.quick_edit)
                return;
            this.switcher.set_disabled(this.get('effective_readonly'))
        },
        render_value: function() {
            this.switcher.set_value(this.get('value'));
        },
    });

    // List view

    function apply_helper(view, columns){
        var switch_fields = columns.filter(function(c){
            return c.widget === 'boolean_switch';
        });
        switch_fields.forEach(function(field){
            if(view.grouped){
                //Manage if it's grouped by boolean_switch widget field
                var checkboxes = view.$el.find(
                    'th.oe_list_group_name input[type="checkbox"]');
                new openerp.instances.instance0.web.BooleanSwitchWidget(
                    checkboxes, {'readonly': true, 'disabled': true});
            }

            var readonly = field.modifiers &&
                field.modifiers.hasOwnProperty('readonly') ?
                field.modifiers.readonly : false;
            var options = py.eval(field.options)
            var quick_edit = options &&
                options.hasOwnProperty('quick_edit') ?
                options.quick_edit : false;

            var checkboxes = view.$el.find('td[data-field=' + field.name +
                '].oe_list_field_boolean_switch > input[type="checkbox"]');
            new openerp.instances.instance0.web.BooleanSwitchWidget(
                checkboxes, {'readonly': readonly, 'disabled': !quick_edit});
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
