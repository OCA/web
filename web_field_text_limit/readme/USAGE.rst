To use it in QWeb views, you need to assign the text widget in t-options if the field does not use it by
default, along with text_limit and the name of the limit to be applied.

.. code:: xml

  <span t-field="name" t-options="{'text_limit': 'Journal Limit'}" />
