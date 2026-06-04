var ImmersiveScene = (function() {

function I(container, sculptures, invitadosData) {
    this.container = container;
    this.sculptures = sculptures;
    this.invitadosData = invitadosData || [];
    this.sculptureMeshes = [];
    this.isActive = true;
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
    this.joystickX = 0;
    this.joystickY = 0;
    this.isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this.giftMeshes = [];
    this.invitedMeshes = [];
    this.audioSlots = [];

    var len = sculptures.length * 6 + 12;
    this.config = {
        backgroundColor: 0x0a0a0a,
        fogColor: 0x1a1a1a,
        fogDensity: 0.0015,
        ambientIntensity: 0.6,
        corridorLength: len,
        corridorWidth: 6,
        corridorHeight: 4.5,
        wallColor: 0x2a221a,
        floorColor: 0x1a1815
    };

    this.init();
}

function _createWallTexture(baseColor) {
    var c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    var ctx = c.getContext('2d');
    var r = (baseColor >> 16) & 0xff;
    var g = (baseColor >> 8) & 0xff;
    var b = baseColor & 0xff;
    ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
    ctx.fillRect(0, 0, 256, 256);
    for (var i = 0; i < 3000; i++) {
        var x = Math.floor(Math.random() * 256);
        var y = Math.floor(Math.random() * 256);
        var v = (Math.random() - 0.5) * 18;
        ctx.fillStyle = 'rgba(' + Math.max(0, r + v) + ',' + Math.max(0, g + v) + ',' + Math.max(0, b + v) + ',0.25)';
        ctx.fillRect(x, y, 2 + Math.floor(Math.random() * 4), 2 + Math.floor(Math.random() * 4));
    }
    for (var j = 0; j < 12; j++) {
        var lx = Math.floor(Math.random() * 200 + 28);
        ctx.strokeStyle = 'rgba(' + Math.max(0, r - 15) + ',' + Math.max(0, g - 15) + ',' + Math.max(0, b - 8) + ',0.12)';
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.beginPath();
        ctx.moveTo(lx, 0);
        ctx.lineTo(lx + (Math.random() - 0.5) * 8, 256);
        ctx.stroke();
    }
    return new THREE.CanvasTexture(c);
}

function _buildArtFrame(self, hw, lado, zPos, yPos, iw, ih, fw, fh, xPos, rotY, faceDir) {
    var backing = new THREE.Mesh(
        new THREE.PlaneGeometry(fw, fh),
        new THREE.MeshStandardMaterial({ color: 0x1a0f08, roughness: 0.5, metalness: 0.6, side: THREE.DoubleSide })
    );
    backing.position.set(xPos + faceDir * 0.005, yPos, zPos);
    backing.rotation.y = rotY;
    self.scene.add(backing);

    var bordeOro = new THREE.Mesh(
        new THREE.PlaneGeometry(fw + 0.06, fh + 0.06),
        new THREE.MeshStandardMaterial({ color: 0xc9a96e, roughness: 0.2, metalness: 0.8, emissive: 0x221100, emissiveIntensity: 0.04, side: THREE.DoubleSide })
    );
    bordeOro.position.set(xPos + faceDir * 0.015, yPos, zPos);
    bordeOro.rotation.y = rotY;
    self.scene.add(bordeOro);

    var mat = new THREE.MeshStandardMaterial({
        color: 0x1a1510,
        roughness: 0.7,
        metalness: 0.1,
        side: THREE.DoubleSide
    });
    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(iw, ih), mat);
    mesh.position.set(xPos + faceDir * 0.03, yPos, zPos);
    mesh.rotation.y = rotY;
    self.scene.add(mesh);

    var plaque = new THREE.Mesh(
        new THREE.PlaneGeometry(1.6, 0.24),
        new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8, metalness: 0.1, side: THREE.DoubleSide })
    );
    plaque.position.set(xPos + faceDir * 0.03, yPos - ih / 2 - 0.26, zPos);
    plaque.rotation.y = rotY;
    self.scene.add(plaque);

    var spot = new THREE.SpotLight(0xfff0dd, 1.8, 6, Math.PI / 7, 0.3, 0.5);
    spot.position.set(lado === -1 ? -hw + 0.5 : hw - 0.5, 4.0, zPos);
    spot.target.position.set(xPos + faceDir * 0.03, yPos, zPos);
    spot.castShadow = true;
    self.scene.add(spot);
    self.scene.add(spot.target);

    var gl = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffeedd }));
    gl.position.copy(spot.position);
    self.scene.add(gl);

    return { mesh: mesh, plaque: plaque, mat: mat };
}

