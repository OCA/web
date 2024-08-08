/** @odoo-module **/

import {Component} from "@odoo/owl";
import {fuzzyLookup} from "@web/core/utils/search";
import {memoize} from "@web/core/utils/functions";
import {registry} from "@web/core/registry";

class CommandSearchComponent extends Component {}
CommandSearchComponent.template = "CommandSearchPalette";

const commandSetupRegistry = registry.category("command_setup");
const commandProviderRegistry = registry.category("command_provider");

async function fetchCommandSearchData() {
    const response = await fetch("/command_search/data", {
        method: "GET",
    });
    if (!response.ok) {
        throw new Error("HTTP error status: " + response.status);
    }
    return await response.json();
}

const fn = (search) => {
    const get_data = memoize((env, searchId) => {
        return env.services.orm.call("command.search", "get_data", [[searchId]]);
    });
    return async function provide(env, options) {
        const result = [];
        const data = JSON.parse(await get_data(env, search.id));

        if (options.searchValue !== "" && data !== false) {
            const items = fuzzyLookup(options.searchValue, data, (item) => item.value);

            items.forEach((item) => {
                result.push({
                    Component: CommandSearchComponent,
                    action() {
                        env.services.action.doAction({
                            type: "ir.actions.act_window",
                            res_id: item.res_id,
                            res_model: item.res_model,
                            views: [[false, "form"]],
                        });
                    },
                    category: search.technical_name,
                    name:
                        item.value +
                        " - " +
                        item.model_name +
                        " (" +
                        item.field_name +
                        ")",
                    href: `#res_id=${item.res_id}&res_model=${item.res_model}`,
                    props: {},
                });
            });
        }

        return result;
    };
};

async function registerCommandSearchCommands() {
    const commandSearchData = await fetchCommandSearchData();

    commandSearchData.forEach((search) => {
        commandSetupRegistry.add(search.character, {
            name: search.technical_name,
            emptyMessage: search.empty_message,
            placeholder: search.placeholder,
        });
        commandProviderRegistry.add(search.technical_name, {
            namespace: search.character,
            provide: fn(search),
        });
    });
}

registerCommandSearchCommands();
