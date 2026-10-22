This is a technical module.

You can add this kind of elements by using

```xml
  <widget 
    name="sub_view_widget" 
    model="res.partner"
    domain="[('parent_id', '=', id)]"
    context="{'search_default_parent_id': id}"         
  />
```

It is necessary to use model.
Context is recomended for setting default values and forcing specific views or default searching values.

Also, you can use:

- view-type: To force an specific view kind. By default it uses list in desktop and kanban in mobile.
- create-action: To force an specific action for creation. Depending on create-action-type, it is either
  the name of a Python method on the model, or the id/xmlid of an existing action.
- create-action-type: How create-action should be interpreted:
  - object (default): create-action is a method name on the model, called server-side. Whatever action
    it returns (e.g. opening a wizard) is executed.
  - action: create-action is an existing action's id or xmlid (e.g. `%(module.action_xmlid)s`), which is
    loaded and executed directly, without calling any method.
- open-action: The function to launch to open the record. By default, it uses get_formview_action.
- filter: set 0 to hide the filters
- group-by: set 0 to hide the group-by
- favorite: set 0 to hide the favorite
