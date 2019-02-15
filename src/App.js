/* eslint-disable no-undef */
/* eslint-disable no-console */
import React, { Component } from "react";
import "./App.css";
import { BrowserRouter as Router, Redirect, HashRouter, Route } from "react-router-dom";
import Home from "./screens/home";
import Player from "./screens/player";
import Store from "./screens/scripts/Store";
import placeholder from "./assets/placeholder.png";
const ptt = require("parse-torrent-title");

// const ptn = require('parse-torrent-name');
// console.log(ptn('[TorrentCouch.net].Arrow.S07E12.720p.HDTV.x264.[414MB]'));

const getPort = window.require('get-port');
const tnp = require('torrent-name-parser');
// var infor = tnp("[TorrentCouch.net].Arrow.S07E12.720p.HDTV.x264.[414MB]");
const MovieDb = window.require('moviedb-promise');
const moviedb = new MovieDb('ae522fd46315e75df2070ebc507385d2');



const electron = window.require("electron");
const WebTorrent = window.require("webtorrent");
const app = electron.remote.app;
const fs = electron.remote.require("fs");
const https = window.require('https');
var download = window.require('download-file')

const appPath = app.getPath("userData");
const downloads = app.getPath("downloads");

const root = fs.readdirSync(appPath);
function initDir(dirname) {
  const dirExists = fs.existsSync(dirname);
  if(!dirExists) {
    fs.mkdir(dirname, (result) => {
      // console.log("created");
    });
  } else {
    // console.log("already exists!");
  }
}
initDir(`${appPath}/Local Storage/torrents/`);
initDir(`${appPath}/Local Storage/cached/`);
initDir(`${downloads}/teaFlix/`);


const store = new Store(appPath + "/Local Storage/torrentData.json");

let storeData = store.get();



var client = new WebTorrent();

async function getPortNum() {
  let port = await getPort();
  return port;
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

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      torrents: [],
      addedTorrents: [],
      currentTorrent: ""
    };
    this._isMounted = true;
  }

  componentDidMount() {
    // console.log(storeData);
    if(storeData) {
      let torrents = JSON.parse(storeData);
    this.setState({torrents: torrents});
    torrents.slice().reverse().forEach(torr => {
      if(torr.active) {
        this._addTorrent(torr.magnetURI, torr.index, torr);
      }
    });
    }
  }

  _addTorrent = (torrentId, index, torr) => {
    let that = this;
    // let ranNum = genRanNum(1045, 29875);
    let theTorrents = this.state.torrents;
    if(index === undefined) {
    index = this.state.torrents.length;

    let tAr = {
    "infoHash" : "",
    "magnetURI": "",
    "tname": "",
    "torretLength": "",
    "servePort": "",
    "tname": "",
    "metaData": "",
    "files" : "",
    "ttype" : "",
    "index": index,
    "active": true
  };

  this._isMounted && this.setState({
    torrents: [...this.state.torrents, tAr]
    });
    // if no index
    }

  client.add(torrentId, {path: downloads + "/teaFlix/"}, function (torrent) {

    if(torr && !that.state.torrents[index].active){
      for(let i = 0; i < torrent.files.length; i++) {
          torrent.files[i].deselect();
          torrent.pause();
        // console.log(torrent.files[i]);
      // torrent.paused = true;
      }
    }

    console.log("added torrent!");
  getPortNum(that).then((port) => that._onAddTorrent(port, torrent, index));
  });

  client.on('torrent', function (torrent) {
    // console.log("index: " + index);
  })

}

