# El'coustic

- Propject Description
  Music ni Anika is a Spotify-inspired web music player built using HTML, CSS, and JavaScript. The application allows users to browse songs, albums, artists, and favorites while providing an interactive music playback experience.

- How to Run

- Features 

  - Play / Pause — Users can start and stop the song directly from the player interface
  - Skip Navigation — Skip to the previous or next track
  - Shuffle — Randomly picks the next song when the current one ends
  - Repeat — Restarts the current song from the beginning when it ends
  - Music Library Navigation — Browse and navigate through four playlists
  - Favorites — Click the heart in the player to automatically add a song to favorites
  - Recently Played — Tracks the songs you've played with a reset button
  - Search Bar — Search for a song by title or artist in real time
  - Progress Bar — Click or drag to seek through a song
  - Volume Control — Slider with live percentage display
 
  ## Known limitations and bugs
 
  - **No persistent state** — favorites, recently played, and playback position are lost on page refresh. There is no localStorage or backend integration.
  - **Filter tabs are partial** — the Album, Artists, and Genre tabs in the library sidebar currently show a "No items to show" message instead of filtering by         those fields. Only Title (all) and Playlists are fully functional.
  - **Center panel album art not dynamically sized** — the image is capped at 320×320px and may not scale optimally on very large or very small screens.
  - **No mobile layout** — the three-column grid is designed for desktop viewports. On narrow screens, columns compress and the bottom player can overflow or          become hard to interact with.
  - **Volume state not preserved between tracks** — volume resets to 100% when the audio element is reloaded.
  - **Heart state not synced across views** — hearting a song in the playlist modal does not visually reflect in search results and vice versa.

## Design decisions and HCI principles
 
  - **Persistent bottom player bar**
  Modeled after Spotify and Apple Music, the playback controls are always visible at the bottom of the screen regardless of what the user is browsing. This          follows the HCI principle of *visibility of system status* — the user always knows what is playing.
 
  - **Three-panel layout**
  The interface uses a fixed three-column grid: library on the left, now-playing art in the center, and contextual panels (Recently / Favorites) on the right.       This mirrors a spatial model familiar from streaming apps, reducing the learning curve (*consistency and standards*).
  
  - **Filter tabs over dropdowns**
  Library filtering uses visible pill-button tabs rather than a hidden dropdown, keeping all filter options scannable at a glance (*recognition over recall*).
 
  - **Heart as a toggle**
  The favorites interaction is a single-click toggle with color change (gray → red) and a scale animation. The visual feedback is instant and reversible,            following the *undo* and *feedback* heuristics.
 
  - **Shuffle and repeat as stateful toggles**
  Both buttons highlight in purple when active, giving a persistent visual indicator of the current playback mode — critical for avoiding user confusion about why   tracks are playing in unexpected orders.

design documentation: https://github.com/elithegrape/quibuloy/blob/main/Design%20System%20Documentation-%20El'acoustic.docx

