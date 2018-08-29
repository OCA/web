//-*- coding: utf-8 -*-
//Copyright 2015-2018 Therp BV <http://therp.nl>
//License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
odoo.define('web_search_autocomplete_prefetch', function(require) {
    var CompoundDomain = require('web.data').CompoundDomain,
        Mutex = require('web.utils').Mutex;

    var complete = function(self, value, data) {
        if(self.options['web_search_autocomplete_prefetch.disable']) {
            return data;
        }
        if(!self.autocomplete_mutex) {
            self.autocomplete_mutex = new Mutex();
        }
        var facet = {
            get: function(name) {
                switch(name) {
                    case 'label': return value;
                    case 'value': return value;
                    case 'operator': return 'ilike';
                }
            },
            attributes: {
                value: value,
            },
        },
        domain = new CompoundDomain(
            self.get_domain({values: [facet]}),
            self.searchview.dataset.domain
        );
        domain.set_eval_context(self.searchview.dataset.get_context());
        return self.autocomplete_mutex.exec(function() {
            return self.searchview.dataset._model.call(
                'search_count', [domain.eval()],
                {context: self.searchview.dataset.get_context()}
            )
            .then(function(count) {
                if(count) {
                    _.each(data, function(obj) {
                        obj.label += _.str.sprintf(' (%s)', count);
                    });
                    return data;
                }
                return null;
            });
        });
    };

    return {
        // overwrite this or use it to recycle the functionality
        // for your own field
        complete: complete,
    };
});

odoo.define('web_search_autocomplete_prefetch.inputs', function(require) {
    var AutoComplete = require('web.AutoComplete'),
        Field = require('web.search_inputs').Field,
        Model = require('web.Model'),
        pyeval = require('web.pyeval'),
        search_widgets_registry = require('web.core').search_widgets_registry,
        web_search_autocomplete_prefetch = require(
            'web_search_autocomplete_prefetch'
        );

    Field.include({
        init: function() {
            var result = this._super.apply(this, arguments);
            this.options = pyeval.py_eval(this.attrs.options || '{}');
            return result;
        },
    });

    search_widgets_registry.get('char').include({
        complete: function(value) {
            var self = this;
            return this._super.apply(this, arguments).then(function(data) {
                return web_search_autocomplete_prefetch.complete(
                    self, value, data
                );
            });
        }
    });

    search_widgets_registry.get('many2one').include({
        complete: function(value) {
            var self = this;
            return this._super.apply(this, arguments).then(function(data) {
                return web_search_autocomplete_prefetch.complete(
                    self, value, data
                );
            });
        }
    });

    search_widgets_registry.get('selection').include({
        complete: function(value) {
            var self = this;
            return this._super.apply(this, arguments).then(function(data) {
                return web_search_autocomplete_prefetch.complete(
                    self, value, data
                );
            });
        }
    });

    AutoComplete.include({
        keypress_timeout: 350,
        start: function() {
            var self = this;
            return jQuery.when(
                this._super.apply(this, arguments),
                new Model('ir.config_parameter').call(
                    'get_param',
                    [
                        'web_search_autocomplete_prefetch.keypress_timeout',
                        this.keypress_timeout
                    ]
                ).then(function(keypress_timeout) {
                    self.keypress_timeout = parseInt(keypress_timeout, 10);
                })
            );
        },
        select_item: function() {
            if(!this.current_result) {
                return;
            }
            return this._super.apply(this, arguments);
        },
        initiate_search: function(query) {
            var self = this,
                _super = this._super,
                last_timeout = null;
            this.last_timeout = last_timeout = window.setTimeout(
                function() {
                    if(self.last_timeout === last_timeout) {
                        _super.apply(self, [query]);
                    }
                },
                this.keypress_timeout
            );
        },
    });
});
