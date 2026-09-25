1. Create a static webpage which contains all website blocks (widgets) you may want to use on static webpages. You may want to do this on a test system.

2. Go to `Settings -> Technical -> Web Assets` and create entries of bundles which you want to modify. Typically you may want to modify the bundles `web.assets_frontend`, `web.assets_frontend_minimal`, `web.assets_frontend_lazy`, `web.assets_common`, `web.assets_common_lazy`, and `web.assets_common_minimal`. Define a Regex rule to match one or multiple pages (e.g. `/test` to match the webpage with URL `example.com/test`).

3. Open a website which matches the defined Regex with the URL parameter "debug=assets" to generate the file lists.

4. Start excluding files from certain bundles. You may sort by size and start with the largest files. Or you group by module which should give a good overview which modules and their assets may not be required (and thus may be excluded).

5. Open and test the webpage again and check if it still works as expected. Repeat this and the previous steps again and again until your assets bundels are as minimal as desired.

6. Modified assets can be downloaded from one system (e.g. test system) and uploaded to another system (e.g. production system)
