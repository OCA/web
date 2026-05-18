odoo.define("web_domain_field.false_domain_tour", function (require) {
    "use strict";

    var tour = require("web_tour.tour");

    tour.register(
        "web_domain_field.false_domain_tour",
        {
            test: true,
            url: "/web",
        },
        [
            tour.stepUtils.showAppsMenuItem(),
            {
                content: "Go to Fake Model menu",
                trigger: '.o_app[data-menu-xmlid="web_domain_field.fake_model_menu"]',
                run: "click",
            },
            {
                content: "Create a new record",
                trigger: "button.o_list_button_add",
                run: "click",
            },
            {
                content: "Click on partner label (opens dropdown)",
                trigger: "div.o_form_sheet label:contains('Partner')",
                run: "click",
            },
        ]
    );
});
