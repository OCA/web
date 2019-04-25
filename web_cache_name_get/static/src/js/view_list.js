odoo.define('web_cache_name_get.view_list', function(require) {
    "use strict";

    var listView = require('web.ListView');
    var Model = require('web.DataModel');
    var data = require('web.data');
    var core = require('web.core');
    var _t = core._t;

    listView.List.include({
        web_cache_name_get: function(key, callback) {
            //will return a promise with the result of
            //the name_get
            //it will cache the request in order to save brandwith
            //and useless requests
            var prom = null;
            var key = JSON.stringify(key);
            //init cache if not already done
            this.name_get_cache = this.name_get_cache || {};

            if (this.name_get_cache[key]) {
                //cache hit
                prom = this.name_get_cache[key];
            }
            if (!prom) {
                //cache miss
                prom = callback();
                this.name_get_cache[key] = prom
            }
            return prom;
        },
        /*
        cache name_get of many2many and many2one in order to reduce
        useless requests
        some parts are a copy paste of web/static/src/js/views/list_view.js
        because we have hook into it and can't do much better than that.
        */
        render_cell: function (record, column) {
            var value;
            var self = this;
            if (column.type === 'many2one') {
                value = record.get(column.id);
                // m2o values are usually name_get formatted, [Number, String]
                // pairs, but in some cases only the id is provided. In these
                // cases, we need to perform a name_get call to fetch the actual
                // displayable value
                if (typeof value === 'number' || value instanceof Number) {
                    // fetch the name, set it on the record (in the right field)
                    // and let the various registered events handle refreshing the
                    // row

                    // our logic starts here
                    prom = this.web_cache_name_get(
                        [this.view.model, this.view.name, column.relation, value],
                        function () {
                            return new data.DataSet(self.view, column.relation)
                            .name_get([value]);
                        }
                    );
                    prom.done(function (names) {
                        if (!names.length) { return; }
                        record.set(column.id, names[0]);
                    });
                }
            } else if (column.type === 'many2many') {
                value = record.get(column.id);
                // non-resolved (string) m2m values are arrays
                if (value instanceof Array && !_.isEmpty(value)
                        && !record.get(column.id + '__display')) {
                    var ids;
                    // they come in two shapes:
                    if (value[0] instanceof Array) {
                        _.each(value, function(command) {
                            switch (command[0]) {
                                case 4: ids.push(command[1]); break;
                                case 5: ids = []; break;
                                case 6: ids = command[2]; break;
                                default: throw new Error(_.str.sprintf( _t("Unknown m2m command %s"), command[0]));
                            }
                        });
                    } else {
                        // 2. an array of ids
                        ids = value;
                    }
                    // our logic starts here
                    var prom = this.web_cache_name_get(
                        [column.relation, ids, this.dataset.get_context()],
                        function () {
                            return new Model(column.relation)
                            .call('name_get', [ids, self.dataset.get_context()])
                        }
                    );

                    // put placeholder at first to limit races conditions
                    // because of the cached answers
                    // promise resolution can happen before placeholder set
                    // and lead to "too much recursion"

                    // temporary empty display name
                    record.set(column.id + '__display', false);
                    prom.done(function (names) {
                        // FIXME: nth horrible hack in this poor listview
                        record.set(column.id + '__display',
                                   _(names).pluck(1).join(', '));
                        record.set(column.id, ids);
                    });
                }
            } else {
                return this._super(record, column);
            }
            return column.format(record.toForm().data, {
                model: this.dataset.model,
                id: record.get('id')
            });
        },
    });
});
