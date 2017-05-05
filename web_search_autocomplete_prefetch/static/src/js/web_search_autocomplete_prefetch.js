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
                    case 'label': return value;
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
                'search_count', [domain.eval()],
                {context: self.view.dataset.get_context()})
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
        keypress_timeout: 350,
        start: function()
        {
            var self = this;
            return jQuery.when(
                this._super.apply(this, arguments),
                new instance.web.Model('ir.config_parameter').call(
                    'get_param',
                    [
                        'web_search_autocomplete_prefetch.keypress_timeout',
                        this.keypress_timeout
                    ]
                ).then(function(keypress_timeout)
                {
                    self.keypress_timeout = parseInt(keypress_timeout);
                })
            );
        },
        select_item: function()
        {
            if(!this.current_result)
            {
                return;
            }
            return this._super.apply(this, arguments);
        },
        initiate_search: function(query)
        {
            var self = this,
                _super = this._super,
                last_timeout = null;
            this.last_timeout = last_timeout = window.setTimeout(function()
            {
                if(self.last_timeout == last_timeout)
                {
                    _super.apply(self, [query]);
                }
            }, this.keypress_timeout)
        },
    });
}
