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
- create-action: To force an specific action for creation (it is a xmlid)
- open-action: The function to launch to open the record. By default, it uses get_formview_action.
- filter: set 0 to hide the filters
- group-by: set 0 to hide the group-by
- favorite: set 0 to hide the favorite
