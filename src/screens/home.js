/* eslint-disable no-console */
/* eslint-disable no-undef */
import React, { Component } from "react";
import "./home.css";
import Navbar from "../ui/navbar";
import Footer from "../ui/footer";
import TorrentCon from './torrentCon';
import LoadingT from './loadingT';

const electron = window.require("electron");

const app = electron.remote.app;
const fs = electron.remote.require("fs");

const appPath = app.getPath("userData");



// client.seed(appPath + "/Local Storage/torrents/avengers3_1.mkv", function (torrent) {
//   console.log(torrent);
//   console.log(torrent.magnetURI);
//   var server = torrent.createServer();
//   server.listen(3003);
// });



class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      torrents: []
    };
    this._isMounted = true;
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  _pickedFile = (file) => {
    fs.copyFileSync(file.path, `${appPath}/Local Storage/torrents/${file.name}`);
    this.props.app._addTorrent(file.path);
  }

  

  // onClick={() => this.props.history.push("player/bunny")}

  render() {
    let torrents = this.props.app.state.torrents;
    return (
      <div className="con">
        <Navbar _pickedFile={this._pickedFile} {...this.props}/>
        {torrents ? (
          <div className='midCon'>
        
        {torrents.slice(0).reverse().map((item,i) => <Torrent key={item.infoHash + i} i={i} infoHash={item.infoHash} torrent={item} {...this.props}/>)}
        </div>
        ) : (
          <div className='midCon'></div>
        )}
        <Footer />
      </div>
    );
  }
}

class Torrent extends Component {
  render() {
    let item = this.props.torrent;
    return(
    <div>
    {this.props.torrent.infoHash ? (
            <TorrentCon key={item.infoHash} infoHash={item.infoHash} torrent={item} {...this.props}/>
          ) : (
            <LoadingT key={item.infoHash + this.props.i} {...this.props}/>
          )}
    </div>
  );
  }
  }

export default Home;