_onAddTorrent = (port, torrent, index) => {
  var server = torrent.createServer();
    server.listen(port);
    let torrents = this.state.torrents;
    let theTorr = torrents[index];

    if(theTorr) {
    } else {
      theTorr = false;
    }

    let starFiles = [];

    let addedTorrents = this.state.addedTorrents;

    addedTorrents.push(index);

    this.setState({addedTorrents});

  for(let f = 0; f < torrent.files.length; f++) {
    var tfile = torrent.files[f];
    tfile = {
      "index": f,
      "name": tfile.name,
      "path": tfile.path,
      "length": tfile.length,
      "offset": tfile.offset,
      "playpoint": theTorr && theTorr.files ? theTorr.files[f].playpoint : 0
    }
    starFiles.push(tfile);
  }

    let tAr = {
    "infoHash" : torrent.infoHash,
    "magnetURI": torrent.magnetURI,
    "tname": torrent.name, 
    "torrentLength": theTorr && theTorr.torrentLength ? theTorr.torrentLength : torrent.length,
    "servePort": port,
    "metaData" : theTorr && theTorr.metaData ? theTorr.metaData : "",
    "files": starFiles,
    "ttype" : theTorr && theTorr.ttype ? theTorr.ttype : "",
    "index": index,
    "active": theTorr && theTorr.infoHash ? theTorr.active : true
  };
  torrents[index] = tAr;


  this._isMounted && this.setState({torrents});
  store.set(torrents);
  if(!theTorr || !theTorr.metaData) {
    this._setupMetaData(torrent, index);
  }
}

_setupMetaData = (torrent, index) => {
  let info = ptt.parse(torrent.name);
  if(!info.season) {
    // let qpart = "";
    // if(info.episodeName) {
    //   qpart =  " " + info.episodeName
    // }
    moviedb.searchMovie({ query: `${info.title}` }).then(res => {
  let torrents = this.state.torrents;
  torrents[index].metaData = res.results[0];
  torrents[index].ttype = "film";

  this.setState({torrents});
  store.set(torrents);

  let result = res.results[0];
  cacheFile(result.backdrop_path);
  cacheFile(result.poster_path)
  
}).catch(err => {console.log(err); this._setupMetaData(torrent, index)});
// ifMovie
  } else {
    // else TV
    moviedb.searchTv({ query: info.title }).then(res => {
    let season = res.results[0];
  if(info.episode) {
    moviedb.tvEpisodeInfo({ id: season.id, season_number:  info.season, episode_number: info.episode}).then(epires => {
    let torrents = this.state.torrents;
    epires["poster_path"] = season.poster_path;
    torrents[index].metaData = epires;
    torrents[index].ttype = "tvEpisode";
    this.setState({torrents});
    store.set(torrents);
    cacheFile(epires.poster_path);
    cacheFile(epires.still_path);
    
  }).catch(err => console.log(err));
  } else {
    moviedb.tvSeasonInfo({ id: res.results[0].id, season_number:  info.season}).then(tvres => {
    let torrents = this.state.torrents;
    tvres["backdrop_path"] = season.backdrop_path;
    tvres["overview"] = season.overview;
    tvres["name"] = season.name + " " + tvres.name;
    tvres["popularity"] = season.popularity;
    tvres["vote_average"] = season.vote_average;
    tvres["vote_count"] = season.vote_count;
    tvres["first_air_date"] = season.first_air_date;
    torrents[index].metaData = tvres;
    torrents[index].ttype = "tvSeason";
    this.setState({torrents});
    store.set(torrents);
    cacheFile(tvres.poster_path);
    cacheFile(tvres.backdrop_path);
    for(let p = 0; p < tvres["episodes"].length; p++) {
      cacheFile(tvres["episodes"][p].still_path);
    }
  }).catch(err => console.log(err));
  }

}).catch(err => console.log(err))
  }
  
}

_appsetState = (torrents) => {
  this.setState({torrents});
}

  render() {
    return (
      <div>
      <Router basename={window.location.pathname}>
        <div className="App">
          <Route
            path={"/"}
            render={props => <Home {...props} app={this} store={store} client={client} placeholder={placeholder} addedTorrents={this.state.addedTorrents}/>}
            exact
          />
          <Route
            path={"/player/:port/:index"}
            render={props => <Player {...props} apptorrents={this.state.torrents} _appsetState={this._appsetState} store={store} placeholder={placeholder} currentTorrent={this.state.currentTorrent}/>}
            exact
          />
        </div>
      </Router>
      </div>
    );
  }
}

export default App;
