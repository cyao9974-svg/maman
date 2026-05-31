/* ==========================================================================
   SITE DE FÊTE DES MÈRES V2 - LOGIQUE INTERACTIVE ET EFFETS MAGIQUES
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
        audioPlayer.src = track.file; // Lecture directe robuste compatible file:// et http://
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
                audioEqualizer.classList.add("playing"); // Lancer l'égaliseur CSS !
            })
            .catch(error => {
                console.log("Lecture automatique impossible hors clic direct :", error);
            });
    }

    function pauseTrack() {
        audioPlayer.pause();
        isPlaying = false;
        playIcon.className = "fa-solid fa-play";
        vinylDisk.classList.remove("spinning");
        vinylTonearm.classList.remove("playing");
        audioEqualizer.classList.remove("playing"); // Arrêter l'égaliseur CSS
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
    // 4. L'HOMMAGE PROFOND : EFFET DE MACHINE À ÉCRIRE AVANCÉ
    // ==========================================================================
    
    // Découpage structurel de la lettre d'amour pour l'écrire dynamiquement
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
        
        // Ajouter le curseur clignotant
        const cursor = document.createElement("span");
        cursor.className = "typewriter-cursor";
        typewriterContainer.appendChild(cursor);

        function typeNextCharacter() {
            if (sectionIndex >= letterSections.length) {
                // Écriture terminée ! Révéler la signature et le bouton câlin
                cursor.remove();
                letterSignatureBlock.classList.remove("hidden");
                setTimeout(() => {
                    letterSignatureBlock.classList.add("show");
                    // Déclencher un mini feu d'artifice de cœurs pour célébrer
                    triggerHeartBurstAtCenter();
                }, 100);
                isTypewriterActive = false;
                return;
            }

            const currentSec = letterSections[sectionIndex];

            // Si on commence un paragraphe
            if (charIndex === 0) {
                activeParagraphElement = document.createElement("p");
                
                if (currentSec.type === "salutation") {
                    activeParagraphElement.className = "salutation-typed";
                } else if (currentSec.type === "highlight") {
                    activeParagraphElement.className = "highlight-typed";
                }
                
                // Insérer le nouveau paragraphe juste avant le curseur
                typewriterContainer.insertBefore(activeParagraphElement, cursor);
            }

            // Écrire le caractère suivant
            activeParagraphElement.textContent += currentSec.text[charIndex];
            charIndex++;

            if (charIndex >= currentSec.text.length) {
                // Fin de paragraphe : passer au suivant après une pause
                sectionIndex++;
                charIndex = 0;
                typewriterTimeout = setTimeout(typeNextCharacter, 600); // 600ms de pause entre paragraphes
            } else {
                // Caractère suivant : vitesse d'écriture variable pour un effet plus naturel (entre 18ms et 35ms)
                const typingSpeed = Math.random() * 17 + 18; 
                typewriterTimeout = setTimeout(typeNextCharacter, typingSpeed);
            }
        }

        typeNextCharacter();
    }

    // Permettre à l'utilisateur de cliquer sur la carte de la lettre pour tout afficher d'un coup
    typewriterContainer.addEventListener("click", () => {
        if (!isTypewriterActive) return;
        
        // Annuler le timer en cours
        clearTimeout(typewriterTimeout);
        isTypewriterActive = false;
        
        // Remplir tout le texte immédiatement
        typewriterContainer.innerHTML = "";
        letterSections.forEach(sec => {
            const el = document.createElement("p");
            if (sec.type === "salutation") el.className = "salutation-typed";
            if (sec.type === "highlight") el.className = "highlight-typed";
            el.textContent = sec.text;
            typewriterContainer.appendChild(el);
        });
        
        // Afficher la signature
        letterSignatureBlock.classList.remove("hidden");
        setTimeout(() => {
            letterSignatureBlock.classList.add("show");
            triggerHeartBurstAtCenter();
        }, 100);
    });

    // ==========================================================================
    // 5. LE DIAPORAMA (FONDU ENCHAÎNÉ 4 SECONDES)
    // ==========================================================================
    
    function initSlideshow() {
        slideshowContainer.innerHTML = "";
        dotsIndicatorsContainer.innerHTML = "";
        
        familyImages.forEach((imgSrc, index) => {
            const slideContainer = document.createElement("div");
            slideContainer.className = `slide-img-container ${index === 0 ? 'active' : ''}`;
            
            const img = document.createElement("img");
            img.src = imgSrc;
            img.alt = `Souvenir de bonheur ${index + 1}`;
            img.className = "slide-img";
            img.loading = "lazy";
            
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
    // 6. GALERIE D'EXPLORATION & VISIONNEUSE PLEIN ÉCRAN (LIGHTBOX)
    // ==========================================================================
    
    function renderGallery() {
        galleryGrid.innerHTML = "";
        familyImages.forEach((imgSrc, index) => {
            const galleryItem = document.createElement("div");
            galleryItem.className = "gallery-item";
            galleryItem.innerHTML = `<img src="${imgSrc}" alt="Vignette souvenir ${index + 1}" loading="lazy">`;
            
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
    // 7. PARTICULES CANVAS AVANCÉES (PLUIE, MOUVEMENT SOURIS ET EXPLOSIONS)
    // ==========================================================================
    
    const ctx = canvas.getContext("2d");
    let particlesArray = [];
    let sparkleTrailThrottle = 0;

    const colors = [
        "rgba(255, 77, 109, 0.55)",  // Rose fuchsia brillant
        "rgba(255, 158, 187, 0.5)",  // Rose poudré scintillant
        "rgba(244, 194, 194, 0.45)", // Rose gold métallique
        "rgba(230, 184, 156, 0.4)"   // Or champagne lumineux
    ];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Classe Particule Multi-Usage (Météo, Traînée de souris, Explosions)
    class Particle {
        constructor(x, y, type = "drift") {
            this.type = type; // "drift" (pluie douce), "trail" (traînée souris), "burst" (explosion de cœurs)
            
            // Coordonnées de départ
            if (type === "drift") {
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + Math.random() * 100;
                this.size = Math.random() * 7 + 4; // Taille cœurs pluie
                this.speedY = -(Math.random() * 1.2 + 0.4); // Douce dérive vers le haut
                this.speedX = Math.random() * 0.6 - 0.3;
                this.alpha = Math.random() * 0.5 + 0.2;
            } else if (type === "trail") {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 5 + 3; // Étoiles scintillantes
                this.speedY = Math.random() * 1.5 + 0.5; // Chute vers le bas
                this.speedX = Math.random() * 1.6 - 0.8;
                this.alpha = 1.0;
                this.decay = Math.random() * 0.015 + 0.015; // Évanouissement rapide
            } else if (type === "burst") {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 10 + 6; // Cœurs d'explosion plus gros !
                
                // Vitesse radiale 360° aléatoire
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 6 + 2; 
                this.speedX = Math.cos(angle) * speed;
                this.speedY = Math.sin(angle) * speed;
                
                this.alpha = 1.0;
                this.decay = Math.random() * 0.008 + 0.01; // Évanouissement modéré
                this.gravity = 0.08; // Chute sous gravité après explosion
            }

            this.angle = Math.random() * Math.PI * 2;
            this.spinSpeed = Math.random() * 0.04 - 0.02;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            
            // Choisir la forme
            this.shape = Math.random() > 0.3 ? "heart" : "sparkle";
        }

        update() {
            if (this.type === "drift") {
                this.y += this.speedY;
                this.x += this.speedX + Math.sin(this.angle) * 0.2;
                this.angle += this.spinSpeed;
                
                // Boucler en bas
                if (this.y < -20) {
                    this.y = canvas.height + 20;
                    this.x = Math.random() * canvas.width;
                    this.speedY = -(Math.random() * 1.2 + 0.4);
                }
            } else if (this.type === "trail") {
                this.y += this.speedY;
                this.x += this.speedX;
                this.alpha -= this.decay;
            } else if (this.type === "burst") {
                // Ralentissement par frottement
                this.speedX *= 0.98;
                this.speedY *= 0.98;
                
                // Application de la gravité
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
            ctx.fillStyle = this.color;
            ctx.beginPath();

            if (this.shape === "heart") {
                const d = this.size;
                const x = this.x;
                const y = this.y;
                ctx.moveTo(x, y + d / 4);
                ctx.quadraticCurveTo(x, y, x + d / 2, y);
                ctx.quadraticCurveTo(x + d, y, x + d, y + d / 3);
                ctx.quadraticCurveTo(x + d, y + (d * 2) / 3, x + d / 2, y + d);
                ctx.quadraticCurveTo(x, y + (d * 2) / 3, x, y + d / 3);
                ctx.quadraticCurveTo(x, y, x, y + d / 4);
                ctx.closePath();
                ctx.fill();
            } else {
                // Étincelle en forme de diamant (sparkle) pour le trail de souris
                const size = this.size;
                ctx.moveTo(this.x, this.y - size);
                ctx.lineTo(this.x + size/2, this.y);
                ctx.lineTo(this.x, this.y + size);
                ctx.lineTo(this.x - size/2, this.y);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();
        }
    }

    function initParticles() {
        particlesArray = [];
        // Lancer 35 cœurs dérivant paisiblement dès le départ
        const numPluie = 35;
        for (let i = 0; i < numPluie; i++) {
            particlesArray.push(new Particle(0, 0, "drift"));
        }
        animateParticles();
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Mettre à jour et dessiner les particules, filtrer celles qui ont fondu (alpha <= 0)
        particlesArray = particlesArray.filter(particle => {
            particle.update();
            particle.draw();
            return particle.type === "drift" || particle.alpha > 0;
        });

        requestAnimationFrame(animateParticles);
    }

    // Traînée de Souris (Sparkles Mouse Trail)
    window.addEventListener("mousemove", (e) => {
        if (entranceOverlay.classList.contains("fade-out")) {
            sparkleTrailThrottle++;
            // Ajouter un sparkle tous les 3 pixels de déplacement pour préserver la fluidité
            if (sparkleTrailThrottle % 3 === 0) {
                particlesArray.push(new Particle(e.clientX, e.clientY, "trail"));
            }
        }
    });

    window.addEventListener("touchmove", (e) => {
        if (entranceOverlay.classList.contains("fade-out") && e.touches.length > 0) {
            sparkleTrailThrottle++;
            if (sparkleTrailThrottle % 3 === 0) {
                const touch = e.touches[0];
                particlesArray.push(new Particle(touch.clientX, touch.clientY, "trail"));
            }
        }
    });

    // Clic général sur l'écran pour provoquer une éruption locale
    window.addEventListener("click", (e) => {
        // Uniquement si l'enveloppe est déjà ouverte et qu'on ne clique pas sur un bouton interactif direct
        if (entranceOverlay.classList.contains("fade-out") && e.target.tagName !== "BUTTON" && e.target.tagName !== "INPUT" && !e.target.closest(".playlist-track-item")) {
            for (let i = 0; i < 8; i++) {
                particlesArray.push(new Particle(e.clientX, e.clientY, "burst"));
            }
        }
    });

    // Éruption centrée sur le bouton Câlin Virtuel
    function triggerHeartBurstAtCenter() {
        const rect = hugBtn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Lancer une superbe explosion de 25 cœurs !
        for (let i = 0; i < 25; i++) {
            particlesArray.push(new Particle(centerX, centerY, "burst"));
        }
    }

    // Écouteur de clic sur le bouton Câlin Virtuel
    hugBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Éviter le clic général
        triggerHeartBurstAtCenter();
        
        // Jouer un petit effet de pulse sur le bouton
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

    // Détecteur de geste (balayage gauche ou droite)
    function handleSwipeGesture(onSwipeLeft, onSwipeRight) {
        // Seuil minimum de 50 pixels pour éviter les déclenchements involontaires
        if (touchEndX < touchStartX - 50) {
            onSwipeLeft();
        }
        if (touchEndX > touchStartX + 50) {
            onSwipeRight();
        }
    }

    // Gestion du balayage sur le diaporama de photos de souvenirs
    slideshowContainer.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    slideshowContainer.addEventListener("touchend", (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipeGesture(
            () => slideNextBtn.click(), // Swipe à gauche -> Morceau/image suivante
            () => slidePrevBtn.click()  // Swipe à droite -> Morceau/image précédente
        );
    }, { passive: true });

    // Gestion du balayage sur la visionneuse plein écran (Lightbox)
    const lightboxContentContainer = document.querySelector(".lightbox-content");
    lightboxContentContainer.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightboxContentContainer.addEventListener("touchend", (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipeGesture(
            () => lightboxNextBtn.click(), // Swipe gauche -> Photo suivante
            () => lightboxPrevBtn.click()  // Swipe droite -> Photo précédente
        );
    }, { passive: true });
});
