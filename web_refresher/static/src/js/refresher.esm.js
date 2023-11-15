/** @odoo-module **/
/* Copyright 2022 Tecnativa - Alexandre D. Díaz
 * Copyright 2022 Tecnativa - Carlos Roca
 * Copyright 2023 Taras Shabaranskyi
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

import {Component} from "@odoo/owl";
import {useService} from "@web/core/utils/hooks";
import {_t} from "@web/core/l10n/translation";

export class Refresher extends Component {
    static template = "web_refresher.Button";
    static props = {
        searchModel: {type: Object, optional: true},
        pagerProps: {type: Object, optional: true},
    };

    setup() {
        super.setup();
        this.notification = useService("notification");
    }

    /**
     * @return {Boolean}
     */
    get displayButton() {
        const {searchModel, pagerProps} = this.props;
        return Boolean(searchModel?.search || pagerProps?.onUpdate);
    }

    _searchModelRefresh() {
        if (typeof this.props.searchModel?.search === "function") {
            this.props.searchModel.search();
        }
    }

    async _pagerRefresh() {
        const pagerProps = this.props.pagerProps;
        if (typeof pagerProps?.onUpdate === "function") {
            const {limit, offset} = pagerProps;
            await pagerProps.onUpdate({offset, limit});
        }
    }

    async refresh() {
        const {searchModel, pagerProps} = this.props;
        if (searchModel) {
            this._searchModelRefresh();
        } else if (pagerProps) {
            await this._pagerRefresh();
        }
    }

    async onClickRefresh() {
        await this.refresh();
        this.notification.add(_t("Refreshed"), {
            type: "info",
        });
    }
}
