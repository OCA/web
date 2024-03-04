# Copyright (C) 2023 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, models


class Base(models.AbstractModel):
    _inherit = "base"

    @api.model
    def _get_view(self, view_id=None, view_type="form", **options):
        arch, view = super()._get_view(view_id=view_id, view_type=view_type, **options)
        arch = self._merge_notebook_tab_update_arch(arch, view)
        return arch, view

    def _merge_notebook_tab_update_arch(self, arch, view):
        merge_settings = self.env["ir.ui.view.merge.notebook.tab"].search(
            [("view_xml_id", "=", view.xml_id)]
        )

        for merge_setting in merge_settings:
            notebook = arch.xpath("//notebook")
            notebook = notebook and notebook[0]

            if len(notebook) == 0:
                continue

            # Create a new tab, and add it to the notebook
            new_tab = arch.makeelement(
                "page",
                name=merge_setting.tab_name,
                string=merge_setting.tab_description,
            )
            notebook.append(new_tab)

            for tab_name in merge_setting.merge_tab_names.split(","):
                old_tab = arch.xpath(f"//page[@name='{tab_name}']")
                old_tab = old_tab and old_tab[0]
                if len(old_tab) == 0:
                    continue

                # Add a new group, and add it to the new tab
                new_group = arch.makeelement(
                    "group",
                    name=f"group_merged_tab__{old_tab.get('name')}",
                    string=old_tab.get("string"),
                )
                new_tab.append(new_group)

                for current_element in old_tab.getchildren():
                    if current_element.tag == "field":
                        # Fix Odoo issue:
                        # If field are not in a 'group' tag, it is nolabel by default
                        # As we move element in a group, if it was not in a group before
                        # we set nolabel, and change colspan
                        # to preserve similar display
                        current_element.set("nolabel", "1")
                        current_element.set("colspan", "2")

                    elif current_element.tag == "group":
                        current_element.set("colspan", "2")

                    # Move all elements of old tab in the new group
                    new_group.append(current_element)

                # Finaly, remove the useless old tab
                notebook.remove(old_tab)

        return arch
