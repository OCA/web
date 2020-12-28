Attributes:
~~~~~~~~~~~

* regex [String]: Defines the regex to test the search criteria
* can_create [Boolean]: Allow create new records
* can_write [Boolean]: Allow edit the linked record

Options:
~~~~~~~~

* search [Dictionary]
  * field: The field to use in the search process [Default is 'id']
  * oper: The operator (like, ilike, etc...) [Default is '=']

* no_create: Invalidates the 'can_create' flag
* no_write: Invalidates the 'can_write' flag
* no_open: Disables open the linked record
