Just modify the definition field like

```python
from odoo import models

from odoo.addons.web_portal_properties.fields import PortalPropertiesDefinition


class ProjectProject(models.Model):
    _inherit = "project.project"

    task_properties_definition = PortalPropertiesDefinition()

```

Then, use the widget `portal_properties` on your field to allow the edition for the user.

Finally, on the portal template add this snippet with the right parameters:

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<odoo>
    <template id="portal_my_task" inherit_id="project.portal_my_task">
        <xpath expr="//div[@id='card_body']" position="inside">

            <t t-call="web_portal_properties.portal_properties">
                <t t-set="properties_record" t-value="task" />
                <t t-set="properties_field" t-value="'task_properties'" />
            </t>
        </xpath>
    </template>
</odoo>
```