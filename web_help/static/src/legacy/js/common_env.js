odoo.define("web_help.commonEnv", function (require) {
    "use strict";

    const commonEnv = require("web.commonEnv");
    const {bus} = require("@web_help/components/highlighter/highlighter.esm");

    Object.assign(commonEnv.services, {
        highlighter: {
            hide: () => bus.trigger("hide"),
            highlight: (selector, content, animate = 250, padding = 10) =>
                bus.trigger("highlight", {
                    selector: selector,
                    content: content,
                    animate: animate,
                    padding: padding,
                }),
        },
    });
});
