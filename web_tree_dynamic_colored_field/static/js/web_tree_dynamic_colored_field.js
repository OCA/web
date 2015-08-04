openerp.web_tree_dynamic_colored_field = function(instance){
    var _t = instance.web._t,
        _lt = instance.web._lt;
    var QWeb = instance.web.qweb;
    
    var pair_colors = function(pair_color){
        if (pair_color != ""){
            var pair_list = pair_color.split(':'),
                color = pair_list[0],
                expression = pair_list[1];
            return [color, py.parse(py.tokenize(expression)), expression]
        }
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
            var ctx = _.extend(
                    {},
                    record.attributes,
                    {
                        uid: obj.session.uid,
                        current_date: new Date().toString('yyyy-MM-dd')
                    }    
            );
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
        fct_colorize: colorize,
        render: function() {
            this.$current.empty().append(
                QWeb.render('ListView.rows', _.extend({
                        render_cell: function () {
                            return self.render_cell.apply(self, arguments); },
                        fct_colorize: function(){
                            return self.fct_colorize.apply(self, arguments);
                        }
                    }, this)));
            this.pad_table_to(4);
        },
        render_record: function(record) {
            var self = this;
            var index = this.records.indexOf(record);
            return QWeb.render('ListView.row', {
                columns: this.columns,
                options: this.options,
                record: record,
                row_parity: (index % 2 === 0) ? 'even' : 'odd',
                view: this.view,
                render_cell: function () {
                    return self.render_cell.apply(self, arguments); },
                fct_colorize: function(){
                    return self.fct_colorize.apply(self, arguments);
                }
            });
        }
    });
}
