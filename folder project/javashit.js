/* ============================================================
   FIXED JAVASCRIPT (javashit.js) - Center content updated
   ============================================================ */

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
const playerTitle = document.querySelector(".player h1");
const playerArtist = document.querySelector(".player p");
const playerImage = document.querySelector(".player .album");
const searchInput = document.querySelector('.search');
const songCards = document.querySelectorAll('.song');
const searchResultsEl = document.querySelector('.search-results');
const progressHandle = document.createElement("div");
const resetRecentBtn = document.getElementById('resetRecent');

// Center content elements
const centerTitle = document.getElementById('center-title');
const centerArtist = document.getElementById('center-artist');
const centerAlbum = document.getElementById('center-album');
const centerGenre = document.getElementById('center-genre');

// Bottom player elements
const bpTitle = document.getElementById('bp-title');
const bpArtist = document.getElementById('bp-artist');
const bpThumb = document.getElementById('bp-thumb');

// Helper functions
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

// Recently played management
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

// FIXED: Corrected getFavoriteTrackFromItem function
function getFavoriteTrackFromItem(item) {
    if (!item) return null;
    if (item.classList.contains('playlist-item')) {
        // FIXED: Was using item.src, should be item.dataset.src
        return allTracks.find((track) => track.src === item.dataset.src) || null;
    }
    if (item.classList.contains('song')) {
        if (item.dataset.trackSrc) {
            return allTracks.find((track) => track.src === item.dataset.trackSrc) || null;
        }
        return playlists[item.dataset.playlist]?.[0] || null;
    }
    return null;
}

// FIXED: Improved favorite tracking using src for uniqueness
function toggleFavoriteTrack(track, heart) {
    if (!track || !favoritesList) return;
    const favoriteId = track.title.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const existingFavorite = favoritesList.querySelector(`[data-favorite-id="${favoriteId}"]`);

    if (existingFavorite) {
        existingFavorite.remove();
        // FIXED: Use src for uniqueness instead of title
        const indexToRemove = favoriteTracks.findIndex((t) => t.src === track.src);
        if (indexToRemove >= 0) favoriteTracks.splice(indexToRemove, 1);
        heart.classList.remove('active');
    } else {
        const favorite = document.createElement("div");
        favorite.className = "favorite";
        favorite.dataset.favoriteId = favoriteId;
        favorite.dataset.trackSrc = track.src;
        favorite.dataset.trackTitle = track.title;
        favorite.dataset.trackArtist = track.artist;
        favorite.dataset.trackImage = track.image;
        favorite.innerHTML = `
            <img src="${track.image}" alt="${track.title}">
            <div>
                <h3>${track.title}</h3>
                <p>${track.artist}</p>
            </div>
        `;
        favoritesList.appendChild(favorite);
        favoriteTracks.push(track);
        heart.classList.add('active');
    }

    updateFavoritesPlaceholder();
}

document.addEventListener('click', (e) => {
    const heart = e.target.closest('.heart');
    if (!heart) return;
    const item = heart.closest('.playlist-item, .song');
    if (!item) return;
    e.stopPropagation();
    const track = getFavoriteTrackFromItem(item);
    toggleFavoriteTrack(track, heart);
});

// Progress bar functionality
if (progress) {
    progress.appendChild(progressHandle);
}

// Search functionality
function clearSearchResults() {
    if (!searchResultsEl) return;
    searchResultsEl.innerHTML = '';
}

