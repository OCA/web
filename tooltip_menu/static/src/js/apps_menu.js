odoo.define("tooltip_menu.AppsMenu", function (require) {
    "use strict";

    var AppsMenu = require("web.AppsMenu");

    AppsMenu.include({
        init: function (parent, menuData) {
            this._super.apply(this, arguments);
            this._activeApp = undefined;
            this._apps = _.map(menuData.children, function (appMenuData) {
                return {
                    actionID: parseInt(appMenuData.action.split(",")[1], 10),
                    menuID: appMenuData.id,
                    name: appMenuData.name,
                    xmlID: appMenuData.xmlid,
                    description: appMenuData.description,
                };
            });
        },
    });
});
