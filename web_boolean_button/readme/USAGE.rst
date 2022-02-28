Go to form and attach widget boolean_button to your boolean field (i.e. in button-box div) with terminology if needed.

.. code-block:: xml

  <button name="toggle_start" type="object" class="oe_stat_button" icon="fa-archive">
      <field name="help_button" widget="boolean_button"
          options="{'terminology': {
                  'string_true': 'ACTIVE',
                  'hover_true': 'PAUSE',
                  'string_false': 'HELP',
                  'hover_false': 'FINISH'
              }}"/>
  </button>
