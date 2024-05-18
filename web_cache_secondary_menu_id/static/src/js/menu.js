odoo.define("web_cache_secondary_menu_id.Menu", function (require) {
    "use strict";

    var Menu = require("web.Menu");
    var sessionStorage = require("web.sessionStorage");

    Menu.include({
        start: function () {
            var self = this;

            return this._super.apply(this, arguments).then(function () {
                var self2 = self;

                var on_secondary_menu_click_patch = function (ev) {
                    /*
                     This is pretty much a copy of the original event,
                     that also add "secondary_menu_id" param to URL.
                     Note that we need to re-serialize the URL param
                     later in method do_push_state(), we already add
                     param here because not all methods will wait
                     for the do_push_state() to be completed ( e.g.
                     renderButtons() ), so you might not be able to
                     find the param in the URL if we don't bind it
                     here already. Another way of doing this was to
                     remove the ev.preventDefault() and refactor the
                     "web.Menu.link" anchor t-attf-href in order to
                     actually use it, but that would cause issues
                     with the serialization of the other parameters
                     */
                    ev.preventDefault();
                    // Set sessionStorage key to notify doAction that
                    // this time URL parameter should be preserved
                    sessionStorage.setItem(
                        "action_executed_from_secondary_menu_item",
                        true
                    );
                    var menu_id = $(ev.currentTarget).data("menu");
                    var action_id = $(ev.currentTarget).data("action-id");
                    var url = window.location.href;
                    var searchParams = new URLSearchParams(url.split("#")[1]);
                    if (menu_id) {
                        // Add URL "secondary_menu_id" parameter
                        searchParams.set("secondary_menu_id", menu_id);
                    } else if (!menu_id && searchParams.get("secondary_menu_id")) {
                        searchParams.delete("secondary_menu_id");
                    }
                    var new_url = url.split("#")[0] + "#" + searchParams.toString();
                    window.history.pushState({}, "", new_url);
                    self._on_secondary_menu_click(menu_id, action_id);
                };

                /*
                 The following code loops through every menu section and
                 through every submenu, and basically replace the original
                 'on_secondary_menu_click' event with the patched event.
                */
                var menu_ids = _.keys(self.$menu_sections);
                for (var i = 0; i < menu_ids.length; i++) {
                    // For every APP menu (primary menu) cycle its sections,
                    // then for every section cycle its sub menus and find
                    // the original handlers bound to the anchors.
                    // Note:
                    // I have tried $section.off("click", "li", "on_secondary_menu_click")
                    // and similar simple approaches but didn't remove the original event,
                    // and I don't want to remove ALL the click listeners but only the
                    // 'on_secondary_menu_click' event, so I had to do it in this verbose
                    // way because at least it does the job, would be nice to optimize it
                    var primary_menu_id = menu_ids[i];
                    var $section = self.$menu_sections[primary_menu_id];
                    var handlers_to_replace = [];
                    _.each($section, function (li) {
                        // Note: not required for the original menu structure, but it
                        // would be good to check if the item is actually the 'li'
                        // that has been bound with the original event
                        var liClickEvents = $._data($(li)[0], "events").click;
                        _.each(liClickEvents, function (originalSecondaryMenuClickEv) {
                            var eventHandler = originalSecondaryMenuClickEv.handler;
                            if (eventHandler.name === "bound on_secondary_menu_click") {
                                // Add to a list and removed later because if removed here
                                // i'm getting error "$._data(...) is undefined"..
                                // I'm pretty sure the handler can be removed here somehow ;)
                                handlers_to_replace.push(eventHandler);
                            }
                        });
                    });
                    _.each(handlers_to_replace, function (eventHandler) {
                        // Remove the original 'on_secondary_menu_click' event
                        $section.off("click", eventHandler);
                    });
                    // Bind patched 'on_secondary_menu_click' event
                    $section.on(
                        "click",
                        "a[data-menu]",
                        self2,
                        on_secondary_menu_click_patch.bind(self)
                    );
                }
            });
        },
    });
});
