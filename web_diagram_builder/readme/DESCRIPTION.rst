This module lets you build interactive dependency diagrams from any Odoo
model that contains a recursive many2one field (e.g. ``parent_id``).

Select a model and a parent field, click **Generate Diagram**, and the
module will traverse all parent-child relationships and render them as an
interactive diagram using Cytoscape.js with automatic dagre layout.

**Use cases:**

* Contacts and sub-contacts (``res.partner``, ``parent_id``)
* Product categories and sub-categories
* Departments and sub-teams
* Any model with a self-referencing many2one field

**Features:**

* Automatic hierarchical layout (dagre algorithm)
* Export diagram as PNG
* Find path between two nodes (Lowest Common Ancestor algorithm)
* CSV import/export of diagram configurations
* In-app step-by-step tutorial
* Bilingual navigation help (EN/FR)
* Auto-refresh via scheduled cron
* Predefined templates for common use cases
* French (fr_CA) translations included
