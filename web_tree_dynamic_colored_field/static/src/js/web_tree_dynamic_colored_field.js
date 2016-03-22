openerp.web_tree_dynamic_colored_field = function(instance){
    var pair_colors = function(pair_color){
        if (pair_color != ""){
            var pair_list = pair_color.split(':'),
                color = pair_list[0],
                expression = pair_list[1];
            return [color, py.parse(py.tokenize(expression)), expression]
        }
    };

    var get_eval_context = function(record){
        return _.extend(
            {},
            record.attributes,
            instance.web.pyeval.context()
        );
    };

    var colorize_helper = function(obj, record, column, field_attribute, css_attribute){
        var result = '';
        if (column[field_attribute]){
            var colors = _(column[field_attribute].split(';'))
            .chain()
            .map(pair_colors)
            .value();
            var colors = colors.filter(function CheckUndefined(value, index, ar) {
                return value != undefined;
            })
            var ctx = get_eval_context(record);
            for(i=0, len=colors.length; i<len; ++i) {
                pair = colors[i];
                var color = pair[0];
                var expression = pair[1];
                if (py.evaluate(expression, ctx).toJSON()) {
                    result = css_attribute + ': ' + color + ';';
                }
            }
        }
        return result
    };

    var colorize = function(record, column){
        var res = '';
        res += colorize_helper(this, record, column, 'bg_color', 'background-color');
        res += colorize_helper(this, record, column, 'fg_color', 'color');
        return res;
    };

    instance.web.ListView.List.include({
        init: function(group, opts){
            this._super(group, opts);
            this.columns.fct_colorize = colorize;
        },
    });

    instance.web.ListView.include({
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
}
