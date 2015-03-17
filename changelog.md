<h3>Changelog</h3>

## 56 - Mar 16, 2015

* Update HTML5 fix regexes.

## 56 - Mar 2, 2015

* Update HTML5 fix regexes.

## 55 - Feb 24, 2015

* Update HTML5 fix regexes.

## 54 - Feb 23, 2015

* Fix double audio bug after clicking a video on the homepage/search page.
* No longer reloading the html5 player to get the `playerInstance`. We are instead creating an unused dummy `playerInstance` to get the reference to it's constructor, which has a static list of the list of active `playerInstances`.
* Reattempt to subscribe to `pubsub` events 1 second later if we get an error.

## 53 - Feb 12, 2015

* Fix double audio due to not doing a null check.
* Hide `Skip navigation` text that overlays the video.

## 52 - Jan 28, 2015

* Search with regex for function that need replacing in HTML5 player.

## 1.51 - Jan 27, 2015

* Update HTML5 fix variables and check in case things have changed.

## 1.50 - Jan 24, 2015

* New HTML5 player fix method which should fix any weird video => video navigation bugs.

## 1.49 - Jan 9, 2015

* Update to the new "detailpage" variable for the HTML5 fix.

## 1.48 - Dec 20, 2014

* Update to the new "detailpage" variable for the HTML5 fix.

## 1.47 - Dec 11, 2014

* Fix bug when visiting a non /watch page first before navigation to the watch video page.
* Update to the new "detailpage" variable for the HTML5 fix.

## 1.46 - Nov 15, 2014

* Remote undoing the HTML5 player fix before navigating to a new video as it isn't needed.

## 1.45 - Nov 12, 2014

* Re fix the progress bar scaling issue.
* Undo the HTML5 player fix before navigating to a new video in order to also load the video description / comments.

## 1.44 - Oct 31, 2014

