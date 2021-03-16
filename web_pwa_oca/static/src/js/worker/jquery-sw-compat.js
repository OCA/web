/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

// Compatibility layer to load some Odoo modules
// This is a hack, not a complete implementation!
// only expected to be used by boot.js

(function() {
    "use strict";
    function JQuery(selector, context) {
        return new JQuery.prototype.init(selector, context);
    }

    JQuery.prototype = {
        init: function(selector) {
            if (typeof selector === "function") {
                selector();
            }
        },

        deparam: function(data) {
            const params = data.split(",");
            const res = [];
            for (const param of params) {
                res.push(param.split("="));
            }
            return _.object(res);
        },

        param: {
            querystring: function() {
                return "debug=1";
            },
        },

        when: function(tasks) {
            return Promise.all(tasks instanceof Array ? tasks : [tasks]).then(
                results => {
                    return results.length === 1 ? results[0] : results;
                }
            );
        },
    };

    class Deferred {
        constructor() {
            this.promise = new Promise((resolve, reject) => {
                this.reject = reject;
                this.resolve = resolve;
            });
        }
    }

    JQuery.prototype.Deferred = () => new Deferred();

    self.$ = JQuery;
    self.$.deparam = JQuery.prototype.deparam;
    self.$.param = JQuery.prototype.param;
    self.$.Deferred = JQuery.prototype.Deferred;
    self.$.when = JQuery.prototype.when;
    self.window = self;
})();