function renderSearchResults(query) {
    if (!searchResultsEl) return;
    const normalized = query.toLowerCase();
    const matches = allTracks.filter((track) => {
        return track.title.toLowerCase().includes(normalized)
            || track.artist.toLowerCase().includes(normalized);
    });

    searchResultsEl.innerHTML = '';
    if (matches.length === 0) {
        const noResult = document.createElement('p');
        noResult.className = 'favorites-empty';
        noResult.textContent = `No songs found for "${query}".`;
        searchResultsEl.appendChild(noResult);
        return;
    }

    matches.forEach((track) => {
        const el = document.createElement('div');
        el.className = 'song';
        el.dataset.trackSrc = track.src;
        el.dataset.trackTitle = track.title;
        el.dataset.trackArtist = track.artist;
        el.dataset.trackImage = track.image;
        el.innerHTML = `
            <img src="${track.image}" alt="${track.title}">
            <div class="song-info">
                <h3>${track.title}</h3>
                <p>${track.artist}</p>
            </div>
            <span class="heart" title="Favorite this song">&#10084;</span>
        `;
        searchResultsEl.appendChild(el);
    });
}

searchInput?.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    if (query === '') {
        document.querySelectorAll('.song[data-playlist]').forEach(song => song.style.display = '');
        clearSearchResults();
        return;
    }

    document.querySelectorAll('.song[data-playlist]').forEach(song => song.style.display = 'none');
    renderSearchResults(query.toLowerCase());
});

searchResultsEl?.addEventListener('click', (e) => {
    const result = e.target.closest('.song[data-track-src]');
    if (!result) return;
    if (e.target.closest('.heart')) return;
    playSongFromElement(result);
});

// Recently clicked handlers
recentList?.addEventListener('click', (e) => {
    const recent = e.target.closest('.favorite');
    if (!recent) return;
    playRecentSong(recent);
});

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
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
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

// Favorites click handler
favoritesList?.addEventListener('click', (e) => {
    const favorite = e.target.closest('.favorite');
    if (!favorite) return;
    const src = favorite.dataset.trackSrc;
    if (!src) return;

    audio.src = src;
    audio.dataset.currentSrc = src;
    audio.load();
    audio.play().catch(() => {});
    playing = true;
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    playerTitle.textContent = favorite.dataset.trackTitle || playerTitle.textContent;
    playerArtist.textContent = favorite.dataset.trackArtist || playerArtist.textContent;
    playerImage.src = favorite.dataset.trackImage || playerImage.src;
    currentPlaylist = allTracks;
    currentTrackIndex = findTrackIndexBySrc(src, allTracks);
    addRecentSong();
});

// Reset recently played
resetRecentBtn?.addEventListener('click', () => {
    if (!recentList) return;
    recentList.querySelectorAll('.favorite').forEach(el => el.remove());
    const msg = recentList.querySelector('.recent-empty');
    if (msg) msg.remove();
    updateRecentPlaceholder();
});

// PLAYBACK STATE (FIXED: declared before use to avoid hoisting confusion)
let playing = false;

// PLAY/PAUSE TOGGLE
playBtn.addEventListener("click", () => {
    if (!playing) {
        audio.play();
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        playing = true;
        addRecentSong();
    } else {
        audio.pause();
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        playing = false;
    }
});

// VOLUME CONTROLS
const volumeSlider = document.getElementById('volumeSlider');
const volValue = document.getElementById('volumeValue');

function updateVolumeDisplay() {
    if (!volValue || !audio) return;
    volValue.textContent = Math.round((audio.volume || 0) * 100) + '%';
}

// Initialize volume display
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

// AUDIO EVENTS
audio.addEventListener("loadedmetadata", () => {
    if (durationTimeEl && audio.duration) {
        durationTimeEl.textContent = formatTime(audio.duration);
    }
});

