import { Pull, test } from 'APIUtil';
import { App, Editor, MarkdownView, Menu, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import * as React from "react";
import * as ReactDOM from "react-dom";
import { QBReaderView } from "./QBReaderView";
import { createRoot } from "react-dom/client";
import { ExampleView, VIEW_TYPE_EXAMPLE } from "ExampleView";


export const AppContext = React.createContext<App | undefined>(undefined);

interface QBReaderSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: QBReaderSettings = {
	mySetting: 'default'
}

export default class QBReaderPlugin extends Plugin {
	settings: QBReaderSettings;

	async onload() {
		await this.loadSettings();

		this.registerView(
			VIEW_TYPE_EXAMPLE,
			(leaf) => new ExampleView(leaf)
		)

		
		const openModal = (checking:boolean) => {
			// Conditions to check
			const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (markdownView) {
				// If checking is true, we're simply "checking" if the command can be run.
				// If checking is false, then we want to actually perform the operation.
				if (!checking) {
					new SampleModal(this.app).open();
				}
	
				// This command will only show up in Command Palette when the check function returns true
				return true;
			}
		}

		//The command to open the modal
		this.addCommand({
			id: "qb-reader",
			name: "QB Reader",
			checkCallback: (checking:boolean) => {

				console.log(this.app.workspace.getActiveFile())
				if(!checking) {
					this.activateView()
				}

				return true;
			}
		})


		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async activateView() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_EXAMPLE);
	
		await this.app.workspace.getLeaf('split', 'vertical').setViewState({
		  type: VIEW_TYPE_EXAMPLE,
		  active: true,
		});
	
		this.app.workspace.revealLeaf(
		  this.app.workspace.getLeavesOfType(VIEW_TYPE_EXAMPLE)[0]
		);
	  }

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}


class SampleModal extends Modal {
	result: string;


	constructor(app: App) {
		super(app);
	}

	onOpen() {

		const { contentEl } = this;

		// contentEl.createEl("h1", { text: "What's your name?" });

		// new Setting(contentEl)
		// 	.setName("Name")
		// 	.addText((text) =>
		// 	text.onChange((value) => {
		// 		this.result = value
		// 	}));

		// new Setting(contentEl)
		// 	.addButton((btn) =>
		// 	btn
		// 		.setButtonText("Submit")
		// 		.setCta()
		// 		.onClick(() => {
		// 			this.close();
		// 		}));
		

	}

	onClose() {
		ReactDOM.unmountComponentAtNode(this.containerEl.children[1])
	}

}

class SampleSettingTab extends PluginSettingTab {
	plugin: QBReaderPlugin;

	constructor(app: App, plugin: QBReaderPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
