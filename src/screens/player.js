import React, { Component } from 'react';
import './player.css';
import createPlayer from './scripts/createPlayer';
import PlayerFileCon from './playerFileCon';


const electron = window.require("electron");

const win = electron.remote.getCurrentWindow();

let vidSrc = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";


let seekDrag = false;
let moving= true;

function findWithAttr(array, attr, value) {
    for(var i = 0; i < array.length; i += 1) {
        if(array[i][attr] == value) {
            return i;
        }
    }
    return -1;
}

class Player extends Component {
    constructor(props) {
        super(props);
        this.state = {
            playing: false,
            currentTime: "00 : 00",
            duration: "00 : 00",
            progress: 0,
            cursor: "pointer",
            fullscreen: false,
            buffering: "init",
            volConWid: 0,
            volWid: 100,
            buffers: "",
            loaded: false,
            vidSrc: "",
            initSeek: false,
            lplaypointc: 0,
            background: "",
            currentIndex: "",
            port: "",
            showFiles: false,
            playableFiles: [],
            currentFileIndex: -1
        };
        this._isMounted = false;
        this.playerInit = null;
        this.lSavedpoint = Date.now();
    }

    componentDidMount() {
        if(!this.playerInit) {
            this.playerInit = new createPlayer(this.player, this.playerCon);
        }
        document.addEventListener("fullscreenchange", this._isfullscreen);
        document.addEventListener("keydown", (key) => this.playerInit.handleKeys(key));
        this._isMounted = true;
        const { match: { params } } = this.props;

        let playableFiles = [];
        this.props.currentTorrent.files.forEach(file => {
            if(file.name.endsWith("mp4") || file.name.endsWith("mkv") || file.name.endsWith("m4v")) {
                playableFiles.push(file);
            }     
        });

        let curFileIn = findWithAttr(playableFiles, "index", params.index);

        this.setState({vidSrc: `${params.port}/${params.index}`, 
        currentIndex: params.index,
        port: params.port,
        playableFiles,
        currentFileIndex: curFileIn
        });
    }

    _isfullscreen = (event) => {
            if (document.fullscreenElement) {
                // fullscreen is activated
                this.setState({fullscreen: true});
            } else {
                // fullscreen is cancelled
                this.setState({fullscreen: false});
            }
    }

    componentWillUnmount() {
        this._isMounted = false;
        this.player = null;
        this.playerInit.destroyPlayer();
        document.removeEventListener("fullscreenchange", this._isfullscreen);
        document.removeEventListener("keydown", (key) => this.playerInit.handleKeys(key));
    }

    _onTimeUpdate = () => {
        let onTimeUpdate = this.playerInit.onTimeUpdate();
        let currentTime = onTimeUpdate.currentTime;
        let progress = onTimeUpdate.progress;
        if(!isNaN(progress)) {
            this._isMounted && this.setState({currentTime, progress});
            this._setPlayPoint(progress);
        }
        this._onBuffer();
    }
    _onLoad = () => {
        let duration = this.playerInit.convertTime(this.player.duration * 1000);
        let volWid = this.player.volume * 100;
        this._isMounted && this.setState({duration, volWid, loaded: true});
    }

    _onPlay = () => {
        let duration = this.playerInit.convertTime(this.player.duration * 1000);
        const { match: { params } } = this.props;
        if(!this.state.initSeek){
            let currentTorrent = this.props.currentTorrent;
        this._seek(currentTorrent.files[this.state.currentIndex].playpoint);
        
        }
        this._isMounted && this.setState({playing: true, duration, buffering: false, initSeek: true});
    }

    _seek = (prog) => {
        if(!this.state.loaded) {
            return false;
        }
        let duration = this.player.duration;

        let currentTime = (duration * prog) / 100;

        currentTime = this.playerInit.convertTime(currentTime * 1000);
        this._isMounted && this.setState({currentTime});
        
        this.playerInit.seek(prog);


    }

