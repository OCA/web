#. Go to *Settings > Tachnical > User Interface > Form Banner Rules* and create a rule.
#. Choose Model, select Trigger Fields (optional), set Default Severity, select Views
   (optional), update Target XPath (insertion point) and Position, and configure the
   message.
#. Save. Open any matching form record—the banner will appear and auto-refresh after
   load/save/reload.

Usage of message fields:
~~~~~~~~~~~~~~~~~~~~~~~~

* **Message** (message): Text shown in the banner. Supports `${placeholders}` filled
  from values returned by message_value_code. Ignored if message_value_code returns an
  `html` value.
* **HTML** (message_is_html): If enabled, the message string is rendered as HTML;
  otherwise it's treated as plain text.
* **Message Value Code** (message_value_code): Safe Python expression evaluated per
  record. Return a dict such as `{"visible": True, "severity": "warning", "values": {"name": record.name}}`.
  Use either message or `html` (from this code), not both. Several evaluation context
  variables are available.

Evaluation context variables available in Message Value Code:
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

* `env`: Odoo environment for ORM access.
* `user`: Current user (`env.user`).
* `ctx`: Copy of the current context (`dict(env.context)`).
* `record`: Current record (the form's record).
* `changes`: Dict of sanitized draft values coming from the form. Includes only
  simple field types; many2one values are normalized to an integer id (or `False`)
  and unknown/complex fields are omitted. Useful when rule logic needs the raw
  user-input values regardless of the proxy overrides applied to `record`.
* `current_id`: Integer id of the record being edited, or `False` if the form
  is creating a new record.
* `model`: Shortcut to the current model (`env[record._name]`).
* `url_for(obj)`: Helper that returns a backend form URL for `obj`.
* `context_today(ts=None)`: User-timezone “today” (date) for reliable date comparisons.
* `time`, `datetime`: Standard Python time/datetime modules.
* `dateutil`: `{ "parser": dateutil.parser, "relativedelta": dateutil.relativedelta }`
* `timezone`: `pytz.timezone` for TZ handling.
* `float_compare`, `float_is_zero`, `float_round`: Odoo float utils for precision-safe
  comparisons/rounding.

All of the above are injected by the module to the safe_eval locals.

Trigger Fields
~~~~~~~~~~~~~~

**What it does**

*Trigger Fields* is an optional list of model fields that, when changed in the open
form, cause the banner to **recompute live**. If left empty, the banner does **not**
auto-refresh as the user edits the form.

When a trigger fires, the module sends the current draft values to the server, sanitizes
them, builds an evaluation record, and re-runs your
`message_value_code`. See :ref:`Evaluation context` for available variables.

**How it interacts with your rule code**

- The dict `changes` contains the **sanitized** draft values of the form at the moment
  of the trigger. Only simple field types are included:
  `char`, `text`, `html`, `selection`, `boolean`, `integer`,
  `float`, `monetary`, `date`, `datetime`.
- `many2one` values in `changes` are normalized to an **integer id** (or `False`). You
   can browse the record if needed::
  
    partner_id = changes.get("partner_id")
    partner = env["res.partner"].browse(partner_id) if partner_id else None

- Complex fields (x2many/reference) are **omitted** from ``changes``. If your
  logic depends on them, read from ``record`` (the proxy around the current DB
  record plus overrides) and choose a simple field as the trigger.

**Choosing good triggers**

- Prefer fields **actually present on the form**; changes to hidden/unrendered
  fields won’t fire in the client.
- Use **simple** fields whenever possible. For complex dependencies, consider a
  stored/computed boolean or selection as a proxy and use that as a trigger.
- Keep the list **small**; every trigger causes a round-trip to recompute.

**Examples**

Basic severity switch on a selection::

    # message_value_code
    stage = changes.get("stage_id")  # many2one -> int id or False
    is_draft = (stage == env.ref("my_module.stage_draft").id) if stage else False
    {
        "visible": True,
        "severity": "warning" if is_draft else "info",
        "values": {"note": "Record is still in draft"}
    }

Date-based visibility using user-timezone today::

    # message_value_code
    deadline = changes.get("date_deadline") or record.date_deadline
    show = bool(deadline and dateutil["parser"].parse(str(deadline)).date() < context_today())
    {
        "visible": show,
        "severity": "danger" if show else "info",
        "values": {"deadline": str(deadline) if deadline else "-"}
    }

**Tips & caveats**

- Triggers control **when** recomputation happens; your rule code decides
  **what** to show. Reading from ``record`` gives you the current database
  values with any draft overrides applied; reading from ``changes`` gives you
  the raw (sanitized) form inputs.
- If you rely on a value that isn’t in ``changes`` (e.g., x2many), ensure some
  **simple** field that correlates with it is listed as a trigger, or expose a
  small computed/stored helper field for that purpose.


Message setting examples:
~~~~~~~~~~~~~~~~~~~~~~~~~

**A) Missing email on contact (warning)**

* Model: `res.partner`
* Message: `This contact has no email.`
* Message Value Code:

.. code-block:: python

  {"visible": not bool(record.email)}

**B) Show partner comment if available**

* Model: `purchase.order`
* Message: `Vendor Comments: ${comment}`
* Message Value Code (single expression):

.. code-block:: python

  {
    "visible": bool(record.partner_id.comment),
    values: {"comment": record.partner_id.comment},
  }

It is also possible to use "convenience placeholders" without an explicit `values` key:

.. code-block:: python

  {
    "visible": bool(record.partner_id.comment),
    "comment": record.partner_id.comment,
  }

**C) High-value sale order (dynamic severity)**

* Model: `sale.order`
* Message: `High-value order: ${amount_total}`
* Message Value Code:

.. code-block:: python

  {
    "visible": record.amount_total > 30000,
    "severity": "danger" if record.amount_total >= 100000 else "warning",
    "values": {"amount_total": record.amount_total},
  }

**D) Quotation past validity date**

* Model: `sale.order`
* Message: `This quotation is past its validity date (${validity_date}).`
* Message Value Code:

.. code-block:: python

  {
    "visible": bool(record.validity_date and context_today() > record.validity_date and record.state in ["draft", "sent"]),
    "values": {"validity_date": record.validity_date},
  }

**E) Pending activities on a task (uses `env`)**

* Model: `project.task`
* Message: `There are ${cnt} pending activities.`
* Message Value Code (multi-line with `result`):

.. code-block:: python

  cnt = env["mail.activity"].search_count([("res_model","=",record._name),("res_id","=",record.id)])
  result = {"visible": cnt > 0, "values": {"cnt": cnt}}

**F) HTML banner linking to the customer's last sales order**

* Model: `sale.order`
* Message: (leave blank; `html` provided by Message Value Code)
* Message Value Code (multi-line with `result`):

.. code-block:: python

  last = model.search(
    [("partner_id", "=", record.partner_id.id), ("id", "<", record.id)],
    order="date_order desc, id desc",
    limit=1,
  )
  if last:
    html = "<strong>Previous order:</strong> <a href='%s'>%s</a>" % (url_for(last), last.name)
    result = {"visible": True, "html": html}
  else:
    result = {"visible": False}

**G) Product is missing internal reference (uses `changes`)**

* Model: `product.template`
* Trigger Fields: `default_code`
* Message: `Make sure to set an internal reference!`
* Message Value Code:

.. code-block:: python

  {
    "visible": not bool(changes.get("default_code", record.default_code)),
  }
