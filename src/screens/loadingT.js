/* eslint-disable no-console */
/* eslint-disable no-undef */
import React, { Component } from "react";
import "./torrentCon.css";
import * as Icon from "react-feather";
import { MuiThemeProvider, createMuiTheme, withStyles } from "@material-ui/core/styles";

const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
  },
  palette: {
    primary: {
      // light: will be calculated from palette.primary.main,
      main: "#ffffff",
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
    },
    secondary: {
      light: "#0066ff",
      main: "#0044ff",
      // dark: will be calculated from palette.secondary.main,
      contrastText: "#ffcc00",
    },
    // error: will use the default color
  },
  root: {
    flexGrow: 1,
  },
});


class LoadingT extends Component {
  constructor(props){
    super(props);
    this.state = {
      checked: false,
    };
    this._isMounted = true;
  }


  render() {
    let placeholder = this.props.placeholder;
    return (
      <MuiThemeProvider theme={theme}>
        <div className="torrentCon">
          <div className="backgroundImage">
            <div style={{backgroundColor: "rgba(0,0,0,0.3)", flex:1}}/>
          </div>
          <div className="torrentInfoFull">
            <div className="torrentImgCon">
              <img src={placeholder} className="torrentImg"/>
            </div>
            <div style={{flexDirection: "column"}}>
            </div>
            {/* torrentInfo */}
            <div className="torrentInfo" style={{marginTop: 6}}>
              <div className="torrentName">
            Loading Torrent
              </div>
              <div className="torrentMeta" style={{marginTop: 1}}>
                <div className="torrentYear">
                Looking For Peers
                </div>
              </div>
            </div>
            {/* torrentInfo */}
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default LoadingT;
