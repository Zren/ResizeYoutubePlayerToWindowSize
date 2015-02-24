# Suggestions
* [Youtube Center](https://github.com/YePpHa/YouTubeCenter/wiki) now has this feature with a few more options in their script. Check out **YT Center Settings > Player > Fullscreen Top Player**.
* Use [Yays!](http://eugenox.appspot.com/script/yays) or [Youtube Center](https://github.com/YePpHa/YouTubeCenter/wiki) to select a video resolution if you want a constant resolution.
* Auto-Hide the Progressbar & Controlbar:
    * HTML5 Player: Default operation of this script.
    * Flash Player: Use [Youtube Center](https://github.com/YePpHa/YouTubeCenter/wiki).
* If using [Youtube Center](https://github.com/YePpHa/YouTubeCenter/wiki):
  *  Version 1.31+ should automatically set these settings for you.
    *   Unchecked **YT Center Settings > Player > Player Size > Enable Resize**.
    *   Unchecked **YT Center Settings > Player > General > Scroll to Video**. YT Center will scroll to the wrong location.

# Screenshots

**After loading the video webpage you will see:**

[![](https://i.imgur.com/ja8Kx.jpg)](https://i.imgur.com/ja8Kx.jpg)

**It appears above the rest of the site, so you can scroll down for the description, related links, etc.**

[![](https://i.imgur.com/RiodhIb.jpg)](https://i.imgur.com/RiodhIb.jpg)

# Changelog

https://github.com/Zren/ResizeYoutubePlayerToWindowSize/blob/master/changelog.md

## 53 - Feb 22, 2015

* Fix double audio bug after clicking a video on the homepage/search page.
* No longer reloading the html5 player to get the `playerInstance`. We are instead creating an unused dummy `playerInstance` to get the reference to it's constructor, which has a static list of the list of active `playerInstances`.
* Reattempt to subscribe to `pubsub` events 1 second later if we get an error.
