## Flow

1. Go to menu : **Web Form -> Forms** and Create new **Web Form**, selects the target model (e.g., crm.lead, helpdesk.applicant, custom model…).

2. Configure inputs (labels, types, required/readonly, mapped fields) and optional computed default values.

3. Send the secure link to a partner (via the mail-template snippet or any channel).

4. Partner opens the link, form renders with defaults, submits → record is created in the target model.

5. Partner’s token rotates to invalidate the previous link.

## Security

The **Web Form** is accessible to the user in the **Other / Web Form User** group