    _updateSeek = (x) => {
        if(!this.state.loaded) {
            return false;
        }
        let seekBar = this.seekBar;
        var position = x - seekBar.offsetLeft;
        let percentage = 100 * position / seekBar.offsetWidth;

    
        if (percentage > 100) {
            percentage = 100;
        }
        if (percentage < 0) {
            percentage = 0;
        }
        let duration = this.player.duration;

        let currentTime = (duration * percentage) / 100;

        currentTime = this.playerInit.convertTime(currentTime * 1000);
        if(!isNaN(percentage)) {
            this._isMounted && this.setState({progress: percentage, currentTime});
        }
        this.playerInit.seek(percentage);
    }

    _onWaiting = () => {
        this._isMounted && this.setState({buffering: true});
        this._onBuffer();
    }

    _onPlaying = () => {
        this._isMounted && this.setState({buffering: false, loaded: true});
        this._onBuffer();
    }

    _onMouseDown = (x, e) => {
        if(e.button === 2) {
            return false;
        }
        seekDrag = true;
        if(seekDrag) {
            this._updateSeek(x);
        }
    }

    _onMouseMove = (x, e) => {
        if(e.button === 2) {
            return false;
        }
        if(seekDrag) {
            this._updateSeek(x);
        }
    }
    _onMouseUp = (x, e) => {
        if(e.button === 2) {
            return false;
        }
        seekDrag = false;
        if(seekDrag) {
            this._updateSeek(x);
        }
    }

    _showCursor = () => {
        this._isMounted && this.setState({cursor: "default"});
        moving = true;
        if(this.cursorTimer) {
            clearInterval(this.cursorTimer)
        }
        this._showControls();
        
            this.cursorTimer = setInterval(() => {
                this._isMounted && this.setState({cursor: "none"});

                this._isMounted && this.setState({volConWid: 0});
            if(this.state.playing) {
                moving = false;
                this._isMounted && this._hideControls();
            }
            }, 3300);
        
    }

    _showControls = () => {
        var fadeTarget = this.controlsCon;
        var backfadeTarget = this.backButton;
        if(fadeTarget) {
            fadeTarget.style.opacity = 1;
        }
        if(backfadeTarget) {
            backfadeTarget.style.opacity = 1;
        }
    }

    _hideControls = () => {
        if(!this.state.showFiles) {
            var fadeTarget = this.controlsCon;
        var fadeOutEffect = setInterval(function () {
            if (!fadeTarget.style.opacity) {
                fadeTarget.style.opacity = 1;
            }
            if (fadeTarget.style.opacity > 0 && !moving) {
                fadeTarget.style.opacity -= 0.1;
            } else {
                clearInterval(fadeOutEffect);
            }
        }, 50);

        var backfadeTarget = this.backButton;
        var backfadeOutEffect = setInterval(function () {
            if (!backfadeTarget.style.opacity) {
                backfadeTarget.style.opacity = 1;
            }
            if (backfadeTarget.style.opacity > 0 && !moving) {
                backfadeTarget.style.opacity -= 0.1;
            } else {
                clearInterval(backfadeOutEffect);
            }
        }, 50);
        }
    }

    _showVolCon = (show) => {
        let that = this;
        if(show) {
            var volInEffect = setInterval(function () {
                if (that.state.volConWid < 100) {
                    that._isMounted && that.setState({volConWid: that.state.volConWid + 10})
                } else {
                    clearInterval(volInEffect);
                }
            }, 50);
        }
    }

    _updateVol = (x) => {
        let percentage = x.target.value;
    
        if (percentage > 100) {
            percentage = 100;
        }
        if (percentage < 0) {
            percentage = 0;
        }
        this.playerInit.seekVol(percentage);
        this._isMounted && this.setState({volWid: percentage})
    }

    _onVolChange = () => {
        this._isMounted && this.setState({volWid: this.player.volume * 100})
    }
    _onBuffer = () => {
        let player = this.player;
        let buffers = [];
        let bufferLength;
        if(player.buffered.length === 1) {
            bufferLength = player.buffered.length;
        } else {
            bufferLength = player.buffered.length;
        }
        for(let i = 0; i < bufferLength; i++){
            let buffer = this._appendBuffer(i, player.buffered.start(i), player.buffered.end(i));
            buffers.push(buffer);
        }
        this._isMounted && this.setState({buffers});
    }