// FIXED: Time update sync - now efficient and centralized
audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    setProgress(audio.currentTime);
    if (currentTimeEl) {
        currentTimeEl.textContent = formatTime(audio.currentTime);
    }
    if (durationTimeEl) {
        durationTimeEl.textContent = formatTime(audio.duration);
    }
    
    // Update proxy elements for JS compatibility
    const titleEl = document.querySelector('.player h1');
    const artistEl = document.querySelector('.player p');
    const imgEl = document.querySelector('.player .album');
    
    if (titleEl && centerTitle) 
        centerTitle.textContent = titleEl.textContent;
    if (artistEl && centerArtist) 
        centerArtist.textContent = artistEl.textContent;
    if (imgEl && document.querySelector('.center-content .album')) 
        document.querySelector('.center-content .album').src = imgEl.src;
    
    // Update bottom bar
    if (titleEl && bpTitle) bpTitle.textContent = titleEl.textContent;
    if (artistEl && bpArtist) bpArtist.textContent = artistEl.textContent;
    if (imgEl && bpThumb) bpThumb.src = imgEl.src;
    
    // UPDATE CENTER CONTENT WITH ALBUM AND GENRE
    if (centerAlbum && trackData) centerAlbum.textContent = trackData.album;
    if (centerGenre && trackData) centerGenre.textContent = trackData.genre;
});

// Store current track data for center content updates
let trackData = {};

audio.addEventListener('error', () => {
    console.error('Audio playback/load error. currentSrc=', audio.currentSrc, 'error=', audio.error);
    alert('Failed to load audio: ' + (audio.currentSrc || 'unknown'));
});

// PROGRESS BAR INTERACTION
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

