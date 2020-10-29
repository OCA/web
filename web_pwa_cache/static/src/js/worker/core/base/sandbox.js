"use strict";
/* eslint strict: ["error", "global"] */
/* eslint-disable no-undef, no-implicit-globals, no-unused-vars */
/* Copyright Odoo S.A.
   Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

 // Original code from NX-Compiler: https://blog.risingstack.com/writing-a-javascript-framework-sandboxed-code-evaluation/#analternativeway
class JSSandbox {
    constructor() {
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
    }

    compile (src) {
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
    }

    run (context) {
        return this.compiledExec(_.extend({}, this._getContext(), context));
    }

    _getContext () {
        return {
            'round_precision': round_precision,
            'round_decimals': round_decimals,
        };
    }
};
