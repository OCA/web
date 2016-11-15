//-*- coding: utf-8 -*-
//© 2016 Therp BV <http://therp.nl>
//License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

openerp.web_x2m_filter = function(instance)
{
    instance.web.ListView.include({
        init: function()
        {
            this.events['click button.web_x2m_filter'] = 'web_x2m_filter_click';
            return this._super.apply(this, arguments);
        },
        web_x2m_filter_click: function(e)
        {
            var $button = jQuery(e.currentTarget);
            this.$('button.web_x2m_filter:disabled').prop('disabled', false);
            $button.prop('disabled', true);
            return (this.getParent().o2m || this.getParent())
            .web_x2m_filter_apply_domain($button.attr('data-domain'))
            .then(this.proxy('reload_content'));
        },
        start: function()
        {
            var self = this;
            return this._super.apply(this, arguments).then(function()
            {
                self.$('button.web_x2m_filter[data-default]').click();
            });
        },
    });
    var apply_domain = function(o2m, domain)
    {
        var compound_domain = new instance.web.CompoundDomain(
                JSON.parse(domain),
                o2m.field.domain,
                [
                    [
                        'id', 'in', _.filter(
                            o2m.field_manager.datarecord[o2m.name],
                            function(x) { return !window.isNaN(x); }
                        ),
                    ]
                ]
            );
        return o2m.dataset._model.query(['id']).filter(
            compound_domain
            .set_eval_context(o2m.field_manager.build_eval_context())
            .eval()
        ).all()
        .then(function(records)
        {
            o2m.dataset.alter_ids(_.map(records, function(x) {
                return x.id;
            }));
        });
    };
    instance.web.form.FieldOne2Many.include({
        web_x2m_filter_apply_domain: function(domain)
        {
            return apply_domain(this, domain);
        },
    });
    instance.web.form.FieldMany2Many.include({
        web_x2m_filter_apply_domain: function(domain)
        {
            return apply_domain(this, domain);
        },
    });
};