// PLAYLIST FUNCTIONALITY
const playlists = {
    bben: [
        { 
            title: 'lifetime', 
            artist: 'Ben&Ben', 
            src: 'assets/songs/ben/lifetime.mp3', 
            image: 'assets/image/ben&ben/lifetime.jpg',
            album: 'Lifetime',
            genre: 'OPM'
        },
        { 
            title: 'Leaves', 
            artist: 'Ben&Ben', 
            src: 'assets/songs/ben/leaves.mp3', 
            image: 'assets/image/ben&ben/leaves.jpg',
            album: 'Leaves',
            genre: 'OPM'
        },
        { 
            title: 'autumn', 
            artist: 'Ben&Ben', 
            src: 'assets/songs/ben/autumn.mp3', 
            image: 'assets/image/ben&ben/autumn.jpg',
            album: 'Autumn',
            genre: 'OPM'
        },
        { 
            title: 'saranggola', 
            artist: 'Ben&Ben', 
            src: 'assets/songs/ben/saranggola.mp3', 
            image: 'assets/image/ben&ben/saranggola.jpg',
            album: 'Saranggola',
            genre: 'OPM'
        },
        { 
            title: 'kathang isip', 
            artist: 'Ben&Ben', 
            src: 'assets/songs/ben/kathang-isip.mp3', 
            image: 'assets/image/ben&ben/kathang-isip.jpg',
            album: 'Kathang Isip',
            genre: 'OPM'
        }
    ],
    ft: [
        { 
            title: 'kalapastangan', 
            artist: 'Fitterkarma', 
            src: 'assets/songs/fitterkarma/kalapastangan.mp3', 
            image: 'assets/image/fitterkarma/kalapastangan.jpg',
            album: 'Kalapastangan',
            genre: 'OPM'
        },
        { 
            title: 'Pag-ibig ay kanibalismo', 
            artist: 'Fitterkarma', 
            src: 'assets/songs/fitterkarma/kanibalismo.mp3', 
            image: 'assets/image/fitterkarma/kanibalismo.jpg',
            album: 'Kanibalismo',
            genre: 'OPM'
        },
        { 
            title: 'Sumpa', 
            artist: 'Fitterkarma', 
            src: 'assets/songs/fitterkarma/sumpa.mp3', 
            image: 'assets/image/fitterkarma/sumpa.jpg',
            album: 'Sumpa',
            genre: 'OPM'
        },
        { 
            title: 'Pambihira', 
            artist: 'Fitterkarma', 
            src: 'assets/songs/fitterkarma/pambihira.mp3', 
            image: 'assets/image/fitterkarma/pambihira.jpg',
            album: 'Pambihira',
            genre: 'OPM'
        },
        { 
            title: 'Isang pangako', 
            artist: 'Fitterkarma', 
            src: 'assets/songs/fitterkarma/pangako.mp3', 
            image: 'assets/image/fitterkarma/isang pangako.jpg',
            album: 'Pangako',
            genre: 'OPM'
        }
    ],
    aljames: [
        { 
            title: 'ngayong gabi', 
            artist: 'Al James', 
            src: 'assets/songs/aljames/ngayon gabi.mp3', 
            image: 'assets/image/al-james/ngayon-gabi.jpg',
            album: 'Ngayong Gabi',
            genre: 'OPM'
        },
        { 
            title: 'pa umaga', 
            artist: 'Al James', 
            src: 'assets/songs/aljames/paumaga.mp3', 
            image: 'assets/image/al-james/paumaga.jpg',
            album: 'Pa Umaga',
            genre: 'OPM'
        },
        { 
            title: 'pwede ba', 
            artist: 'Al James', 
            src: 'assets/songs/aljames/pwedeba.mp3', 
            image: 'assets/image/al-james/pwedeba.jpg',
            album: 'Pwede Ba',
            genre: 'OPM'
        },
        { 
            title: 'pahinga', 
            artist: 'Al James', 
            src: 'assets/songs/aljames/pahinga.mp3', 
            image: 'assets/image/al-james/pahinga.jpg',
            album: 'Pahinga',
            genre: 'OPM'
        },
        { 
            title: 'repeat', 
            artist: 'Al James', 
            src: 'assets/songs/aljames/repeat.mp3', 
            image: 'assets/image/al-james/repeat.jpg',
            album: 'Repeat',
            genre: 'OPM'
        }
    ],
    janroberts: [
        { 
            title: 'sagip', 
            artist: 'Jan Robert S.', 
            src: 'assets/songs/jan-roberts/sagip.mp3', 
            image: 'assets/image/janroberts/sagip.jpg',
            album: 'Sagip',
            genre: 'OPM'
        },
        { 
            title: 'patlang', 
            artist: 'Jan Robert S.', 
            src: 'assets/songs/jan-roberts/patlang.mp3', 
            image: 'assets/image/janroberts/patlang.jpg',
            album: 'Patlang',
            genre: 'OPM'
        },
        { 
            title: 'tanaw', 
            artist: 'Jan Robert S.', 
            src: 'assets/songs/jan-roberts/tanaw.mp3', 
            image: 'assets/image/janroberts/tanaw.jpg',
            album: 'Tanaw',
            genre: 'OPM'
        },
        { 
            title: 'hirap kalimutan', 
            artist: 'Jan Robert S.', 
            src: 'assets/songs/jan-roberts/hirap kalimutan.mp3', 
            image: 'assets/image/janroberts/hirap-kalimutan.jpg',
            album: 'Hirap Kalimutan',
            genre: 'OPM'
        },
        { 
            title: 'U-Belt', 
            artist: 'Jan Robert S.', 
            src: 'assets/songs/jan-roberts/u-belt.mp3', 
            image: 'assets/image/janroberts/u-belt.jpg',
            album: 'U-Belt',
            genre: 'OPM'
        }
    ]
};

const playlistTitles = { bben: 'Ben&Ben', ft: 'Fitterkarma', aljames: 'Al James', janroberts: 'Jan Robert S.'};

// Track-level favorites state: each favorite item represents one song/track.
const favoriteTracks = [];

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

// FIXED: Consolidated ended event handling - no more conflicts
audio.addEventListener("ended", () => {
    // Reset progress bar when song ends
    progress.style.width = "0%";
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
    playing = false;
    
    // Handle repeat
    if (document.getElementById('repeatBtn').classList.contains('bp-icon-active')) {
        audio.currentTime = 0;
        audio.play();
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        playing = true;
        return;
    }
    
    // Handle shuffle
    if (document.getElementById('shuffleBtn').classList.contains('bp-icon-active')) {
        if (allTracks.length > 1) {
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * allTracks.length);
            } while (randomIndex === currentTrackIndex && allTracks.length > 1);
            
            playTrack(allTracks, randomIndex);
        } else {
            audio.currentTime = 0;
            audio.play();
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            playing = true;
        }
        return;
    }
    
    // Default: play next track
    if (currentPlaylist && currentPlaylist.length > 0) {
        let nextIndex = currentTrackIndex + 1;
        if (nextIndex >= currentPlaylist.length) {
            nextIndex = 0;
        }
        playTrack(currentPlaylist, nextIndex);
    }
});

