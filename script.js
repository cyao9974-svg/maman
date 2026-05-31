/* ==========================================================================
   SITE DE FÊTE DES MÈRES V2 - LOGIQUE INTERACTIVE ET EFFETS MAGIQUES OPTIMISÉS
   Auteur: Antigravity AI
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================================================
    // 1. ARCHIVES DE SOUVENIRS (PHOTOS) & PLAYLIST (SONS)
    // ==========================================================================
    
    // Les 16 photos de famille avec leur nom exact
    const familyImages = [
        "IMG_20230726_220202.jpg",
        "IMG_20231014_104719.jpg",
        "IMG_20231014_104733.jpg",
        "IMG_20231014_104817.jpg",
        "IMG_20231019_131442.jpg",
        "IMG_20231019_131445.jpg",
        "IMG_2600.JPG",
        "IMG_2607.JPG",
        "IMG_2623.JPG",
        "IMG_2652.JPG",
        "IMG_2958.JPG",
        "IMG_4864.JPG",
        "IMG_4962.JPG",
        "IMG_4980.JPG",
        "IMG_5044.JPG",
        "IMG_5049.JPG"
    ];

    // Les 4 musiques de fond fournies localement
    const audioPlaylist = [
        {
            title: "Maman la plus belle du monde",
            artist: "Luis Mariano",
            file: "Luis Mariano - Maman la plus belle du monde - Paroles - Lyrics.mp3"
        },
        {
            title: "Maman, tu es là ❤️",
            artist: "Chanson pour la fête des mères",
            file: "Maman, tu es là ❤️ Chanson pour la fête des mères.mp3"
        },
        {
            title: "Maman",
            artist: "Roméo",
            file: "Roméo - Maman.mp3"
        },
        {
            title: "Tout simplement maman",
            artist: "Charles Dumont",
            file: "Tout simplement maman - Charles Dumont.mp3"
        }
    ];

    let currentTrackIndex = 0;
    let isPlaying = false;
    let slideshowInterval = null;
    let activeSlideIndex = 0;
    let activeLightboxIndex = 0;
    let isTypewriterActive = false;
    let typewriterTimeout = null;

    // ==========================================================================
    // SÉLECTEURS DU DOM
    // ==========================================================================
    
    // Écran d'entrée
    const envelopeTrigger = document.getElementById("envelope-trigger");
    const entranceOverlay = document.getElementById("entrance-overlay");
    const mainContent = document.getElementById("main-content");

    // Lecteur Audio & Égaliseur
    const audioPlayer = document.getElementById("audio-player");
    const btnPlayPause = document.getElementById("btn-play-pause");
    const playIcon = document.getElementById("play-icon");
    const btnPrev = document.getElementById("btn-prev");
    const btnNext = document.getElementById("btn-next");
    const vinylDisk = document.getElementById("vinyl-disk");
    const vinylTonearm = document.getElementById("vinyl-tonearm");
    const audioEqualizer = document.getElementById("audio-equalizer");
    const trackTitle = document.getElementById("current-track-title");
    const trackArtist = document.getElementById("current-track-artist");
    const currentTimeEl = document.getElementById("current-time");
    const totalDurationEl = document.getElementById("total-duration");
    const progressFill = document.getElementById("progress-fill");
    const progressContainer = document.getElementById("progress-container");
    const volumeSlider = document.getElementById("volume-slider");
    const volumeIcon = document.getElementById("volume-icon");
    const playlistTracksContainer = document.getElementById("playlist-tracks");

    // Diaporama
    const slideshowContainer = document.getElementById("slideshow-container");
    const slidePrevBtn = document.getElementById("slide-prev");
    const slideNextBtn = document.getElementById("slide-next");
    const dotsIndicatorsContainer = document.getElementById("dots-indicators");

    // Galerie & Lightbox
    const galleryGrid = document.getElementById("gallery-grid");
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxCaption = document.getElementById("lightbox-caption");
    const lightboxClose = document.getElementById("lightbox-close");
    const lightboxPrevBtn = document.getElementById("lightbox-prev");
    const lightboxNextBtn = document.getElementById("lightbox-next");

    // Révélation lettre & Câlin Virtuel
    const typewriterContainer = document.getElementById("typewriter-container");
    const letterSignatureBlock = document.getElementById("letter-signature-block");
    const hugBtn = document.getElementById("hug-btn");

    // Canvas
    const canvas = document.getElementById("heart-particles");

    // ==========================================================================
    // 2. ÉCRAN D'ENTRÉE & LECTURE AUTOMATIQUE
    // ==========================================================================
    
    envelopeTrigger.addEventListener("click", () => {
        envelopeTrigger.classList.add("open");
        
        setTimeout(() => {
            entranceOverlay.classList.add("fade-out");
            mainContent.classList.remove("hidden");
            
            // Lancer le canvas de particules
            initParticles();
            
            // Charger et lancer l'audio de fond
            loadTrack(currentTrackIndex);
            playTrack();
            
            setTimeout(() => {
                mainContent.classList.add("visible");
                
                // Lancer le diaporama automatique
                startSlideshow();
                
                // Déclencher l'effet de machine à écrire de la lettre
                startLoveLetterTypewriter();
            }, 150);
            
        }, 950);
    });

    // ==========================================================================
    // 3. LECTEUR DE MUSIQUE SUR MESURE ET ÉGALISEUR ANIMÉ
    // ==========================================================================
    
    function renderPlaylist() {
        playlistTracksContainer.innerHTML = "";
        audioPlaylist.forEach((track, index) => {
            const trackItem = document.createElement("li");
            trackItem.className = `playlist-track-item ${index === currentTrackIndex ? 'active' : ''}`;
            trackItem.innerHTML = `
                <div class="track-info">
                    <span class="track-name-item">${track.title}</span>
                    <span class="track-artist-item">${track.artist}</span>
                </div>
                <i class="fa-solid fa-play track-play-icon"></i>
            `;
            
            trackItem.addEventListener("click", () => {
                if (currentTrackIndex === index && isPlaying) {
                    pauseTrack();
                } else {
                    currentTrackIndex = index;
                    loadTrack(currentTrackIndex);
                    playTrack();
                }
            });
            playlistTracksContainer.appendChild(trackItem);
        });
    }

    function loadTrack(index) {
        const track = audioPlaylist[index];
        audioPlayer.src = track.file; // Lecture directe
        trackTitle.textContent = track.title;
        trackArtist.textContent = track.artist;
        
        const trackItems = document.querySelectorAll(".playlist-track-item");
        trackItems.forEach((item, idx) => {
            if (idx === index) {
                item.classList.add("active");
            } else {
                item.classList.remove("active");
            }
        });
        
        progressFill.style.width = "0%";
        currentTimeEl.textContent = "0:00";
        totalDurationEl.textContent = "0:00";
    }

    function playTrack() {
        audioPlayer.play()
            .then(() => {
                isPlaying = true;
                playIcon.className = "fa-solid fa-pause";
                vinylDisk.classList.add("spinning");
                vinylTonearm.classList.add("playing");
                audioEqualizer.classList.add("playing");
            })
            .catch(error => {
                console.log("Lecture automatique bloquée :", error);
            });
    }

    function pauseTrack() {
        audioPlayer.pause();
        isPlaying = false;
        playIcon.className = "fa-solid fa-play";
        vinylDisk.classList.remove("spinning");
        vinylTonearm.classList.remove("playing");
        audioEqualizer.classList.remove("playing");
    }

    btnPlayPause.addEventListener("click", () => {
        if (isPlaying) {
            pauseTrack();
        } else {
            playTrack();
        }
    });

    btnPrev.addEventListener("click", () => {
        currentTrackIndex--;
        if (currentTrackIndex < 0) {
            currentTrackIndex = audioPlaylist.length - 1;
        }
        loadTrack(currentTrackIndex);
        playTrack();
    });

    btnNext.addEventListener("click", () => {
        currentTrackIndex++;
        if (currentTrackIndex >= audioPlaylist.length) {
            currentTrackIndex = 0;
        }
        loadTrack(currentTrackIndex);
        playTrack();
    });

    audioPlayer.addEventListener("ended", () => {
        btnNext.click();
    });

    audioPlayer.addEventListener("timeupdate", () => {
        if (audioPlayer.duration) {
            const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            progressFill.style.width = `${progressPercent}%`;
            
            currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
            totalDurationEl.textContent = formatTime(audioPlayer.duration);
        }
    });

    audioPlayer.addEventListener("loadedmetadata", () => {
        totalDurationEl.textContent = formatTime(audioPlayer.duration);
    });

    progressContainer.addEventListener("click", (e) => {
        const width = progressContainer.clientWidth;
        const clickX = e.offsetX;
        const duration = audioPlayer.duration;
        
        if (duration) {
            audioPlayer.currentTime = (clickX / width) * duration;
        }
    });

    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    volumeSlider.addEventListener("input", (e) => {
        const vol = e.target.value;
        audioPlayer.volume = vol;
        
        if (vol == 0) {
            volumeIcon.className = "fa-solid fa-volume-xmark";
        } else if (vol < 0.4) {
            volumeIcon.className = "fa-solid fa-volume-low";
        } else {
            volumeIcon.className = "fa-solid fa-volume-high";
        }
    });

    renderPlaylist();

    // ==========================================================================
    // 4. L'HOMMAGE PROFOND : MACHINE À ÉCRIRE PROGRESSIVE
    // ==========================================================================
    
    const letterSections = [
        { type: "salutation", text: "Maman, notre Reine, notre premier amour..." },
        { type: "p", text: "Si nous devions retenir une seule image de notre enfance, ce serait celle de ton regard protecteur, de tes mains douces qui ont apaisé nos fièvres et de ton cœur qui a battu pour nous avant même notre premier souffle." },
        { type: "p", text: "Tu as sacrifié tes nuits, tes propres rêves, ton sommeil et tes forces. Tu as essuyé des larmes dans le silence pour que nous ne manquions jamais de sourires. Tout ce que nous sommes aujourd'hui, tout ce que nous avons de bon, de fort et de digne en nous, nous te le devons. Nous sommes ton œuvre, le fruit de ton dévouement infini." },
        { type: "p", text: "Nous le savons, Maman : chacun de nous a son propre caractère, ses maladresses, ses silences et ses manières parfois différentes d'exprimer ses sentiments. Nous ne sommes pas toujours parfaits, et nos chemins divergent parfois. Mais aujourd'hui, toutes nos différences s'effacent pour laisser place à une seule et unique vérité, gravée dans nos âmes :" },
        { type: "highlight", text: "Tu es notre pilier, notre héroïne, le plus beau cadeau de notre existence." },
        { type: "p", text: "Du plus profond de nos cœurs, merci pour chaque sacrifice, merci pour chaque pardon, merci d'être toi. Notre amour pour toi surpasse les mots, traverse le temps et n'aura jamais de fin." }
    ];

    function startLoveLetterTypewriter() {
        if (isTypewriterActive) return;
        isTypewriterActive = true;
        
        typewriterContainer.innerHTML = "";
        
        let sectionIndex = 0;
        let charIndex = 0;
        let activeParagraphElement = null;
        
        const cursor = document.createElement("span");
        cursor.className = "typewriter-cursor";
        typewriterContainer.appendChild(cursor);

        function typeNextCharacter() {
            if (sectionIndex >= letterSections.length) {
                cursor.remove();
                letterSignatureBlock.classList.remove("hidden");
                setTimeout(() => {
                    letterSignatureBlock.classList.add("show");
                    triggerHeartBurstAtCenter();
                }, 100);
                isTypewriterActive = false;
                return;
            }

            const currentSec = letterSections[sectionIndex];

            if (charIndex === 0) {
                activeParagraphElement = document.createElement("p");
                
                if (currentSec.type === "salutation") {
                    activeParagraphElement.className = "salutation-typed";
                } else if (currentSec.type === "highlight") {
                    activeParagraphElement.className = "highlight-typed";
                }
                
                typewriterContainer.insertBefore(activeParagraphElement, cursor);
            }

            activeParagraphElement.textContent += currentSec.text[charIndex];
            charIndex++;

            if (charIndex >= currentSec.text.length) {
                sectionIndex++;
                charIndex = 0;
                typewriterTimeout = setTimeout(typeNextCharacter, 600);
            } else {
                const typingSpeed = Math.random() * 15 + 15; 
                typewriterTimeout = setTimeout(typeNextCharacter, typingSpeed);
            }
        }

        typeNextCharacter();
    }

    typewriterContainer.addEventListener("click", () => {
        if (!isTypewriterActive) return;
        
        clearTimeout(typewriterTimeout);
        isTypewriterActive = false;
        
        typewriterContainer.innerHTML = "";
        letterSections.forEach(sec => {
            const el = document.createElement("p");
            if (sec.type === "salutation") el.className = "salutation-typed";
            if (sec.type === "highlight") el.className = "highlight-typed";
            el.textContent = sec.text;
            typewriterContainer.appendChild(el);
        });
        
        letterSignatureBlock.classList.remove("hidden");
        setTimeout(() => {
            letterSignatureBlock.classList.add("show");
            triggerHeartBurstAtCenter();
        }, 100);
    });

    // ==========================================================================
    // 5. DIAPORAMA DE SOUVENIRS (LAZY LOADING POUR RAM & PERFORMANCES)
    // ==========================================================================
    
    function initSlideshow() {
        slideshowContainer.innerHTML = "";
        dotsIndicatorsContainer.innerHTML = "";
        
        familyImages.forEach((imgSrc, index) => {
            const slideContainer = document.createElement("div");
            slideContainer.className = `slide-img-container ${index === 0 ? 'active' : ''}`;
            
            const img = document.createElement("img");
            // LAZY LOADING INTELLIGENT : Charger uniquement la première image, différer les autres
            if (index === 0) {
                img.src = imgSrc;
            } else {
                img.dataset.src = imgSrc;
            }
            img.alt = `Souvenir de Fête des Mères ${index + 1}`;
            img.className = "slide-img";
            
            slideContainer.appendChild(img);
            slideshowContainer.appendChild(slideContainer);
            
            const dot = document.createElement("div");
            dot.className = `dot ${index === 0 ? 'active' : ''}`;
            dot.addEventListener("click", () => {
                showSlide(index);
                resetSlideshowTimer();
            });
            dotsIndicatorsContainer.appendChild(dot);
        });
    }

    function showSlide(index) {
        const slides = document.querySelectorAll(".slide-img-container");
        const dots = document.querySelectorAll(".dot");
        
        if (slides.length === 0) return;
        
        if (index >= slides.length) {
            activeSlideIndex = 0;
        } else if (index < 0) {
            activeSlideIndex = slides.length - 1;
        } else {
            activeSlideIndex = index;
        }
        
        // Charger la photo active à la volée (Lazy-Load Just-in-Time)
        const activeSlide = slides[activeSlideIndex];
        const activeImg = activeSlide.querySelector("img");
        if (activeImg && !activeImg.src && activeImg.dataset.src) {
            activeImg.src = activeImg.dataset.src;
        }

        // Précharger l'image suivante pour que la transition soit instantanée !
        const nextIndex = (activeSlideIndex + 1) % slides.length;
        const nextImg = slides[nextIndex].querySelector("img");
        if (nextImg && !nextImg.src && nextImg.dataset.src) {
            nextImg.src = nextImg.dataset.src;
        }
        
        slides.forEach((slide, idx) => {
            if (idx === activeSlideIndex) {
                slide.classList.add("active");
            } else {
                slide.classList.remove("active");
            }
        });
        
        dots.forEach((dot, idx) => {
            if (idx === activeSlideIndex) {
                dot.classList.add("active");
            } else {
                dot.classList.remove("active");
            }
        });
    }

    function startSlideshow() {
        if (slideshowInterval) clearInterval(slideshowInterval);
        slideshowInterval = setInterval(() => {
            showSlide(activeSlideIndex + 1);
        }, 4000);
    }

    function resetSlideshowTimer() {
        startSlideshow();
    }

    slidePrevBtn.addEventListener("click", () => {
        showSlide(activeSlideIndex - 1);
        resetSlideshowTimer();
    });

    slideNextBtn.addEventListener("click", () => {
        showSlide(activeSlideIndex + 1);
        resetSlideshowTimer();
    });

    initSlideshow();

    // ==========================================================================
    // 6. GALERIE PHOTO INTERACTIVE & VISIONNEUSE PLEIN ÉCRAN
    // ==========================================================================
    
    function renderGallery() {
        galleryGrid.innerHTML = "";
        familyImages.forEach((imgSrc, index) => {
            const galleryItem = document.createElement("div");
            galleryItem.className = "gallery-item";
            galleryItem.innerHTML = `<img src="${imgSrc}" alt="Miniature souvenir ${index + 1}" loading="lazy">`;
            
            galleryItem.addEventListener("click", () => {
                openLightbox(index);
            });
            galleryGrid.appendChild(galleryItem);
        });
    }

    function openLightbox(index) {
        activeLightboxIndex = index;
        updateLightboxContent();
        lightbox.classList.remove("hidden");
        setTimeout(() => {
            lightbox.classList.add("visible");
        }, 10);
        if (slideshowInterval) clearInterval(slideshowInterval);
    }

    function updateLightboxContent() {
        const imgSrc = familyImages[activeLightboxIndex];
        lightboxImg.src = imgSrc;
        lightboxCaption.textContent = `Instant précieux - Photo ${activeLightboxIndex + 1} sur ${familyImages.length}`;
    }

    function closeLightbox() {
        lightbox.classList.remove("visible");
        setTimeout(() => {
            lightbox.classList.add("hidden");
            startSlideshow();
        }, 500);
    }

    lightboxClose.addEventListener("click", closeLightbox);
    
    lightboxPrevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        activeLightboxIndex--;
        if (activeLightboxIndex < 0) {
            activeLightboxIndex = familyImages.length - 1;
        }
        updateLightboxContent();
    });

    lightboxNextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        activeLightboxIndex++;
        if (activeLightboxIndex >= familyImages.length) {
            activeLightboxIndex = 0;
        }
        updateLightboxContent();
    });

    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox || e.target === document.querySelector(".lightbox-content")) {
            closeLightbox();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (!lightbox.classList.contains("hidden")) {
            if (e.key === "Escape") {
                closeLightbox();
            } else if (e.key === "ArrowLeft") {
                lightboxPrevBtn.click();
            } else if (e.key === "ArrowRight") {
                lightboxNextBtn.click();
            }
        }
    });

    renderGallery();

    // ==========================================================================
    // 7. PARTICULES CANVAS ULTRA-PERFORMANTES (TEXTURES HORS-ÉCRAN PRE-RENDUES)
    // ==========================================================================
    
    const ctx = canvas.getContext("2d");
    let particlesArray = [];
    let lastSparkleTime = 0; // Limitation de l'échantillonnage de la souris

    const colors = [
        "rgba(255, 77, 109, 0.55)",  // Rose fuchsia
        "rgba(255, 158, 187, 0.5)",  // Rose clair
        "rgba(244, 194, 194, 0.45)", // Rose gold
        "rgba(230, 184, 156, 0.4)"   // Or champagne
    ];

    // textures pré-calculées hors-écran pour éviter d'évaluer les chemins bezier
    const heartTextures = {};
    const sparkleTextures = {};

    function preRenderTextures() {
        colors.forEach(color => {
            // Dessiner un cœur de référence 32x32px
            const canvasHeart = document.createElement("canvas");
            canvasHeart.width = 32;
            canvasHeart.height = 32;
            const ctxHeart = canvasHeart.getContext("2d");
            ctxHeart.fillStyle = color;
            ctxHeart.beginPath();
            const d = 22; // Taille du cœur sur la texture
            const x = 5;
            const y = 4;
            ctxHeart.moveTo(x, y + d / 4);
            ctxHeart.quadraticCurveTo(x, y, x + d / 2, y);
            ctxHeart.quadraticCurveTo(x + d, y, x + d, y + d / 3);
            ctxHeart.quadraticCurveTo(x + d, y + (d * 2) / 3, x + d / 2, y + d);
            ctxHeart.quadraticCurveTo(x, y + (d * 2) / 3, x, y + d / 3);
            ctxHeart.quadraticCurveTo(x, y, x, y + d / 4);
            ctxHeart.closePath();
            ctxHeart.fill();
            heartTextures[color] = canvasHeart;

            // Dessiner une étincelle de référence 16x16px
            const canvasSparkle = document.createElement("canvas");
            canvasSparkle.width = 16;
            canvasSparkle.height = 16;
            const ctxSparkle = canvasSparkle.getContext("2d");
            ctxSparkle.fillStyle = color;
            ctxSparkle.beginPath();
            const size = 6;
            ctxSparkle.moveTo(8, 8 - size);
            ctxSparkle.lineTo(8 + size/2, 8);
            ctxSparkle.lineTo(8, 8 + size);
            ctxSparkle.lineTo(8 - size/2, 8);
            ctxSparkle.closePath();
            ctxSparkle.fill();
            sparkleTextures[color] = canvasSparkle;
        });
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    class Particle {
        constructor(x, y, type = "drift") {
            this.type = type;
            
            if (type === "drift") {
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + Math.random() * 100;
                this.size = Math.random() * 6 + 4; // Cœurs pluie plus légers
                this.speedY = -(Math.random() * 1.0 + 0.3); // Dérive très calme
                this.speedX = Math.random() * 0.4 - 0.2;
                this.alpha = Math.random() * 0.45 + 0.15;
            } else if (type === "trail") {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 4 + 2.5;
                this.speedY = Math.random() * 1.2 + 0.4;
                this.speedX = Math.random() * 1.2 - 0.6;
                this.alpha = 1.0;
                this.decay = Math.random() * 0.02 + 0.02; // S'évanouit plus vite pour libérer de la mémoire
            } else if (type === "burst") {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 8 + 5;
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 4.5 + 1.5;
                this.speedX = Math.cos(angle) * speed;
                this.speedY = Math.sin(angle) * speed;
                this.alpha = 1.0;
                this.decay = Math.random() * 0.015 + 0.015;
                this.gravity = 0.06;
            }

            this.angle = Math.random() * Math.PI * 2;
            this.spinSpeed = Math.random() * 0.02 - 0.01;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.shape = Math.random() > 0.45 ? "heart" : "sparkle";
        }

        update() {
            if (this.type === "drift") {
                this.y += this.speedY;
                this.x += this.speedX + Math.sin(this.angle) * 0.15;
                this.angle += this.spinSpeed;
                
                if (this.y < -20) {
                    this.y = canvas.height + 20;
                    this.x = Math.random() * canvas.width;
                    this.speedY = -(Math.random() * 1.0 + 0.3);
                }
            } else if (this.type === "trail") {
                this.y += this.speedY;
                this.x += this.speedX;
                this.alpha -= this.decay;
            } else if (this.type === "burst") {
                this.speedX *= 0.97;
                this.speedY *= 0.97;
                this.speedY += this.gravity;
                this.x += this.speedX;
                this.y += this.speedY;
                this.alpha -= this.decay;
            }
        }

        draw() {
            if (this.alpha <= 0) return;
            
            ctx.save();
            ctx.globalAlpha = this.alpha;

            // OPTIMISATION ULTRA-HAUTE PERFORMANCE : Dessiner l'image pré-calculée au lieu des tracés bezier
            if (this.shape === "heart") {
                const img = heartTextures[this.color];
                if (img) {
                    ctx.drawImage(img, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
                }
            } else {
                const img = sparkleTextures[this.color];
                if (img) {
                    ctx.drawImage(img, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
                }
            }
            ctx.restore();
        }
    }

    function initParticles() {
        // Pré-calculer les textures une seule fois
        preRenderTextures();

        particlesArray = [];
        // Budget de particules réduit pour maximiser le FPS (20 cœurs dérivant)
        const numPluie = 20;
        for (let i = 0; i < numPluie; i++) {
            particlesArray.push(new Particle(0, 0, "drift"));
        }
        animateParticles();
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particlesArray = particlesArray.filter(particle => {
            particle.update();
            particle.draw();
            return particle.type === "drift" || particle.alpha > 0;
        });

        requestAnimationFrame(animateParticles);
    }

    // Traînée de Souris Throttlée (au maximum 1 particule toutes les 70ms pour éviter l'accumulation)
    window.addEventListener("mousemove", (e) => {
        if (entranceOverlay.classList.contains("fade-out")) {
            const now = Date.now();
            if (now - lastSparkleTime > 70) {
                particlesArray.push(new Particle(e.clientX, e.clientY, "trail"));
                lastSparkleTime = now;
            }
        }
    });

    window.addEventListener("touchmove", (e) => {
        if (entranceOverlay.classList.contains("fade-out") && e.touches.length > 0) {
            const now = Date.now();
            if (now - lastSparkleTime > 70) {
                const touch = e.touches[0];
                particlesArray.push(new Particle(touch.clientX, touch.clientY, "trail"));
                lastSparkleTime = now;
            }
        }
    });

    // Clic général : éruption locale modérée (6 cœurs)
    window.addEventListener("click", (e) => {
        if (entranceOverlay.classList.contains("fade-out") && e.target.tagName !== "BUTTON" && e.target.tagName !== "INPUT" && !e.target.closest(".playlist-track-item")) {
            for (let i = 0; i < 6; i++) {
                particlesArray.push(new Particle(e.clientX, e.clientY, "burst"));
            }
        }
    });

    function triggerHeartBurstAtCenter() {
        const rect = hugBtn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Budget d'explosion optimisé à 16 cœurs pour un rendu vif et rapide
        for (let i = 0; i < 16; i++) {
            particlesArray.push(new Particle(centerX, centerY, "burst"));
        }
    }

    hugBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        triggerHeartBurstAtCenter();
        
        hugBtn.style.transform = "scale(0.95)";
        setTimeout(() => {
            hugBtn.style.transform = "";
        }, 100);
    });

    // ==========================================================================
    // 8. LOGIQUE RESPONSIVE TACTILE : GESTION DES GLISSEMENTS (SWIPE GESTURES)
    // ==========================================================================
    
    let touchStartX = 0;
    let touchEndX = 0;

    function handleSwipeGesture(onSwipeLeft, onSwipeRight) {
        if (touchEndX < touchStartX - 50) {
            onSwipeLeft();
        }
        if (touchEndX > touchStartX + 50) {
            onSwipeRight();
        }
    }

    slideshowContainer.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    slideshowContainer.addEventListener("touchend", (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipeGesture(
            () => slideNextBtn.click(),
            () => slidePrevBtn.click()
        );
    }, { passive: true });

    const lightboxContentContainer = document.querySelector(".lightbox-content");
    lightboxContentContainer.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightboxContentContainer.addEventListener("touchend", (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipeGesture(
            () => lightboxNextBtn.click(),
            () => lightboxPrevBtn.click()
        );
    }, { passive: true });
});
