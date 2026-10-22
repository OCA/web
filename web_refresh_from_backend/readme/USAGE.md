## 🧩 Example Usage

Below is a code snippet showing how to use the `reload_views` helper function.

```python
# Reload the kanban and form views for all salespeople when an opportunity is won
# Will reload views only if the current opportunity is being displayed

group_id = self.env.ref("sales_team.group_sale_salesman").id
users_to_reload = self.env["res.users"].search([("groups_id", "in", [group_id])])
users_to_reload.reload_views(
    model="crm.lead",
    view_types=["kanban", "form"],
    rec_ids=[self.id],
)
