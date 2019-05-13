Use this widget by saying:

.. code-block:: xml

    <field name="my_table" widget="widget_table" options="{
                                'field_name': 'child_ids',
                                'datatable_params':{'searching': False,
                                'paging': False,
                                'info': False},
                                'fields': ['name','date_start', 'date_end', 'real_date_start', 'real_date_end', 'total_time'],
                                'headers': ['Name','Date Start', 'Date End', 'Real Date Start', 'Real Date End', 'Total Time']}"/>

"my_table" field must be of type char, it is only used to display the table. For example:

.. code-block:: python

    my_table = fields.Char(
            store=False)

You need to pass the following parameters:

field_name
    This required parameter indicates a One2many field present in the model from which
    the fields parameter will refer
fields
    This required parameter is a list that indicates the fields from child_ids records
    that will be displayed in the datatable
headers
    The required parameter is a list of used string to display in the table header, 
    they should be in the same order as the fields
datatable_params
    This is to pass the datatable parameters https://datatables.net/manual/options, like:
        paging;
        info;
        searching;
        scrollY;
        etc.
