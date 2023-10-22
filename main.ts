import {App, Plugin, PluginSettingTab, Setting, TAbstractFile, TFile} from 'obsidian';
import * as React from "react";
import {QBREaderView, QB_READER_VIEW_TYPE} from "src/QBREaderView";
import {categories} from "./src/Categories";
import {around} from "monkey-around";

export const AppContext = React.createContext<App | undefined>(undefined);

//TODO: Bonus-ing?
//TODO: Part of speech parsing to determine if you should add an extra word to the "pronoun"
//TODO: Hotkey for jump to top
//TODO: highlight search query on jump to top

export interface QBReaderSettings {
	activeCats: string[];
	disableCatColors: boolean;
	defaultNumberQuestions: number;
}

const DEFAULT_SETTINGS: Partial<QBReaderSettings> = {
	activeCats: categories.map(e => e.name),
	disableCatColors: false,
	defaultNumberQuestions: 25,
}

export default class QBReaderPlugin extends Plugin {
	settings: QBReaderSettings;

	async onload() {
		await this.loadSettings();

		this.registerView(
			QB_READER_VIEW_TYPE,
			(leaf) => new QBREaderView(leaf, this.settings)
		)

		//The command to open the modal
		this.addCommand({
			id: "qb-reader",
			name: "QB Reader",
			checkCallback: (checking:boolean) => {

				if(!checking) {
					this.activateView()
				}

				return true;
			}
		})


		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new QBReaderSettingsTab(this.app, this));

		//Register display for number of cards in document
		const item = this.addStatusBarItem()
		item.createEl("span", {text: `-1 cards`})

		this.updateCardNumber(item, this.app.workspace.getActiveFile() as TAbstractFile)

		this.registerEvent(
			this.app.vault.on("modify", async (file: TAbstractFile) => {
				await this.updateCardNumber(item, file)
			})
		);

		this.registerEvent(
			this.app.workspace.on("file-open", async (file: TFile) => {
				await this.updateCardNumber(item, file)
			})
		)
		this.registerMonkeyPatches()
	}

	async updateCardNumber(item:HTMLElement, file:TAbstractFile)  {
		const spanEle = item.getElementsByTagName("span")[0]
		if(file instanceof TFile) {
			const content = await this.app.vault.cachedRead(file);

			const numberOfCards = (content.match(/==.+?==/g) || []).length

			spanEle.setText(`${numberOfCards} cards`)
		} else {
			spanEle.setText("")
		}
	}

	onunload() {

	}

	async activateView() {
		this.app.workspace.detachLeavesOfType(QB_READER_VIEW_TYPE);
	
		await this.app.workspace.getLeaf('split', 'vertical').setViewState({
			type: QB_READER_VIEW_TYPE,
			active: true,
		});
	
		this.app.workspace.revealLeaf(
			this.app.workspace.getLeavesOfType(QB_READER_VIEW_TYPE)[0]
		);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	registerMonkeyPatches() {
		this.app.workspace.onLayoutReady(() => {
			this.register(
				around((this.app as any).commands, {
					executeCommand(next) {
						return function (command: any) {
							const view = app.workspace.getActiveViewOfType(QBREaderView);

							if (view && command?.id) {
								view.emitter.emit('hotkey', command.id);
							}

							return next.call(this, command);
						};
					},
				})
			);
		});
	}
}

class QBReaderSettingsTab extends PluginSettingTab {
	plugin: QBReaderPlugin;

	constructor(app: App, plugin: QBReaderPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Disable Category Colors")
			.setTooltip("For themes that make colored text hard to read")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.disableCatColors)
				.onChange(async (value) => {
					this.plugin.settings.disableCatColors = value;

					await this.plugin.saveSettings();
				})
			)

		new Setting(containerEl)
			.setName("Default Number of Tossups to load")
			.setDesc("Max: 10K")
			.addText(text => text
				.setValue(this.plugin.settings.defaultNumberQuestions.toString())
				.onChange(async (value) => {
					let numberVal = parseInt(value)
					if(numberVal) {
						if(numberVal > 10000) numberVal = 10000

						this.plugin.settings.defaultNumberQuestions = numberVal
					} else if(value === "") {
						this.plugin.settings.defaultNumberQuestions = 0
					}

					await this.plugin.saveSettings()
				})
			)

		categories.forEach(e => {
				new Setting(containerEl)
					.setName(e.name)
					.addToggle(toggle => toggle
						.setValue(this.plugin.settings.activeCats.includes(e.name))
						.onChange(async (value) => {
							if(value) {
								this.plugin.settings.activeCats.push(e.name)
							} else {
								this.plugin.settings.activeCats = this.plugin.settings.activeCats.filter(ele => {
									return ele !== e.name
								})
							}
							await this.plugin.saveSettings()
						})
					)
		})

	}
}