// FIXED: Centralized play function with proper UI updates
function playTrack(list, index) {
    if (!list || index < 0 || index >= list.length) return;
    const track = list[index];
    
    // Store track data for center content updates
    trackData = track;
    
    // Reset progress bar
    progress.style.width = "0%";
    
    audio.src = track.src;
    audio.dataset.currentSrc = track.src;
    audio.load();
    audio.play().catch(() => {});
    
    // Update ALL UI elements
    playerTitle.textContent = track.title;
    playerArtist.textContent = track.artist;
    playerImage.src = track.image;
    bpTitle.textContent = track.title;
    bpArtist.textContent = track.artist;
    bpThumb.src = track.image;
    centerTitle.textContent = track.title;
    centerArtist.textContent = track.artist;
    centerAlbum.textContent = track.album;
    centerGenre.textContent = track.genre;
    
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    playing = true;
    currentPlaylist = list;
    currentTrackIndex = index;
    addRecentSong();
}

// FIXED: Unified filter and search systems
// Filter tabs control library display, search controls search results
// They work independently but don't interfere with each other

// PLAYLIST FUNCTIONALITY (unchanged from original)
const playlistModal = document.getElementById('playlist-modal');
const playlistItemsEl = playlistModal?.querySelector('.playlist-items');
const closePlaylistBtn = document.getElementById('close-playlist');

function openPlaylist(id) {
    const list = playlists[id];
    if (!list || !playlistModal || !playlistItemsEl) return;
    playlistItemsEl.innerHTML = '';
    document.getElementById('playlist-title').textContent = playlistTitles[id] || 'Playlist';
    list.forEach((t, idx) => {
        const el = document.createElement('div');
        el.className = 'playlist-item';
        el.dataset.src = t.src;
        el.dataset.trackTitle = t.title;
        el.dataset.trackArtist = t.artist;
        el.dataset.trackImage = t.image;
        el.innerHTML = `
            <img src="${t.image}" alt="${t.title}">
            <div class="meta">
                <strong>${t.title}</strong>
                <div style="font-size:12px;color:#999">${t.artist}</div>
            </div>
            <span class="heart" title="Favorite this song">&#10084;</span>
        `;
        el.addEventListener('click', (evt) => {
            if (evt.target.closest && evt.target.closest('.heart')) return;
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

// PLAYLIST UI HANDLERS
document.addEventListener('click', (e) => {
    const open = e.target.closest && e.target.closest('.open-playlist');
    if (open) {
        e.preventDefault();
        const id = open.dataset.playlist;
        openPlaylist(id);
        return;
    }

    const songEl = e.target.closest && e.target.closest('.song[data-playlist]');
    if (songEl) {
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

// Initialize
updateFavoritesPlaceholder();
updateRecentPlaceholder();

// Load first track on page load without autoplaying (browsers block autoplay anyway)
if (allTracks.length > 0) {
    const track = allTracks[0];
    audio.src = track.src;
    audio.dataset.currentSrc = track.src;
    audio.load();
    playerTitle.textContent = track.title;
    playerArtist.textContent = track.artist;
    playerImage.src = track.image;
    bpTitle.textContent = track.title;
    bpArtist.textContent = track.artist;
    bpThumb.src = track.image;
    centerTitle.textContent = track.title;
    centerArtist.textContent = track.artist;
    centerAlbum.textContent = track.album;
    centerGenre.textContent = track.genre;
    // Keep play icon (not pause) since nothing is playing yet
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
    playing = false;
    currentPlaylist = allTracks;
    currentTrackIndex = 0;
}
