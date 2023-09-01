import { App, ItemView, WorkspaceLeaf } from "obsidian";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { QBReaderMainComponent } from "./react-components/QBReaderMainComponent";
import { Root, createRoot } from "react-dom/client";
import {AppContext, QBReaderSettings} from "main";
import {createEmitter, Emitter} from "./dnd/util/emitter";
import {getParentWindow} from "./dnd/util/getWindow";
import { t } from './lang/helpers';

export const QB_READER_VIEW_TYPE = "qb-reader-view";


interface ViewEvents {
	showLaneForm: () => void;
	hotkey: (commandId: string) => void;
}

export class QBREaderView extends ItemView {
	root:Root;
	settings:QBReaderSettings
	emitter: Emitter<ViewEvents>
	actionButtons: Record<string, HTMLElement> = {};

	constructor(leaf: WorkspaceLeaf, settings:QBReaderSettings) {
    super(leaf);


	this.emitter = createEmitter()

    this.root = createRoot(this.containerEl.children[1]);

	this.settings = settings;

	this.initHeaderButtons()

  }

  initHeaderButtons() {

		if (
			this.settings.showSearch &&
			!this.actionButtons['show-search']
		) {
			this.actionButtons['show-search'] =	this.addAction(
				'lucide-search',
				t('Search...'),
				() => {
					this.emitter.emit('hotkey', 'editor:open-search');
				}
			);
		} else if (
			!this.settings.showSearch &&
			this.actionButtons['show-search']
		) {
			this.actionButtons['show-search'].remove();
			delete this.actionButtons['show-search'];
		}
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
        <QBReaderMainComponent settings={this.settings} view={this}/>
      </AppContext.Provider>
    );
  }

  async onClose() {
    this.root.unmount();
    ReactDOM.unmountComponentAtNode(this.containerEl.children[1]);
  }

	getWindow() {
		return getParentWindow(this.containerEl) as Window & typeof globalThis;
	}
}

export const useApp = (): App | undefined => {
  return React.useContext(AppContext);
};
