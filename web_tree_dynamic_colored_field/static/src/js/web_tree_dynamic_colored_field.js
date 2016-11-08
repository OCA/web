odoo.define('web_tree_dynamic_colored_field', function(require)
{
    'use strict';
    var ListView = require('web.ListView'),
        pyeval = require('web.pyeval'),
        py = window.py;

    var pair_colors = function(pair_color){
        if (pair_color !== ""){
            var pair_list = pair_color.split(':'),
                color = pair_list[0],
                expression = pair_list[1];
            return [color, py.parse(py.tokenize(expression)), expression];
        }
    };

    var get_eval_context = function(record){
        return _.extend(
            {},
            record.attributes,
            pyeval.context()
        );
    };

    var colorize_helper = function(obj, record, column, field_attribute, css_attribute){
        var result = '';
        if (column[field_attribute]){
            var colors = _(column[field_attribute].split(';'))
            .chain()
            .map(pair_colors)
            .value()
            .filter(function CheckUndefined(value, index, ar) {
                return value !== undefined;
            });
            var ctx = get_eval_context(record);
            for(var i=0, len=colors.length; i<len; ++i) {
                var pair = colors[i],
                    color = pair[0],
                    expression = pair[1];
                if (py.evaluate(expression, ctx).toJSON()) {
                    result = css_attribute + ': ' + color + ';';
                }
            }
        }
        return result;
    };

    var colorize = function(record, column){
        var res = '';
        res += colorize_helper(this, record, column, 'bg_color', 'background-color');
        res += colorize_helper(this, record, column, 'fg_color', 'color');
        return res;
    };

    ListView.List.include({
        init: function(group, opts){
            this._super(group, opts);
            this.columns.fct_colorize = colorize;
        },
    });

    ListView.include({
        load_view: function()
        {
            var self = this;
            return this._super.apply(this, arguments)
            .then(function()
            {
                // the style_for helper is only called if one of colors or
                // fonts is not null
                if(self.fields_view.arch.attrs.color_field)
                {
                    self.colors = [];
                }
            });
        },
        style_for: function (record)
        {
            var result = this._super.apply(this, arguments);
            if(this.fields_view.arch.attrs.color_field)
            {
                var color = py.evaluate(
                    py.parse(py.tokenize(
                        this.fields_view.arch.attrs.color_field
                    )),
                    get_eval_context(record)).toJSON();
                if(color)
                {
                    result += 'color: ' + color;
                }
            }
            return result;
        },
    });
});
