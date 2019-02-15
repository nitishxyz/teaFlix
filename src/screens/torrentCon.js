/* eslint-disable no-console */
/* eslint-disable no-undef */
import React, { Component } from "react";
import "./torrentCon.css";
import * as Icon from "react-feather";
import Checkbox from "@material-ui/core/Checkbox";
import { MuiThemeProvider, createMuiTheme, withStyles } from '@material-ui/core/styles';
import FileCon from './fileCon';


var download = window.require('download-file')

const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
  },
  palette: {
    primary: {
      // light: will be calculated from palette.primary.main,
      main: '#ffffff',
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
    },
    secondary: {
      light: '#0066ff',
      main: '#0044ff',
      // dark: will be calculated from palette.secondary.main,
      contrastText: '#ffcc00',
    },
    // error: will use the default color
  },
  root: {
    flexGrow: 1,
  },
});

const electron = window.require("electron");

const fs = electron.remote.require("fs");

const app = electron.remote.app;


const appPath = app.getPath("userData");

const fetch = window.require('fetch-base64');


const win = electron.remote.getCurrentWindow();

function formatBytes(bytes,decimals) {
   if(bytes == 0) return '0 Bytes';
   var k = 1024,
       dm = decimals <= 0 ? 0 : decimals || 2,
       sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
       i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function convertTime(ms, delim = " : ") {
    const showWith0 = value => (value < 10 ? `0${value}` : value);
    const hours = showWith0(Math.floor((ms / (1000 * 60 * 60)) % 60));
    const minutes = showWith0(Math.floor((ms / (1000 * 60)) % 60));
    const seconds = showWith0(Math.floor((ms / 1000) % 60));
    return `${parseInt(hours) ? `${hours} hours ` : ""}${minutes} minutes ${seconds} seconds`;
  }

  function findWithAttr(array, attr, value) {
    for(var i = 0; i < array.length; i += 1) {
        if(array[i][attr] === value) {
            return i;
        }
    }
    return -1;
}

function cacheFile(fileName) {
  const url = `https://image.tmdb.org/t/p/w500${fileName}`;

  var options = {
    directory: `${appPath}/Local Storage/cached/`,
    filename: fileName
}

if(!fs.existsSync(`${appPath}/Local Storage/cached/${fileName}`)) {
  download(url, options, function(err){
    if (err) {
      cacheFile(fileName);
    }
  }) 
  }
}

class TorrentCon extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      torrent: "",
      active: false,
      prog: 0,
      torrentSize: 0,
      downloaded: 0,
      downloadSpeed: 0,
      uploadSpeed: 0,
      peers: 0,
      timeLeft: 0,
      bytes: 0,
      completed: false,
      playDef: 0,
      addedTorrents: [],
      showFiles: false
    };
    this._isMounted = true;
  }
  componentDidMount() {
    this._isMounted = true;
     // console.log(torrent);
     if(this.downloadTimer) {
      clearInterval(this.downloadTimer);
    }

     let torrentDat = this.props.torrent;
     let torrent = this.props.client.get(torrentDat.magnetURI);
     let formattedLen = formatBytes(torrentDat.torrentLength);
     if(isNaN(torrentDat.torrentLength)) {
       this.setState({torrentSize: "Waiting"});
     } else {
       this.setState({torrentSize: formattedLen});
     }

     this.setState({addedTorrents: this.props.addedTorrents});

     if(torrent) {
       this.setState({active: torrentDat.active});
    let that = this;

    this._progress(torrent);

    // console.log(this.props.torrent);



// torrent.on('upload', function (bytes) {
//   that._isMounted && that.setState({
//     uploadSpeed: formatBytes(torrent.uploadSpeed),
//     peers: torrent.numPeers
//   })
// })

if(torrent.done) {
  if(torrent.length === torrent.downloaded) {
    this._isMounted && this.setState({
    completed: true, 
    prog: 100,
    downloaded: formatBytes(torrent.downloaded),
    downloadSpeed: 0,
    timeLeft: 0
    });
  }
}

let timeR = (torrent.length - torrent.downloaded) / torrent.downloadSpeed;
    timeR = timeR * 1000;
    if(isNaN(timeR)) {
      timeR = "Waiting";
    } else {
      timeR = convertTime(timeR);
    }

  that._isMounted && that.setState({
    downloaded: formatBytes(torrent.downloaded),
    downloadSpeed: formatBytes(torrent.downloadSpeed),
    uploadSpeed: formatBytes(torrent.uploadSpeed),
    prog: torrent.progress * 100,
    peers: torrent.numPeers,
    timeLeft: timeR
  })

if(this.props.torrent.files) {
  var file = this.props.torrent.files.find(function (file) {
    return file.name.endsWith('.mp4') || file.name.endsWith('.mkv')
  });

  if(file) {
    var fileIndex = findWithAttr(this.props.torrent.files, "name", file.name);
    this.setState({playDef: fileIndex});
  }
}
//if torrent added
     }

  }

   shouldComponentUpdate(nextProps, nextState) {
      return this.props.torrent != nextProps.client.get(this.props.torrent.magnetURI) || this.props.addedTorrents != nextProps.addedTorrents;
   }

  componentWillUnmount() {
    this._isMounted = false;
    if(this.downloadTimer) {
      clearInterval(this.downloadTimer);
    }
  }

  _progress = (torrent) => {
    let that = this;

    if(this.props.torrent.files && !this.state.playDef) {
  var file = this.props.torrent.files.find(function (file) {
    return file.name.endsWith('.mp4') || file.name.endsWith('.mkv')
  });

  if(file) {
    var fileIndex = findWithAttr(this.props.torrent.files, "name", file.name);
    this.setState({playDef: fileIndex});
  }
}

    this.downloadTimer = setInterval(() => {

      let timeR = (torrent.length - torrent.downloaded) / torrent.downloadSpeed;
    timeR = timeR * 1000;
    if(isNaN(timeR)) {
      timeR = "Waiting";
    } else {
      timeR = convertTime(timeR);
    }
    let formattedLen = formatBytes(torrent.length);
    if(isNaN(torrent.length)) {
       formattedLen = "Waiting";
     }
  that._isMounted && that.setState({
    torrentSize: formattedLen,
    downloaded: formatBytes(torrent.downloaded),
    downloadSpeed: formatBytes(torrent.downloadSpeed),
    uploadSpeed: formatBytes(torrent.uploadSpeed),
    prog: torrent.progress * 100,
    peers: torrent.numPeers,
    timeLeft: timeR
  })
}, 1000);
  };

  handleToggle = () => {
    let torrentDat = this.props.torrent;
     let torrent = this.props.client.get(torrentDat.magnetURI);
     this._isMounted && this.setState({
      active: !this.state.active,
    });

    if(torrent && torrent.files) {
      if(!this.state.active) {
        for(let i = 0; i < torrent.files.length; i++) {
          torrent.files[i].select();
          if(this.downloadTimer) {
            clearInterval(this.downloadTimer);
          }
          this._progress(torrent);
          torrent.resume();
        // console.log(torrent.files[i]);
      }
    } else {
      for(let i = 0; i < torrent.files.length; i++) {
          torrent.files[i].deselect();
          torrent.pause();
          clearInterval(this.downloadTimer);
        // console.log(torrent.files[i]);
      }

    }
     } else {
      //  if torrent is not added!
       this.props.app._addTorrent(torrentDat.magnetURI, torrentDat.index, torrentDat);
       let torrentP = this.props.client.get(torrentDat.magnetURI);
          this._progress(torrentP);
     }

    let torrents = this.props.app.state.torrents;
    torrents[this.props.torrent.index].active = !this.state.active;
    this.props.app.setState({torrents});


    let store = this.props.store;
    store.set(torrents)
  };
  render() {
    let torrentDat = this.props.torrent;
    let meta = torrentDat.metaData;
    let placeholder = this.props.placeholder;
    let pic = placeholder;
    let title = torrentDat.tname;
    let desc = "";
    let seasonNum = "";
    let episodeNum = "";
    let backPic = `url(${placeholder})`;
    let year = ""

    if(meta) {
      // film
      if(torrentDat.ttype === "film") {
        title = meta.original_title;
      desc = meta.overview;
      year = meta.release_date.split("-")[0];
      let backdrop = `${appPath}/Local Storage/cached${meta.backdrop_path}`;
      let poster = `${appPath}/Local Storage/cached${meta.poster_path}`;
      if(fs.existsSync(backdrop)) {
        // let back_img = fs.readFileSync(backdrop).toString('base64');
        //  backPic = `url(data:image/jpeg;base64,${back_img})`;
        backPic = `url("file://${backdrop}")`
      } else {
        cacheFile(meta.backdrop_path);
      }
      if(fs.existsSync(poster)) {
        let poster_img = fs.readFileSync(poster).toString('base64');
        //  pic = `data:image/jpeg;base64,${poster_img}`;
        pic = `file://${poster}`
      } else {
        cacheFile(meta.poster_path);
      }
      // film
      } else if(torrentDat.ttype === "tvEpisode") {
        title = meta.name;
        desc = meta.overview;
        year = meta.air_date.split("-")[0];
        episodeNum = meta.episode_number;
        seasonNum = meta.season_number;
        let backdrop = `${appPath}/Local Storage/cached${meta.still_path}`;
      let poster = `${appPath}/Local Storage/cached${meta.poster_path}`;
      if(fs.existsSync(backdrop)) {
        // let back_img = fs.readFileSync(backdrop).toString('base64');
        //  backPic = `url(data:image/jpeg;base64,${back_img})`;
         backPic = `url("file://${backdrop}")`
      } else {
        cacheFile(meta.still_path);
      }
      if(fs.existsSync(poster)) {
        // let poster_img = fs.readFileSync(poster).toString('base64');
        //  pic = `data:image/jpeg;base64,${poster_img}`;
         pic = `file://${poster}`
      } else {
        cacheFile(meta.poster_path);
      }
      } else if (torrentDat.ttype === "tvSeason") {
        title = meta.name;
        desc = meta.overview;
        year = meta.air_date.split("-")[0];
        seasonNum = meta.season_number;
        let backdrop = `${appPath}/Local Storage/cached${meta.backdrop_path}`;
      let poster = `${appPath}/Local Storage/cached${meta.poster_path}`;
      if(fs.existsSync(backdrop)) {
        // let back_img = fs.readFileSync(backdrop).toString('base64');
        //  backPic = `url(data:image/jpeg;base64,${back_img})`;
        backPic = `url("file://${backdrop}")`
      } else {
        cacheFile(meta.backdrop_path);
      }
      if(fs.existsSync(poster)) {
        // let poster_img = fs.readFileSync(poster).toString('base64');
        //  pic = `data:image/jpeg;base64,${poster_img}`;
        pic = `file://${poster}`
      } else {
        cacheFile(meta.poster_path);
        }
      }
    }
    let torrent = this.state.torrent;
    return (
      <MuiThemeProvider theme={theme}>
      <div className="conTor">
      <div className="backgroundImage" style={{backgroundImage: backPic}}>
          <div style={{backgroundColor: "rgba(0,0,0,0.3)", position: 'absolute', left:0,right:0,top:0,bottom:0}}/>
        </div>
      <div className="torrentCon">
        <div className="torrentInfoFull">
          <div className="torrentImgCon" onClick={() => {
            if(this.props.addedTorrents.includes(this.props.torrent.index)) {
              this.props.app.setState({currentTorrent: torrentDat})
              this.props.history.push(`player/${torrentDat.servePort}/${this.state.playDef}`)}
            }
            }>
            <img src={pic} className="torrentImg"/>
          </div>
          <div style={{flexDirection: "column", flex:1}}>
          {/* torrentInfo */}
          <div className="torrentInfo" style={{marginTop: 6}}>
            <div className="torrentName" onClick={() => {
            this.setState({showFiles: !this.state.showFiles})
          }}>
            {title}
            </div>
            <div className="torrentMeta" style={{marginTop: 6}} onClick={() => {
            this.setState({showFiles: !this.state.showFiles})
          }}>
              <div className="torrentYear">
                {year}
              </div>
              {torrentDat.ttype === "tvSeason" || torrentDat.ttype === "tvEpisode" ? (
                <div className="torrentDot">
              .
              </div>
              ) : null}
              {torrentDat.ttype === "tvSeason" || torrentDat.ttype === "tvEpisode" ? ( 
                <div className="torrentSeason">
                  Season {seasonNum}
                </div>
              ) : null}

              {torrentDat.ttype === "tvEpisode" ? (
                <div className="torrentDot">
              .
              </div>
              ) : null}
              {torrentDat.ttype === "tvEpisode" ? ( 
                <div className="torrentSeason">
                  Episode {episodeNum}
                </div>
              ) : null}
              
              {meta && meta.vote_average ? (
                <div className="torrentDot">
              .
              </div>
              ) : null}

              {meta && meta.vote_average ? (
                <div className="torrentStars">
                  <Icon.Star color={"#fff"} size={14} style={{marginTop: 1.5}}/>  <span className="starVal">{meta.vote_average}</span>
                </div>
              ) : null}
              
            </div>
            <div style={{flex:1,marginTop: 10, paddingLeft: 13}} onClick={() => {
            this.setState({showFiles: !this.state.showFiles})
          }}>
            {desc ? (
              <div style={{height: 45, lineHeight: 1.4, textOverflow: 'ellipsis', overflow: 'hidden'}}>{desc}</div>
            ) : null}
            </div>
            {/* torrentProgress */}
            {this.state.active && !this.state.completed ? (
              <div className="torrentMeta">
            <div className="torrentProg">
              <Checkbox
                checked={this.state.active}
                onChange={this.handleToggle}
                color={"primary"}
              />
              </div>
              <div className="torrentProg" style={{width: 100, paddingRight: '9px'}}>
              <div style={{height: 5, width: '100%', backgroundColor: 'rgba(255,255,255,0.5)'}}>
              <div style={{
                width: this.state.prog + "%",
                backgroundColor: '#fff',
                height: 5,
              }}></div>
              </div>
              </div>
              <div className="torrentProg">
                {this.state.downloaded} / {this.state.torrentSize}
              </div>
              <div className="torrentBot">
              .
              </div><div className="torrentProg">
                {this.state.peers} Peers
              </div>
              <div className="torrentBot">
              .
              </div>
              <div className="torrentProg">
                <Icon.ArrowDown color={"#fff"} size={14}/> 
                <span className="progVal">{this.state.downloadSpeed}/s</span>
              </div>
              <div className="torrentBot">
              .
              </div>
              <div className="torrentProg">
                <Icon.ArrowUp color={"#fff"} size={14}/> 
                <span className="progVal">{this.state.uploadSpeed}/s</span>
              </div>
              <div className="torrentBot">
              .
              </div>
              <div className="torrentProg">
                {this.state.timeLeft}
              </div>
            </div>
            ) : (
              <div className="torrentMeta">
            {this.state.active ? (
              <div>
              <div className="torrentProg">
              <Checkbox
                checked={this.state.active}
                onChange={this.handleToggle}
                color={"primary"}
              />
              </div>
              <div className="torrentProg">
                Seeding
              </div>
              <div className="torrentBot" style={{marginTop: 3}}>
              .
              </div>
              <div className="torrentProg">
                <Icon.ArrowUp color={"#fff"} size={14}/> 
                <span className="progVal">{this.state.uploadSpeed}/s</span>
              </div>
              </div>
            ) : (
              <div>
              <div className="torrentProg">
              <Checkbox
                checked={this.state.active}
                onChange={this.handleToggle}
                color={"primary"}
              />
              </div>
              <div className="torrentProg">
                Paused
              </div>
              </div>
            )}
            </div>
            )}
            {/* torrent Progress */}
          </div>
          {/* torrentInfo */}
          </div>
        </div>
      </div>
      {torrentDat && torrentDat.files && this.state.showFiles ? (
        <div className="filesCon">
          {torrentDat.files.slice(0).map((item,i) => <FileCon key={item.name + i} filei={i} torrentDat={torrentDat} file={item} {...this.props}/>)}
        </div>
      ) : null}
      </div>
      </MuiThemeProvider>
    );
  }
}

export default TorrentCon;