* Fix a second video player getting loaded when running this script along Youtube Center, this reintroduces the progressbar bug for users with YT Center. Please use the [dev build of YT Center](https://github.com/YePpHa/YouTubeCenter/raw/master/dist/YouTubeCenter.user.js) until the author pushes the fix to the main build.

## 1.43 - Oct 30, 2014

* Fix HTML5 progress bar not resizing. Thanks to [YePpHa](https://github.com/YePpHa/) for re-solving this bug in YoutubeCenter [Issue #1083](https://github.com/YePpHa/YouTubeCenter/issues/1083).
* Completely hide the Player controls on the HTML5 player since we're reloading the player anyways.

## 1.42 - Aug 18, 2014

* Fix HTML5 progress bar not resizing. Thanks to [YePpHa](https://github.com/YePpHa/) for solving this bug in YoutubeCenter. [[Screenshot](https://i.imgur.com/FcLISVq.png)]
* Fix the player getting right aligned in some cases. [[Screenshot]](https://greasyfork.org/forum/uploads/FileUpload/95/4d455197513c65d1aa243a0d800133.jpg)
* Prevent the script from running twice on the same page.

## 1.41 - Aug 11, 2014

* Remove poorly done HTML5 fix. The HTML5 progress bar will remain unfixed until a Youtube update provides the ability to resize it.
* Use CSS absolutly positioning to move the player. This should fix playback restarting while moving the player.

## 1.40 - July 23, 2014

* Attempt to fix the html5 player. The seek bar & annotations might not scale properly.

## 1.39 - July 12, 2014

* Remove debugging code that broke the script due to a raise in javascript execution security.

## 1.38 - June 17, 2014

* Style `#watch7-sidebar {top: 0 !important; }` to fix the sidebar overlapping the player.
* Fix the guide from being off position when viewing the video.

<p>
  <h4>1.37 - May 13, 2014</h4>
  <ul>
    <li>Style the new <code>#player-mole-container</code> element. It had a height of 0, which was hiding the player.</li>
  </ul>
</p>

<p>
  <h4>1.36 - March 22, 2014</h4>
  <ul>
    <li>[<a href="https://github.com/YePpHa/YouTubeCenter/issues/349">Link</a>] BugFix: On the HTML5 player, resizing it to a non standard width will cause the cursor in the seek bar to not line up. In order to fix this, the script now removes the <code>.watch-small</code>, <code>.watch-medium</code> or <code>.watch-large</code> from the <code>#player</code> element.</li>
  </ul>
</p>

<p>
  <h4>1.35 - Febuary 12, 2014</h4>
  <ul>
    <li>Hook into the <code>appbar-guide-delay-load</code> event. It should be called on every single page however, unlike the other events...</li>
    <li>Fix another regression from rewriting the script: check if the script is on a <code>/watch?</code> page before runnning.</li>
  </ul>
</p>

<p>
  <h4>1.34 - Febuary 7, 2014</h4>
  <ul>
    <li>Re add code to move the playlist as not all users might have updated to the new UI.</li>
  </ul>
</p>

<p>
  <h4>1.33 - Febuary 7, 2014</h4>
  <ul>
    <li>Check the previous player state before moving to decide to autoplay or not.</li>
  </ul>
</p>

<p>
  <h4>1.32 - Febuary 7, 2014</h4>
  <ul>
    <li>Fix issue where video would bug when playing videoes in a row.</li>
    <li>Refactored script.</li>
    <li>Autoplay videos as moving the player pauses the video.</li>
  </ul>
</p>

<p>
  <h4>1.31 - October 28, 2013</h4>
  <ul>
    <li>Automatically uncheck relevant YT Center settings for the user. This is done during the <code>player-added</code> event simply because it (should) be after YT Center is up and running.</li>
  </ul>
</p>

<p>
  <h4>1.30 - October 28, 2013</h4>
  <ul>
    <li>Create a placeholder to mark where the player was, so we can move it back there during a SPF navigation.</li>
    <li>Hook into the <code>init-watch</code> and <code>dispose-watch</code> events rather than the ones used before (<code>player-added</code> and <code>navigate</code>).</li>
  </ul>
</p>

<p>
  <h4>1.29 - October 26, 2013</h4>
  <ul>
    <li>Minor CSS update to fix padding below the playlist tray caused by todays update.</li>
  </ul>
</p>

<p>
  <h4>1.28 - October 23, 2013</h4>
  <ul>
    <li>[<a href="https://userscripts.org/topics/132874">Thread</a>] Update the fixed header so it doesn't overlay the video.</li>
  </ul>
</p>

<p>
  <h4>1.27 - September 8, 2013</h4>
  <ul>
    <li>Go back to moving the #player element rather than #player-api as the playlist bar is no longer attached above it.</li>
  </ul>
</p>

<p>
  <h4>1.26 - August 20, 2013</h4>
  <ul>
    <li>Remove references to <code>-legacy</code>.</li>
    <li>Check the <code>window.location.href</code> for <code>/watch?</code> to run the script. The old way no longer works (checking for <code>#player-api</code>) as it's now pregenerated even on the homepage.</li>
    <li>Add debugging ouput to the console.</li>
    <li>Move the Video Manager bar into <code>#watch7-content</code> so that it fits in seemlessly [<a href="http://i.imgur.com/OqiVBkg.png">Screenshot</a>].</li>
  </ul>
</p>

<p>
  <h4>1.25 - August 15, 2013</h4>
  <ul>
    <li>The script now moves the playlist bar and tray. The playlist tray is moved into the sidebar element.</li>
    <li>General cleanup of unused styling.</li>
    <li>Don't remove the script selector from the body element during AJAX navigation as it looks weird if you notice the removal of this scripts styling. Youtube will removes it later (at a proper time) anyways.</li>
    <li>Only hide the horizontal scrollbar when fully scrolled to the top.</li>
  </ul>
</p>

<p>
  <h4>1.24 - August 15, 2013</h4>
  <ul>
    <li>[<a href="https://userscripts.org/topics/129717">Thread</a>] Update for today's Youtube update. <code>#player-api</code> → <code>#player-api-legacy</code>.</li>
  </ul>
</p>

<p>
  <h4>1.23 - August 11, 2013</h4>
  <ul>
    <li>[<a href="https://userscripts.org/topics/129562">Thread</a>] Bug Fix for users using Youtube Center. Had to override the height on the <code>#player</code> element.</li>
  </ul>
</p>

<p>
  <h4>1.22 - August 10, 2013</h4>
  <ul>
    <li>[<a href="https://userscripts.org/topics/129495">Thread</a>] Bug Fix for users using Firefox. The <code>#player-api</code> element had a <code>float: left;</code> on it. The UI in general doesn't seem to have had the update Chrome does (no fixed header + guide).</li>
  </ul>
</p>

<p>
  <h4>1.21 - August 1, 2013</h4>
  <ul>
    <li>[<a href="https://userscripts.org/topics/129111">Thread</a>] Wrap an exception caused by the <code>window.yt</code> not yet existing when the script gets run in NinjaKit on Safari. Will possibly cause <a href="https://userscripts.org/topics/128760">this bug</a> to resurface when using safari.</li>
  </ul>
</p>

<p>
  <h4>1.20 - July 30, 2013</h4>
  <ul>
    <li>Fix <a href="http://userscripts.org/topics/129094">bug</a> in Firefox/Greasemonkey where the script would break trying to get the <code>window.yt</code> object reference by changing all references to <code>window</code> to <code>unsafeWindow</code>.</li>
  </ul>
</p>

<p>
  <h4>1.19 - July 30, 2013</h4>
  <ul>
    <li>Run the script slightly earlier at the <code>player-added</code> event.</li>
    <li>The horizontal scrollbar is now hidden until the video is no longer visible.</li>
    <li>Fix bug where the playlist tray was overlapping the video.</li>
    <li>Fix bug where the script was run twice on page load.</li>
  </ul>
</p>

<p>
  <h4>1.18 - July 28, 2013</h4>
  <ul>
    <li>
      I managed to find a proper place to hook into Youtube's new AJAX technique. Wrapping <code>window.history.pushState</code> didn't seem to work. On a further look, it also seems like I should have tried wrapping <code>replaceState</code> as well. Instead of wrapping <code>ytspf.config</code> like Youtube Center, I've found <code>yt.pubsub.instance_.subscribe(eventName, callback)</code>. The bugs listed in 1.17 are fixed.
      <ul>
        <li>Listen to the <code>navigate</code> event which is triggered before the page loads through AJAX in order to perform a cleanup (delete the video player as it's out of position).</li>
        <li>Listen to the <code>player-ready</code> event in order to move the player.</li>
      </ul>
    </li>
  </ul>
</p>


<p>
  <h4>1.17 - July 26, 2013</h4>
  Youtube's latest update now loads new pages through ajax (and also when you click a Youtube link in Google).
  <ul>
    <li>Temporarily move the main selector used to identify the script <code>body.ytwp-window-player</code> to <code>html.ytwp-window-player body</code>. Navigating to a new page through ajax will clear all classes attached to the body element.</li>
  </ul>

  Until I've managed to hook into Youtube's new SPF/Ajax technique, the following bugs will be prevalent.
  <ul>
    <li>Visiting the homepage, then clicking a video won't cause the script to run.</li>
    <li>Visiting the homepage (or any other url) will still show the last video above the page.</li>
  </ul>
</p>

<p>
  <h4>1.16 - July 24, 2013</h4>
  <ul>
    <li>Use unsafeWindow.addEventListener(...) instead of window.onresize = function(){...}. window.addEventListener was broken in the recent version of Tampermonkey, but should work now.</li>
  </ul>
</p>

<p>
  <h4>1.15 - July 19, 2013</h4>
  <ul>
    <li>Use absolute positioning on the guide until the user has scrolled past the video completely.</li>
    <li>Do checks for if the video is in view (for switching to the fixed header) when the window is resized.</li>
  </ul>
</p>

<p>
  <h4>1.14 - July 16, 2013</h4>
  <ul>
    <li>Minor refactor on the last update and removed a debugging <code>console.log()</code>.</li>
  </ul>
</p>

<p>
  <h4>1.13 - July 16, 2013</h4>
  <ul>
    <li>Use absolute positioning on the fixed header until the user has scrolled past the video completely. It will add the class <code>ytwp-viewing-video</code> to the body element when doing so.</li>
  </ul>
</p>

<p>
  <h4>1.12 - July 15, 2013</h4>
  <ul>
    <li>Remove some whitespace from some large areas of whitespace caused by branded pages (<a href="http://i.imgur.com/Re06imh.jpg">Example</a>).</li>
    <li>Resize the playlist tray to the same width as the sidebar.</li>
    <li>Inject the completed stylesheet instead of updating as the script runs.</li>
  </ul>
</p>

<p>
  <h4>1.11 - May 7, 2013</h4>
  <ul>
    <li>Fix edge case missed in the last version. There was another rule that affected the padding-left when the guide was collapsed and under the small page width media query.</li>
  </ul>
</p>

<p>
  <h4>1.10 - May 7, 2013</h4>
  <ul>
    <li>Fix padding on the playlist bar when using 'Center Page' in YT Center.</li>
  </ul>
</p>

<p>
  <h4>1.9 - May 3, 2013</h4>
  <ul>
    <li>Removed <code>padding</code> and <code>margin-top</code> override on <code>#player</code>.</li>
    <li>Adjusted selectors for the sidebar due to the shifting of element/classes.</li>
  </ul>
</p>

<p>
  <h4>1.8 - Apr 2, 2013</h4>
  <ul>
    <li>Change all occurance of <code>#playlist-main-container</code> to <code>#playlist</code>.</li>
    <li>Use <code>!important</code> when settings <code>margin-top</code> on the sidebar due to it being set at element level (only on non-playlist pages).</li>
    <li>Fix styling margins on the sidebar on pages with the playlist bar.</li>
  </ul>
</p>

<p>
  <h4>1.7 - Mar 20, 2013</h4>
  <ul>
    <li>Updated for Youtube's new layout. <code>#watch7-video-container</code> became <code>#player</code>, <code>#watch7-video</code> became <code>#player-api</code>.</li>
    <li>The fixed Feedback button code was removed (no longer there).</li>
    <li>Raised the <code>z-index</code> of the <code>#watch7-creator-bar</code> due to the <code>#guide</code> overlaying it and making the buttons unclickable. This is most likely a side effect of the last patch because the <code>#watch7-creator-bar</code> was a child of <code>#watch7-video-container</code> and therafor was no longer moved with the video (speculation). The creator bar currently looks <a href="http://i.imgur.com/rMqaVpy.png">like so</a>.</li>
  </ul>
</p>

<p>
  <h4>1.6 - Feb 28, 2013</h4>
  <ul>
    <li>Script is now only run on the /watch page.</li>
    <li>Removed whitespace margin leftover from moving the video.</li>
    <li>The script now moves the <code>#watch7-video</code> instead of the <code>#watch7-video-container</code> element due to Youtube's new update which will move the <code>#watch7-playlist-container</code> element above the <code>#watch7-video-container</code> element. An example of this new bug can be seen <a href="http://i.imgur.com/pqyuduU.png">here</a>.</li>
    <li>Fixed typo in local variable name.</li>
  </ul>
</p>

<p>
  <h4>1.5 - Feb 5, 2013</h4>
  <ul>
    <li>Refactored code to inject overriding CSS instead of applying styling to the elements themselves.</li>
    <li>Deleted the Feedback element altogether.</li>
    <li>Fixed compatibility with YT Center. (<a href="http://userscripts.org/topics/122305?page=1#posts-480909">Forum Post</a>)</li>
    <li>Fixed styling of the Video Manager bar when browsing your own videos. (<a href="http://userscripts.org/topics/122305?page=1#posts-481046">Forum Post</a>) (<a href="http://i569.photobucket.com/albums/ss134/tom053/window-player-own-video-bug.jpg">Example</a>)</li>
    <li>Added css class to the <code>body</code> tag so people can style around this effects of this script. Use <code>body.ytwp-window-player</code> with your selector(s).</li>
    <li>Overwrote the smooth resizing of the video player.</li>
  </ul>
</p>

<p>
  <h4>1.4 - Jan 6, 2013</h4>
  <ul>
    <li>Fixed the video getting resized when opening the guide (<a href="http://i.imgur.com/V60lu.png">Example</a>).</li>
    <li>Moved the fixed Feedback element to the bottom of the page (<a href="http://i.imgur.com/z5pxM.png">Example</a>).</li>
  </ul>
</p>

<p>
  <h4>1.3 - Dec 27, 2012</h4>
  <ul>
    <li>Fix styling on pages with a playlist bar by:
      <ul>
        <li>Moving down the related videos with the small video player</li>
        <li>Fixing the width of the playlist bar and un-hiding the toggle playlist button in large video mode.</li>
      </ul>
    </li>
    <li>Update script metadata.</li>
  </ul>
</p>

<p>
  <h4>1.2</h4>
  <ul>
    <li>Fixed styling to work in small video mode.</li>
    <li>Fixed styling to work in FireFox. Examples: <a href="http://i.imgur.com/HmR0z.png">[1]</a> | <a href="http://i.imgur.com/LrQR6.png">[2]</a>. <i>Note that the feedback button was moved in later versions.</i></li>
  </ul>
</p>
