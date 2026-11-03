No specific configuration is required. The module adds a new view type "daypilot" that can be used in any Odoo model.

To use the DayPilot view:

1. Install the module from the Apps menu
2. Define a daypilot view in your custom module following the example in USAGE.md
3. Add the view to your model's action or menu
4. The view will be available as an option in the view switcher

The DayPilot Lite library is bundled with the module and loaded lazily at runtime by the view renderer (no asset bundle entry is required).
