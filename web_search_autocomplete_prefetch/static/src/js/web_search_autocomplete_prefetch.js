//-*- coding: utf-8 -*-
//© 2015 Therp BV <http://therp.nl>
//License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

openerp.web_search_autocomplete_prefetch = function(instance)
{
    // overwrite this or use it to recycle the functionality for your own field
    openerp.web_search_autocomplete_prefetch.complete = function(self, value, data)
    {
        if(self.options['web_search_autocomplete_prefetch.disable'])
        {
            return data;
        }
        if(!self.autocomplete_mutex)
        {
            self.autocomplete_mutex = new instance.Mutex()
        }
        var facet = {
            get: function(name)
            {
                switch(name)
                {
                    case 'value': return value;
                    case 'operator': return 'ilike';
                }
            },
        },
        domain = new instance.web.CompoundDomain(
            self.get_domain({values: [facet]}),
            self.view.dataset.domain);
        domain.set_eval_context(self.view.dataset.get_context());
        return self.autocomplete_mutex.exec(function()
        {
            return self.view.dataset._model.call(
                'search_count', [domain.eval()])
                .then(function(count)
                {
                    if(count)
                    {
                        _.each(data, function(obj)
                        {
                            obj.label += _.str.sprintf(' (%s)', count);
                        });
                        return data;
                    }
                    else
                    {
                        return null;
                    }
                });
        });
    }

    instance.web.search.CharField.include({
        init: function()
        {
            var result = this._super.apply(this, arguments);
            this.options = instance.web.py_eval(this.attrs.options || '{}');
            return result;
        },
        complete: function(value)
        {
            var self = this;
            return this._super.apply(this, arguments).then(function(data)
            {
                return openerp.web_search_autocomplete_prefetch.complete(
                    self, value, data);
            });
        }
    });

    instance.web.search.ManyToOneField.include({
        complete: function(value)
        {
            var self = this;
            return this._super.apply(this, arguments).then(function(data)
            {
                return openerp.web_search_autocomplete_prefetch.complete(
                    self, value, data);
            });
        }
    });

    instance.web.search.AutoComplete.include({
        select_item: function()
        {
            if(!this.current_result)
            {
                return;
            }
            return this._super.apply(this, arguments);
        },
    });
}
