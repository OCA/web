/* Copyright 2018 Tecnativa - Jairo Llopis
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

 odoo.define("web_advanced_search.human_domain", function (require) {
     "use strict";

     var DomainSelector = require("web.DomainSelector");

     var join_mapping = {
         "&": _(" and "),
         "|": _(" or "),
         "!": _(" is not "),
    };

    // HACK I should extend classes, but they are not exposed
    // TODO Remove file when merged https://github.com/odoo/odoo/pull/25922
    var human_domain_methods = {
        DomainTree: function () {
            var human_domains = [];
            _.each(this.children, function (child) {
                human_domains.push(
                    human_domain_methods[child.template].apply(child)
                );
            });
            return _.str.sprintf(
                "(%s)",
                human_domains.join(join_mapping[this.operator])
            );
        },

        DomainSelector: function () {
            var result = human_domain_methods.DomainTree.apply(this, arguments);
            // Remove surrounding parenthesis
            return result.slice(1, -1);
        },

        DomainLeaf: function () {
            var chain = [],
                operator = this.operator_mapping[this.operator],
                value = _.str.sprintf('"%s"', this.value);
            // Humanize chain
            this.chain.split(".").forEach(function (element, index) {
                chain.push(
                    _.findWhere(
                        this.fieldSelector.pages[index],
                        {name: element}
                    ).string || element
                );
            }, this);
            // Special beautiness for some values
            if (this.operator === "=" && _.isBoolean(this.value)) {
                operator = this.operator_mapping[this.value ? "set" : "not set"];
                value = "";
            } else if (_.isArray(this.value)) {
                value = _.str.sprintf('["%s"]', this.value.join('", "'));
            }
            return _.str.sprintf(
                "%s %s %s",
                chain.join("→"),
                operator || this.operator,
                value
            ).trim();
        },
    };

    function getHumanDomain (parent, model, domain, options) {
        var domain_selector = new DomainSelector(
            parent,
            model,
            domain,
            options
        );
        var dummy_parent = $("<div>");
        domain_selector.appendTo(dummy_parent);
        var result = human_domain_methods.DomainSelector.apply(
            domain_selector
        );
        domain_selector.destroy();
        dummy_parent.destroy();
        return result;
    }

    return {
        getHumanDomain: getHumanDomain,
    };
});
