/*
    © 2016 Savoir-faire Linux <https://savoirfairelinux.com>
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

openerp.web_field_form_color = function (instance) {

    "use strict";

    var QWeb = instance.web.qweb;
    var _t  = instance.web._t;

    instance.web.form.FieldFloat.include({
        render_value: function() {
            this._super();
            this.set_color();
        },
        init: function (field_manager, node) {
            this._super(field_manager, node);

            if (this.node.attrs.colors) {
                this.colors = _(this.node.attrs.colors.split(';'))
                    .chain()
                    .compact()
                    .map(function(color_pair) {
                        var pair = color_pair.split(':'),
                            color = pair[0],
                            expr = pair[1];
                        return [color, py.parse(py.tokenize(expr)), expr];
                    })
                    .value();
            }

        },
        eval_color: function(){
            if (!this.colors) {
                return null;
            }

            var record = this.view.datarecord;

            var view_fields = {}
            var fields = this.view.fields;
            for(var field_name in fields){
                if(fields.hasOwnProperty(field_name)){
                    view_fields[field_name] = false;
                }
            }

            var context = _.extend(view_fields, record, {
                uid: this.session.uid,
                current_date: new Date().toString('yyyy-MM-dd')
            });

            for(var i = 0; i < this.colors.length; ++i) {
                var pair = this.colors[i];
                var color = pair[0];
                var expression = pair[1];
                if (py.evaluate(expression, context).toJSON()) {
                    return color;
                }
            }
            return null;
        },
        set_color: function() {
            var color = this.eval_color();
            if(color){
                this.$el.css('color', color);
            }
            else{
                this.$el.css('color', 'black');
            }
        },
        set_value: function(value_) {
            this.set_color();
            return this._super(value_);
        },
        format_value: function(val, def) {
            return instance.web.format_value(val, this, def);
        },
    })
}
