Go to pivot view and click on the "Measures" menu, you will see
a new option called 'Computed Measure'.

You have the follow options to create a 'computed measure':
 - Measure 1: Used in 'operation formula' as 'm1'
 - Measure 2: Used in 'operation formula' as 'm2'
 - Operation: The formula
    - Sum: m1 + m2
    - Sub: m1 - m2
    - Mult: m1 * m2
    - Div: m1 / m2 (Format: Float)
    - Perc m1 / m2 (Format: Percentage)
    - Custom: Special option only visible in debug mode to write a custom formula.
 - Name: The name of the new measure (emtpy = auto-generated)
 - Format: How will the value be printed
    - Integer
    - Float
    - Percentage (value * 100)
 - Formula*: Custom operation formula
    These formula is evaluated using 'PY.eval'

These computed measures can be mixed (You can reuse it to make new computed measures) and saved as favorites.

Notice that "measures/computed measures" involved in an active 'computed measure'
can't be deactivated until you have deactivate the 'computed measure'.
