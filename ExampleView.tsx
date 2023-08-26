import { App, ItemView, WorkspaceLeaf } from "obsidian";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { QBReaderView } from "./QBReaderView";
import { Root, createRoot } from "react-dom/client";
import { AppContext } from "main";

export const VIEW_TYPE_EXAMPLE = "example-view";

export class ExampleView extends ItemView {

  
  root:Root;

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);

    this.root = createRoot(this.containerEl.children[1]);
  }

  getViewType() {
    return VIEW_TYPE_EXAMPLE;
  }

  getDisplayText() {
    return "QB Reader Import";
  }

  async onOpen() {
    
    this.root.render(
      <AppContext.Provider value = {this.app}>
        <QBReaderView />
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