I.prototype = {
    init: function() {
        var self = this;
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.config.backgroundColor);
        this.scene.fog = new THREE.FogExp2(this.config.fogColor, this.config.fogDensity);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.container.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.set(0, 1.7, 0.5);
        this.euler.set(0, Math.PI, 0, 'YXZ');
        this.camera.quaternion.setFromEuler(this.euler);
        this.clock = new THREE.Clock();

        this.setupLighting();
        this.createCorridor();
        this.createFloor();
        this.createCeiling();
        this.loadSculptures();
        this.createInvitedCorridor();

        var bgMusic = document.createElement('audio');
        bgMusic.loop = true;
        bgMusic.volume = 0.12;
        bgMusic.src = URL_AUDIO + '/GymnopedieNo.1.mp3';
        bgMusic.play().catch(function(){});
        this._bgMusic = bgMusic;

        this._boundAnimate = function() { self.animate(); };
        this.animId = requestAnimationFrame(this._boundAnimate);

        this._boundResize = function() { self.onResize(); };
        window.addEventListener('resize', this._boundResize);

        this._onPointerLock = function() {
            if (!self.renderer) return;
            if (document.pointerLockElement !== self.renderer.domElement) {
                self.moveForward = false;
                self.moveBackward = false;
                self.moveLeft = false;
                self.moveRight = false;
            }
        };
        document.addEventListener('pointerlockchange', this._onPointerLock);

        if (this.isMobile) {
            this.setupMobileControls();
        } else {
            this.setupDesktopControls();
        }
    },

    setupLighting: function() {
        var c = this.config;
        this.scene.add(new THREE.AmbientLight(0xffeedd, 0.5));
        this.scene.add(new THREE.HemisphereLight(0xffeedd, 0x1a1a2e, 0.4));

        var ml = new THREE.PointLight(0xffe4c4, 2.5, 30);
        ml.position.set(0, 6, 0);
        ml.castShadow = true;
        this.scene.add(ml);

        for (var z = -2; z < c.corridorLength; z += 3) {
            var s = new THREE.SpotLight(0xffeedd, 1.2, 10, Math.PI / 5, 0.4, 0.8);
            s.position.set(0, c.corridorHeight - 0.2, z);
            s.target.position.set(0, 0, z);
            this.scene.add(s);
            this.scene.add(s.target);
            var g = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffeedd }));
            g.position.set(0, c.corridorHeight - 0.3, z);
            this.scene.add(g);
        }
    },

    createCorridor: function() {
        var c = this.config;
        var hw = c.corridorWidth / 2, h = c.corridorHeight, len = c.corridorLength;

        var wallTex = _createWallTexture(c.wallColor);
        wallTex.wrapS = THREE.RepeatWrapping;
        wallTex.wrapT = THREE.RepeatWrapping;
        wallTex.repeat.set(4, 2);

        var wm = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.85, metalness: 0.05, side: THREE.DoubleSide });

        this._wallMaterial = wm;

        var lw = new THREE.Mesh(new THREE.PlaneGeometry(len, h), wm);
        lw.rotation.y = Math.PI / 2;
        lw.position.set(-hw, h / 2, len / 2);
        lw.receiveShadow = true;
        this.scene.add(lw);
        this._leftWall = lw;

        this._buildRightWall(hw, h, len, wm);

        var wd = new THREE.MeshStandardMaterial({ color: 0x1a1510, roughness: 0.9, side: THREE.DoubleSide });
        var bw = new THREE.Mesh(new THREE.PlaneGeometry(h, len), wd);
        bw.position.set(0, h / 2, -0.1);
        this.scene.add(bw);

        var ew = new THREE.Mesh(new THREE.PlaneGeometry(h, len), wd);
        ew.position.set(0, h / 2, len + 0.1);
        this.scene.add(ew);

        var bm = new THREE.MeshStandardMaterial({ color: 0x2a2218, roughness: 0.55, metalness: 0.15 });
        for (var z = 0; z < len; z += 3) {
            var b = new THREE.Mesh(new THREE.BoxGeometry(hw * 2, 0.15, 3), bm);
            b.position.set(0, 0.075, z + 1.5);
            b.receiveShadow = true;
            this.scene.add(b);
            var t = new THREE.Mesh(new THREE.BoxGeometry(hw * 2, 0.12, 3), bm);
            t.position.set(0, h - 0.06, z + 1.5);
            this.scene.add(t);
        }
    },

    _buildRightWall: function(hw, h, len, wm) {
        var gapStart = len - 10;
        var gapEnd = len - 4;
        var gapCenter = (gapStart + gapEnd) / 2;
        var gapSize = gapEnd - gapStart;

        var seg1Len = gapStart;
        if (seg1Len > 0) {
            var seg1 = new THREE.Mesh(new THREE.PlaneGeometry(seg1Len, h), wm);
            seg1.rotation.y = -Math.PI / 2;
            seg1.position.set(hw, h / 2, seg1Len / 2);
            seg1.receiveShadow = true;
            this.scene.add(seg1);
        }

        var seg2Start = gapEnd;
        var seg2Len = len - seg2Start;
        if (seg2Len > 0) {
            var seg2 = new THREE.Mesh(new THREE.PlaneGeometry(seg2Len, h), wm);
            seg2.rotation.y = -Math.PI / 2;
            seg2.position.set(hw, h / 2, seg2Start + seg2Len / 2);
            seg2.receiveShadow = true;
            this.scene.add(seg2);
        }

        var archMat = new THREE.MeshStandardMaterial({ color: 0xc9a96e, roughness: 0.3, metalness: 0.7, emissive: 0x221100, emissiveIntensity: 0.05, side: THREE.DoubleSide });

        var archH = 4.0;
        var archW = 0.35;
        var archD = 0.25;
        var archLeft = new THREE.Mesh(new THREE.BoxGeometry(archW, archH, archD), archMat);
        archLeft.position.set(hw, archH / 2, gapStart);
        this.scene.add(archLeft);

        var archRight = new THREE.Mesh(new THREE.BoxGeometry(archW, archH, archD), archMat);
        archRight.position.set(hw, archH / 2, gapEnd);
        this.scene.add(archRight);

        var archTop = new THREE.Mesh(new THREE.BoxGeometry(archW, 0.25, gapSize), archMat);
        archTop.position.set(hw, archH, gapCenter);
        this.scene.add(archTop);

        var bannerX = hw - 0.20;
        var btc = document.createElement('canvas');
        btc.width = 512; btc.height = 80;
        var btx = btc.getContext('2d');
        btx.fillStyle = '#0a0a0a'; btx.fillRect(0, 0, btc.width, btc.height);
        btx.fillStyle = '#c9a96e';
        btx.font = 'bold 30px Georgia, serif';
        btx.textAlign = 'center'; btx.textBaseline = 'middle';
        btx.fillText('Artistas Invitados', btc.width / 2, btc.height / 2);
        var banner = new THREE.Mesh(
            new THREE.PlaneGeometry(1.6, 0.22),
            new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(btc), side: THREE.DoubleSide, transparent: true })
        );
        banner.position.set(bannerX, archH + 0.35, gapCenter);
        banner.rotation.y = -Math.PI / 2;
        this.scene.add(banner);

        this._invitedOpening = { zMin: gapStart, zMax: gapEnd, xStart: hw, archHeight: archH };
    },

    createFloor: function() {
        var c = this.config;
        var fc = document.createElement('canvas');
        fc.width = 512; fc.height = 512;
        var fctx = fc.getContext('2d');

        fctx.fillStyle = '#ebe7e0';
        fctx.fillRect(0, 0, 512, 512);

        for (var i = 0; i < 3000; i++) {
            var fx = Math.floor(Math.random() * 512);
            var fy = Math.floor(Math.random() * 512);
            var fv = (Math.random() - 0.5) * 18;
            fctx.fillStyle = 'rgba(' + Math.floor(225 + fv) + ',' + Math.floor(222 + fv) + ',' + Math.floor(216 + fv) + ',0.12)';
            fctx.fillRect(fx, fy, 2 + Math.random() * 3, 2 + Math.random() * 3);
        }

        fctx.strokeStyle = 'rgba(180,176,170,0.1)';
        fctx.lineWidth = 1;
        for (var j = 0; j < 18; j++) {
            var sx = Math.random() * 512;
            var sy = Math.random() * 512;
            fctx.beginPath();
            fctx.moveTo(sx, sy);
            for (var k = 0; k < 6; k++) {
                sx += (Math.random() - 0.5) * 80;
                sy += (Math.random() - 0.5) * 80;
                fctx.lineTo(Math.max(0, Math.min(512, sx)), Math.max(0, Math.min(512, sy)));
            }
            fctx.stroke();
        }

        fctx.strokeStyle = 'rgba(190,187,180,0.06)';
        fctx.lineWidth = 2.5;
        for (var m = 0; m < 10; m++) {
            var mx = Math.random() * 512;
            var my = Math.random() * 512;
            fctx.beginPath();
            fctx.moveTo(mx, my);
            for (var n = 0; n < 8; n++) {
                mx += (Math.random() - 0.5) * 120;
                my += (Math.random() - 0.5) * 120;
                fctx.lineTo(Math.max(0, Math.min(512, mx)), Math.max(0, Math.min(512, my)));
            }
            fctx.stroke();
        }

        this._floorTex = new THREE.CanvasTexture(fc);
        this._floorTex.wrapS = THREE.RepeatWrapping;
        this._floorTex.wrapT = THREE.RepeatWrapping;
        this._floorTex.repeat.set(8, Math.ceil(c.corridorLength / 2));

        var f = new THREE.Mesh(
            new THREE.PlaneGeometry(c.corridorWidth + 2, c.corridorLength + 2),
            new THREE.MeshStandardMaterial({ map: this._floorTex, roughness: 0.35, metalness: 0.15, color: 0xffffff })
        );
        f.rotation.x = -Math.PI / 2;
        f.position.set(0, -0.01, c.corridorLength / 2);
        f.receiveShadow = true;
        this.scene.add(f);
    },

    createCeiling: function() {
        var c = this.config;
        var cl = new THREE.Mesh(
            new THREE.PlaneGeometry(c.corridorWidth, c.corridorLength),
            new THREE.MeshStandardMaterial({ color: 0x0a0907, roughness: 0.9 })
        );
        cl.rotation.x = Math.PI / 2;
        cl.position.set(0, c.corridorHeight, c.corridorLength / 2);
        this.scene.add(cl);
    },

    loadSculptures: function() {
        var hw = this.config.corridorWidth / 2;
        var self = this;

        this.sculptures.forEach(function(art, i) {
            var lado = i % 2 === 0 ? -1 : 1;
            var zPos = i * 6 + 4;
            var yPos = 1.85;
            var aspect = (art.width && art.height) ? art.width / art.height : 4 / 3;
            var iw = 1.8 * aspect, ih = 1.8;
            var fw = iw + 0.16, fh = ih + 0.16;
            var xPos = lado === -1 ? -hw + 0.18 : hw - 0.18;
            var rotY = lado === -1 ? Math.PI / 2 : -Math.PI / 2;
            var faceDir = lado === -1 ? 1 : -1;

            var parts = _buildArtFrame(self, hw, lado, zPos, yPos, iw, ih, fw, fh, xPos, rotY, faceDir);

            if (art.title) {
                var tc = document.createElement('canvas');
                tc.width = 768; tc.height = 96;
                var tx = tc.getContext('2d');
                tx.fillStyle = '#111111'; tx.fillRect(0, 0, tc.width, tc.height);
                tx.fillStyle = '#d4b85f';
                tx.textAlign = 'center'; tx.textBaseline = 'middle';
                var fontSize = 30;
                tx.font = 'bold ' + fontSize + 'px Georgia, serif';
                var maxTextW = tc.width - 40;
                var txt = art.title;
                while (tx.measureText(txt).width > maxTextW && fontSize > 16) {
                    fontSize -= 1;
                    tx.font = 'bold ' + fontSize + 'px Georgia, serif';
                }
                if (tx.measureText(txt).width > maxTextW) {
                    while (txt.length > 3 && tx.measureText(txt + '...').width > maxTextW) {
                        txt = txt.substring(0, txt.length - 1);
                    }
                    txt = txt + '...';
                }
                tx.fillText(txt, tc.width / 2, tc.height / 2);
                var tm = new THREE.Mesh(
                    new THREE.PlaneGeometry(1.5, 0.22),
                    new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(tc), side: THREE.DoubleSide, transparent: true })
                );
                tm.position.set(xPos + faceDir * 0.04, yPos - ih / 2 - 0.32, zPos);
                tm.rotation.y = rotY;
                self.scene.add(tm);
            }

            if (art.image) {
                self._loadImg(art.image, parts.mat);
            }

            if (art.audio) {
                var audioEl = document.createElement('audio');
                audioEl.preload = 'auto';
                audioEl.src = art.audio;
                audioEl.volume = 0.85;
                self.audioSlots.push({
                    el: audioEl,
                    zPos: zPos,
                    xPos: xPos,
                    playing: false,
                    lastToggle: 0
                });
            }
        });

        this.createGiftPanel(hw);
    },

    _loadImg: function(url, mat) {
        if (!url) return;
        var loader = new THREE.TextureLoader();
        loader.load(url, function(tex) {
            mat.map = tex;
            mat.color.setHex(0xffffff);
            mat.needsUpdate = true;
        }, undefined, function(err) {
            console.error('[ImmersiveScene] Error cargando textura:', url, err);
        });
    },

    createGiftPanel: function(hw) {
        var gz = this.config.corridorLength - 3;
        var gy = 2.0;
        var self = this;

        if (window._galeriaRegaloEntregado) {
            this.giftZone = { zMin: gz - 3, zMax: gz + 1, triggered: true };
            return;
        }

        var frame = new THREE.Mesh(
            new THREE.BoxGeometry(2.6, 2.1, 0.1),
            new THREE.MeshStandardMaterial({ color: 0xc9a96e, roughness: 0.3, metalness: 0.7, emissive: 0x221100, emissiveIntensity: 0.08 })
        );
        frame.position.set(0, gy, gz);
        this.giftMeshes.push(frame);
        this.scene.add(frame);

        var inner = new THREE.Mesh(
            new THREE.BoxGeometry(2.3, 1.8, 0.05),
            new THREE.MeshStandardMaterial({ color: 0x1a0f08, roughness: 0.5, metalness: 0.3 })
        );
        inner.position.set(0, gy, gz + 0.08);
        this.giftMeshes.push(inner);
        this.scene.add(inner);

        var glm = new THREE.Mesh(
            new THREE.PlaneGeometry(3.0, 2.5),
            new THREE.MeshBasicMaterial({ color: 0xc9a96e, transparent: true, opacity: 0.12 })
        );
        glm.position.set(0, gy, gz - 0.08);
        glm.rotation.y = Math.PI;
        this.giftMeshes.push(glm);
        this.scene.add(glm);

        var tc = document.createElement('canvas');
        tc.width = 512; tc.height = 100;
        var tx = tc.getContext('2d');
        tx.fillStyle = '#111111'; tx.fillRect(0, 0, tc.width, tc.height);
        tx.fillStyle = '#c9a96e';
        tx.font = 'bold 28px Georgia, serif';
        tx.textAlign = 'center'; tx.textBaseline = 'middle';
        tx.fillText('Un regalo de agradecimiento', tc.width / 2, 35);
        tx.fillStyle = '#8b949e';
        tx.font = '15px Georgia, serif';
        tx.fillText('por visitar mi exposici\u00f3n', tc.width / 2, 72);
        var tm = new THREE.Mesh(
            new THREE.PlaneGeometry(1.6, 0.35),
            new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(tc), side: THREE.DoubleSide, transparent: true })
        );
        tm.position.set(0, gy - 0.85, gz - 0.1);
        tm.rotation.y = Math.PI;
        this.giftMeshes.push(tm);
        this.scene.add(tm);

        var giftMat = new THREE.MeshStandardMaterial({ color: 0x2a2218, roughness: 0.7, metalness: 0.1 });
        var giftMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.3), giftMat);
        giftMesh.position.set(0, gy + 0.08, gz - 0.1);
        giftMesh.rotation.y = Math.PI;
        this.giftMeshes.push(giftMesh);
        this.scene.add(giftMesh);

        self._loadImg('/static/images/regalo.jpeg', giftMat);

        this.giftZone = { zMin: gz - 3, zMax: gz + 1, triggered: false };
    },

    hideGiftPanel: function() {
        for (var i = 0; i < this.giftMeshes.length; i++) {
            this.scene.remove(this.giftMeshes[i]);
        }
        this.giftMeshes = [];
        if (this.giftZone) {
            this.giftZone.triggered = true;
        }
    },

    createInvitedCorridor: function() {
        if (!this._invitedOpening) return;
        var io = this._invitedOpening;
        var self = this;

        var sideLen = 12;
        var sideWidth = 5.5;
        var sideHeight = 4.0;
        var sideHw = sideWidth / 2;
        var baseX = io.xStart;
        var baseZ = (io.zMin + io.zMax) / 2;

        var wallMat = this._wallMaterial || new THREE.MeshStandardMaterial({ color: 0x2a221a, roughness: 0.85, metalness: 0.05, side: THREE.DoubleSide });

        var sideFloorTex = this._floorTex;
        if (!sideFloorTex) {
            sideFloorTex = new THREE.CanvasTexture(document.createElement('canvas'));
        }

        var floor = new THREE.Mesh(
            new THREE.PlaneGeometry(sideLen, sideWidth),
            new THREE.MeshStandardMaterial({ map: sideFloorTex, roughness: 0.35, metalness: 0.15, color: 0xffffff })
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(baseX + sideLen / 2, -0.01, baseZ);
        floor.receiveShadow = true;
        this.scene.add(floor);

        var ceil = new THREE.Mesh(
            new THREE.PlaneGeometry(sideLen, sideWidth),
            new THREE.MeshStandardMaterial({ color: 0x0a0907, roughness: 0.9 })
        );
        ceil.rotation.x = Math.PI / 2;
        ceil.position.set(baseX + sideLen / 2, sideHeight, baseZ);
        this.scene.add(ceil);

        var farWall = new THREE.Mesh(
            new THREE.PlaneGeometry(sideWidth, sideHeight),
            new THREE.MeshStandardMaterial({ color: 0x1a1510, roughness: 0.9, side: THREE.DoubleSide })
        );
        farWall.position.set(baseX + sideLen, sideHeight / 2, baseZ);
        farWall.rotation.y = -Math.PI / 2;
        this.scene.add(farWall);

        var frontWall = new THREE.Mesh(
            new THREE.PlaneGeometry(sideLen, sideHeight),
            new THREE.MeshStandardMaterial({ color: 0x2a221a, roughness: 0.85, metalness: 0.05, side: THREE.DoubleSide })
        );
        frontWall.position.set(baseX + sideLen / 2, sideHeight / 2, baseZ - sideHw);
        this.scene.add(frontWall);

        var backWall = new THREE.Mesh(
            new THREE.PlaneGeometry(sideLen, sideHeight),
            new THREE.MeshStandardMaterial({ color: 0x2a221a, roughness: 0.85, metalness: 0.05, side: THREE.DoubleSide })
        );
        backWall.position.set(baseX + sideLen / 2, sideHeight / 2, baseZ + sideHw);
        this.scene.add(backWall);

        for (var sx = baseX + 0.5; sx < baseX + sideLen - 0.5; sx += 3) {
            var sl = new THREE.SpotLight(0xffeedd, 1.0, 8, Math.PI / 5, 0.3, 0.5);
            sl.position.set(sx, sideHeight - 0.3, baseZ);
            sl.target.position.set(sx, 1.5, baseZ);
            this.scene.add(sl);
            this.scene.add(sl.target);
        }

        var invitados = this.invitadosData && this.invitadosData.length > 0
            ? this.invitadosData
            : [
                { title: 'Invitado 1', artist: '', image: null },
                { title: 'Invitado 2', artist: '', image: null },
                { title: 'Invitado 3', artist: '', image: null },
                { title: 'Invitado 4', artist: '', image: null },
                { title: 'Invitado 5', artist: '', image: null }
            ];

        var muralX = baseX + sideLen - 0.15;
        if (invitados.length > 0) {
            var primer = invitados[0];
            var muralMat = new THREE.MeshStandardMaterial({
                color: 0x1a1510,
                roughness: 0.7,
                metalness: 0.1,
                side: THREE.DoubleSide
            });
            var muralMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.35), muralMat);
            muralMesh.position.set(muralX, 2.0, baseZ);
            muralMesh.rotation.y = -Math.PI / 2;
            this.scene.add(muralMesh);

            if (primer.artist_image) {
                var url = primer.artist_image;
                if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
                    url = URL_GALLERY + '/' + url;
                }
                self._loadImg(url, muralMat);
            } else if (primer.image) {
                var url = primer.image;
                if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
                    url = URL_GALLERY + '/' + url;
                }
                self._loadImg(url, muralMat);
            } else {
                var mc = document.createElement('canvas');
                mc.width = 256; mc.height = 192;
                var mctx = mc.getContext('2d');
                mctx.fillStyle = '#1a1510'; mctx.fillRect(0, 0, 256, 192);
                mctx.fillStyle = '#c9a96e'; mctx.font = 'bold 18px Georgia, serif';
                mctx.textAlign = 'center'; mctx.textBaseline = 'middle';
                mctx.fillText(primer.artist || 'Artista', 128, 96);
                muralMat.map = new THREE.CanvasTexture(mc);
                muralMat.color.setHex(0xffffff);
                muralMat.needsUpdate = true;
            }

            var dtc = document.createElement('canvas');
            dtc.width = 512; dtc.height = 200;
            var dtx = dtc.getContext('2d');
            dtx.fillStyle = '#0a0a0a'; dtx.fillRect(0, 0, dtc.width, dtc.height);
            dtx.fillStyle = '#c9a96e';
            dtx.font = 'bold 26px Georgia, serif';
            dtx.textAlign = 'center'; dtx.textBaseline = 'middle';
            dtx.fillText(primer.artist || '', dtc.width / 2, 30);
            dtx.fillStyle = '#8b949e';
            dtx.font = '15px Georgia, serif';
            dtx.textAlign = 'left'; dtx.textBaseline = 'top';
            var fullDesc = (primer.artist_description || primer.description || '');
            var maxCharsPerLine = 55;
            var yLine = 62;
            for (var li = 0; li < fullDesc.length; li += maxCharsPerLine) {
                var line = fullDesc.substring(li, li + maxCharsPerLine);
                dtx.fillText(line, 20, yLine);
                yLine += 22;
                if (yLine > 180) break;
            }
            var descPlane = new THREE.Mesh(
                new THREE.PlaneGeometry(1.8, 0.7),
                new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(dtc), side: THREE.DoubleSide, transparent: true })
            );
            descPlane.position.set(muralX - 0.05, 0.85, baseZ);
            descPlane.rotation.y = -Math.PI / 2;
            this.scene.add(descPlane);
        }

        invitados.forEach(function(inv, i) {
            var lado = i % 2 === 0 ? -1 : 1;
            var zPos = baseZ + (lado === -1 ? -1.2 : 1.2);
            var xPos = baseX + 1.5 + (Math.floor(i / 2)) * 4.5;
            var yPos = 1.65;
            var iw = 1.3, ih = 1.0;
            var fw = iw + 0.14, fh = ih + 0.14;
            var rotY = lado === -1 ? Math.PI : 0;
            var faceDir = lado === -1 ? 1 : -1;
            var wallX = lado === -1 ? baseZ - sideHw : baseZ + sideHw;

            var backing = new THREE.Mesh(
                new THREE.PlaneGeometry(fw, fh),
                new THREE.MeshStandardMaterial({ color: 0x1a0f08, roughness: 0.5, metalness: 0.6, side: THREE.DoubleSide })
            );
            backing.position.set(xPos, yPos, wallX + faceDir * 0.005);
            backing.rotation.y = rotY;
            self.scene.add(backing);

            var borde = new THREE.Mesh(
                new THREE.PlaneGeometry(fw + 0.05, fh + 0.05),
                new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.25, metalness: 0.6, emissive: 0x110800, emissiveIntensity: 0.03, side: THREE.DoubleSide })
            );
            borde.position.set(xPos, yPos, wallX + faceDir * 0.012);
            borde.rotation.y = rotY;
            self.scene.add(borde);

            var mat = new THREE.MeshStandardMaterial({
                color: 0x1a1510,
                roughness: 0.7,
                metalness: 0.1,
                side: THREE.DoubleSide
            });
            var mesh = new THREE.Mesh(new THREE.PlaneGeometry(iw, ih), mat);
            mesh.position.set(xPos, yPos, wallX + faceDir * 0.022);
            mesh.rotation.y = rotY;
            self.scene.add(mesh);

            self.invitedMeshes.push(mesh);

            if (inv.image) {
                var imgUrl = inv.image;
                if (imgUrl && !imgUrl.startsWith('http://') && !imgUrl.startsWith('https://')) {
                    imgUrl = URL_GALLERY + '/' + imgUrl;
                }
                self._loadImg(imgUrl, mat);
            } else {
                var pic = document.createElement('canvas');
                pic.width = 128; pic.height = 96;
                var px = pic.getContext('2d');
                var hue = (i * 50 + 30) % 360;
                px.fillStyle = 'hsl(' + hue + ',12%,16%)';
                px.fillRect(0, 0, 128, 96);
                px.fillStyle = '#8b7355';
                px.font = 'bold 11px Georgia, serif';
                px.textAlign = 'center'; px.textBaseline = 'middle';
                px.fillText(inv.title || inv.name || '', 64, 48);
                var picTex = new THREE.CanvasTexture(pic);
                mat.map = picTex;
                mat.color.setHex(0xffffff);
                mat.needsUpdate = true;
            }

            var ltc = document.createElement('canvas');
            ltc.width = 320; ltc.height = 52;
            var ltx = ltc.getContext('2d');
            ltx.fillStyle = '#111111'; ltx.fillRect(0, 0, ltc.width, ltc.height);
            ltx.fillStyle = '#8b7355';
            ltx.font = 'bold 18px Georgia, serif';
            ltx.textAlign = 'center'; ltx.textBaseline = 'middle';
            ltx.fillText(inv.title || inv.name || '', ltc.width / 2, ltc.height / 2);
            var label = new THREE.Mesh(
                new THREE.PlaneGeometry(0.7, 0.12),
                new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(ltc), side: THREE.DoubleSide, transparent: true })
            );
            label.position.set(xPos, yPos - ih / 2 - 0.16, wallX + faceDir * 0.028);
            label.rotation.y = rotY;
            self.scene.add(label);

            var spot = new THREE.SpotLight(0xfff0dd, 1.2, 5, Math.PI / 7, 0.3, 0.5);
            spot.position.set(xPos, sideHeight - 0.5, wallX + faceDir * (-0.8));
            spot.target.position.set(xPos, yPos, wallX + faceDir * 0.022);
            self.scene.add(spot);
            self.scene.add(spot.target);
        });
    },

    setupDesktopControls: function() {
        var self = this;

        var overlay = document.createElement('div');
        overlay.id = 'pointerLockOverlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:30;background:rgba(0,0,0,0.65);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;font-family:sans-serif;transition:opacity 0.4s;pointer-events:auto;';
        overlay.innerHTML = '<div style="text-align:center"><div style="font-size:2.5rem;margin-bottom:1rem">🖱️</div><div style="color:#c9a96e;font-size:1.3rem;font-weight:600;margin-bottom:0.5rem">Click para explorar</div><div style="color:rgba(255,255,255,0.45);font-size:0.8rem"><kbd style="background:rgba(255,255,255,0.08);padding:2px 8px;border-radius:4px;margin:0 3px">W</kbd><kbd style="background:rgba(255,255,255,0.08);padding:2px 8px;border-radius:4px;margin:0 3px">A</kbd><kbd style="background:rgba(255,255,255,0.08);padding:2px 8px;border-radius:4px;margin:0 3px">S</kbd><kbd style="background:rgba(255,255,255,0.08);padding:2px 8px;border-radius:4px;margin:0 3px">D</kbd> para caminar &nbsp;|&nbsp; Mouse para mirar</div><div style="color:rgba(255,255,255,0.3);font-size:0.7rem;margin-top:0.8rem">Presiona ESC para liberar el cursor</div></div>';
        document.body.appendChild(overlay);

        function overlayClick(e) {
            e.stopPropagation();
            if (!self.renderer || !self.renderer.domElement) return;
            if (!document.body.contains(self.renderer.domElement)) return;
            self.renderer.domElement.requestPointerLock();
        }
        overlay.addEventListener('click', overlayClick);

        function onPointerLockChange() {
            if (!self.renderer || !self.renderer.domElement) return;
            if (document.pointerLockElement === self.renderer.domElement) {
                overlay.style.opacity = '0';
                overlay.style.pointerEvents = 'none';
                setTimeout(function() {
                    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                }, 500);
            } else {
                if (!document.getElementById('pointerLockOverlay')) {
                    overlay.style.opacity = '1';
                    overlay.style.pointerEvents = 'auto';
                    document.body.appendChild(overlay);
                }
            }
        }
        document.addEventListener('pointerlockchange', onPointerLockChange);

        function canvasClick(e) {
            if (!self.renderer || !self.renderer.domElement) return;
            if (!document.body.contains(self.renderer.domElement)) return;
            if (document.pointerLockElement !== self.renderer.domElement) {
                self.renderer.domElement.requestPointerLock();
            }
        }
        this.renderer.domElement.addEventListener('click', canvasClick);

        function onMouseMove(e) {
            if (!self.renderer) return;
            if (document.pointerLockElement !== self.renderer.domElement) return;
            self.euler.setFromQuaternion(self.camera.quaternion);
            self.euler.z = 0;
            self.euler.y -= e.movementX * 0.004;
            self.euler.x -= e.movementY * 0.004;
            self.euler.x = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, self.euler.x));
            self.camera.quaternion.setFromEuler(self.euler);
        }
        document.addEventListener('mousemove', onMouseMove);

        function onKeyDown(e) {
            if (!self.renderer) return;
            if (document.pointerLockElement !== self.renderer.domElement) return;
            switch (e.code) {
                case 'KeyW': case 'ArrowUp': e.preventDefault(); self.moveForward = true; break;
                case 'KeyS': case 'ArrowDown': e.preventDefault(); self.moveBackward = true; break;
                case 'KeyA': case 'ArrowLeft': e.preventDefault(); self.moveLeft = true; break;
                case 'KeyD': case 'ArrowRight': e.preventDefault(); self.moveRight = true; break;
            }
        }
        document.addEventListener('keydown', onKeyDown);

        function onKeyUp(e) {
            switch (e.code) {
                case 'KeyW': case 'ArrowUp': self.moveForward = false; break;
                case 'KeyS': case 'ArrowDown': self.moveBackward = false; break;
                case 'KeyA': case 'ArrowLeft': self.moveLeft = false; break;
                case 'KeyD': case 'ArrowRight': self.moveRight = false; break;
            }
        }
        document.addEventListener('keyup', onKeyUp);

        this._desktopCleanup = function() {
            overlay.removeEventListener('click', overlayClick);
            document.removeEventListener('pointerlockchange', onPointerLockChange);
            if (self.renderer && self.renderer.domElement) {
                self.renderer.domElement.removeEventListener('click', canvasClick);
            }
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        };
    },

    setupMobileControls: function() {
        var self = this;
        var lookTouchId = null, lookStartX = 0, lookStartY = 0;
        var stickTouchId = null;

        function isTouchOnInteractive(evt) {
            for (var i = 0; i < evt.changedTouches.length; i++) {
                var t = evt.changedTouches[i];
                var el = document.elementFromPoint(t.clientX, t.clientY);
                while (el) {
                    if (el.closest && (el.closest('.imm-ex') || el.closest('.rg-over') || el.closest('#rotarMsgWrap'))) {
                        return true;
                    }
                    el = el.parentElement;
                }
            }
            return false;
        }

        var base = document.createElement('div');
        base.id = 'joystickBase';
        base.style.cssText = 'position:fixed;left:20px;bottom:30px;width:120px;height:120px;z-index:25;background:rgba(255,255,255,0.06);border:2px solid rgba(255,255,255,0.12);border-radius:50%;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);touch-action:none;user-select:none;-webkit-user-select:none;';
        var knob = document.createElement('div');
        knob.style.cssText = 'width:50px;height:50px;border-radius:50%;background:rgba(201,169,110,0.3);border:2px solid rgba(201,169,110,0.5);touch-action:none;';
        base.appendChild(knob);
        document.body.appendChild(base);
        var radius = 35;

        function onStart(e) {
            if (isTouchOnInteractive(e)) return;
            for (var i = 0; i < e.changedTouches.length; i++) {
                var t = e.changedTouches[i];
                var r = base.getBoundingClientRect();
                var inside = t.clientX >= r.left && t.clientX <= r.right && t.clientY >= r.top && t.clientY <= r.bottom;
                if (inside && stickTouchId === null) {
                    stickTouchId = t.identifier;
                    e.preventDefault();
                } else if (lookTouchId === null) {
                    lookTouchId = t.identifier;
                    lookStartX = t.clientX; lookStartY = t.clientY;
                    e.preventDefault();
                }
            }
        }
        function onMove(e) {
            if (isTouchOnInteractive(e)) return;
            for (var i = 0; i < e.changedTouches.length; i++) {
                var t = e.changedTouches[i];
                if (t.identifier === stickTouchId) {
                    e.preventDefault();
                    var r = base.getBoundingClientRect();
                    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
                    var dx = t.clientX - cx, dy = t.clientY - cy;
                    var d = Math.sqrt(dx * dx + dy * dy);
                    if (d > radius) { dx = dx / d * radius; dy = dy / d * radius; }
                    knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
                    self.joystickX = dx / radius;
                    self.joystickY = -dy / radius;
                } else if (t.identifier === lookTouchId) {
                    e.preventDefault();
                    var ldx = t.clientX - lookStartX, ldy = t.clientY - lookStartY;
                    self.euler.setFromQuaternion(self.camera.quaternion);
                    self.euler.z = 0;
                    self.euler.y -= ldx * 0.005;
                    self.euler.x -= ldy * 0.005;
                    self.euler.x = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, self.euler.x));
                    self.camera.quaternion.setFromEuler(self.euler);
                    lookStartX = t.clientX; lookStartY = t.clientY;
                }
            }
        }
        function onEnd(e) {
            for (var i = 0; i < e.changedTouches.length; i++) {
                var t = e.changedTouches[i];
                if (t.identifier === stickTouchId) {
                    stickTouchId = null;
                    knob.style.transform = 'translate(0px,0px)';
                    self.joystickX = 0; self.joystickY = 0;
                }
                if (t.identifier === lookTouchId) lookTouchId = null;
            }
        }

        document.addEventListener('touchstart', onStart, { passive: false });
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onEnd);
        document.addEventListener('touchcancel', onEnd);

        this._mobileCleanup = function() {
            document.removeEventListener('touchstart', onStart);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend', onEnd);
            document.removeEventListener('touchcancel', onEnd);
            if (base.parentNode) base.parentNode.removeChild(base);
        };
    },

    animate: function() {
        if (!this.isActive) return;
        this.animId = requestAnimationFrame(this._boundAnimate);

        var delta = Math.min(this.clock.getDelta(), 0.1);
        var speed = this.isMobile ? 3.5 : 4.0;
        var mx = 0, mz = 0;

        if (this.isMobile) {
            var dz = 0.15;
            if (Math.abs(this.joystickX) > dz) mx = this.joystickX;
            if (Math.abs(this.joystickY) > dz) mz = -this.joystickY;
        } else {
            if (this.moveForward) mz -= 1;
            if (this.moveBackward) mz += 1;
            if (this.moveLeft) mx -= 1;
            if (this.moveRight) mx += 1;
        }

        if (mx !== 0 || mz !== 0) {
            var l = Math.sqrt(mx * mx + mz * mz);
            mx /= l; mz /= l;
            var fw = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
            fw.y = 0; fw.normalize();
            var rt = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
            rt.y = 0; rt.normalize();
            var mv = new THREE.Vector3().addScaledVector(fw, -mz).addScaledVector(rt, mx);
            if (mv.length() > 0) {
                mv.normalize().multiplyScalar(speed * delta);
                this.camera.position.add(mv);
            }
        }

        var hw = this.config.corridorWidth / 2 - 0.3;
        var inInvitedZone = false;
        if (this._invitedOpening) {
            var io = this._invitedOpening;
            inInvitedZone = this.camera.position.z >= io.zMin - 0.3 && this.camera.position.z <= io.zMax + 0.3 && this.camera.position.x > io.xStart - 0.5;
        }
        if (!inInvitedZone) {
            this.camera.position.x = Math.max(-hw, Math.min(hw, this.camera.position.x));
        }
        this.camera.position.z = Math.max(0.5, Math.min(this.config.corridorLength - 0.5, this.camera.position.z));
        this.camera.position.y = 1.7;

        if (inInvitedZone) {
            this.camera.position.x = Math.min(this.camera.position.x, io.xStart + 11.5);
            this.camera.position.z = Math.max(io.zMin + 0.3, Math.min(io.zMax - 0.3, this.camera.position.z));
        }

        if (this.giftZone && !this.giftZone.triggered && this.camera.position.z >= this.giftZone.zMin && this.camera.position.z <= this.giftZone.zMax) {
            this.giftZone.triggered = true;
            var ov = document.getElementById('regaloOverlay');
            if (ov) ov.classList.add('activo');
        }

        var now = performance.now();
        var proxThresh = 3.0;
        var cooldown = 800;
        var narracionActiva = false;
        for (var a = 0; a < this.audioSlots.length; a++) {
            var sl = this.audioSlots[a];
            var dx = this.camera.position.x - sl.xPos;
            var dz = this.camera.position.z - sl.zPos;
            var dist = Math.sqrt(dx * dx + dz * dz);
            if (dist < proxThresh && !sl.playing && (now - sl.lastToggle) > cooldown) {
                sl.el.currentTime = 0;
                sl.el.play().catch(function(){});
                sl.playing = true;
                sl.lastToggle = now;
            } else if (dist >= proxThresh && sl.playing && (now - sl.lastToggle + 400) > cooldown) {
                sl.el.pause();
                sl.playing = false;
                sl.lastToggle = now;
            }
            if (sl.playing) narracionActiva = true;
        }
        if (this._bgMusic) {
            var targetVol = narracionActiva ? 0.03 : 0.12;
            var currentVol = parseFloat(this._bgMusic.volume);
            var newVol = currentVol + (targetVol - currentVol) * 0.05;
            if (Math.abs(newVol - targetVol) < 0.001) newVol = targetVol;
            this._bgMusic.volume = newVol;
        }

        this.renderer.render(this.scene, this.camera);
    },

    onResize: function() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    },

    dispose: function() {
        this.isActive = false;
        if (this.animId) cancelAnimationFrame(this.animId);
        if (this._boundResize) window.removeEventListener('resize', this._boundResize);
        if (this._onPointerLock) document.removeEventListener('pointerlockchange', this._onPointerLock);
        if (this._desktopCleanup) this._desktopCleanup();
        this.renderer.dispose();
        if (this.container && this.container.contains(this.renderer.domElement)) {
            this.container.removeChild(this.renderer.domElement);
        }
        if (this._mobileCleanup) this._mobileCleanup();
        var jb = document.getElementById('joystickBase');
        if (jb && jb.parentNode) jb.parentNode.removeChild(jb);
        var ov = document.getElementById('pointerLockOverlay');
        if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
        var rw = document.getElementById('rotarMsgWrap');
        if (rw && rw.parentNode) rw.parentNode.removeChild(rw);
        if (document.pointerLockElement && document.pointerLockElement === this.renderer.domElement) {
            document.exitPointerLock();
        }
        for (var a = 0; a < this.audioSlots.length; a++) {
            var sl = this.audioSlots[a];
            sl.el.pause();
            sl.el.src = '';
            sl.el.load();
        }
        this.audioSlots = [];
        if (this._bgMusic) {
            this._bgMusic.pause();
            this._bgMusic.src = '';
            this._bgMusic = null;
        }
        this.scene = null;
        this.renderer = null;
        this.camera = null;
        this.container = null;
        this.sculptures = null;
    }
};

return I;
})();
