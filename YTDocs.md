# Youtube Player Documentation

## 2023 Oct 31

https://www.youtube.com/s/desktop/9e7f5697/jsbin/desktop_polymer_enable_wil_icons.vflset/desktop_polymer_enable_wil_icons.js

Note, `yt-navigate-start` does not fire on web browser Back button ([Issue #76](https://github.com/Zren/ResizeYoutubePlayerToWindowSize/issues/76)). `document` events fire before `window` events.

```js
document.addEventListener('yt-navigate-start', function(){ console.log('document.yt-navigate-start', arguments)})
document.addEventListener('yt-navigate-finish', function(){ console.log('document.yt-navigate-finish', arguments)})
document.addEventListener('yt-navigate-error', function(){ console.log('document.yt-navigate-error', arguments)})
document.addEventListener('yt-navigate-redirect', function(){ console.log('document.yt-navigate-redirect', arguments)})
document.addEventListener('yt-navigate-cache', function(){ console.log('document.yt-navigate-cache', arguments)})
document.addEventListener('yt-navigate-action', function(){ console.log('document.yt-navigate-action', arguments)})
document.addEventListener('yt-navigate-home-action', function(){ console.log('document.yt-navigate-home-action', arguments)})
document.addEventListener('yt-page-data-fetched', function(){ console.log('document.yt-page-data-fetched', arguments)})
window.addEventListener('yt-navigate-start', function(){ console.log('window.yt-navigate-start', arguments)})
window.addEventListener('yt-navigate-finish', function(){ console.log('window.yt-navigate-finish', arguments)})
window.addEventListener('yt-navigate-error', function(){ console.log('window.yt-navigate-error', arguments)})
window.addEventListener('yt-navigate-redirect', function(){ console.log('window.yt-navigate-redirect', arguments)})
window.addEventListener('yt-navigate-cache', function(){ console.log('window.yt-navigate-cache', arguments)})
window.addEventListener('yt-navigate-action', function(){ console.log('window.yt-navigate-action', arguments)})
window.addEventListener('yt-navigate-home-action', function(){ console.log('window.yt-navigate-home-action', arguments)})
window.addEventListener('yt-page-data-fetched', function(){ console.log('window.yt-page-data-fetched', arguments)})
```

```js
    T8c = function (a, b) {
      a.listen(b, 'yt-navigate-start', 'onYtNavigateStart');
      a.listen(b, 'yt-navigate-finish', 'onYtNavigateFinish');
      a.listen(b, 'yt-navigate-error', 'onYtNavigateError');
      a.listen(b, 'yt-page-data-fetched', 'onYtPageDataFetched');
      a.listen(b, 'yt-navigate-redirect', 'onYtNavigateRedirect')
    };
    f = C6.prototype;
    f.detached = function () {
      var a = rp().resolve(BE);
      this.unlisten(a, 'yt-navigate-start', 'onYtNavigateStart');
      this.unlisten(a, 'yt-navigate-finish', 'onYtNavigateFinish');
      this.unlisten(a, 'yt-navigate-error', 'onYtNavigateError');
      this.unlisten(a, 'yt-page-data-fetched', 'onYtPageDataFetched');
      this.unlisten(document, 'yt-navigate-cache', 'onYtNavigateCache');
      this.unlisten(a, 'yt-navigate-redirect', 'onYtNavigateRedirect');
      this.ytActionHandlerBehavior.unregisterActionMap(this.appBehaviorActionMap)
    };
```

```js
a.actionMap = {
'yt-command-executor-command': 'handleCommandWithCommandHandler',
'yt-dark-mode-toggled-action': 'onDarkModeToggledAction',
'yt-edu-dismiss-action': 'handleEduDismissAction',
'yt-edu-impression-action': 'handleEduImpressionAction',
'yt-navigate-action': 'onYtNavigateAction',
'yt-navigate-home-action': 'onYtNavigateHomeAction',
'yt-player-fullscreen': 'onPlayerFullscreen',
'yt-register-create-family-dialog': 'onYtRegisterCreateFamilyDialog',
'yt-select-country-command': 'handleSelectCountryCommand',
'yt-select-language-command': 'handleSelectLanguageCommand',
'yt-clear-url-param-command': 'handleClearUrlParamCommand',
'yt-set-cookie-command': 'onSetCookieCommand',
'yt-set-pref-storage-entry-command': 'onSetPrefStorageEntryCommand',
'yt-set-local-storage-command': 'onSetLocalStorageCommand',
'yt-set-push-notifications-enabled-command': 'onSetPushNotificationsEnabledCommand',
'yt-signal-action-copy-debug-data': 'onYtSignalActionCopyDebugData',
'yt-signal-action-enable-chrome-notifications': 'onYtSignalActionEnableChromeNotifications',
'yt-signal-action-toggle-restricted-mode-on': 'onYtSignalActionToggleRestrictedModeOnAction',
'yt-signal-action-toggle-restricted-mode-off': 'onYtSignalActionToggleRestrictedModeOffAction',
'yt-signal-action-confirm-mentions-edu': 'onYtSignalActionConfirmMentionsEdu',
'yt-signal-action-record-mentions-edu-impression': 'onYtSignalActionRecordMentionsEduImpression',
'yt-signal-action-show-keyboard-shortcut-dialog': 'onYtSignalActionShowKeyboardShortcutDialog',
'yt-signal-action-skip-navigation': 'onYtSignalActionSkipNavigation',
'yt-signal-action-request-persistent-storage': 'onYtSignalActionRequestPersistentStorage',
'yt-timed-command': 'onYtTimedCommand',
'yt-window-resized': 'onWindowResized',
'yt-window-scrolled': 'onWindowScrolled',
'yt-persist-subscriptions-display-preferences-command': 'handlePersistSubscriptionsDisplayPreferencesCommand',
'yt-invoke-instrument-manager-action': 'onInvokeInstrumentManagerAction',
'yt-entity-update-command': 'handleEntityUpdateCommand',
'yt-web-native-share-command': 'handleWebNativeShareCommand',
'yt-confirm-dialog-endpoint': 'handleConfirmDialogEndpoint',
'yt-ad-feedback-endpoint': 'handleOpenPopupNavigationEndpoints',
'yt-create-backstage-post-dialog-endpoint': 'handleOpenPopupNavigationEndpoints',
'yt-manage-purchase-endpoint': 'handleOpenPopupNavigationEndpoints',
'yt-modal-endpoint': 'handleOpenPopupNavigationEndpoints',
'yt-unlimited-family-flow-endpoint': 'handleOpenPopupNavigationEndpoints',
'yt-ypc-cancel-survey-endpoint': 'handleOpenPopupNavigationEndpoints',
'yt-register-promo-command': 'handleYtRegisterPromoCommand',
'yt-location-collection-command': 'onYtLocationCollectionCommand',
'yt-get-location-command': 'onYtGetLocationCommand',
'yt-log-flow-logging-event-command': 'logFlowLoggingEventCommand',
'yt-save-command-to-session-storage-action': 'handleSaveCommandToSessionStorage',
'yt-show-dma-consent-flow-command': 'handleShowDmaConsentFlow',
'yt-signal-action-show-dma-consent-flow': 'handleShowDmaConsentFlow',
'yt-signal-action-toggle-dark-theme-on': 'handleSignalActionToggleDarkThemeOn',
'yt-signal-action-toggle-dark-theme-off': 'handleSignalActionToggleDarkThemeOff',
'yt-signal-action-toggle-dark-theme-device': 'handleSignalActionToggleDarkThemeDevice',
'yt-select-active-identity-endpoint': 'handleSelectActiveIdentityEndpointInternal',
'yt-update-permission-role-command': 'handleUpdatePermissionRoleCommand',
'yt-channel-creation-form-endpoint': 'handleYtChannelCreationFormEndpoints',
'yt-google-payment-billing-command': 'handleCommandWithCommandHandler'
}
```


## 2017 May 11

`base.js` defines the classes and exposes them at `window._yt_player`
a watch page will add a script tag that sets `window.ytplayer.config`
then immeditately calls `Application.create()`, but doesn't expose the app instance.

```js
ytplayer.load = function() {
  yt.player.Application.create("player-api", ytplayer.config);
  ytplayer.config.loaded = true;
};
(function() {
  if (!!window.yt && yt.player && yt.player.Application) {
    ytplayer.load();
  }
}());
```

`Application.create` does store the app instance in a list, 
but it's no longer accessible.
Reinitializing the player will work, but may cause a 2nd `#movie_player` element to be created.

`Application.create()` will call

```js
O1 = function(a, b) {
    g.M.call(this);
    var c = this;
    this.ca = Xia(b);
    var d = this.ca.args || {};
    this.Z = new zO(d);
    g.N(this, this.Z);
    this.Z.experiments.g("legacy_autoplay_flag") || "detailpage" != this.Z.g || (d.autoplay = "1");
    this.Bc = dO("detailpage" == this.Z.g && "blazer" != this.Z.o, d.enablesizebutton);
    this.oa = dO(!1, d.player_wide);
    this.V = this.Z.Fb && dO(!1, d.external_list);
    this.va = (this.qc = this.Z.Fb && dO(!1, d.external_play_video)) && this.Z.experiments.g("player_unified_fullscreen_transitions");
    this.P = new g.BL(this);
    g.N(this, this.P);
    Gc = function(a, b) {
        g.kE(b, "WARNING")
    }
    ;
    this.Oa = null;
    this.K = new g.cD;
    this.ba = new g.cD;
    this.da = new N1(this.ba);
    this.da.pause();
    this.g = new PU(this);
    g.N(this, this.g);
    this.J = new PU(this,1);
    g.N(this, this.J);
    this.F = new bZ(this);
    g.N(this, this.F);
    this.O = 1;
    this.Va = {};
    this.M = this.Z.storeUserVolume ? Cja() : {
        volume: 100,
        muted: this.Z.mute
    };
    this.aa = this.Z.Fb ? new YJ(this,1) : new bJ(this,1);
    g.N(this, this.aa);
    this.D = null;
    this.Ra = {};
    d = {};
    this.xb = (d.internalAbandon = this.RL,
    d.internalvideodatachange = this.QL,
    d.playbackready = this.SL,
    d.playbackstarted = this.TL,
    d.statechange = this.UL,
    d.signatureexpired = this.YO,
    d);
    this.A = Lna(this);
    g.N(this, this.A);
    this.G = new zP(this.Z,"",this.A);
    this.o = Mna(this);
    d = {};
    this.tc = (d.airplayactivechange = this.HL,
    d.airplayavailabilitychange = this.IL,
    d.beginseeking = this.cM,
    d.endseeking = this.QM,
    d.internalAbandon = this.iN,
    d.internalaudioformatchange = this.WL,
    d.internalvideodatachange = this.vr,
    d.internalvideoformatchange = this.BP,
    d.liveviewshift = this.oN,
    d.playbackstalledatstart = this.eP,
    d.progresssync = this.RI,
    d.seekto = this.SI,
    d.onLoadProgress = this.pN,
    d.onVideoProgress = this.VI,
    d.playbackready = this.lO,
    d.statechange = this.cA,
    d.connectionissue = this.AM,
    d.newelementrequired = this.SN,
    d.heartbeatparams = this.OI,
    d.videoelementevent = this.TI,
    d);
    this.C = null;
    this.ra = new zZ(5,function(a) {
        a != g.WU(c, a.getPlayerType()) && a.dispose()
    }
    );
    g.N(this, this.ra);
    this.zb = this.Bb = -1;
    this.sb = new g.nt(this.F.Zf,16,this.F);
    g.N(this, this.sb);
    this.tb = !1;
    this.fa = !0;
    this.sa = this.Na = this.B = null;
    this.Hb = !1;
    this.Tb = this.sc = null;
    this.ob = this.ga = 0;
    this.ka = this.Ja = !1;
    this.Fa = this.ha = null;
    this.P.T(this.g, "crn_appapi", this.OL);
    this.P.T(this.g, "crx_appapi", this.PL);
    this.P.T(this.g, "crn_appad", this.mz);
    this.P.T(this.g, "crx_appad", this.mz);
    this.P.T(this.g, "presentingplayerstatechange", this.QI);
    this.P.T(this.g, "resize", this.IO);
    this.F.Ia(g.ae(a));
    this.Xb = this.Z.experiments.g("html5_enable_embedded_player_visibility_signals") && this.Z.A ? new BZ(this.F.element) : null;
    g.N(this, this.Xb);
    g.ND = this.Z.ba;
    Nna(this);
    this.G.o("fs");
    Ona(this);
    this.Fa = new L1(this.g);
    this.A.C = this.Fa;
    this.Fa.init();
    g.dV(this.J, "init")
}
```

The `g` variable is an alias for `_yt_player`.
We can monkey patch `g.WU` since it's passed the "c = this" variable as it's first argument.

```js
g.WU=function(a,b){return b?1==b?a.o:a.Ra[b]||null:a.C}; // Chrome
g.ZU=function(a,b){return b?1==b?a.o:a.Ra[b]||null:a.C}; // Firefox
```

We then take that instance and patch `app[key1][key2]()`
where the value of `key1` has a property called element that points to `#movie_player`

```js
app[key1].element = #movie_player`
```

The value of `key2` is the function we need to patch.
We use regex detect if it's source looks like the following.

```js
function(){var a=this.app.Z,b=g.pF()==this.element;if(b&&IE())return new g.Vd(window.outerWidth,window.outerHeight);if(b||a.mi){if(window.matchMedia){a="(width: "+window.innerWidth+"px) and (height: "+window.innerHeight+"px)";this.C&&this.C.media==a||(this.C=window.matchMedia(a));var c=this.C&&this.C.matches}if(c)return new g.Vd(window.innerWidth,window.innerHeight)}else if(this.P&&!this.app.oa)for(a=0;a<this.P.length;a++)if(b=this.P[a],b.query.matches)return new g.Vd(b.size.width,b.size.height);
return new g.Vd(this.element.clientWidth,this.element.clientHeight)};
```

we then call another function that'll update the DOM.


## 2013 May 3

`.watch-playlist-collapsed` and `.watch-medium` now attach to `#player`

```
#watch7-container .watch-playlist
  #player .watch-playlist-collapsed .watch-medium (moved)
    #playlist (Moved to inside #player)
      #watch7-playlist-scrollfloater
        #watch7-playlist-bar
      #watch7-playlist-data
        #watch7-playlist-bar
#watch7-main-container
  ...
```

The following pubsub events fire when you scroll to see the comments since ~2017-02-14.

```
pubsub1 yt-www-pageFrameCssNotifications-load
pubsub1 yt-www-comments-page-updated
```

Something fires on scroll that needs to fire, otherwise the next button doesn't work,
and autoplay doesn't work either.

```
/watch_fragments_ajax
  ?v=9BJ3jDWlOHE
  &list=WL
  &index=15
  &tr=scroll
  &distiller=1
  &ctoken=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa%253D
    decode this param with atob(decodeURIComponent(decodeURIComponent("...")))
  &frags=comments
  &spf=load
```


## 2013  April 2

`#watch7-playlist-container` --renamed--> `#playlist`


## 2013 March 20

`#watch7-video-container` --renamed--> `#watch7-container` (renamed back then?)

```
#player (#watch7-playlist-container is injected above this element)
  #player-api
    embed#movie_player
  #watch7-creator-bar
```


## 2013 March ?

```
#watch7-video-container (#watch7-playlist-container is injected above this element)
  #watch7-video
    #watch-player ?
      embed#movie_player ?
```

