When creating new reports, you should use a path like the following::

    <img t-att-src="'/report/qr/?value=%s&amp;error_correction=%s' % ('HELLO WORLD!', 3)" style="width:100;height:100"/>


The **error_correction** parameter controls the error correction used for the QR Code. The following four constants are made available:

* **error_correction** = 1: About 7% or less errors can be corrected.
* **error_correction** = 0: About 15% or less errors can be corrected.
* **error_correction** = 3: About 25% or less errors can be corrected.
* **error_correction** = 2: About 30% or less errors can be corrected.

The **box_size** parameter controls how many pixels each "box" of the QR code is. The default is 3.
The **border** parameter controls how many boxes thick the border should be (the default is 4, which is the minimum according to the specs).

The **version** parameter is an integer from 1 to 40 that controls the size of the QR Code (the smallest, version 1, is a 21x21 matrix). Set to None and use the fit parameter when making the code to determine this automatically.

**fill_color** and **back_color** can change the background and the painting color of the QR, when using the default image factory.
