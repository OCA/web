* You can change the ribbon's name ("TEST") by editing the default system
  parameter "ribbon.name" (in the menu Settings > Parameters > System
  Parameters) To hide the ribbon, set this parameter to "False" or delete it.
* You can customize the ribbon color and background color through system
  parameters: "ribbon.color", "ribbon.background.color". Fill with valid CSS
  colors or just set to "False" to use default values.
* You can add the database name in the ribbon by adding "{db_name}" in the
  system parameter "ribbon.name".
* It is possible to use the parameters ("ribbon.name", "ribbon.color",
  "ribbon.background.color") in the configuration file instead of changing
  the system parameters. This option will be useful in the case of
  a restoration of a production database on a pre-production environment,
  where we want to see a different ribbon that corresponds to the environment
  and not to the value stored in the database.
