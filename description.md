# Suggestions
* [Youtube Center](https://github.com/YePpHa/YouTubeCenter/wiki) now has this feature with a few more options in their script. Check out **YT Center Settings > Player > Fullscreen Top Player**.
* Use [Yays!](http://eugenox.appspot.com/script/yays) or [Youtube Center](https://github.com/YePpHa/YouTubeCenter/wiki) to select a video resolution if you want a constant resolution.
* Auto-Hide the Progressbar & Controlbar with [Youtube Center](https://github.com/YePpHa/YouTubeCenter/wiki).
* If using [Youtube Center](https://github.com/YePpHa/YouTubeCenter/wiki):
  *  Version 1.31+ should automatically set these settings for you.
    *   Unchecked **YT Center Settings > Player > Player Size > Enable Resize**.
    *   Unchecked **YT Center Settings > Player > General > Scroll to Video**. YT Center will scroll to the wrong location.
* The **HTML5 player** was only designed to be sized at 640px or 848px wide. Thus, the progress bar will not be resized. Using the flash player will "fix" this. 

# Screenshots

**After loading the video webpage you will see:**

[![](https://i.imgur.com/ja8Kx.jpg)](http://i.imgur.com/ja8Kx.jpg)

**It appears above the rest of the site, so you can scroll down for the description, related links, etc.**

[![](https://i.imgur.com/RiodhIb.jpg)](http://i.imgur.com/RiodhIb.jpg)

# Changelog

## 1.41 - Aug 11, 2014

* Remove poorly done HTML5 fix. The HTML5 progress bar will remain unfixed until a Youtube update provides the ability to resize it.
* Use CSS absolutly positioning to move the player. This should fix playback restarting while moving the player.