    _appendBuffer(i, start, end) {
        let player = this.player;
        let duration = player.duration;

        let startPer = (start/duration) * 100;
        if(i === 0) {
            return (<div className="bufferIn" key={i} style={{left: startPer + "%", width: ((end - start)/duration)*100 + "%"}}></div>)
        } else {
            return (<div className="bufferIn" key={i} style={{left: startPer + "%", width: ((end - start)/duration)*100 + "%"}}></div>)
        }
    }

    _setPlayPoint = (point) => {
        const now = Date.now();
        if(now - this.lSavedpoint > 3000) {
            const { match: { params } } = this.props;
            let torrents = this.props.app.state.torrents;
            let currentTorrent = this.props.currentTorrent;
        
            torrents[currentTorrent.index].files[this.state.currentIndex].playpoint = point;

            this.props.app.setState({torrents});
            this.props.store.set(torrents);
            this.lSavedpoint = now;
        }
    }
    

    _goBack = () => {
        this.props.history.goBack();
    }

    _playThisFile = (file, index) => {
        let curFileIn = findWithAttr(this.state.playableFiles, "index", index);
        this.player.pause();
        this.setState({
            vidSrc: `${this.state.port}/${file.index}`,
            currentIndex: index,
            playing: false,
            currentTime: "00 : 00",
            duration: "00 : 00",
            progress: 0,
            cursor: "pointer",
            buffering: "init",
            volConWid: 0,
            volWid: 100,
            buffers: "",
            loaded: false,
            initSeek: false,
            showFiles: false,
            currentFileIndex: curFileIn
        })
    }

