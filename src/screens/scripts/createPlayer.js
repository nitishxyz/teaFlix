class createPlayer {
constructor(thePlayer, elem) {
    this.player = thePlayer;
    this.fullscreenElement = elem;
    this.fullscreen = false;
    document.addEventListener("fullscreenchange", function (event) {
    if (document.fullscreenElement) {
        // fullscreen is activated
        this.fullscreen = true;
    } else {
        // fullscreen is cancelled
        this.fullscreen = false;
    }
    });
}

play() {
    if(this.player) {
        this.player.play();
    }
}

pause() {
    if(this.player) {
        this.player.pause();
    }   
}

seek(prog) {
    if(this.player) {
        let duration = this.player.duration;
    let seekTo = (duration * prog)/100;
    this.player.currentTime = seekTo;
    }
}

seekTo(forward) {
    if(this.player){
        let duration = this.player.duration;
    let currentTime = this.player.currentTime;
    let seekTo;
    if(forward) {
        if(currentTime + 10 < duration) {
            seekTo = currentTime + 10;
        } else {
            seekTo = duration;
        }
    } else {
        if(currentTime - 10 > 0) {
            seekTo = currentTime - 10;
        } else {
            seekTo = 0;
        }
    }
    this.player.currentTime = seekTo;
    }
}

volumeTo(up) {
    if(this.player) {
        let currentVol = this.player.volume;
    let volumeTo;
    if(up) {
        if(currentVol + 0.1 < 1) {
            volumeTo = currentVol + 0.1;
        } else {
            volumeTo = 1;
        }
    } else {
        if(currentVol - 0.1 > 0) {
            volumeTo = currentVol - 0.1;
        } else {
            volumeTo = 0;
        }
    }
    this.player.volume = volumeTo;
    }
}

seekVol(prog) {
    if(this.player) {
        this.player.volume = prog / 100;
    }
}

mute(mute) {
    if(this.player) {
        this.player.muted = mute;
    }
    
}



onTimeUpdate() {
    if(this.player) {
        let currentTime = this.player.currentTime;
    let duration = this.player.duration;
    let progress = (currentTime/duration) * 100;
    currentTime = this.convertTime(currentTime * 1000);
    duration = this.convertTime(duration * 1000);
    let ar = ({"progress" : progress, "currentTime" : currentTime, "duration" : duration});
    return ar;
    }
};

goFullscreen() {
    let elem = this.fullscreenElement;
    if (document.fullscreenEnabled || 
	document.webkitFullscreenElement || 
	document.mozFullScreenElement) {
        if(this.fullscreen) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
              } else if (document.mozCancelFullScreen) { /* Firefox */
                document.mozCancelFullScreen();
              } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
                document.webkitExitFullscreen();
              } else if (document.msExitFullscreen) { /* IE/Edge */
                document.msExitFullscreen();
              }
              this.fullscreen = false;
        } else {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.mozRequestFullScreen) { /* Firefox */
                elem.mozRequestFullScreen();
            } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) { /* IE/Edge */
                elem.msRequestFullscreen();
            }
            this.fullscreen = true;
        }
    }
  }

  

    handleKeys(k) {
    if(this.player) {
        if(k.key === " ") {
            k.preventDefault();
        }
        let key = k.key;
        if(key === "p" || key === "k" || key === " ") {
            if(!this.player.paused) {
                this.player.pause();
            } else {
                this.player.play();
            }
            
        }

        if(key === "m") {
           this.mute(!this.player.muted);
        }

        if(key === "j" || key === "ArrowLeft") {
            this.seekTo(false);
        }

        if(key === "l" || key === "ArrowRight") {
            this.seekTo(true);
        }

        if(key === "ArrowUp") {
            this.volumeTo(true);
        }

        if(key === "ArrowDown") {
            this.volumeTo(false);
        }

        if(key === "f") {
            this.goFullscreen();
        }

    }
    }


destroyPlayer() {
    this.player = "";
}

convertTime(ms, delim = " : ") {
    const showWith0 = value => (value < 10 ? `0${value}` : value);
    const hours = showWith0(Math.floor((ms / (1000 * 60 * 60)) % 60));
    const minutes = showWith0(Math.floor((ms / (1000 * 60)) % 60));
    const seconds = showWith0(Math.floor((ms / 1000) % 60));
    return `${parseInt(hours) ? `${hours}${delim}` : ""}${minutes}${delim}${seconds}`;
  }

}
export default createPlayer;