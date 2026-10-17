In your xml view, add `widget="numeric_step"` to a float or integer field. This will add the 2
buttons "+" and "-" just next to the input field in edit mode. Iteration
step by default is 1.

![](../static/description/add_two_buttons.png)

**Optional**

Add an option to choose the step iteration and limits (min and max
values).

Example for an 0.25 step, min to -1 and max to 10 :

``` xml
<field name="sale_delay" widget="numeric_step" options="{'step': 0.25, 'min': -1, 'max': 10}" /> days
```

**Available Options**

- step \> Amount to increase/decrease (default: 1.0)
- min \> Min. value allowed (default: no limit)
- max \> Max. value allowed (default: no limit)
- auto_select \> Select the content when the element get focus (default:
  False)
- placeholder \> Define the placeholder text (default: None)
- class \> Define additional classes for the input (default: None)

**Examples**

Iteration with 0.25 step, min to -1 and max to 10.

Start to increment with button, continue incrementing with scrolling
mouse.

![](../static/description/step0,25andlimits.gif)

Iteration with 10 step, max limit 15, placeholder with onchange

![](../static/description/step10_limit15_placeholder117_with_onchange.gif)

**Demo**

You can test the feature by going to Settings > Technical > Reporting > Paper Format.
The fields "Top Margin (mm)" and "Bottom Margin (mm)" are configured to use the
widget with 0.5 step, min to 0 and max to 100, and the fields "Left Margin (mm)"
and "Right Margin (mm)" with 1 step, min to 0 and max to 50. The integer field
"Header spacing" is configured with 5 step, min to 0 and max to 100.
