
# Backend UI Reload Module

This is a **technical module** that allows triggering a **UI reload** from the backend.
It enables triggering the reload action for selected users and record IDs.

**NB:** this module refreshes views using direct actions instead of calling `action_reload`.
This is done to avoid possible glitches and is aligned with the same approach used in the [web_refreshed](https://github.com/OCA/web/tree/16.0/web_refresher) module.

---

## 🔧 Helper Function: `reload_views`

A special helper function `reload_views` is added to the `res.users` model.

### **Arguments**

| Argument | Type | Description |
|-----------|------|-------------|
| **model** | `Char` | Model name, e.g. `'res.partner'` |
| **view_types** | `List of Char` *(optional)* | View types to reload, e.g. `["form", "kanban"]`. Leave blank to reload all views. |
| **rec_ids** | `List of Integer` *(optional)* | The view will be reloaded only if a record with an ID from this list is present in the view. |

---

## ⚠️ Important Notes

Use this function **wisely**.

When reloading **form views**, be aware that if a user is currently editing a record,
**their unsaved updates may be lost**.
