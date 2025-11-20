To trigger an action for the current user, call `_send_action` on
`res.users`:

```python
   action = {
      "type": "ir.actions.act_window",
      "name": "My Wizard",
      "res_model": "my.wizard",
      "view_mode": "form",
      "target": "new",
      "context": {
         "default_some_field": 42,
      },
   }

   self.env.user._send_action(action)
```

This will send a cleaned version of the action to the web client of the
current user.

**Filter by model (`res_model`)**

If you want the action to run when the user is currently
working with a specific model. You can pass a `res_model` hint:

```python
   action = {
      "type": "ir.actions.act_window",
      "name": "Order Helper",
      "res_model": "sale.order.helper.wizard",
      "view_mode": "form",
      "target": "new",
   }

   self.env.user._send_action(
      action,
      res_model="sale.order",
   )
```

**Filter by record (`res_id`)**

For form views, it is often useful to restrict execution to a specific
record (for example, only when the user is looking at a particular
partner or document). You can pass a res_id value:

```python
   action = {
      "type": "ir.actions.client",
      "tag": "soft_reload",
   }

   # Only execute when the user is viewing this specific partner record
   self.env.user._send_action(
      action,
      res_model="res.partner",
      res_id=self.id,
      view_types=["form"],
   )
```

**Filter by view type (view_types)**

You can also restrict execution to specific view types, for example only
in form view or only in list view. Use the `view_types` parameter:

```python
   action = {
      "type": "ir.actions.act_window",
      "name": "Mass Update",
      "res_model": "stock.quant",
      "view_mode": "form",
      "target": "new",
   }

   self.env.user._send_action(
      action,
      res_model="stock.quant",
      view_types=["list"],  # only when the user is on a list view
   )
```

If `view_types` is omitted or an empty list, no restriction by view type
is applied.

**Example patterns**

- Update UI after a background job

```python
   def _cron_enrich_contact(self):
      # ... heavy enrich logic ...

      action = {
         "type": "ir.actions.client",
         "tag": "soft_reload",
      }

      # Ask the client to soft-reload when viewing this contact
      self.env.user._send_action(
         action,
         res_model="res.partner",
         res_id=self.id,
         view_types=["form"],
      )
```

- Notify after creating a record

```python
   def create(self, vals_list):
      res = super().create(vals_list)
      action = {
         "type": "ir.actions.client",
         "tag": "display_notification",
         "params": {
               "type": "info",
               "title": _("Info"),
               "message": _("Record was created successfully."),
               "next": {"type": "ir.actions.act_window_close"},
         },
      }
      # Notify only when the user is on the partner form
      self.env.user._send_action(
         action,
         res_model="res.partner",
         res_id=self.id,
         view_types=["form"],
      )
```

- Ask the user to fill in missing information

```python
   def _cron_check_employees_data(self):
      # ... find employees with incomplete data ...
      employees = self.search([("some_field", "=", False)])

      for employee in employees:
         action = {
               "type": "ir.actions.act_window",
               "name": "Complete Employee Data",
               "res_model": "hr.employee.wizard",
               "view_mode": "form",
               "target": "new",
               "context": {
                  "default_employee_id": employee.id,
               },
         }

         # Ask the responsible user to complete data
         employee.user_id._send_action(
               action,
         )
```
