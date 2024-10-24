odoo.define("web_addline_large_btn.EditableListRenderer", function (require) {
    "use strict";

    const ListRenderer = require("web.ListRenderer");

    ListRenderer.include({
        _renderRows: function () {
            const attrs = this.arch.attrs;
            const model = this.state.model;
            const $rows = this._super();
            const use_large_addline_btn = Boolean(attrs.use_large_addline_btn);
            const use_large_addline_model = attrs.use_large_addline_model
                ? attrs.use_large_addline_model
                : false;
            const use_large_addline_btn_class =
                attrs.use_large_addline_btn_class || "btn btn-primary";
            if (
                $rows &&
                use_large_addline_btn &&
                use_large_addline_model &&
                $rows.length &&
                model === use_large_addline_model
            ) {
                for (let i = 0; i < $rows.length; i++) {
                    const ele = $rows[i].find('td a[role="button"]');
                    if (ele.length) {
                        $rows[i]
                            .find('td a[role="button"]')
                            .addClass(use_large_addline_btn_class);
                    }
                }
            }
            return $rows;
        },
    });
});
