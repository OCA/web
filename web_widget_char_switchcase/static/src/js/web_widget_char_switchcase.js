odoo.define('web_widget_char_switchcase', function (require) {
    "use strict";

    var form_widgets = require('web.form_widgets');

    form_widgets.FieldChar.include({
        events: _.extend({}, form_widgets.FieldChar.prototype.events, {
            'keyup': '_onKeyUp',
        }),
        transformations: [
            'default',
            'upper',
            'lower',
            'title',
            'sentence',
            'camel',
            'pascal',
            'snake',
        ],
        init: function (field_manager, node) {
            this._super(field_manager, node);
            this.options = _.defaults(this.options, {
                transform: this.transformations[0],
            });
            this.current_transformation = this.options.transform;
            this.current_transformation_handler =
                this.get_transformation_handler();
            if (!_.contains(this.transformations,
                this.current_transformation)) {
                console.error(this.current_transformation + ' case unknown');
            }
        },
        _onKeyUp: function () {
            // Save caret position
            var input = this.$input[0];
            var start = input.selectionStart;
            var end = input.selectionEnd;

            // Transform the value
            var old_val = this.$input.val();
            var new_val = this.current_transformation_handler(old_val);
            this.$input.val(new_val);

            // Restore caret position
            input.setSelectionRange(start, end);
        },
        parse_value: function (val, def) {
            return this._super(this.current_transformation_handler(val), def);
        },
        format_value: function (val, def) {
            return this._super(this.current_transformation_handler(val), def);
        },
        check_val: function (val) {
            return val && val.trim();
        },
        get_transformation_handler: function () {
            switch (this.current_transformation) {
            case 'upper':
                // Result: HELLO WORLD!
                return function (val) {
                    if (!this.check_val(val)) {
                        return val;
                    }
                    return val.toUpperCase();
                };
            case 'lower':
                // Result: hello world!
                return function (val) {
                    if (!this.check_val(val)) {
                        return val;
                    }
                    return val.toLowerCase();
                };
            case 'title':
                // Result: Hello World!
                return function (val) {
                    if (!this.check_val(val)) {
                        return val;
                    }
                    return val.replace(
                        /\w\S*/g,
                        function (txt) {
                            return txt.charAt(0).toUpperCase() +
                                txt.substr(1).toLowerCase();
                        });
                };
            case 'sentence':
                // Result: Hello world!
                return function (val) {
                    if (!this.check_val(val)) {
                        return val;
                    }
                    var first = true;
                    return val.replace(
                        /\w\S*/g,
                        function (txt) {
                            if (first) {
                                first = false;
                                return txt.charAt(0).toUpperCase() +
                                    txt.substr(1).toLowerCase();
                            }
                            return txt.toLowerCase();
                        });
                };
            case 'camel':
                // Result: helloWorld!
                return function (val) {
                    if (!this.check_val(val)) {
                        return val;
                    }
                    var first = true;
                    return val.replace(
                        /\w\S*/g,
                        function (txt) {
                            if (first) {
                                first = false;
                                return txt.toLowerCase();
                            }
                            return txt.charAt(0).toUpperCase() +
                                txt.substr(1).toLowerCase();
                        }).replace(' ', '');
                };
            case 'pascal':
                // Result: HelloWorld!
                return function (val) {
                    if (!this.check_val(val)) {
                        return val;
                    }
                    return val.replace(
                        /\w\S*/g,
                        function (txt) {
                            return txt.charAt(0).toUpperCase() +
                                txt.substr(1).toLowerCase();
                        }).replace(' ', '');
                };
            case 'snake':
                // Result: hello_world!
                return function (val) {
                    if (!this.check_val(val)) {
                        return val;
                    }
                    return val.toLowerCase().replace(' ', '_');
                };
            case 'default':
            default:
                return function (val) {
                    return val;
                };
            }
        },
    });
});
