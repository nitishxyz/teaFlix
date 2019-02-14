/* eslint-disable no-undef */
import React, { Component } from "react";
import "./footer.css";
import * as Icon from "react-feather";
import ReactTooltip from "react-tooltip";

const electron = window.require("electron");


class Footer extends Component {
  render() {
    return (
      <div className="footer">
        <div className="footLeft">
          {/* <div className="searchBar">
            <Icon.Search className="searchIcon" size={18}/>
            <input type="text" className="searchIn" placeholder="search your torrents"/>
          </div> */}
        </div>
        <div className="footRight">
          {/* <button className="addTorrent" data-tip="Seed File">
            <Icon.PlusSquare className="addT" size={25}/>
          </button>
          <ReactTooltip place={"top"} effect={"solid"}/> */}
        </div>
      </div>
    );
  }
}

export default Footer;
