/* Copyright 2018 Tecnativa - Jairo Llopis
 * Copyright 2020 Tecnativa - Alexandre Díaz
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define("web_advanced_search.human_domain", function () {
    "use strict";

    const join_mapping = {
        "&": _(" and "),
        "|": _(" or "),
        "!": _(" is not "),
    };

    const human_domain_methods = {
        DomainTree: function () {
            const human_domains = [];
            _.each(this.children, (child) => {
                human_domains.push(human_domain_methods[child.template].apply(child));
            });
            return `(${human_domains.join(join_mapping[this.operator])})`;
        },

        DomainSelector: function () {
            const result = human_domain_methods.DomainTree.apply(this, arguments);
            // Remove surrounding parenthesis
            return result.slice(1, -1);
        },

        DomainLeaf: function () {
            const chain = [];
            let operator = this.operator_mapping[this.operator],
                value = `"${this.value}"`;
            // Humanize chain
            const chain_splitted = this.chain.split(".");
            const len = chain_splitted.length;
            for (let x = 0; x < len; ++x) {
                const element = chain_splitted[x];
                chain.push(
                    _.findWhere(this.fieldSelector.pages[x], {name: element}).string ||
                        element
                );
            }
            // Special beautiness for some values
            if (this.operator === "=" && _.isBoolean(this.value)) {
                operator = this.operator_mapping[this.value ? "set" : "not set"];
                value = "";
            } else if (_.isArray(this.value)) {
                value = `["${this.value.join('", "')}"]`;
            }
            return `${chain.join("→")} ${operator || this.operator} ${value}`.trim();
        },
    };

    function getHumanDomain(domain_selector) {
        return human_domain_methods.DomainSelector.apply(domain_selector);
    }

    return {
        getHumanDomain: getHumanDomain,
    };
});