  render() {
      let torrentDat = this.props.currentTorrent;
      let playableFiles = this.state.playableFiles;
      let curFileIn = this.state.currentFileIndex;
      let latFileIn = playableFiles.length - 1;
    return (
      <div className="playerCon"
      ref={ref => {
          this.playerCon = ref;
      }}
      onMouseMove={this._showCursor}
      onDoubleClick={() => win.setFullScreen(!win.isFullScreen())}
      style={{cursor: this.state.cursor}}
      align={"center"}
      >
		<video ref={ref => {
            this.player = ref;
        }} 
        id="player" 
        className="player"
        src={`http://localhost:${this.state.vidSrc}`}
        onLoad={this._onLoad}
        onPlay={this._onPlay}
        onPause={() => {this.setState({playing: false}); this._showControls()}}
        onTimeUpdate={this._onTimeUpdate}
        onWaiting={this._onWaiting}
        onCanPlay={this._onPlaying}
        onPlaying={this._onPlaying}
        onLoadedMetadata={this._onLoad}
        onVolumeChange={this._onVolChange}
        onProgress={this._onBuffer}
        autoPlay
        ></video>
        <div className='uxCon'>
            <div className="bufferingCon">
            {this.state.buffering ? (
                <div className="bufferIconCon">
            <i className="bufferIcon fas fa-spinner"></i>
            </div>
            ) : null}
            </div>
            <div className="topButton" ref={ref => {
            this.backButton = ref;
        }}>
            <button className="backButton" onClick={this._goBack}>
            <i className="topConIcon fas fa-arrow-circle-left"></i>
            </button>
            </div>
        </div>
        {this.state.buffering !== "init" ? (
            <div className='controlsCon' 
            ref={ref => {
            this.controlsCon = ref;
        }}>
			{/* <!-- topControle --> */}
			<div className="topCon">
            {/* <div className="topButton">
            <button className="backButton" onClick={this._goBack}>
            <i className="topConIcon fas fa-arrow-circle-left"></i>
            </button>
            </div> */}
            </div>
			{/* <!-- topControls -->
			<!-- middleControls --> */}
			<div className="middleCon">
            <div className="controlCon">
            {curFileIn != 0 ? (
                <button className="control" onClick={() => this._playThisFile(playableFiles[curFileIn - 1], playableFiles[curFileIn - 1].index)}>
                        <i className="conIcon fas fa-step-backward"></i>
                    </button>
            ) : (
                <div className="control-disabled">
                    <i className="conIcon fas fa-step-backward"></i>
                </div>
            )}
                    <div className="playCon">
            {!this.state.buffering ? (
                <div className="playConIn">
                    {!this.state.playing ? (
                        <button className="control" style={{width: '100%'}} onClick={() => this.playerInit.play()} type="button">
                        <i className="conIcon fas fa-play"></i>
                    </button>
                    ) : (
                        <button className="control" style={{width: '100%'}} onClick={() => this.playerInit.pause()} type="button">
                        <i className="conIcon fas fa-pause"></i>
                    </button>
                    )}
                    </div>
            ) : null}
            </div>
            {curFileIn != latFileIn ? (
                <button className="control" onClick={() => this._playThisFile(playableFiles[curFileIn + 1], playableFiles[curFileIn + 1].index)}>
                        <i className="conIcon fas fa-step-forward"></i>
                    </button>
            ) : (
                <div className="control-disabled">
                    <i className="conIcon fas fa-step-forward"></i>
                </div>
            )}
            </div>
			</div>
			{/* <!-- middleControls -->
			<!-- bottomControls --> */}
			<div className="bottomCon">
            <div className="timeCon">
            <div className="time currentTime">{this.state.currentTime}</div>
            <div className="midTime"></div>
            <div className="time duration">{this.state.duration}</div>
            </div>
            <div className="sliderConDragger" onMouseDown={(e) => this._onMouseDown(e.pageX, e)}
                onMouseMove={(e) => this._onMouseMove(e.pageX, e)}
                onMouseUp={(e) => this._onMouseUp(e.pageX, e)}>
            <div className="sliderCon"
                ref={ref => {
                    this.seekBar = ref;
                }}
                >
                    <div 
                    className="slider">
                        <div className="bufferCon">
                        {this.state.buffers}
                        </div>
						<div id="sliderIn" style={{width: this.state.progress + "%"}} className="sliderIn"></div>
                        <div className="sliderInpCon">
                        <input ref={ref => {
                            this.mainSlider = ref
                            }} 
                            type="range" 
                            min="0" 
                            max="100"
                            step="0.1"
                            className="seekSlider" 
                            id="myRange"
                            onChange={(per) => this._seek(per.target.value)}
                            value={this.state.progress}
                            style={{
                                marginTop: this.state.fullscreen ? -1 : 0
                            }}
                            onKeyDown={() => {return false}}
                            onKeyUp={() => {return false}}
                            onKeyPress={() => {return false}}
                        ></input>
                        </div>
					</div>
				</div>
                </div>
                <div className="otherCons">
                <div className="leftCon">
                <button className="otherControl" onMouseOver={() => this._showVolCon(true)}>
                    <i className="onIcon fas fa-volume-up"></i>
                </button>

                <div className="volSliderCon" 
                ref={ref => {
                    this.volBar = ref
                }}
                >
                <div className="volCon" style={{width: this.state.volConWid}}>
                <input ref={ref => {
                    this.volBar = ref
                }} type="range" 
                min="1" 
                max="100"
                className="volSlider" 
                id="myRange"
                onChange={this._updateVol}
                value={this.state.volWid}
                onKeyDown={() => {return false}}
                onKeyUp={() => {return false}}
                onKeyPress={() => {return false}}
                ></input>
                </div>
                </div>
                </div>
                <div className="rightCon">

                <button className="otherControl" onClick={() => {this.setState({showFiles: !this.state.showFiles})}}>
                    <i className="onIcon fas fa-layer-group"></i>
                </button>
                
                {/* <button className="otherControl">
                    <i className="onIcon fas fa-cog"></i>
                </button> */}

                <button className="otherControl" onClick={() => {
                        win.setFullScreen(!win.isFullScreen());
                    }}>
                    {!win.isFullScreen() ? (
                        <i className="onIcon fas fa-expand"></i>
                    ) : (
                        <i className="onIcon fas fa-compress"></i>
                    )}
                </button>
                    </div>
                </div>
			</div>
			{/* <!-- bottomControls --> */}
            {this.state.showFiles ? (
                <div className="episodeList">
            {torrentDat && torrentDat.files ? (
                <div className="filesCon">
                    {torrentDat.files.slice(0).map((item,i) => <PlayerFileCon key={item.name + i} filei={i} torrentDat={torrentDat} file={item} currentIndex={this.state.currentIndex} playThisFile={this._playThisFile} {...this.props}/>)}
                </div>
            ) : null}
            </div>
            ) : null}
		</div>
        ) : null}
		
      </div>
    );
  }
}

export default Player;
