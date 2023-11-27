odoo.define("web_load_translations_fix.Session", function (require) {
    "use strict";

    var Session = require("web.Session");
    var core = require("web.core");
    var _t = core._t;

    /**
     * Override session manager to change how modules' are loaded: use ids instead of names.
     *
     */
    Session.include({
        _modules_info: function () {
            return odoo._modules_info;
        },
        _module_ids: function (names) {
            const mod_names = names ? names : this.module_list;
            const info = this._modules_info();
            const ids = [];
            _.each(mod_names, function (name) {
                if (info[name]) {
                    ids.push(info[name].id);
                }
            });
            console.debug("Session: load module names", mod_names);
            return ids;
        },
        /**
         * Full override due to no available hook.
         * The whole code is taken as-is from Odoo core (comments included).
         * Only the call to `load_translations` has been modified to use `_module_ids`.
         * @returns: Promise
         */
        load_translations: function () {
            var lang = this.user_context.lang;
            /* We need to get the website lang at this level.
            The only way is to get it is to take the HTML tag lang
            Without it, we will always send undefined if there is no lang
            in the user_context. */
            var html = document.documentElement,
                htmlLang = html.getAttribute("lang");
            if (!this.user_context.lang && htmlLang) {
                lang = htmlLang.replace("-", "_");
            }
            return _t.database.load_translations(
                this,
                this._module_ids(),
                lang,
                this.translationURL
            );
        },
        /**
         * Full override due to no available hook.
         * The whole code is taken as-is from Odoo core (comments included).
         * Only the call to `load_qweb` and `bootstrap_translations` have been modified to use `_module_ids`.
         * @returns: Promise
         */
        session_init: function () {
            var self = this;
            var prom = this.session_reload();

            if (this.is_frontend) {
                return prom.then(function () {
                    return self.load_translations();
                });
            }

            return prom.then(function () {
                var promise = self.load_qweb(self._module_ids().join(","));
                if (self.session_is_valid()) {
                    return promise.then(function () {
                        return self.load_modules();
                    });
                }
                return Promise.all([
                    promise,
                    self
                        .rpc("/web/webclient/bootstrap_translations", {
                            mods: self._module_ids(),
                        })
                        .then(function (trans) {
                            _t.database.set_bundle(trans);
                        }),
                ]);
            });
        },
        /**
         * Full override due to no available hook.
         * The whole code is taken as-is from Odoo core (comments included).
         * Only the call to `csslist` and `jslist` have been modified to use `_module_ids`.
         * @returns: Promise
         */
        load_modules: function () {
            var self = this;
            var modules = odoo._modules;
            var all_modules = _.uniq(self.module_list.concat(modules));
            var to_load = _.difference(modules, self.module_list).join(",");
            this.module_list = all_modules;
            var loaded = Promise.resolve(self.load_translations());
            var locale = "/web/webclient/locale/" + self.user_context.lang || "en_US";
            var file_list = [locale];
            if (to_load.length) {
                loaded = Promise.all([
                    loaded,
                    self
                        .rpc("/web/webclient/csslist", {
                            mods: self._module_ids(to_load),
                        })
                        .then(self.load_css.bind(self)),
                    self.load_qweb(to_load),
                    self
                        .rpc("/web/webclient/jslist", {mods: self._module_ids(to_load)})
                        .then(function (files) {
                            file_list = file_list.concat(files);
                        }),
                ]);
            }
            return loaded
                .then(function () {
                    return self.load_js(file_list);
                })
                .then(function () {
                    self._configureLocale();
                });
        },
    });
});
