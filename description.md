# Suggestions

* The `w` key will toggle the script in the current tab.
* Use [Resize Video To Window Size](https://greasyfork.org/en/scripts/10815-resize-video-to-window-size) for Crunchyroll, Vimeo, and a few other sites.

# Screenshots

**After loading the video webpage you will see:**

[![](https://i.imgur.com/GDeEDPA.png)](https://i.imgur.com/GDeEDPA.png)

**It appears above the rest of the site, so you can scroll down for the description, related links, etc.**

[![](https://i.imgur.com/uVDKPUp.jpg)](https://i.imgur.com/uVDKPUp.jpg)

# Changelog

https://github.com/Zren/ResizeYoutubePlayerToWindowSize/blob/master/changelog.md

## v138 - January 9, 2024

* Bind toggle to `keydown` instead of `keyup` so that pressing `Ctrl+W` to close a tab does not trigger the YTWP toggle when you focus on a Youtube tab.

## v137 - November 1, 2023

* Bind to `yt-page-data-fetched` and `yt-navigate-finish` to fix the back button not cleaning up the window view since `yt-navigate-start` does not always fire (Issue #72 and #76)
* Bind `keyup` not `keypress` (which is deprecated). Also cancel event during `keydown`. This fixes the `w` key also changing the caption box style. It should also fix changing the toggle key to `Escape` (Issue #71)

## v139 - April 10, 2024

* Fix page top margin as certain elements seem to ignore the CSS properties completely (Issue #88)
