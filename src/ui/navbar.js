/* eslint-disable no-console */
/* eslint-disable no-undef */
import React, { Component } from "react";
import "./navbar.css";
import * as Icon from "react-feather";
import ReactTooltip from "react-tooltip";
import { FilePicker } from "react-file-picker";

const electron = window.require("electron");

const app = electron.remote.app;


const win = electron.remote.getCurrentWindow();



class Navbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showLight: "none",
      magLink: ""
    };
  }
  render() {
    return (
      <div className="navbar">
        <div className="navbarIn">
          <div className="navLeft">
            <div className="stopLights" 
              onMouseEnter={() => this.setState({showLight: "flex"})}
              onMouseLeave={() => this.setState({showLight: "none"})}
            >
              <button className="stopLight redL" onClick={() => win.close()}>
                <Icon.X classsname={"redx"} size={9} style={{display: this.state.showLight}}/>
              </button>
              <span className="btwLights"></span>
              <button className="stopLight yellowL" onClick={() => win.minimize()}>
                <Icon.Minus className={"yelldash"} size={9} style={{display: this.state.showLight}}/>
              </button>
              <span className="btwLights"></span>
              <button className="stopLight greenL" onClick={() => {
                win.setFullScreen(!win.isFullScreen());
              }}>
                {!win.isFullScreen() ? (
                  <Icon.Maximize2 className={"greenmax"} size={7} style={{display: this.state.showLight}}/>
                ) : (
                  <Icon.Minimize2 className={"greenmax"} size={7} style={{display: this.state.showLight}}/>
                )}
              </button>
            </div>
          </div>
          <div className="navMiddle">
            <div className="appName">
            teaFlix (BETA)
            </div>
          </div>
          {/* navRight */}
          <div className="navRight">
            <FilePicker
              extensions={["torrent"]}
              onChange={this.props._pickedFile}
              onError={errMsg => {console.log(errMsg);}}
            >
              <div className="addTorrent" data-tip="Add Torrent">
                <Icon.PlusCircle className="addT" size={25}/>
                {/* <input type="file" className={"torrentPicker"} onChange={this._pickedFile}/> */}
              </div>
            </FilePicker>
            <ReactTooltip place={"bottom"} effect={"solid"}/>
          </div>
          {/* navRight */}
        </div>
        {/* navIn */}
        {/* magnetIn */}
        <div className="magnetIn">
          <input className="magnetInput" 
            placeholder="Paste magenet link here.."
            value={this.state.magLink}
            onChange={(val) => this.setState({magLink: val.target.value})}
          />
          {this.state.magLink ? (
            <button className="magSub" 
              onClick={() => {
                this.props.app._addTorrent(this.state.magLink);
                this.setState({magLink: ""});
              }}>
          ADD
            </button>
          ) : (
            <div className="magSubDiv">
          ADD
            </div>
          )}
        </div>
        {/* magnetIn */}
      </div>
    );
  }
}

export default Navbar;
