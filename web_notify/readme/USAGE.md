To send a notification to the user you just need to call one of the new
methods defined on res.users:

``` python
self.env.user.notify_success(message='My success message')
```

or

``` python
self.env.user.notify_danger(message='My danger message')
```

or

``` python
self.env.user.notify_warning(message='My warning message')
```

or

``` python
self.env.user.notify_info(message='My information message')
```

or

``` python
self.env.user.notify_default(message='My default message')
```

![](static/description/notifications_screenshot.gif)

You can test the behaviour of the notifications by installing this
module in a demo database. Access the users form through Settings -\>
Users & Companies. You'll see a tab called "Test web notify", here
you'll find two buttons that'll allow you test the module.

![](static/description/test_notifications_demo.png)
