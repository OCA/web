odoo.define('web_cache_name_get.view_list', function(require) {
    "use strict";

    var listView = require('web.ListView');
    var Model = require('web.DataModel');
    var core = require('web.core');
    var _t = core._t;

    listView.List.include({
        /*
        cache name_get of many2many in order to reduce
        useless requests
        first part is a copy paste of web/static/src/js/views/list_view.js
        because we have hook into it and can't do much better than that.
        */
        render_cell: function (record, column) {
            var value;
            if (column.type !== 'many2many') {
                return this._super(record, column);
            } else {
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
                    // the logic starts here

                    // create a cache if not already done
                    this.name_get_cache = this.name_get_cache || {};
                    var prom = null;
                    var key = JSON.stringify([column.relation, ids, this.dataset.get_context()]);

                    if (this.name_get_cache[key]) {
                        prom = this.name_get_cache[key];
                    }
                    if (!prom) {
                        prom = new Model(column.relation)
                            .call('name_get', [ids, this.dataset.get_context()]);
                        this.name_get_cache[key] = prom;
                    }
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
            }
            return column.format(record.toForm().data, {
                model: this.dataset.model,
                id: record.get('id')
            });
        },
    });
});
