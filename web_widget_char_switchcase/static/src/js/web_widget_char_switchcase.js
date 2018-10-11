odoo.define('web_widget_char_switchcase', function (require) {
    "use strict";

    var core = require('web.core');
    var formats = require('web.formats');
    var form_widgets = require('web.form_widgets');

    form_widgets.FieldChar.include({
        transformations: ['default', 'upper', 'lower', 'title', 'sentence', 'camel', 'pascal', 'snake'],
        init: function (field_manager, node) {
            this._super(field_manager, node);
            this.options = _.defaults(this.options, {
                transform: this.transformations[0]
            });
            this.current_transformation = this.options['transform'];
            this.current_transformation_handler = this.get_transformation_handler()
            if (!_.contains(this.transformations, this.current_transformation))
                console.error(this.current_transformation + ' case unknown');
        },
        initialize_content: function() {
            var res = this._super();
            var self = this;
            if(this.$input) {
                this.$input.keyup(function(){
                    var old_val = self.$input.val();
                    if (!old_val)
                        return;
                    var new_val = self.current_transformation_handler(old_val);
                    self.$input.val(new_val);
                });
            }
            return res;
        },
        parse_value: function (val, def) {
            return this._super(this.current_transformation_handler(val), def);
        },
        format_value: function (val, def) {
            return this._super(this.current_transformation_handler(val), def);
        },
        get_transformation_handler: function () {
            switch (this.current_transformation) {
                case 'upper':
                    // HELLO WORLD!
                    return function (val) { return val.toUpperCase(); };
                case 'lower':
                    // hello world!
                    return function (val) { return val.toLowerCase(); };
                case 'title':
                    // Hello World!
                    return function (val) {
                        return val.replace(
                            /\w\S*/g,
                            function(txt) {
                                return txt.charAt(0).toUpperCase()
                                + txt.substr(1).toLowerCase();
                            });
                        };
                case 'sentence':
                    // Hello world!
                    return function (val) {
                        var first = true;
                        return val.replace(
                            /\w\S*/g,
                            function(txt) {
                                if (first){
                                    first = false;
                                    return txt.charAt(0).toUpperCase()
                                    + txt.substr(1).toLowerCase();
                                }
                                else
                                    return txt.toLowerCase();
                            });
                        };
                case 'camel':
                    // helloWorld!
                    return function (val) {
                        var first = true;
                        return val.replace(
                            /\w\S*/g,
                            function(txt) {
                                if (first){
                                    first = false;
                                    return txt.toLowerCase();
                                }
                                else
                                    return txt.charAt(0).toUpperCase()
                                    + txt.substr(1).toLowerCase();
                            }).replace(' ', '');
                        };
                case 'pascal':
                    // HelloWorld!
                    return function (val) {
                        return val.replace(
                            /\w\S*/g,
                            function(txt) {
                                return txt.charAt(0).toUpperCase()
                                + txt.substr(1).toLowerCase();
                            }).replace(' ', '');
                        };
                case 'snake':
                    // hello_world!
                    return function (val) {
                        return val.toLowerCase().replace(' ', '_');
                        };
                case 'default':
                default:
                    return function (val) { return val; };
            }
        }
    });
});
