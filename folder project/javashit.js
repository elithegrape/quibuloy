
//DOM elements
const playBtn = document.getElementById("playBtn");
const audio = document.getElementById("audio");
const progress = document.querySelector(".progress");
const progressBar = document.querySelector(".progress-bar");
const prevbtn = document.getElementById("prevbutton");
const nextbtn = document.getElementById("nextbutton");
const favoritesList = document.querySelector(".favorites-list");
const recentList = document.querySelector(".recent-list");
const currentTimeEl = document.querySelector(".current");
const durationTimeEl = document.querySelector(".duration");
const playerTitle = document.querySelector(".panel.player h1");
const playerArtist = document.querySelector(".panel.player p");
const playerImage = document.querySelector(".panel.player .album");
const searchInput = document.querySelector('.search');
const songCards = document.querySelectorAll('.song');
const progressHandle = document.createElement("div");
const resetRecentBtn = document.getElementById('resetRecent');

const hearts = document.querySelectorAll("[id^='heart']");



//helper
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? "0" + secs : secs}`;
}

function setProgress(currentTime) {
    if (!audio.duration) return;
    const percent = (currentTime / audio.duration) * 100;
    progress.style.width = `${percent}%`;
}

function seekAudio(clientX) {
    if (!progressBar || !audio.duration) return;
    const rect = progressBar.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    audio.currentTime = (x / rect.width) * audio.duration;
}

let isDraggingProgress = false;

//2) Placeholders & recentlyList Management

function updateRecentPlaceholder() {
    if (!recentList) return;
    const recentItems = recentList.querySelectorAll(".favorite");
    const emptyMessage = recentList.querySelector(".recent-empty");

    if (recentItems.length === 0) {
        if (!emptyMessage) {
            const message = document.createElement("p");
            message.className = "recent-empty";
            message.textContent = "No recently played songs. Play music to see it here.";
            recentList.appendChild(message);
        }
    } else if (emptyMessage) {
        emptyMessage.remove();
    }
}

function addRecentSong() {
    if (!recentList || !playerTitle) return;

    const title = playerTitle.textContent.trim();
    if (!title) return;

    const artist = playerArtist?.textContent.trim() || "";
    const image = playerImage?.src || "";
    const recentId = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const existingRecent = recentList.querySelector(`[data-recent-id="${recentId}"]`);

    // ✅ Use audio.dataset.currentSrc instead of reading from <source>
    const currentSrc = audio.dataset.currentSrc || '';

    if (existingRecent) {
        existingRecent.dataset.src = currentSrc;
        recentList.prepend(existingRecent);
    } else {
        const recent = document.createElement("div");
        recent.className = "favorite";
        recent.dataset.recentId = recentId;
        recent.dataset.src = currentSrc;
        recent.innerHTML = `
            <img src="${image}" alt="${title}">
            <div>
                <h3>${title}</h3>
                <p>${artist}</p>
            </div>
        `;
        recentList.prepend(recent);
    }

    updateRecentPlaceholder();
}

function updateFavoritesPlaceholder() {
    if (!favoritesList) return;
    const favorites = favoritesList.querySelectorAll(".favorite");
    const emptyMessage = favoritesList.querySelector(".favorites-empty");

    if (favorites.length === 0) {
        if (!emptyMessage) {
            const message = document.createElement("p");
            message.className = "favorites-empty";
            message.textContent = "No favorites yet. Click a heart to add songs.";
            favoritesList.appendChild(message);
        }
    } else if (emptyMessage) {
        emptyMessage.remove();
    }
}

//3) Favorites handling (heart toggles)

hearts.forEach((heart) => {
    heart.addEventListener("click", () => {
        heart.classList.toggle("active");
        const song = heart.closest(".song");
        if (!song || !favoritesList) return;

        const title = song.querySelector(".song-info h3")?.textContent || "";
        const artist = song.querySelector(".song-info p")?.textContent || "";
        const image = song.querySelector("img")?.src || "";
        const favoriteId = title.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        const existingFavorite = favoritesList.querySelector(`[data-favorite-id="${favoriteId}"]`);

        if (heart.classList.contains("active")) {
            if (!existingFavorite) {
                const favorite = document.createElement("div");
                favorite.className = "favorite";
                favorite.dataset.favoriteId = favoriteId;
                favorite.dataset.playlistId = song.dataset.playlist || '';
                const playlistTrack = playlists[song.dataset.playlist]?.[0];
                if (playlistTrack) {
                    favorite.dataset.src = playlistTrack.src;
                }
                favorite.innerHTML = `
                    <img src="${image}" alt="${title}">
                    <div>
                        <h3>${title}</h3>
                        <p>${artist}</p>
                    </div>
                `;
                favoritesList.appendChild(favorite);
            }
        } else  if (existingFavorite) {
            existingFavorite.remove();
        }

        updateFavoritesPlaceholder();
    });
});

//4) Progress / Seeking 

if (progress) {
    progress.appendChild(progressHandle);
}

//5) Search filtering

searchInput?.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    songCards.forEach((song) => {
        const title = song.querySelector('.song-info h3')?.textContent.toLowerCase() || '';
        const artist = song.querySelector('.song-info p')?.textContent.toLowerCase() || '';
        const matches = title.includes(query) || artist.includes(query);
        song.style.display = query === '' || matches ? '' : 'none';
    });
});

updateFavoritesPlaceholder();
updateRecentPlaceholder();

//6) Recent items playback

// recent song click handler
async function playRecentSong(recent) {
    if (!recent || !audio) return;
    const src = recent.dataset.src;
    if (!src) return;

    
    audio.src = src;
    audio.dataset.currentSrc = src; 
    audio.load();

    try {
        await audio.play();
        playing = true;
        playBtn.innerHTML = '⏸';
        playerTitle.textContent = recent.querySelector('h3')?.textContent || playerTitle.textContent;
        playerArtist.textContent = recent.querySelector('p')?.textContent || playerArtist.textContent;
        playerImage.src = recent.querySelector('img')?.src || playerImage.src;
        currentPlaylist = allTracks;
        currentTrackIndex = findTrackIndexBySrc(src, allTracks);
        addRecentSong();
    } catch (err) {
        console.error('Playback failed:', err);
    }
}

recentList?.addEventListener('click', (e) => {
    const recent = e.target.closest && e.target.closest('.favorite');
    if (!recent) return;
    playRecentSong(recent);
});


//favorites click handler (also supports playlist favorites)

favoritesList?.addEventListener('click', (e) => {
    const favorite = e.target.closest && e.target.closest('.favorite');
    if (!favorite) return;
    const playlistId = favorite.dataset.playlistId;
    if (playlistId && playlists[playlistId]) {
        openPlaylist(playlistId);
        return;
    }
    const src = favorite.dataset.src;
    if (!src) return;
    const sourceEl = audio.querySelector('source');
    if (sourceEl) sourceEl.src = encodeURI(src);
    audio.load();
    audio.play().catch(() => {});
    playing = true;
    playBtn.innerHTML = '⏸';
    playerTitle.textContent = favorite.querySelector('h3')?.textContent || playerTitle.textContent;
    playerArtist.textContent = favorite.querySelector('p')?.textContent || playerArtist.textContent;
    playerImage.src = favorite.querySelector('img')?.src || playerImage.src;
    currentPlaylist = allTracks;
    currentTrackIndex = findTrackIndexBySrc(src, allTracks);
    addRecentSong();
});

// Clear recently played list when reset button is clicked
resetRecentBtn?.addEventListener('click', () => {
    if (!recentList) return;
    // remove all recent items
    recentList.querySelectorAll('.favorite').forEach(el => el.remove());
    // also remove any non-empty placeholders so updateRecentPlaceholder can recreate it
    const msg = recentList.querySelector('.recent-empty');
    if (msg) msg.remove();
    updateRecentPlaceholder();
});

//play back controls

let playing = false;

playBtn.addEventListener("click", () => {
    if (!playing) {
        audio.play();
        playBtn.innerHTML = "⏸";
        playing = true;
        addRecentSong();
    } else {
        audio.pause();
        playBtn.innerHTML = "▶";
        playing = false;
    }
});

/* ----------------------
   Volume controls
   ---------------------- */
const volumeSlider = document.getElementById('volumeSlider');
const volValue = document.getElementById('volumeValue');

function updateVolumeDisplay() {
    if (!volValue || !audio) return;
    volValue.textContent = Math.round((audio.volume || 0) * 100) + '%';
}

// initialize slider and display from current audio volume (default 1)
if (typeof audio.volume === 'number') {
    const init = Math.round((audio.volume || 1) * 100);
    if (volumeSlider) volumeSlider.value = init;
}
updateVolumeDisplay();

volumeSlider?.addEventListener('input', (e) => {
    if (!audio) return;
    const v = Number(e.target.value) / 100;
    audio.volume = Math.min(1, Math.max(0, v));
    updateVolumeDisplay();
});

audio.addEventListener("pause", () => {
    // Keep progress position when paused so the user can resume from the same spot.
});

audio.addEventListener("loadedmetadata", () => {
    if (durationTimeEl && audio.duration) {
        durationTimeEl.textContent = formatTime(audio.duration);
    }
});

audio.addEventListener("ended", () => {
    progress.style.width = "0%";
    playBtn.innerHTML = "▶";
    playing = false;
});

audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    setProgress(audio.currentTime);
    if (currentTimeEl) {
        currentTimeEl.textContent = formatTime(audio.currentTime);
    }
    if (durationTimeEl) {
        durationTimeEl.textContent = formatTime(audio.duration);
    }
});

audio.addEventListener('error', () => {
    console.error('Audio playback/load error. currentSrc=', audio.currentSrc, 'error=', audio.error);
    // Show a brief on-screen message
    alert('Failed to load audio: ' + (audio.currentSrc || 'unknown'));
});

progressBar?.addEventListener("mousedown", (e) => {
    isDraggingProgress = true;
    seekAudio(e.clientX);
});

document.addEventListener("mousemove", (e) => {
    if (isDraggingProgress) {
        seekAudio(e.clientX);
    }
});

document.addEventListener("mouseup", () => {
    isDraggingProgress = false;
});

progressBar?.addEventListener("touchstart", (e) => {
    isDraggingProgress = true;
    seekAudio(e.touches[0].clientX);
});

progressBar?.addEventListener("touchmove", (e) => {
    if (isDraggingProgress) {
        seekAudio(e.touches[0].clientX);
    }
});

document.addEventListener("touchend", () => {
    isDraggingProgress = false;
});

progressBar?.addEventListener("click", (e) => {
   seekAudio(e.clientX);
});

//playlist modal handling

const playlistModal = document.getElementById('playlist-modal');
const playlistItemsEl = playlistModal?.querySelector('.playlist-items');
const closePlaylistBtn = document.getElementById('close-playlist');

const playlists = {
    bben: [
        { title: 'lifetime', artist: 'Ben&Ben', src: 'assets/songs/ben/lifetime.mp3', image: 'assets/image/ben&ben/lifetime.jpg' },
        { title: 'Leaves', artist: 'Ben&Ben', src: 'assets/songs/ben/leaves.mp3', image: 'assets/image/ben&ben/leaves.jpg' },
        { title: 'autumn', artist: 'Ben&Ben', src: 'assets/songs/ben/autumn.mp3', image: 'assets/image/ben&ben/autumn.jpg' },
        { title: 'saranggola', artist: 'Ben&Ben', src: 'assets/songs/ben/saranggola.mp3', image: 'assets/image/ben&ben/saranggola.jpg' },
        { title: 'kathang isip', artist: 'Ben&Ben', src: 'assets/songs/ben/kathang-isip.mp3', image: 'assets/image/ben&ben/kathang-isip.jpg' }
    ],
    ft: [
        { title: 'kalapastangan', artist: 'Fitterkarma', src: 'assets/songs/fitterkarma/kalapastangan.mp3', image: 'assets/image/fitterkarma/kalapastangan.jpg' },
        { title: 'Pag-ibig ay kanibalismo', artist: 'Fitterkarma', src: 'assets/songs/fitterkarma/kanibalismo.mp3', image: 'assets/image/fitterkarma/kanibalismo.jpg' },
        { title: 'Sumpa', artist: 'Fitterkarma', src: 'assets/songs/fitterkarma/sumpa.mp3', image: 'assets/image/fitterkarma/sumpa.jpg' },
        { title: 'Pambihira', artist: 'Fitterkarma', src: 'assets/songs/fitterkarma/pambihira.mp3', image: 'assets/image/fitterkarma/pambihira.jpg' },
        { title: 'Isang pangako', artist: 'Fitterkarma', src: 'assets/songs/fitterkarma/pangako.mp3', image: 'assets/image/fitterkarma/pangako.jpg' }
    ],
    aljames: [
        { title: 'ngayong gabi', artist: 'Al James', src: 'assets/songs/aljames/ngayon gabi.mp3', image: 'assets/image/al-james/ngayon-gabi.jpg' },
        { title: 'pa umaga', artist: 'Al James', src: 'assets/songs/aljames/paumaga.mp3', image: 'assets/image/al-james/paumaga.jpg' },
        { title: 'pwede ba', artist: 'Al James', src: 'assets/songs/aljames/pwedeba.mp3', image: 'assets/image/al-james/pwedeba.jpg' },
        { title: 'pahinga', artist: 'Al James', src: 'assets/songs/aljames/pahinga.mp3', image: 'assets/image/al-james/pahinga.jpg' },
        { title: 'repeat', artist: 'Al James', src: 'assets/songs/aljames/repeat.mp3', image: 'assets/image/al-james/repeat.jpg' }
    ],
    janroberts: [
        { title: 'sagip', artist: 'Jan Robert S.', src: 'assets/songs/jan-roberts/sagip.mp3', image: 'assets/image/janroberts/sagip.jpg' },
        { title: 'patlang', artist: 'Jan Robert S.', src: 'assets/songs/jan-roberts/patlang.mp3', image: 'assets/image/janroberts/patlang.jpg' },
        { title: 'tanaw', artist: 'Jan Robert S.', src: 'assets/songs/jan-roberts/tanaw.mp3', image: 'assets/image/janroberts/tanaw.jpg' },
        { title: 'hirap kalimutan', artist: 'Jan Robert S.', src: 'assets/songs/jan-roberts/hirap kalimutan.mp3', image: 'assets/image/janroberts/hirap-kalimutan.jpg' },
        { title: 'U-Belt', artist: 'Jan Robert S.', src: 'assets/songs/jan-roberts/u-belt.mp3', image: 'assets/image/janroberts/u-belt.jpg' }
    ],
      
};  

const playlistTitles = { bben: 'Ben&Ben', ft: 'Fitterkarma', aljames: 'Al James', janroberts: 'Jan Robert S.'};
//prev and next button functionality
let currentPlaylist = null;
let currentTrackIndex = -1;

// Flatten all playlists into a single library list for global navigation
const allTracks = Object.values(playlists).flat();

function findTrackIndexBySrc(src, list) {
    if (!src || !list) return -1;
    return list.findIndex(t => t.src === src || (t.src && src && src.includes(t.src)));
}

function ensurePlaylistForNavigation() {
    if (currentPlaylist && currentPlaylist.length > 0) return;
    const sourceEl = audio.querySelector('source');
    const currentSrc = sourceEl?.src || sourceEl?.getAttribute('src') || '';
    currentPlaylist = allTracks;
    const idx = findTrackIndexBySrc(currentSrc, allTracks);
    currentTrackIndex = idx >= 0 ? idx : 0;
}

function playTrack(list, index) {
    if (!list || index < 0 || index >= list.length) return;
    const track = list[index];
    
    audio.src = track.src;
    audio.dataset.currentSrc = track.src;
    audio.load();
    audio.play().catch(() => {});
    playerTitle.textContent = track.title;
    playerArtist.textContent = track.artist;
    playerImage.src = track.image;
    playBtn.innerHTML = '⏸';
    playing = true;
    currentPlaylist = list;
    currentTrackIndex = index;
    addRecentSong();
}

function openPlaylist(id) {
    const list = playlists[id];
    if (!list || !playlistModal || !playlistItemsEl) return;
    playlistItemsEl.innerHTML = '';
    document.getElementById('playlist-title').textContent = playlistTitles[id] || 'Playlist';
    list.forEach((t, idx) => {
        const el = document.createElement('div');
        el.className = 'playlist-item';
        el.dataset.src = t.src;
        el.innerHTML = `
            <img src="${t.image}" alt="${t.title}">
            <div class="meta">
                <strong>${t.title}</strong>
                <div style="font-size:12px;color:#999">${t.artist}</div>
            </div>
        `;
        el.addEventListener('click', () => {
            playTrack(list, idx);
            closePlaylist();
        });
        playlistItemsEl.appendChild(el);
    });
    playlistModal.classList.remove('hidden');
}

function closePlaylist() {
    if (!playlistModal) return;
    playlistModal.classList.add('hidden');
}

/* ----------------------
   10) Playlist UI handlers
   11) Global document handlers
   ---------------------- */

document.addEventListener('click', (e) => {
    const open = e.target.closest && e.target.closest('.open-playlist');
    if (open) {
        e.preventDefault();
        const id = open.dataset.playlist;
        openPlaylist(id);
        return;
    }

    // If user clicked the song container that has a playlist, open it.
    const songEl = e.target.closest && e.target.closest('.song[data-playlist]');
    if (songEl) {
        // don't open playlist if user clicked the heart inside the song
        if (e.target.closest && e.target.closest('.heart')) return;
        const id = songEl.dataset.playlist;
        if (id) openPlaylist(id);
    }
});

closePlaylistBtn?.addEventListener('click', closePlaylist);
playlistModal?.addEventListener('click', (e) => {
    if (e.target === playlistModal) closePlaylist();
});

// Prev / Next button handlers
prevbtn?.addEventListener('click', () => {
    ensurePlaylistForNavigation();
    if (currentPlaylist && currentPlaylist.length > 0) {
        const len = currentPlaylist.length;
        const newIndex = (currentTrackIndex - 1 + len) % len;
        playTrack(currentPlaylist, newIndex);
    }
});

nextbtn?.addEventListener('click', () => {
    ensurePlaylistForNavigation();
    if (currentPlaylist && currentPlaylist.length > 0) {
        const len = currentPlaylist.length;
        const newIndex = (currentTrackIndex + 1) % len;
        playTrack(currentPlaylist, newIndex);
    }
});

