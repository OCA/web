odoo.define('web_widget_timepicker.form_widgets', function (require) {
    "use strict";

    var core = require('web.core');
    var formats = require('web.formats');
    var common = require('web.form_common');    

    var TimePicker = common.AbstractField.extend(common.ReinitializeFieldMixin, {
        is_field_number: true,        
        template: "TimePickerField",
        internal_format: 'float_time',
        widget_class: 'oe_form_field_time',
        events: {
            'change input': 'store_dom_value',
        },
        init: function (field_manager, node) {
            this._super(field_manager, node);
            
            this.internal_set_value(0);

            this.options = _.defaults( {}, {
                disableTextInput: true,
                forceRoundTime: true,
                step: 15,
                selectOnBlur: true,
                timeFormat: 'H:i',
                scrollDefault: 'now',
            });
        },
        initialize_content: function() {
            if(!this.get("effective_readonly")) {
                this.$input = this.$el.find('input');

                var effective_options = this.options;

                if(typeof this.node.attrs.options !== 'undefined' && this.node.attrs.options.length > 0 ) {

                    var custom_options = eval('('+ this.node.attrs.options +')')

                    // for(var key in custom_options) {
                    //     console.log('attr key : ' + key);
                    //     console.log('attr value : ' + custom_options[key] );
                    // }

                    // if(typeof effective_options === 'object') {
                    //     for(var key in effective_options) {
                    //         console.log('def key : ' + key);
                    //         console.log('def value : ' + effective_options[key] );
                    //     }
                    // }
                    
                    if(typeof custom_options === 'object') {
                        effective_options = $.extend({}, this.options, custom_options ); 
                    }

                    // if(typeof effective_options === 'object') {
                    //     for(var key in effective_options) {
                    //         console.log('merge key : ' + key);
                    //         console.log('merge value : ' + effective_options[key] );
                    //     }
                    // }
                }

                this.$input.timepicker(effective_options); 
                this.setupFocus(this.$('input'));                   
            }   
        },
        is_syntax_valid: function() {
            if (!this.get("effective_readonly") && this.$("input").size() > 0) {
                try {
                    this.parse_value(this.$('input').val(),'');
                    return true;
                } catch(e) {
                    return false;
                }
            }
            return true;
        },
        is_false: function() {
            return this.get('value') === '' || this._super();
        },
        focus: function() {
            var input = this.$('input:first')[0];
            return input ? input.focus() : false;
        },
        set_dimensions: function (height, width) {
            this._super(height, width);
            this.$('input').css({
                height: height,
                width: width
            });
        },                        
        store_dom_value: function () {
            if (!this.get('effective_readonly')) {
                this.internal_set_value(
                    this.parse_value(
                        this.$('input').val(),''));
            }
        },
        parse_value: function(val, def) {
            return formats.parse_value(val, {"widget": this.internal_format}, def);  
        },
        format_value: function(val, def) {
            return formats.format_value(val, {"widget": this.internal_format}, def);
        },
        render_value: function() {
            var show_value = this.format_value(this.get('value'),'');             

            if (!this.get("effective_readonly")) {
                this.$input = this.$el.find('input');
                this.$input.val(show_value);
            } else {
                this.$(".oe_form_time_content").text(show_value);
            }
        },
    });

    core.form_widget_registry.add('timepicker', TimePicker);

    return TimePicker;
});
