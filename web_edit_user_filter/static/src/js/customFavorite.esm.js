/** @odoo-module **/

import {CustomFavoriteItem} from "@web/search/favorite_menu/custom_favorite_item";
import {patch} from "@web/core/utils/patch";

patch(CustomFavoriteItem.prototype, "web_edit_user_filter.CustomFavoriteItem", {
    /**
     * @param {Event} ev
     */
    saveFavorite(ev) {
        if (!this.state.description) {
            this.notificationService.add(
                this.env._t("A name for your favorite filter is required."),
                {type: "danger"}
            );
            ev.stopPropagation();
            return this.descriptionRef.el.focus();
        }
        const favorites = this.env.searchModel.getSearchItems(
            (s) => s.type === "favorite" && s.description === this.state.description
        );
        if (favorites.length) {
            this.notificationService.add(
                this.env._t("A filter with same name already exists."),
                {
                    type: "danger",
                }
            );
            ev.stopPropagation();
            return this.descriptionRef.el.focus();
        }
        const {description, isDefault, isShared} = this.state;
        var facets = this.env.searchModel.facets;
        const facet = JSON.stringify(facets);
        this.env.searchModel.createNewFavorite({
            description,
            isDefault,
            isShared,
            facet,
        });

        Object.assign(this.state, {
            description: this.env.config.getDisplayName(),
            isDefault: false,
            isShared: false,
            open: false,
        });
    },
});

export default CustomFavoriteItem;
