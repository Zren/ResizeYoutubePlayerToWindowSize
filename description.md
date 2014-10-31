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

## 1.44 - Oct 31, 2014

* Fix a second video player getting loaded when running this script along Youtube Center, this reintroduces the progressbar bug for users with YT Center. Please use the [dev build of YT Center](https://github.com/YePpHa/YouTubeCenter/raw/master/dist/YouTubeCenter.user.js) until the author pushes the fix to the main build.

## 1.43 - Oct 30, 2014

* Fix HTML5 progress bar not resizing. Thanks to [YePpHa](https://github.com/YePpHa/) for re-solving this bug in YoutubeCenter [Issue #1083](https://github.com/YePpHa/YouTubeCenter/issues/1083).
* Completely hide the Player controls on the HTML5 player since we're reloading the player anyways.
