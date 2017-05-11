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

## 99 - May 10, 2017

* Undo the update for the control bar since it can cause a second instance of the player.

## 98 - May 8, 2017

* Quick update for the control bar monkey patch. We need to reinit the player so it's slightly slower than normal. Unfortunately the list of players isn't exposed anymore.

## 97 - May 8, 2017

* Fix the info card button in the top right. Example of button: https://www.youtube.com/watch?v=XGu-WCyiaEY
* Make it easy to edit the script to set the player to a fixed height.
