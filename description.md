Chrome users: **Uninstall Sylish!** This script will now hide the scrollbar by default (and only on video pages) now that Stylish went to the dark side and is used to spy on the websites you visit by "tracking you anonymously" by default.

# Suggestions
* Use [Resize Video To Window Size](https://greasyfork.org/en/scripts/10815-resize-video-to-window-size) for Crunchyroll, Vimeo, and a few others.

# Screenshots

**After loading the video webpage you will see:**

[![](https://i.imgur.com/GDeEDPA.png)](https://i.imgur.com/GDeEDPA.png)

**It appears above the rest of the site, so you can scroll down for the description, related links, etc.**

[![](https://i.imgur.com/RiodhIb.jpg)](https://i.imgur.com/RiodhIb.jpg)

# Changelog

https://github.com/Zren/ResizeYoutubePlayerToWindowSize/blob/master/changelog.md

## 101 - May 11, 2017

* Finish the last regex for applying the control bar fix on page load, control bar should now work in firefox.

## 100 - May 11, 2017

* Patch the player with a newer method to retrieve the app instance. Works for Chrome, but firefox needs one more regex update. Will push a final fix for firefox later today.

## 102 - June 18, 2017

* Fix regex checks in FF v54.
* Attempt to fix resizing the progressbar after a few vidoes have played.
* Fix detection for video -> video page changes.
* Keep track of the player size instead of querying the element every time it's looked up (which is a lot).
