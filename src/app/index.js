class MusicPlayer {
  constructor() {
    this.audio = document.getElementById("audioPlayer")
    this.playlist = []
    this.currentIndex = 0
    this.isPlaying = false
    this.isShuffled = false
    this.isRepeating = false
    this.volume = 0.5

    this.initializeElements()
    this.bindEvents()
    this.updateVolumeDisplay()
    this.createGalaxyParticles()
  }

  initializeElements() {
    this.playBtn = document.getElementById("btnPlay")
    this.prevBtn = document.getElementById("btnAnterior")
    this.nextBtn = document.getElementById("btnSiguiente")
    this.shuffleBtn = document.getElementById("btnShuffle")
    this.repeatBtn = document.getElementById("btnRepeat")
    this.volumeBtn = document.getElementById("btnVolumen")
    this.volumeSlider = document.getElementById("volumenSlider")
    this.progressBar = document.getElementById("barraProgreso")
    this.fileInput = document.getElementById("cargarCancion")
    this.songList = document.getElementById("listaCanciones")
    this.albumCover = document.getElementById("albumImage")
    this.albumCoverContainer = document.querySelector(".album-cover")
    this.songTitle = document.getElementById("tituloCancion")
    this.songArtist = document.getElementById("artistaCancion")
    this.currentTime = document.getElementById("tiempoActual")
    this.totalTime = document.getElementById("tiempoTotal")
    this.progressFill = document.querySelector(".progress-fill")
    this.clearPlaylistBtn = document.getElementById("btnClearPlaylist")
    this.uploadBtn = document.getElementById("uploadBtn")
    this.visualizerBars = document.querySelectorAll(".bar")
  }

  bindEvents() {
    this.uploadBtn.addEventListener("click", () => this.fileInput.click())
    this.playBtn.addEventListener("click", () => this.togglePlay())
    this.prevBtn.addEventListener("click", () => this.previousSong())
    this.nextBtn.addEventListener("click", () => this.nextSong())
    this.shuffleBtn.addEventListener("click", () => this.toggleShuffle())
    this.repeatBtn.addEventListener("click", () => this.toggleRepeat())
    this.volumeBtn.addEventListener("click", () => this.toggleMute())
    this.volumeSlider.addEventListener("input", (e) => this.setVolume(e.target.value / 100))
    this.progressBar.addEventListener("input", (e) => this.setProgress(e.target.value))
    this.fileInput.addEventListener("change", (e) => this.loadFiles(e.target.files))
    this.clearPlaylistBtn.addEventListener("click", () => this.clearPlaylist())
    this.audio.addEventListener("loadedmetadata", () => this.updateDuration())
    this.audio.addEventListener("timeupdate", () => this.updateProgress())
    this.audio.addEventListener("ended", () => this.handleSongEnd())
    this.audio.addEventListener("loadstart", () => this.showLoading())
    this.audio.addEventListener("canplay", () => this.hideLoading())
  }

  createGalaxyParticles() {
    const particlesContainer = document.querySelector(".particles")

    for (let i = 0; i < 20; i++) {
      const particle = document.createElement("div")
      particle.className = "galaxy-particle"
      particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 3 + 1}px;
        height: ${Math.random() * 3 + 1}px;
        background: linear-gradient(45deg, #ff006e, #8338ec, #3a86ff);
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: galaxyFloat ${Math.random() * 10 + 5}s ease-in-out infinite;
        animation-delay: ${Math.random() * 5}s;
      `
      particlesContainer.appendChild(particle)
    }

    const style = document.createElement("style")
    style.textContent = `
      @keyframes galaxyFloat {
        0%, 100% { 
          transform: translateY(0px) translateX(0px) rotate(0deg);
          opacity: 0.3;
        }
        25% { 
          transform: translateY(-20px) translateX(10px) rotate(90deg);
          opacity: 1;
        }
        50% { 
          transform: translateY(-10px) translateX(-15px) rotate(180deg);
          opacity: 0.7;
        }
        75% { 
          transform: translateY(15px) translateX(5px) rotate(270deg);
          opacity: 0.9;
        }
      }
    `
    document.head.appendChild(style)
  }

  loadFiles(files) {
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("audio/")) {
        const song = {
          file: file,
          url: URL.createObjectURL(file),
          title: this.extractTitle(file.name),
          artist: this.extractArtist(file.name),
          duration: "0:00",
        }
        this.playlist.push(song)
        this.addSongToList(song, this.playlist.length - 1)
        if (this.playlist.length === 1) {
          this.loadSong(0)
        }
      }
    })
  }

  extractTitle(filename) {
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "")
    if (nameWithoutExt.includes(" - ")) {
      return nameWithoutExt.split(" - ")[1].replace(/[-_]/g, " ")
    }
    return nameWithoutExt.replace(/[-_]/g, " ")
  }

  extractArtist(filename) {
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "")
    if (nameWithoutExt.includes(" - ")) {
      return nameWithoutExt.split(" - ")[0].replace(/[-_]/g, " ")
    }
    return "Artista desconocido"
  }

  addSongToList(song, index) {
    const li = document.createElement("li")
    li.className = "song-item"
    li.dataset.index = index

    li.innerHTML = `
            <div class="song-item-info">
                <div class="song-title">${song.title}</div>
                <div class="song-artist">${song.artist}</div>
            </div>
            <div class="song-duration">${song.duration}</div>
            <div class="song-controls">
                <button class="song-control-btn" onclick="musicPlayer.playSong(${index})">
                    <i class="fas fa-play"></i>
                </button>
                <button class="song-control-btn" onclick="musicPlayer.removeSong(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `

    li.addEventListener("click", () => this.playSong(index))
    this.songList.appendChild(li)
  }

  loadSong(index) {
    if (index < 0 || index >= this.playlist.length) return
    const song = this.playlist[index]
    this.currentIndex = index
    this.audio.src = song.url
    this.songTitle.textContent = song.title
    this.songArtist.textContent = song.artist
    this.updateActiveItem()
    this.updateAlbumCover()
  }

  updateAlbumCover() {
    const song = this.playlist[this.currentIndex]
    if (song) {
      this.albumCover.src = `/placeholder.svg?height=200&width=200&query=music album cover for ${encodeURIComponent(song.title)}`
    }
  }

  playSong(index) {
    this.loadSong(index)
    this.play()
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause()
    } else {
      this.play()
    }
  }

  play() {
    if (this.playlist.length === 0) return

    this.audio
      .play()
      .then(() => {
        this.isPlaying = true
        this.playBtn.innerHTML = '<i class="fas fa-pause"></i>'
        this.playBtn.classList.add("playing")
        this.albumCoverContainer.classList.add("playing")
        this.startVisualizer()
      })
      .catch((error) => {
        console.error("Error al reproducir:", error)
      })
  }

  pause() {
    this.audio.pause()
    this.isPlaying = false
    this.playBtn.innerHTML = '<i class="fas fa-play"></i>'
    this.playBtn.classList.remove("playing")
    this.albumCoverContainer.classList.remove("playing")
    this.stopVisualizer()
  }

  previousSong() {
    if (this.playlist.length === 0) return

    let newIndex
    if (this.isShuffled) {
      newIndex = Math.floor(Math.random() * this.playlist.length)
    } else {
      newIndex = this.currentIndex - 1
      if (newIndex < 0) newIndex = this.playlist.length - 1
    }

    this.playSong(newIndex)
  }

  nextSong() {
    if (this.playlist.length === 0) return

    let newIndex
    if (this.isShuffled) {
      newIndex = Math.floor(Math.random() * this.playlist.length)
    } else {
      newIndex = this.currentIndex + 1
      if (newIndex >= this.playlist.length) newIndex = 0
    }

    this.playSong(newIndex)
  }

  toggleShuffle() {
    this.isShuffled = !this.isShuffled
    this.shuffleBtn.classList.toggle("active", this.isShuffled)
  }

  toggleRepeat() {
    this.isRepeating = !this.isRepeating
    this.repeatBtn.classList.toggle("active", this.isRepeating)
  }

  toggleMute() {
    if (this.audio.volume > 0) {
      this.audio.volume = 0
      this.volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>'
      this.volumeSlider.value = 0
    } else {
      this.audio.volume = this.volume
      this.updateVolumeDisplay()
      this.volumeSlider.value = this.volume * 100
    }
  }

  setVolume(volume) {
    this.volume = volume
    this.audio.volume = volume
    this.updateVolumeDisplay()
  }

  updateVolumeDisplay() {
    const volume = this.audio.volume
    let icon = "fas fa-volume-up"

    if (volume === 0) {
      icon = "fas fa-volume-mute"
    } else if (volume < 0.5) {
      icon = "fas fa-volume-down"
    }

    this.volumeBtn.innerHTML = `<i class="${icon}"></i>`
  }

  setProgress(value) {
    const time = (value / 100) * this.audio.duration
    this.audio.currentTime = time
  }

  updateProgress() {
    if (this.audio.duration) {
      const progress = (this.audio.currentTime / this.audio.duration) * 100
      this.progressBar.value = progress
      this.progressFill.style.width = progress + "%"

      this.currentTime.textContent = this.formatTime(this.audio.currentTime)
    }
  }

  updateDuration() {
    this.totalTime.textContent = this.formatTime(this.audio.duration)
    const song = this.playlist[this.currentIndex]
    if (song) {
      song.duration = this.formatTime(this.audio.duration)
      const songItem = this.songList.children[this.currentIndex]
      if (songItem) {
        const durationElement = songItem.querySelector(".song-duration")
        if (durationElement) {
          durationElement.textContent = song.duration
        }
      }
    }
  }

  formatTime(seconds) {
    if (isNaN(seconds)) return "0:00"
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  handleSongEnd() {
    if (this.isRepeating) {
      this.audio.currentTime = 0
      this.play()
    } else {
      this.nextSong()
    }
  }

  updateActiveItem() {
    document.querySelectorAll(".song-item").forEach((item) => {
      item.classList.remove("active")
    })
    const currentItem = this.songList.children[this.currentIndex]
    if (currentItem) {
      currentItem.classList.add("active")
    }
  }

  removeSong(index) {
    if (index < 0 || index >= this.playlist.length) return

  
    URL.revokeObjectURL(this.playlist[index].url)

    this.playlist.splice(index, 1)

    
    this.songList.children[index].remove()

   
    if (index < this.currentIndex) {
      this.currentIndex--
    } else if (index === this.currentIndex) {
      if (this.currentIndex >= this.playlist.length) {
        this.currentIndex = 0
      }
      if (this.playlist.length > 0) {
        this.loadSong(this.currentIndex)
      } else {
        this.resetPlayer()
      }
    }

  
    this.updateSongIndices()
  }

  updateSongIndices() {
    Array.from(this.songList.children).forEach((item, index) => {
      item.dataset.index = index
      const playBtn = item.querySelector(".song-control-btn")
      const removeBtn = item.querySelectorAll(".song-control-btn")[1]

      playBtn.setAttribute("onclick", `musicPlayer.playSong(${index})`)
      removeBtn.setAttribute("onclick", `musicPlayer.removeSong(${index})`)
    })
  }

  clearPlaylist() {

    this.playlist.forEach((song) => {
      URL.revokeObjectURL(song.url)
    })

    
    this.playlist = []
    this.songList.innerHTML = ""
    this.currentIndex = 0

   
    this.resetPlayer()
  }

  resetPlayer() {
    this.pause()
    this.audio.src = ""
    this.songTitle.textContent = "Sin canción"
    this.songArtist.textContent = "Selecciona una canción"
    this.currentTime.textContent = "0:00"
    this.totalTime.textContent = "0:00"
    this.progressBar.value = 0
    this.progressFill.style.width = "0%"
    this.albumCover.src = "/vinyl-record.png"
  }

  startVisualizer() {
    this.visualizerInterval = setInterval(() => {
      this.visualizerBars.forEach((bar) => {
        const height = Math.random() * 40 + 10
        bar.style.height = height + "px"
      })
    }, 150)
  }

  stopVisualizer() {
    if (this.visualizerInterval) {
      clearInterval(this.visualizerInterval)
      this.visualizerBars.forEach((bar) => {
        bar.style.height = "10px"
      })
    }
  }

  showLoading() {
    this.playBtn.classList.add("loading")
  }

  hideLoading() {
    this.playBtn.classList.remove("loading")
  }
}

let musicPlayer
document.addEventListener("DOMContentLoaded", () => {
  musicPlayer = new MusicPlayer()
})

document.addEventListener("dragover", (e) => {
  e.preventDefault()
})

document.addEventListener("drop", (e) => {
  e.preventDefault()
  const files = e.dataTransfer.files
  if (files.length > 0) {
    musicPlayer.loadFiles(files)
  }
})
