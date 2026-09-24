# Copyright 2024 TechnoLibre
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class WebDiagramBuilderHelp(models.TransientModel):
    _name = "web.diagram.builder.help"
    _description = "Diagram Builder Tutorial"

    content_html = fields.Html(sanitize=False)

    @staticmethod
    def _get_help_html(is_fr):
        if is_fr:
            return """
<div>
  <div class="text-center mb-4">
    <h2><i class="fa fa-sitemap me-2 text-primary"></i>
      Constructeur de diagramme — Guide rapide
    </h2>
    <p class="text-muted mb-0">
      Tout ce qu'il faut savoir pour créer votre premier diagramme.
    </p>
    <p class="text-muted mb-0" style="font-size:0.9em;">
      <i class="fa fa-info-circle me-1"></i>
      Ce module visualise des données qui existent déjà dans votre compte. Il ne crée pas de nouvelles données et ne permet pas de les modifier — il sert uniquement à les afficher sous forme de diagramme.
    </p>
  </div>

  <div class="card mb-3 border-0 bg-light rounded p-3">
    <h5 class="mb-3"><i class="fa fa-question-circle me-2 text-info"></i>C'est quoi un diagramme ?</h5>
    <p class="mb-2">
      Un diagramme est une <strong>carte visuelle de vos données</strong>.
      Au lieu d'une liste, vous voyez des <strong>bulles</strong> (une par enregistrement)
      reliées par des <strong>flèches</strong> indiquant qui est le parent de qui.
    </p>
    <div class="text-center py-3">
      <span class="badge rounded-pill bg-primary px-3 py-2 me-1">Entreprise</span>
      <i class="fa fa-arrow-right text-secondary mx-1"></i>
      <span class="badge rounded-pill bg-success px-3 py-2 me-1">Département A</span>
      <i class="fa fa-arrow-right text-secondary mx-1"></i>
      <span class="badge rounded-pill bg-success px-3 py-2">Équipe A1</span>
    </div>
    <p class="mb-0 text-muted" style="font-size:0.9em;">
      <i class="fa fa-lightbulb-o me-1"></i>
      Fonctionne avec toute donnée ayant une relation parent/enfant :
      Contacts, Catégories de produits, Départements, Emplacements…
    </p>
  </div>

  <div class="card mb-3 border-0 bg-light rounded p-3">
    <h5 class="mb-3"><i class="fa fa-list-ol me-2 text-success"></i>Comment créer un diagramme — étape par étape</h5>
    <div class="d-flex align-items-start mb-3">
      <span class="badge bg-primary rounded-circle me-3 mt-1" style="min-width:24px;height:24px;line-height:16px;">1</span>
      <div><strong>Donnez un nom à votre diagramme</strong><br/>
        <span class="text-muted" style="font-size:0.9em;">
          Quelque chose de descriptif comme « Hiérarchie des contacts » ou « Catégories de produits ».
        </span>
      </div>
    </div>
    <div class="d-flex align-items-start mb-3">
      <span class="badge bg-primary rounded-circle me-3 mt-1" style="min-width:24px;height:24px;line-height:16px;">2</span>
      <div><strong>Choisissez un modèle</strong><br/>
        <span class="text-muted" style="font-size:0.9em;">
          C'est le type de données à afficher (ex. <em>Contact</em>, <em>Catégorie de produit</em>).
          Chaque enregistrement de ce modèle deviendra une bulle dans le diagramme.
          Seuls les modèles supportant les relations parent/enfant apparaissent dans cette liste.
        </span>
      </div>
    </div>
    <div class="d-flex align-items-start mb-3">
      <span class="badge bg-primary rounded-circle me-3 mt-1" style="min-width:24px;height:24px;line-height:16px;">3</span>
      <div><strong>Choisissez le champ parent</strong><br/>
        <span class="text-muted" style="font-size:0.9em;">
          C'est le champ qui détermine <strong>qui sera au-dessus de qui</strong> dans le diagramme.
          Par exemple, si vous choisissez <em>parent_id</em> sur les Contacts, chaque contact apparaîtra
          sous son contact parent. Changer ce champ change complètement la structure du diagramme.
        </span>
      </div>
    </div>
    <div class="d-flex align-items-start mb-0">
      <span class="badge bg-success rounded-circle me-3 mt-1" style="min-width:24px;height:24px;line-height:16px;">4</span>
      <div><strong>Cliquez sur « Générer le diagramme »</strong><br/>
        <span class="text-muted" style="font-size:0.9em;">
          Ce bouton lit tous vos enregistrements et construit le diagramme.
          Cela peut prendre quelques secondes selon le nombre d'enregistrements.
        </span>
      </div>
    </div>
  </div>

  <div class="card mb-3 border-0 bg-light rounded p-3">
    <h5 class="mb-3"><i class="fa fa-hand-pointer-o me-2 text-warning"></i>À quoi sert chaque bouton ?</h5>
    <div class="d-flex align-items-start mb-3">
      <i class="fa fa-play-circle text-primary me-3 mt-1" style="font-size:1.2em;"></i>
      <div><strong>Générer le diagramme</strong><br/>
        <span class="text-muted" style="font-size:0.9em;">
          Génère (ou régénère) le diagramme depuis vos données actuelles.
          Lancez-le à chaque fois que vos données changent.
        </span>
      </div>
    </div>
    <div class="d-flex align-items-start mb-3">
      <i class="fa fa-eye text-success me-3 mt-1" style="font-size:1.2em;"></i>
      <div>
        <strong>Voir le diagramme</strong>
        <span class="badge bg-secondary ms-1" style="font-size:0.7em;">apparaît après la génération</span><br/>
        <span class="text-muted" style="font-size:0.9em;">
          Ouvre le diagramme visuel — les bulles et les flèches.
          Vous pouvez déplacer les nœuds pour réorganiser la disposition visuellement,
          mais cela ne modifie pas vos données.
        </span>
      </div>
    </div>
    <div class="d-flex align-items-start mb-0">
      <i class="fa fa-download text-info me-3 mt-1" style="font-size:1.2em;"></i>
      <div>
        <strong>Exporter en CSV</strong>
        <span class="badge bg-secondary ms-1" style="font-size:0.7em;">apparaît après la génération</span><br/>
        <span class="text-muted" style="font-size:0.9em;">
          Télécharge les données du diagramme sous forme de tableur (nœuds et liens).
          Utile pour partager ou analyser davantage dans Excel.<br/>
          Pour exporter <strong>plusieurs diagrammes à la fois</strong>, sélectionnez-les
          dans la liste puis utilisez <strong>Action → Exporter CSV</strong> — vous obtiendrez un fichier ZIP.
        </span>
      </div>
    </div>
  </div>

  <div class="card mb-3 border-0 bg-light rounded p-3">
    <h5 class="mb-1">
      <i class="fa fa-sliders me-2 text-secondary"></i>Options
      <span class="badge bg-secondary ms-2" style="font-size:0.7em;vertical-align:middle;">tout est facultatif</span>
    </h5>
    <p class="text-muted mb-3" style="font-size:0.9em;">
      Ces paramètres vous permettent de contrôler ce qui apparaît dans le diagramme.
      Vous pouvez les laisser à leurs valeurs par défaut, tout fonctionnera très bien.
    </p>
    <div class="d-flex align-items-start mb-3">
      <i class="fa fa-filter text-muted me-3 mt-1"></i>
      <div><strong>Domaine de filtrage</strong><br/>
        <span class="text-muted" style="font-size:0.9em;">
          Restreint les enregistrements inclus. Laissez ce champ vide pour tout inclure.
          Exemple : filtrer pour n'afficher que les contacts d'un pays spécifique.
        </span>
      </div>
    </div>
    <div class="d-flex align-items-start mb-3">
      <i class="fa fa-hashtag text-muted me-3 mt-1"></i>
      <div>
        <strong>Nombre maximum de nœuds</strong>
        <span class="text-muted ms-1" style="font-size:0.85em;">(défaut : 200)</span><br/>
        <span class="text-muted" style="font-size:0.9em;">
          Le nombre maximum de bulles à afficher. Si votre diagramme semble incomplet,
          augmentez ce nombre. Attention : les très grands diagrammes peuvent être lents à afficher.
        </span>
      </div>
    </div>
    <div class="d-flex align-items-start mb-3">
      <i class="fa fa-refresh text-muted me-3 mt-1"></i>
      <div><strong>Rafraîchissement automatique</strong><br/>
        <span class="text-muted" style="font-size:0.9em;">
          Lorsqu'activé, une tâche planifiée régénère automatiquement le diagramme toutes les heures —
          plus besoin de cliquer sur « Générer le diagramme » manuellement.
        </span>
      </div>
    </div>
    <div class="d-flex align-items-start mb-0">
      <i class="fa fa-bookmark text-muted me-3 mt-1"></i>
      <div><strong>Appliquer un modèle</strong><br/>
        <span class="text-muted" style="font-size:0.9em;">
          Les modèles vous permettent d'enregistrer une combinaison Modèle + Champ parent
          pour la réutiliser rapidement. Créez vos propres modèles dans Configuration → Modèles.
        </span>
      </div>
    </div>
  </div>

  <div class="card mb-3 border-0 bg-light rounded p-3">
    <h5 class="mb-3"><i class="fa fa-info-circle me-2 text-info"></i>Après la génération — à quoi servent les onglets Nœuds et Liens ?</h5>
    <p class="mb-2">Une fois le diagramme généré, deux onglets apparaissent en bas :</p>
    <ul class="mb-0">
      <li class="mb-1"><strong>Nœuds</strong> — la liste de toutes les bulles du diagramme.
        Chaque nœud correspond à un enregistrement de votre modèle.</li>
      <li class="mb-0"><strong>Liens</strong> — la liste de toutes les flèches reliant les bulles.
        Chaque lien va d'un nœud parent vers un nœud enfant.</li>
    </ul>
  </div>
</div>"""
        return """
<div>
  <div class="text-center mb-4">
    <h2><i class="fa fa-sitemap me-2 text-primary"></i>
      Diagram Builder — Quick Guide
    </h2>
    <p class="text-muted mb-0">
      Everything you need to know to create your first diagram.
    </p>
    <p class="text-muted mb-0" style="font-size:0.9em;">
      <i class="fa fa-info-circle me-1"></i>
      This module visualizes data that already exists in your account. It does not create new data and does not allow you to modify it — it only displays your data as a diagram.
    </p>
  </div>

  <div class="card mb-3 border-0 bg-light rounded p-3">
    <h5 class="mb-3"><i class="fa fa-question-circle me-2 text-info"></i>What is a diagram?</h5>
    <p class="mb-2">
      A diagram is a <strong>visual map of your data</strong>.
      Instead of a list, you see <strong>bubbles</strong> (one per record)
      connected by <strong>arrows</strong> showing who is the parent of whom.
    </p>
    <div class="text-center py-3">
      <span class="badge rounded-pill bg-primary px-3 py-2 me-1">Company</span>
      <i class="fa fa-arrow-right text-secondary mx-1"></i>
      <span class="badge rounded-pill bg-success px-3 py-2 me-1">Department A</span>
      <i class="fa fa-arrow-right text-secondary mx-1"></i>
      <span class="badge rounded-pill bg-success px-3 py-2">Team A1</span>
    </div>
    <p class="mb-0 text-muted" style="font-size:0.9em;">
      <i class="fa fa-lightbulb-o me-1"></i>
      Works with any data that has a parent/child relationship:
      Contacts, Product Categories, Departments, Locations…
    </p>
  </div>

  <div class="card mb-3 border-0 bg-light rounded p-3">
    <h5 class="mb-3"><i class="fa fa-list-ol me-2 text-success"></i>How to create a diagram — step by step</h5>
    <div class="d-flex align-items-start mb-3">
      <span class="badge bg-primary rounded-circle me-3 mt-1" style="min-width:24px;height:24px;line-height:16px;">1</span>
      <div><strong>Give your diagram a name</strong><br/>
        <span class="text-muted" style="font-size:0.9em;">
          Something descriptive like "Contact Hierarchy" or "Product Categories".
        </span>
      </div>
    </div>
    <div class="d-flex align-items-start mb-3">
      <span class="badge bg-primary rounded-circle me-3 mt-1" style="min-width:24px;height:24px;line-height:16px;">2</span>
      <div><strong>Choose a Model</strong><br/>
        <span class="text-muted" style="font-size:0.9em;">
          This is the type of data to display (e.g. <em>Contact</em>, <em>Product Category</em>).
          Each record in this model will become a bubble in the diagram.
          Only models that support parent/child relationships appear in this list.
        </span>
      </div>
    </div>
    <div class="d-flex align-items-start mb-3">
      <span class="badge bg-primary rounded-circle me-3 mt-1" style="min-width:24px;height:24px;line-height:16px;">3</span>
      <div><strong>Choose the Parent Field</strong><br/>
        <span class="text-muted" style="font-size:0.9em;">
          This is the field that determines <strong>who appears above whom</strong> in the diagram.
          For example, choosing <em>parent_id</em> on Contacts will place each contact below its parent contact.
          Changing this field completely changes the structure of the diagram.
        </span>
      </div>
    </div>
    <div class="d-flex align-items-start mb-0">
      <span class="badge bg-success rounded-circle me-3 mt-1" style="min-width:24px;height:24px;line-height:16px;">4</span>
      <div><strong>Click "Generate Diagram"</strong><br/>
        <span class="text-muted" style="font-size:0.9em;">
          This button reads all your records and builds the diagram.
          It may take a few seconds depending on how many records you have.
        </span>
      </div>
    </div>
  </div>

  <div class="card mb-3 border-0 bg-light rounded p-3">
    <h5 class="mb-3"><i class="fa fa-hand-pointer-o me-2 text-warning"></i>What does each button do?</h5>
    <div class="d-flex align-items-start mb-3">
      <i class="fa fa-play-circle text-primary me-3 mt-1" style="font-size:1.2em;"></i>
      <div><strong>Generate Diagram</strong><br/>
        <span class="text-muted" style="font-size:0.9em;">
          Generates (or regenerates) the diagram from your current data.
          Run this every time your data changes and you want an up-to-date view.
        </span>
      </div>
    </div>
    <div class="d-flex align-items-start mb-3">
      <i class="fa fa-eye text-success me-3 mt-1" style="font-size:1.2em;"></i>
      <div>
        <strong>View Diagram</strong>
        <span class="badge bg-secondary ms-1" style="font-size:0.7em;">appears after computing</span><br/>
        <span class="text-muted" style="font-size:0.9em;">
          Opens the visual diagram — the bubbles and arrows.
          You can drag nodes around to rearrange the layout visually,
          but this does not modify your data.
        </span>
      </div>
    </div>
    <div class="d-flex align-items-start mb-0">
      <i class="fa fa-download text-info me-3 mt-1" style="font-size:1.2em;"></i>
      <div>
        <strong>Export CSV</strong>
        <span class="badge bg-secondary ms-1" style="font-size:0.7em;">appears after computing</span><br/>
        <span class="text-muted" style="font-size:0.9em;">
          Downloads the diagram data as a spreadsheet (nodes and links).
          Useful for sharing or further analysis in Excel.<br/>
          To export <strong>multiple diagrams at once</strong>, select them
          in the list view and use <strong>Action → Export CSV</strong> — you will get a ZIP file.
        </span>
      </div>
    </div>
  </div>

  <div class="card mb-3 border-0 bg-light rounded p-3">
    <h5 class="mb-1">
      <i class="fa fa-sliders me-2 text-secondary"></i>Options
      <span class="badge bg-secondary ms-2" style="font-size:0.7em;vertical-align:middle;">all optional</span>
    </h5>
    <p class="text-muted mb-3" style="font-size:0.9em;">
      These settings let you control what appears in the diagram.
      You can leave them all at their default values and it will work just fine.
    </p>
    <div class="d-flex align-items-start mb-3">
      <i class="fa fa-filter text-muted me-3 mt-1"></i>
      <div><strong>Filter Domain</strong><br/>
        <span class="text-muted" style="font-size:0.9em;">
          Restricts which records are included. Leave this field empty to include all records.
          Example: filter to only show contacts in a specific country.
        </span>
      </div>
    </div>
    <div class="d-flex align-items-start mb-3">
      <i class="fa fa-hashtag text-muted me-3 mt-1"></i>
      <div>
        <strong>Max Nodes</strong>
        <span class="text-muted ms-1" style="font-size:0.85em;">(default: 200)</span><br/>
        <span class="text-muted" style="font-size:0.9em;">
          The maximum number of bubbles to display. If your diagram looks incomplete,
          increase this number. Warning: very large diagrams can be slow to render.
        </span>
      </div>
    </div>
    <div class="d-flex align-items-start mb-3">
      <i class="fa fa-refresh text-muted me-3 mt-1"></i>
      <div><strong>Auto-refresh</strong><br/>
        <span class="text-muted" style="font-size:0.9em;">
          When enabled, a scheduled task automatically regenerates the diagram every hour —
          no need to click "Generate Diagram" manually.
        </span>
      </div>
    </div>
    <div class="d-flex align-items-start mb-0">
      <i class="fa fa-bookmark text-muted me-3 mt-1"></i>
      <div><strong>Apply Template</strong><br/>
        <span class="text-muted" style="font-size:0.9em;">
          Templates let you save a Model + Parent Field combination to reuse it quickly.
          Create your own templates in Configuration → Templates.
        </span>
      </div>
    </div>
  </div>

  <div class="card mb-3 border-0 bg-light rounded p-3">
    <h5 class="mb-3"><i class="fa fa-info-circle me-2 text-info"></i>After computing — what are the Nodes and Links tabs?</h5>
    <p class="mb-2">Once the diagram is generated, two tabs appear at the bottom:</p>
    <ul class="mb-0">
      <li class="mb-1"><strong>Nodes</strong> — the list of all bubbles in the diagram.
        Each node corresponds to one record in your model.</li>
      <li class="mb-0"><strong>Links</strong> — the list of all arrows connecting the bubbles.
        Each link goes from a parent node to a child node.</li>
    </ul>
  </div>
</div>"""
