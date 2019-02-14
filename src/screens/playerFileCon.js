/* eslint-disable no-undef */
/* eslint-disable no-console */
import React, { Component } from "react";
import "./playerFileCon.css";


const electron = window.require("electron");
const app = electron.remote.app;
const fs = electron.remote.require("fs");
const https = window.require("https");
var download = window.require("download-file");
const ptt = require("parse-torrent-title");

const appPath = app.getPath("userData");
const downloads = app.getPath("downloads");

class PlayerFileCon extends Component {
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

    if(file.name.endsWith("mp4") || file.name.endsWith("mkv") || file.name.endsWith("m4v")) {
    } else {
      return null;
    }


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

    let borderLft = "none";

    if(this.props.currentIndex == file.index) {
      borderLft = "2px solid #ff0000";
    }
    return (
      <div className="playfileCon" style={{borderLeft: borderLft}} onClick={() => {
        if(this.props.currentIndex != file.index) {
          this.props.playThisFile(file, this.props.filei);
        }
      }}>
        <div>
          <img src={pic} className={"playePoster"} />
        </div>
        <div className="playfileInfo">
          <div className="playfileName">
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
          <div className="playfileDesc">
            {desc}
          </div>
        </div>
      </div>
    );
  }
}

export default PlayerFileCon;
