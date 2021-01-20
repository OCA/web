/* Copyright 2016 RisingStack
   Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.PWA.core.base.JSSandbox", function (require) {
    "use strict";

    const OdooClass = require("web.Class");

    // Original code from NX-Compiler: https://github.com/nx-js/compiler-util
    const JSSandbox = OdooClass.extend({
        init: function () {
            this.sandboxProxies = new WeakMap();
            this.handler = {
                has: function (target, key) {
                    return true;
                },

                get: function (target, key) {
                    if (key === Symbol.unscopables) {
                        return undefined;
                    }
                    return target[key];
                },
            }
            this.compiledExec = false;
        },

        compile: function (src) {
            const self = this;
            const s_src = 'with (sandbox) {' + src + '}'
            const code = new Function('sandbox', s_src);

            this.compiledExec = function (sandbox) {
                if (!self.sandboxProxies.has(sandbox)) {
                    const sandboxProxy = new Proxy(sandbox, self.handler);
                    self.sandboxProxies.set(sandbox, sandboxProxy);
                }
                return code(self.sandboxProxies.get(sandbox))
            }
        },

        run: function (context) {
            return this.compiledExec(_.extend({}, this._getContext(), context));
        },

        _getContext: function () {
            return {
                'round_precision': round_precision,
                'round_decimals': round_decimals,
                'date2odoo_format': DateToOdooFormat,
                'Date': Date,
            };
        },
    });

    return JSSandbox;

});
