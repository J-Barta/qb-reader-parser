import { App, ItemView, WorkspaceLeaf } from "obsidian";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { QBReaderMainComponent } from "./react-components/QBReaderMainComponent";
import { Root, createRoot } from "react-dom/client";
import {AppContext, QBReaderSettings} from "main";
// import 'semantic-ui-css/semantic.min.css'


export const QB_READER_VIEW_TYPE = "qb-reader-view";

export class QBREaderView extends ItemView {

  
  root:Root;
  settings:QBReaderSettings

  constructor(leaf: WorkspaceLeaf, settings:QBReaderSettings) {
    super(leaf);

    this.root = createRoot(this.containerEl.children[1]);

	this.settings = settings;
  }

  getViewType() {
    return QB_READER_VIEW_TYPE;
  }

  getDisplayText() {
    return "QB Reader Import";
  }

  async onOpen() {
    
    this.root.render(
      <AppContext.Provider value = {this.app}>
        <QBReaderMainComponent settings={this.settings}/>
      </AppContext.Provider>
    );
  }

  async onClose() {
    this.root.unmount();
    ReactDOM.unmountComponentAtNode(this.containerEl.children[1]);
  }
}

export const useApp = (): App | undefined => {
  return React.useContext(AppContext);
};
