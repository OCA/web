# Copyright 2019 Alexandre Díaz <dev@redneboa.es>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
import base64
from colorsys import hls_to_rgb, rgb_to_hls

from PIL import ImageColor

from odoo import api, fields, models
from odoo.http import request

from ..utils import convert_to_image, image_to_rgb, n_rgb_to_hex

URL_BASE = "/web_company_color/static/src/scss/"
URL_SCSS_GEN_TEMPLATE = URL_BASE + "custom_colors.%d.gen.scss"

# Odoo 19 Community defaults, used when a colour group is left empty.
DEFAULT_THEME_COLOR = "#71639e"

NAVBAR_FIELDS = ("color_navbar_bg", "color_navbar_bg_hover", "color_navbar_text")
BUTTON_FIELDS = ("color_button_bg", "color_button_bg_hover", "color_button_text")
LINK_FIELDS = ("color_link_text", "color_link_text_hover")
COLOR_FIELDS = NAVBAR_FIELDS + BUTTON_FIELDS + LINK_FIELDS + ("color_submenu_text",)


class ResCompany(models.Model):
    _inherit = "res.company"

    # The generated attachment is served as plain CSS, so the templates below
    # must not rely on Sass features or native CSS nesting. Each group is only
    # emitted when the company sets at least one colour of that group: empty
    # groups keep the native Odoo appearance instead of hard-coded fallbacks.
    # Where Odoo 19 exposes CSS variables (links, buttons, navbar, tables,
    # inputs, statusbar) we set those variables so every state (hover, active,
    # focus, disabled) keeps Odoo's own rules.
    NAVBAR_TEMPLATE = """
.o_main_navbar {
  --NavBar-entry-color: %(color_navbar_text)s;
  --NavBar-entry-color--active: %(color_navbar_text)s;
  --NavBar-brand-color: %(color_navbar_text)s;
  --NavBar-entry-backgroundColor: %(color_navbar_bg)s;
  --NavBar-entry-backgroundColor--hover: %(color_navbar_bg_hover)s;
  --NavBar-entry-backgroundColor--focus: %(color_navbar_bg_hover)s;
  --NavBar-entry-backgroundColor--active: %(color_navbar_bg_hover)s;
  --link-color-rgb: %(color_navbar_text_rgb)s;
  --link-hover-color-rgb: %(color_navbar_text_rgb)s;
  background: %(color_navbar_bg)s !important;
  background-color: %(color_navbar_bg)s !important;
  border-bottom-color: %(color_navbar_bg_hover)s !important;
  color: %(color_navbar_text)s !important;
}
.bottom-sheet-open:not(.o_home_menu_background) .o_main_navbar {
  box-shadow: 20px 0 0 %(color_navbar_bg)s, -20px 0 0 %(color_navbar_bg)s;
}
.o_main_navbar .show .dropdown-toggle {
  background-color: %(color_navbar_bg_hover)s !important;
}
.o_main_navbar .o_menu_brand,
.o_main_navbar .o_menu_toggle,
.o_main_navbar .o_navbar_apps_menu .dropdown-toggle,
.o_main_navbar .o_navbar_breadcrumbs,
.o_main_navbar .o_navbar_breadcrumbs .btn {
  color: %(color_navbar_text)s !important;
}
.o_main_navbar .o_menu_brand:hover,
.o_main_navbar .o_menu_brand:focus,
.o_main_navbar .o_menu_brand:active,
.o_main_navbar .o_menu_toggle:hover,
.o_main_navbar .o_navbar_apps_menu .dropdown-toggle:hover {
  background-color: %(color_navbar_bg_hover)s !important;
}
.o_menu_sections .o_nav_entry,
.o_menu_sections .dropdown-toggle {
  background: %(color_navbar_bg)s !important;
  background-color: %(color_navbar_bg)s !important;
  color: %(color_navbar_text)s !important;
}
.o_menu_sections .o_nav_entry:hover,
.o_menu_sections .o_nav_entry:focus,
.o_menu_sections .o_nav_entry:active,
.o_menu_sections .dropdown-toggle:hover,
.o_menu_sections .dropdown-toggle:focus,
.o_menu_sections .dropdown-toggle:active {
  background-color: %(color_navbar_bg_hover)s !important;
}
.o_menu_systray button,
.o_menu_systray .dropdown-toggle {
  color: %(color_navbar_text)s !important;
}
.o_menu_systray button:hover,
.o_menu_systray button:focus,
.o_menu_systray button:active,
.o_menu_systray .dropdown-toggle:hover {
  background-color: %(color_navbar_bg_hover)s !important;
}
.o_web_client .o_loading_indicator {
  background-color: %(color_navbar_bg)s;
  color: %(color_navbar_text)s;
}
.o_web_client .o_mobile_search {
  --mobileSearch__header-bg: %(color_navbar_bg)s;
}
.o_web_client .o_mobile_search .o_mobile_search_header .o_mobile_search_button {
  color: %(color_navbar_text)s;
}
.o_web_client .o_mobile_search .o_mobile_search_header .o_mobile_search_button:active {
  background-color: %(color_navbar_bg_hover)s;
}
"""

    BUTTON_TEMPLATE = """
:root {
  /* Company palette for other modules' custom styles. */
  --web-company-color-primary: %(color_button_bg)s;
  --web-company-color-primary-hover: %(color_button_bg_hover)s;
}
.o_web_client {
  --primary: %(color_button_bg)s;
  --primary-rgb: %(color_button_bg_rgb)s;
  --primary-text-emphasis: %(color_button_emphasis)s;
  --primary-bg-subtle: %(color_button_subtle)s;
  --primary-border-subtle: %(color_button_border_subtle)s;
  /* Inherited by every scrollable area; otherwise browsers use the OS accent. */
  scrollbar-color: %(color_button_border_subtle)s transparent;
  /* Smart (stat) buttons */
  --o-stat-button-color: %(color_button_bg)s;
  --o-stat-text-color: %(color_button_bg)s;
  /* Mobile statusbar/selection sheets */
  --BottomSheetStatusBar__entry-background--active: %(color_component_active_bg)s;
}
.o_web_client .o_searchview:focus-within,
.o_web_client .o_searchview:focus-within + .o_searchview_dropdown_toggler {
  border-color: %(color_button_bg)s;
}
.o_web_client .o_kanban_renderer {
  --KanbanColumn__highlight-background: %(color_button_active_bg)s;
  --KanbanColumn__highlight-border: %(color_button_bg)s;
  --KanbanColumn__highlight-selected-border: %(color_button_border_subtle)s;
}
.o_web_client .o_base_settings_view .o_form_renderer {
  --settings__tab-bg--active: %(color_component_active_bg)s;
}
.o_web_client .o_base_settings_view .o_setting_container .settings_tab .selected {
  box-shadow: inset 2px 0 0 %(color_button_bg)s;
}
.o_web_client .o_searchable_setting {
  --SearchableSetting__highlight-background: %(color_button_active_bg)s;
  --SearchableSetting__highlight-border: %(color_button_bg)s;
}
.o_web_client .o_datetime_picker .o_selected,
.o_web_client .o_datetime_picker .o_date_item_picker
.o_datetime_button.o_selected:not(.o_select_start):not(.o_select_end) {
  background: %(color_component_active_bg)s;
}
.o_web_client .o_datetime_picker .o_select_start,
.o_web_client .o_datetime_picker .o_select_end {
  --selected-day-color: %(color_selected_day)s;
  background:
    %(color_component_active_bg)s
    radial-gradient(
      circle,
      var(--selected-day-color) 0%% var(--percent),
      transparent var(--percent) 100%%
    );
}
.o_web_client .o_datetime_picker .o_date_item_cell:hover,
.o_web_client .o_datetime_picker .o_date_item_cell:focus {
  --DateTimePicker__date-cell-border-color-hover: %(color_button_bg)s;
}
.o_web_client .o_field_percent_pie .o_pie {
  --PercentPieField-color-active: %(color_button_bg)s;
}
.o_web_client .o_field_widget.o_field_image .o_form_image_controls,
.o_web_client .o_field_widget.o_field_image_url .o_form_image_controls,
.o_web_client .o_field_widget.o_field_image .o_form_image_controls
> .fa.o_select_file_button {
  background-color: %(color_button_bg)s;
}
.o_web_client .o_field_widget.o_field_copy {
  border-color: %(color_button_bg)s;
  color: %(color_button_bg)s;
}
.o_web_client .o-file-upload-progress-bar-value {
  background-color: %(color_button_bg)s;
  border-right-color: %(color_button_bg_hover)s;
}
.o_web_client .badge.text-bg-default,
.o_web_client .badge.bg-light,
.o_web_client .badge.text-bg-light,
.o_web_client .badge.bg-default,
.o_web_client .badge.text-primary {
  outline-color: %(color_button_bg)s;
}
.o_web_client .btn-primary {
  --btn-color: %(color_button_text)s;
  --btn-bg: %(color_button_bg)s;
  --btn-border-color: %(color_button_bg)s;
  --btn-hover-color: %(color_button_text)s;
  --btn-hover-bg: %(color_button_bg_hover)s;
  --btn-hover-border-color: %(color_button_bg_hover)s;
  --btn-active-color: %(color_button_emphasis)s;
  --btn-active-bg: %(color_button_active_bg)s;
  --btn-active-border-color: %(color_button_bg)s;
  --btn-disabled-color: %(color_button_text)s;
  --btn-disabled-bg: %(color_button_bg)s;
  --btn-focus-shadow-rgb: %(color_button_bg_rgb)s;
}
.o_web_client .btn-outline-primary {
  --btn-color: %(color_button_bg)s;
  --btn-border-color: %(color_button_bg)s;
  --btn-hover-color: %(color_button_text)s;
  --btn-hover-bg: %(color_button_bg)s;
  --btn-hover-border-color: %(color_button_bg)s;
  --btn-active-color: %(color_button_text)s;
  --btn-active-bg: %(color_button_bg)s;
  --btn-active-border-color: %(color_button_bg)s;
  --btn-disabled-color: %(color_button_bg)s;
  --btn-disabled-border-color: %(color_button_bg)s;
  --btn-focus-shadow-rgb: %(color_button_bg_rgb)s;
}
.o_web_client .btn-secondary,
.o_web_client .btn-light,
.o_web_client .btn-outline-secondary {
  --btn-active-bg: %(color_component_active_bg)s;
  --btn-active-border-color: %(color_button_bg)s;
}
.o_web_client .form-check:not(.form-switch) > .form-check-input:checked,
.o_web_client .form-check:not(.form-switch) > .form-check-input:indeterminate {
  background-color: %(color_button_bg)s;
  border-color: %(color_button_bg)s;
}
.o_web_client .form-check:not(.form-switch) > .form-check-input:focus {
  border-color: %(color_button_bg)s;
}
.o_web_client .o_required_modifier:not(.o_field_invalid),
.o_web_client .o_field_widget:focus-within:not(.o_field_invalid) {
  --o-input-border-color: %(color_button_bg)s;
  --o-caret-color: %(color_button_bg)s;
}
.o_web_client .o_list_renderer .o_data_row.o_selected_row >
.o_data_cell.o_required_modifier:not(.o_readonly_modifier) {
  border-bottom-color: %(color_button_bg)s;
}
.o_web_client .o_list_renderer .o_data_row.table-info {
  --table-color: var(--body-color, #374151);
  --table-bg: %(color_component_active_bg)s;
  --table-border-color: %(color_button_border_subtle)s;
  --table-striped-color: var(--body-color, #374151);
  --table-striped-bg: %(color_component_active_bg)s;
  --table-active-color: var(--body-color, #374151);
  --table-active-bg: %(color_component_hover_bg)s;
  --table-hover-color: var(--body-color, #374151);
  --table-hover-bg: %(color_component_hover_bg)s;
}
.o_web_client .o_field_statusbar > .o_statusbar_status {
  --o-statusbar-background-active: %(color_component_active_bg)s;
  --o-statusbar-border-active: %(color_button_bg)s;
}
.o_web_client .o_searchview .o_searchview_facet .o_searchview_facet_label {
  color: %(color_button_text)s !important;
  background-color: %(color_button_bg)s !important;
}
.o_web_client .btn-fill-primary {
  --btn-color: %(color_button_text)s;
  --btn-bg: %(color_button_bg)s;
  --btn-border-color: %(color_button_bg)s;
  --btn-hover-color: %(color_button_text)s;
  --btn-hover-bg: %(color_button_bg_hover)s;
  --btn-hover-border-color: %(color_button_bg_hover)s;
}
.o_web_client .btn-fill-secondary,
.o_web_client .btn-fill-light,
.o_web_client .o_bottom_sheet .o_cp_switch_buttons .o-dropdown-item {
  --btn-active-bg: %(color_component_active_bg)s;
  --btn-active-border-color: %(color_button_bg)s;
}
.o_web_client .btn-link {
  --btn-focus-shadow-rgb: %(color_button_bg_rgb)s;
}
.o_web_client .o-dropdown.btn-secondary.show,
.o_web_client .o-dropdown.btn-outline-secondary.show {
  background-color: %(color_component_active_bg)s;
  border-color: %(color_button_bg)s;
}
.o_web_client .nav-pills {
  --nav-pills-link-active-bg: %(color_button_bg)s;
}
.o_web_client .progress,
.o_web_client .progress-stacked {
  --progress-bar-bg: %(color_button_bg)s;
}
.o_web_client .pagination {
  --pagination-focus-box-shadow: 0 0 0 0.25rem rgba(%(color_button_bg_rgb)s, 0.25);
  --pagination-active-bg: %(color_component_active_bg)s;
  --pagination-active-border-color: %(color_component_active_bg)s;
}
.o_web_client .accordion {
  --accordion-btn-focus-box-shadow: 0 0 0 0.25rem rgba(%(color_button_bg_rgb)s, 0.25);
}
.o_web_client .btn-close {
  --btn-close-focus-shadow: 0 0 0 0.25rem rgba(%(color_button_bg_rgb)s, 0.25);
}
.o_web_client .form-control:focus,
.o_web_client .form-select:focus,
.o_web_client .form-check-input:focus {
  border-color: %(color_button_bg)s;
  box-shadow: 0 0 0 0.25rem rgba(%(color_button_bg_rgb)s, 0.25);
}
.o_web_client .nav-link:focus-visible {
  box-shadow: 0 0 0 0.25rem rgba(%(color_button_bg_rgb)s, 0.25);
}
.o_web_client .o_notebook .nav-link:focus-visible,
.o_web_client .o_notebook .nav-link.active:focus-visible {
  box-shadow: inset 0 0 0 0.25rem rgba(%(color_button_bg_rgb)s, 0.25);
}
.o_web_client .form-check:hover,
.o_web_client .form-check:hover .form-check-input:not(:disabled),
.o_web_client .form-select:where(:not(:disabled)):hover {
  border-color: %(color_button_bg)s;
}
.o_web_client .form-range::-webkit-slider-thumb {
  background-color: %(color_button_bg)s;
}
.o_web_client .form-range::-webkit-slider-thumb:active {
  background-color: %(color_button_active_bg)s;
}
.o_web_client .form-range:focus::-webkit-slider-thumb {
  box-shadow: 0 0 0 1px %(color_button_bg)s;
}
.o_web_client .form-range::-moz-range-thumb {
  background-color: %(color_button_bg)s;
}
.o_web_client .form-range::-moz-range-thumb:active {
  background-color: %(color_button_active_bg)s;
}
.o_web_client .form-range:focus::-moz-range-thumb {
  box-shadow: 0 0 0 1px %(color_button_bg)s;
}
.o_web_client .form-switch.o_switch_toggle .form-check-input,
.o_web_client .form-switch.o_switch_toggle .form-check-input:focus,
.o_web_client .form-switch.o_switch_toggle .form-check-input:checked {
  border-color: %(color_button_bg)s;
  background-image: %(color_button_switch_knob)s;
}
.o_web_client .form-switch.o_switch_toggle:hover .form-check-input:not(:disabled),
.o_web_client .o_field_res_user_group_ids_privilege
.o_is_implied:not(.o_is_disjoint) .o-checkbox > input {
  border-color: %(color_button_bg)s;
}
.o_web_client .o_switch > input:checked + span {
  background: %(color_button_bg)s;
}
.o_web_client .o_switch > input:focus + span {
  box-shadow: 0 0 0 3px %(color_button_border_subtle)s;
}
.o_web_client .o_command_palette_listbox .o_command.focused {
  background: rgba(%(color_button_bg_rgb)s, 0.15);
}
.o_web_client .o_base_settings_view .o_setting_container .settings_tab .tab::after,
.o_web_client .o_attachment .o_attachment_delete:hover,
.o_web_client .o_barcode {
  background-color: %(color_button_bg)s;
}
.o_web_client .o_field_many2one_avatar img:hover,
.o_web_client .o_field_many2many_avatar_user img:hover,
.o_web_client .o_clickable_m2x_avatar img:hover,
.o_web_client .o_property_field_value .o_m2m_avatar:hover,
.o_web_client .o_property_field_value .o_field_property_many2one_value img:hover {
  outline-color: %(color_button_bg)s;
}
.o_web_client .o_field_properties .o_input:focus,
.o_web_client .o_field_properties .o_input:focus *,
.o_web_client .o_field_properties .dropdown:focus-within ~ .o_dropdown_button,
.o_web_client .o_field_properties .dropdown:focus-within ~ .o_dropdown_button * {
  --o-input-border-color: %(color_button_bg)s;
}
.o_web_client .o_property_field_highlight,
.o_web_client .o_property_field_highlight .o_field_property_empty_label {
  border-color: %(color_button_bg)s;
}
.o_web_client .o_field_properties div:not([columns="1"]) .o_property_drag_group {
  background-color: %(color_button_active_bg)s;
  border-color: %(color_button_bg)s;
}
.o_web_client .o_field_property_label .o_field_property_open_popover:hover,
.o_web_client .o_field_property_label .oi-draggable:hover {
  color: %(color_button_bg)s;
}
.o_web_client .o_field_property_tag .o_field_property_dropdown_add * {
  color: %(color_button_bg)s !important;
}
.o_web_client .o_export_data_dialog .o_export_tree_item:hover:not(.o_expanded) {
  background: rgba(%(color_button_bg_rgb)s, 0.7);
}
.o_web_client .o_export_data_dialog .o_export_tree_item.o_expanded {
  background: rgba(%(color_button_bg_rgb)s, 0.2);
}
.o_web_client .bg-primary-light {
  background-color: rgba(%(color_button_bg_rgb)s, 0.5) !important;
}
"""

    LINK_TEMPLATE = """
.o_web_client {
  --link-color: %(color_link_text)s;
  --link-color-rgb: %(color_link_text_rgb)s;
  --link-hover-color: %(color_link_text_hover)s;
  --link-hover-color-rgb: %(color_link_text_hover_rgb)s;
}
.o_web_client .o_form_view .o_form_uri,
.o_web_client .o_form_view .o_form_uri > span:first-child,
.o_web_client .o-autocomplete .ui-menu-item.o_m2o_dropdown_option > a,
.o_web_client .o-autocomplete .ui-menu-item.o_calendar_dropdown_option > a {
  color: %(color_link_text)s;
}
.o_web_client .o_form_view .o_form_uri:hover,
.o_web_client .o_form_view .o_form_uri > span:first-child:hover,
.o_web_client .o-autocomplete .ui-menu-item.o_m2o_dropdown_option >
a.ui-state-active:not(.o_m2o_start_typing),
.o_web_client .o-autocomplete .ui-menu-item.o_calendar_dropdown_option >
a.ui-state-active {
  color: %(color_link_text_hover)s;
}
.o_web_client .o_calendar_renderer .fc-daygrid-day-bottom .fc-more-link,
.o_web_client .o_pivot table.o_enable_linking .o_pivot_cell_value:not(.o_empty):hover {
  color: %(color_link_text)s;
}
.o_web_client .o_field_x2many_list_row_add a:focus,
.o_web_client .o_field_x2many_list_row_add a:active,
.o_web_client .o_field_x2many_list_row_add button:focus,
.o_web_client .o_field_x2many_list_row_add button:active,
.o_web_client .o_group_field_row_add a:focus,
.o_web_client .o_group_field_row_add a:active {
  color: %(color_link_text_hover)s;
}
.o_web_client .dropdown-item.active:not(.disabled)::before,
.o_web_client .dropdown-item.selected:not(.disabled)::before,
.o_web_client .dropdown-item.active:not(.disabled)::after,
.o_web_client .dropdown-item.selected:not(.disabled)::after {
  color: %(color_link_text)s;
}
.o_form_view .o_horizontal_separator {
  color: %(color_link_text)s !important;
}
.o_web_client .btn-link.btn-primary:hover,
.o_web_client .btn-link.btn-primary:focus,
.o_web_client .btn-link.text-primary:hover,
.o_web_client .btn-link.text-primary:focus,
.o_web_client .btn-link.btn-action:hover,
.o_web_client .btn-link.btn-action:focus,
.o_web_client .btn-link.text-action:hover,
.o_web_client .btn-link.text-action:focus {
  color: %(color_link_text)s !important;
}
"""

    SUBMENU_TEMPLATE = """
.o_web_client .o-dropdown--menu .dropdown-item[data-menu-xmlid]:not(.disabled) {
  color: %(color_submenu_text)s;
}
"""

    company_colors = fields.Serialized()
    color_navbar_bg = fields.Char("Navbar Background Color", sparse="company_colors")
    color_navbar_bg_hover = fields.Char(
        "Navbar Background Color Hover", sparse="company_colors"
    )
    color_navbar_text = fields.Char("Navbar Text Color", sparse="company_colors")
    color_button_text = fields.Char("Button Text Color", sparse="company_colors")
    color_button_bg = fields.Char("Button Background Color", sparse="company_colors")
    color_button_bg_hover = fields.Char(
        "Button Background Color Hover", sparse="company_colors"
    )
    color_link_text = fields.Char("Link Text Color", sparse="company_colors")
    color_link_text_hover = fields.Char(
        "Link Text Color Hover", sparse="company_colors"
    )
    color_submenu_text = fields.Char("Submenu Text Color", sparse="company_colors")
    scss_modif_timestamp = fields.Char("SCSS Modif. Timestamp")

    @api.model_create_multi
    def create(self, vals_list):
        records = super().create(vals_list)
        records.scss_create_or_update_attachment()
        return records

    def unlink(self):
        IrAttachmentObj = self.env["ir.attachment"]
        for record in self:
            IrAttachmentObj.sudo().search(
                [("url", "=", record.scss_get_url()), ("company_id", "=", record.id)]
            ).sudo().unlink()
        return super().unlink()

    def write(self, values):
        if not self.env.context.get("ignore_company_color", False):
            result = super().write(values)
            if any([field in values for field in COLOR_FIELDS]):
                self.scss_create_or_update_attachment()
        else:
            result = super().write(values)
        return result

    def button_compute_color(self):
        self.ensure_one()
        values = self.default_get(
            ["color_navbar_bg", "color_navbar_bg_hover", "color_navbar_text"]
        )
        if self.logo:
            _r, _g, _b = image_to_rgb(convert_to_image(self.logo))
            # Make color 10% darker
            _h, _l, _s = rgb_to_hls(_r, _g, _b)
            _l = max(0, _l - 0.1)
            _rd, _gd, _bd = hls_to_rgb(_h, _l, _s)
            # Calc. optimal text color (b/w)
            # Grayscale human vision perception (Rec. 709 values)
            _a = 1 - (0.2126 * _r + 0.7152 * _g + 0.0722 * _b)
            values.update(
                {
                    "color_navbar_bg": n_rgb_to_hex(_r, _g, _b),
                    "color_navbar_bg_hover": n_rgb_to_hex(_rd, _gd, _bd),
                    "color_navbar_text": "#000" if _a < 0.5 else "#fff",
                }
            )
        self.write(values)

    @api.model
    def _get_company_color_active_company(self):
        """Company whose colours apply to the current web client request.

        The web client keeps the active company first in the ``cids`` cookie;
        ``env.company`` is only the user's default company at page load.
        """
        company = self.env["res.company"]
        if request:
            try:
                company_id = int(
                    request.httprequest.cookies.get("cids", "").split("-")[0]
                )
            except (TypeError, ValueError):
                company_id = False
            if company_id:
                company = self.env["res.company"].browse(company_id).exists()
        return company or self.env.company

    @api.model
    def _get_company_color_theme_color(self):
        """Browser/phone toolbar colour (<meta name="theme-color">)."""
        company = self.sudo()._get_company_color_active_company()
        return (company.company_colors or {}).get(
            "color_navbar_bg"
        ) or DEFAULT_THEME_COLOR

    def _scss_get_sanitized_values(self):
        self.ensure_one()
        # Clone company_color as dictionary to avoid ORM operations
        # This allow extend company_colors and only sanitize selected fields
        # or add custom values
        saved = dict(self.company_colors or {})
        values = dict(saved)

        def rgb(value, fallback):
            try:
                return ImageColor.getrgb(value)[:3]
            except (ValueError, TypeError, AttributeError):
                return ImageColor.getrgb(fallback)[:3]

        def to_hex(colour):
            return "#{:02x}{:02x}{:02x}".format(*colour)

        def tint(colour, white, base=(255, 255, 255)):
            return to_hex(
                round(channel * (1 - white) + target * white)
                for channel, target in zip(colour, base, strict=False)
            )

        def darken(colour, amount):
            # Same as Sass darken(): lower HSL lightness by an absolute amount.
            _h, _l, _s = rgb_to_hls(*(channel / 255 for channel in colour))
            return to_hex(
                round(channel * 255)
                for channel in hls_to_rgb(_h, min(1, max(0, _l - amount)), _s)
            )

        def luminance(colour):
            linear = [
                c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
                for c in (channel / 255 for channel in colour)
            ]
            return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]

        def readable_text(colour):
            # Pick black or white, whichever contrasts more with the background.
            lum = luminance(colour)
            return "#000000" if (lum + 0.05) / 0.05 > 1.05 / (lum + 0.05) else "#FFFFFF"

        def triplet(colour):
            return "{}, {}, {}".format(*colour)

        # Hover/text colours left empty follow the colour actually chosen
        # instead of unrelated purple defaults.
        navbar_bg = values.get("color_navbar_bg") or "#714B67"
        button_bg = values.get("color_button_bg") or DEFAULT_THEME_COLOR
        link = values.get("color_link_text") or (
            values.get("color_button_bg") or DEFAULT_THEME_COLOR
        )
        navbar = rgb(navbar_bg, "#714B67")
        button = rgb(button_bg, DEFAULT_THEME_COLOR)
        values.update(
            {
                "color_navbar_bg": navbar_bg,
                "color_navbar_bg_hover": values.get("color_navbar_bg_hover")
                or darken(navbar, 0.1),
                "color_navbar_text": values.get("color_navbar_text")
                or readable_text(navbar),
                "color_button_bg": button_bg,
                "color_button_bg_hover": values.get("color_button_bg_hover")
                or darken(button, 0.1),
                "color_button_text": values.get("color_button_text")
                or readable_text(button),
                "color_link_text": link,
                "color_link_text_hover": values.get("color_link_text_hover")
                or darken(rgb(link, DEFAULT_THEME_COLOR), 0.1),
                "color_submenu_text": values.get("color_submenu_text") or "#374151",
            }
        )
        # Company attachments are served as CSS directly, not compiled Sass.
        # Resolve tint/alpha values here so both the browser and asset tests agree.
        text = rgb(values["color_navbar_text"], "#FFFFFF")
        link_rgb = rgb(values["color_link_text"], DEFAULT_THEME_COLOR)
        link_hover_rgb = rgb(values["color_link_text_hover"], DEFAULT_THEME_COLOR)
        values.update(
            {
                "color_navbar_text_rgb": triplet(text),
                "color_button_bg_rgb": triplet(button),
                # Bootstrap draws the switch knob as an inline SVG.
                "color_button_switch_knob": (
                    "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg'"
                    " viewBox='-4 -4 8 8'%3e%3ccircle r='3'"
                    " fill='%23{:02x}{:02x}{:02x}'/%3e%3c/svg%3e\")".format(*button)
                ),
                "color_link_text_rgb": triplet(link_rgb),
                "color_link_text_hover_rgb": triplet(link_hover_rgb),
                # Same mixes Odoo applies to its brand colour.
                "color_button_active_bg": tint(button, 0.9),
                "color_button_emphasis": darken(button, 0.2),
                "color_button_emphasis_10": darken(button, 0.1),
                "color_button_lighter": darken(button, -0.075),
                "color_button_tint_95": tint(button, 0.95),
                "color_button_tint_85": tint(button, 0.85),
                "color_button_tint_50": tint(button, 0.5),
                "color_button_subtle": tint(button, 0.8),
                "color_button_border_subtle": tint(button, 0.6),
                "color_component_active_bg": tint(button, 0.8, (248, 249, 250)),
                "color_component_hover_bg": tint(button, 0.72, (248, 249, 250)),
            }
        )
        # Odoo: mix(lighten(active-border, 10%), active-bg, 15%)
        values["color_selected_day"] = tint(
            rgb(darken(button, -0.1), DEFAULT_THEME_COLOR),
            0.85,
            rgb(values["color_component_active_bg"], "#F8F9FA"),
        )
        return values

    def _scss_generate_content(self):
        self.ensure_one()
        colors = self.company_colors or {}
        templates = [
            template
            for group, template in (
                (NAVBAR_FIELDS, self.NAVBAR_TEMPLATE),
                (BUTTON_FIELDS, self.BUTTON_TEMPLATE),
                (LINK_FIELDS, self.LINK_TEMPLATE),
                (("color_submenu_text",), self.SUBMENU_TEMPLATE),
            )
            if any(colors.get(field) for field in group)
        ]
        # ir.attachment need files with content to work
        if not templates:
            return "// No Web Company Color SCSS Content\n"
        values = self._scss_get_sanitized_values()
        return "".join(template % values for template in templates)

    def scss_get_url(self):
        self.ensure_one()
        return URL_SCSS_GEN_TEMPLATE % self.id

    def scss_create_or_update_attachment(self):
        IrAttachmentObj = self.env["ir.attachment"]
        for record in self:
            datas = base64.b64encode(record._scss_generate_content().encode("utf-8"))
            custom_url = record.scss_get_url()
            custom_attachment = IrAttachmentObj.sudo().search(
                [("url", "=", custom_url), ("company_id", "=", record.id)]
            )
            values = {
                "datas": datas,
                "url": custom_url,
                "name": custom_url,
                "company_id": record.id,
                "type": "binary",
                "mimetype": "text/css",
            }
            if custom_attachment:
                custom_attachment.sudo().write(values)
            else:
                IrAttachmentObj.sudo().create(values)
        self.env.registry.clear_cache()
