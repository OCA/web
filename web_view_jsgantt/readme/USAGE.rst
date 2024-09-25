To use the jsgantt view on a model, a view of that type must be defined for
that model. The root element of the view is ``<jsgantt>`` and it should
contain multiple ``<field>`` elements.

The ``<jsgantt>`` root element can have the following attributes:

``time_format``
   The default time format (time scale) to use. Possible values are: ``hour``,
   ``day``, ``week``, ``month``, and ``quarter``. Defaults to ``day``.

``show_duration``
   Whether to display the duration information (as a column and in the task
   information). Defaults to ``true``.

``caption_type``
   Controls which internal task field to use as a caption next to the Gantt
   chart task bars. Possible values are ``none``, ``caption``,
   ``resource_id``, ``duration``, ``completion``. Defaults to ``none``.

Each ``<field>`` element can have the following attributes:

``name``
   The name of the field as defined by the model. This is mandatory.

``mapping``
   The internal task field name to map the value to. See below for possible
   values. Fields without a valid ``mapping`` value will not appear in the
   view.

``invisible``
   Whether this field should be hidden (as a column and in the task
   information). Although hidden, its value will still be mapped to the
   internal field as defined by its ``mapping`` attribute and used to display
   tasks. Defaults to ``false`` (field is visible).

To make the view available, the ``jsgantt`` view mode must be added to the
list of view modes (``view_mode`` field) of the window action.

Internal task field names
~~~~~~~~~~~~~~~~~~~~~~~~~

Here are the names of the internal fields used to display the Gantt chart.
Internally, the Gantt chart sees each record as a task, and these are its
properties.

Each field of the view must be mapped to one of these using its ``mapping``
attribute.

``name``
    The name (label) of the task. (``Char``)

``start_date``
    The start date of the task. (``Date`` or ``DateTime``)

``end_date``
    The end date of the task. (``Date`` or ``DateTime``)

``plan_start_date``
    The planned start date of the task. (``Date`` or ``DateTime``)

``plan_end_date``
    The planned end date of the task. (``Date`` or ``DateTime``)

``is_milestone``
    Whether this task represents a milestone. (``Boolean``)

``resource_id``
    The resource assigned to the task. (``Many2one``)

``completion``
    The completion ratio, between 0 and 1. Is displayed as a percentage.
    (``Float``)

``is_parent``
    Whether this task is a parent task. (``Boolean``)

``parent_id``
    The parent task. (``Many2one``)

``is_expanded``
    For parent tasks, whether the task group should be expanded by default.
    (``Boolean``)

``dependency_ids``
    The tasks on which this task depends. (``Many2many``)

``caption``
    The caption to display next to the task bar (if the ``caption_type``
    attribute of the view is set to ``caption``). (``Char``)

``notes``
    The notes to display in the task information. (``Char``)

``cost``
    The cost of the task. (``Float``)

``bar_text``
    The text to display on the task bar. (``Char``)
