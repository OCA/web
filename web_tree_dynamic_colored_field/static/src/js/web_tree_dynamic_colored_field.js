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
        willStart: function()
        {
	    // the style_for helper is only called if one of colors or
            // fonts is not null
            if(
                this.fields_view.arch.attrs.color_field ||
                this.fields_view.arch.attrs.background_color_field
	    )
            {
                this.colors = [];
            }
            return this._super.apply(this, arguments)
        },
	_style_for_color_field: function (record, css_property, field_attribute) {
            if(this.fields_view.arch.attrs[field_attribute])
            {
                var color = py.evaluate(
                    py.parse(py.tokenize(
                        this.fields_view.arch.attrs[field_attribute]
                    )),
                    get_eval_context(record)).toJSON();
                if(color)
                {
                    return _.str.sprintf('%s: %s;', css_property, color);
                }
            }
	    return '';
	},
        style_for: function (record)
        {
            var result = this._super.apply(this, arguments);
	    result += this._style_for_color_field(record, 'color', 'color_field');
	    result += this._style_for_color_field(record, 'background-color', 'background_color_field');
            return result;
        },
    });
});
