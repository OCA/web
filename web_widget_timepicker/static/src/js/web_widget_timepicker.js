odoo.define('web_widget_timepicker.form_widgets', function (require) {
    "use strict";

    var core = require('web.core');
    var formats = require('web.formats');
    var common = require('web.form_common');    

    // Snippet from http://stackoverflow.com/questions/9036429/convert-object-string-to-json
    function cleanup_str2json(str) {
      return (str.length > 0 && str !== undefined) ? str
        // wrap keys without quote with valid double quote
        .replace(/([\$\w]+)\s*:/g, function(_, $1){return '"'+$1+'":'})    
        // replacing single quote wrapped ones to double quote 
        .replace(/'([^']+)'/g, function(_, $1){return '"'+$1+'"'}) : undefined;         
    };

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
                var custom_options;

                if( this.node.attrs['data-options'] !== undefined && this.node.attrs['data-options'].length > 0) {
                    // First try to use jquery data function to create object
                    custom_options = $(this.node).data('options');

                    if(typeof custom_options !== 'object') {
                        // No garantee that the input data-options string is valid JSON format so try to cleanup
                        custom_options = JSON.parse(cleanup_str2json(this.node.attrs['data-options']));    
                    }
                }

                if(typeof custom_options === 'object') {
                    this.$el.find('input').timepicker($.extend({}, this.options, custom_options )); 
                } else {
                    this.$el.find('input').timepicker(this.options);                    
                }

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
