//-*- coding: utf-8 -*-
//© 2016 Therp BV <http://therp.nl>
//License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

openerp.web_x2m_defaults_from_previous = function(instance)
{
    instance.web.form.FieldOne2Many.include({
        build_context: function()
        {
            var self = this,
                default_fields =
                this.options.web_x2m_defaults_from_previous || [],
                extra_context = {},
                result = this._super.apply(this, arguments);
            if(!this.dataset.cache || !this.dataset.cache.length)
            {
                return result;
            }
            _.each(default_fields, function(field_name)
            {
                var value = self.dataset.cache[
                    self.views[0].embedded_view.arch.attrs.editable == 'top' ?
                    0 :
                    self.dataset.cache.length - 1
                ].values[field_name];
                if(_.isArray(value))
                {
                    value = value[0];
                }
                extra_context[
                    _.str.sprintf('default_%s', field_name)
                ] = value;
            });
            if(!_.isEmpty(extra_context))
            {
                result.add(extra_context);
            }
            return result;
        },
    });
};
