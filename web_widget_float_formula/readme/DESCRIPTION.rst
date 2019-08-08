This module allows the use of simple math formulas in integer/float fields 
(e.g. "=45 + 4/3 - 5 * (2 + 1)").

* Only supports parentheses, decimal points, thousands separators, and the 
  operators "+", "-", "*", and "/"
* Will use the decimal point and thousands separator characters associated 
  with your language
* If the formula is valid, the result will be computed and displayed, and the 
  formula will be stored for editing
* If the formula is not valid, it's retained in the field as text

**Technical Details**

* Overloads web.basic_fields.NumericField (so it works for FieldFloat and 
  FieldInteger)
* Uses the eval() JS function to evaluate the formula
* Does not do any rounding (this is handled elsewhere)
* Avoids code injection by applying strict regex to formula prior to eval() 
  (e.g. "=alert('security')" would not get evaluated)
