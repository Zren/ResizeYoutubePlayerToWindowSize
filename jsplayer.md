base.js defines the classes and exposes them at window._yt_player
a watch page will add a script tag that sets window.ytplayer.config
then immeditately calls Application.create(), but doesn't expose the app instance
ytplayer.load = function() {yt.player.Application.create("player-api", ytplayer.config);ytplayer.config.loaded = true;};(function() {if (!!window.yt && yt.player && yt.player.Application) {ytplayer.load();}}());
Application.create does store the app instance in a list, 
but it's no longer accessible.
Reinitializing the player will work, but may cause a 2nd #movie_player element to be created. 

Application.create() will call

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
;


The g variable is an alias for _yt_player.
We can monkey patch g.WU since it's passed the "c = this" variable as it's first argument.

g.WU=function(a,b){return b?1==b?a.o:a.Ra[b]||null:a.C}; // Chrome
g.ZU=function(a,b){return b?1==b?a.o:a.Ra[b]||null:a.C}; // Firefox

We then take that instance and patch app[key1][key2]()
where the value of key1 has a property called element that points to #movie_player
app[key1].element = #movie_player
The value of key2 is the function we need to patch.
We use regex detect if it's source looks like the following.

function(){var a=this.app.Z,b=g.pF()==this.element;if(b&&IE())return new g.Vd(window.outerWidth,window.outerHeight);if(b||a.mi){if(window.matchMedia){a="(width: "+window.innerWidth+"px) and (height: "+window.innerHeight+"px)";this.C&&this.C.media==a||(this.C=window.matchMedia(a));var c=this.C&&this.C.matches}if(c)return new g.Vd(window.innerWidth,window.innerHeight)}else if(this.P&&!this.app.oa)for(a=0;a<this.P.length;a++)if(b=this.P[a],b.query.matches)return new g.Vd(b.size.width,b.size.height);
return new g.Vd(this.element.clientWidth,this.element.clientHeight)};

we then call another function that'll update the DOM.
