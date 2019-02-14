/* eslint-disable no-undef */
/* eslint-disable no-console */
import React, { Component } from "react";
import "./fileCon.css";


const electron = window.require("electron");
const app = electron.remote.app;
const fs = electron.remote.require("fs");
const https = window.require("https");
var download = window.require("download-file");
const ptt = require("parse-torrent-title");

const appPath = app.getPath("userData");
const downloads = app.getPath("downloads");

class FileCon extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: []
    };
    this._isMounted = true;
  }


  componentDidMount() {
    let torrentDat = this.props.torrentDat;
    let file = this.props.file;
    let meta = this.props.torrentDat.metaData;
    if(file.name.endsWith(".mp4") || file.name.endsWith(".mkv") || file.name.endsWith(".m4v")) {
      let info = ptt.parse(file.name);
      // console.log(info);
      var found;
      if(info.season && meta && meta.episodes) {
        for (let index = 0; index < meta.episodes.length; ++index) {
          let entry = meta.episodes[index];
          if (entry.episode_number === info.episode) {
            found = entry;
            break;
          }
        }
        this.setState({file: found});
      }
    }
  }


  render() {
    let torrentDat = this.props.torrentDat;
    let meta = torrentDat.metaData;
    let file = this.props.file;
    let gotFile = this.state.file;
    let placeholder = this.props.placeholder;


    let title = file.name;
    let season = "";
    let episode = "";
    let desc = "";
    let year = "";
    let pic = placeholder;

    if(torrentDat.ttype === "film" && meta) {
      if(file.name.endsWith("mp4") || file.name.endsWith("mkv") || file.name.endsWith("m4v")) {
        title = meta.original_title;
        desc = meta.overview;
        year = meta.release_date.split("-")[0];
        let poster = `${appPath}/Local Storage/cached${meta.poster_path}`;
        if(fs.existsSync(poster)) {
          let poster_img = fs.readFileSync(poster).toString("base64");
          pic = `data:image/jpeg;base64,${poster_img}`;
        }
      }
      // film
    } else if (torrentDat.ttype === "tvEpisode" && meta) {
      if(file.name.endsWith("mp4") || file.name.endsWith("mkv") || file.name.endsWith("m4v")) {
        if(meta.length !== 0) {
          let poster = `${appPath}/Local Storage/cached${meta.still_path}`;
          if(fs.existsSync(poster)) {
            let pic_img = fs.readFileSync(poster).toString("base64");
            pic = `data:image/jpeg;base64,${pic_img}`;
          }
          title = meta.name;
          desc = meta.overview;
          season = meta.season_number;
          episode = meta.episode_number;
        }
      }
    } else if (torrentDat.ttype === "tvSeason" && meta) {
      if(file.name.endsWith("mp4") || file.name.endsWith("mkv") || file.name.endsWith("m4v")) {
        if(gotFile.length !== 0) {
          let poster = `${appPath}/Local Storage/cached${gotFile.still_path}`;
          if(fs.existsSync(poster)) {
            let pic_img = fs.readFileSync(poster).toString("base64");
            pic = `data:image/jpeg;base64,${pic_img}`;
          }
          title = gotFile.name;
          desc = gotFile.overview;
          season = gotFile.season_number;
          episode = gotFile.episode_number;
        }
      }
    }
    return (
      <div className="fileCon" onClick={() => {
        if(this.props.addedTorrents.includes(this.props.torrent.index)) {
          this.props.app.setState({currentTorrent: torrentDat});
          this.props.history.push(`player/${torrentDat.servePort}/${this.props.file.index}`);}
      }}>
        <div>
          <img src={pic} className={"ePoster"} />
        </div>
        <div className="fileInfo">
          <div className="fileName">
            <span>{title}</span>
            <div style={{
              paddingLeft: 10,
              paddingRight: 10
            }}>
              {/* {season ? (
                <span style={{marginTop: -5}}>.</span>
              ) : null} */}
              {season ? (
                <span style={{fontWeight: "bold", fontSize:14}}>S{season}</span>
              ) : null}
              {episode ? (
                <span style={{marginTop: -5, paddingLeft: 6, paddingRight: 6}}> . </span>
              ) : null}
              {episode ? (
                <span style={{fontWeight: "bold", fontSize:14}}>E{episode}</span>
              ) : null}
            </div>
          </div>
          <div className="fileDesc">
            {desc}
          </div>
        </div>
      </div>
    );
  }
}

export default FileCon;
