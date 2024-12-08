import { App, DropdownComponent, Editor, MarkdownEditView, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, View, WorkspaceLeaf } from 'obsidian';
import { DataSet, Edge, Network, networkGephiParser } from 'vis-network/standalone';
import { Decoration, DecorationSet, EditorView, ViewPlugin, WidgetType} from '@codemirror/view';
import { createGraph} from 'src/Standalone_Graph';
// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}
export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;
	DecorationSet: DecorationSet;
	async onload() {
		await this.loadSettings();
		this.addCommand({
			id: 'create-graph',
			name: 'Create Graph',
			editorCheckCallback: (checking: boolean, editor: Editor, view: MarkdownView) => {
				const leaf = this.app.workspace.getActiveViewOfType(View)?.leaf;
				if(leaf){
					if(!checking){
						const leafs = this.app.workspace.getLeavesOfType("markdown");
						const index = leafs.indexOf(leaf);
						const pos = editor.getCursor
						run: createGraph
						console.log(leafs);
					}
					return true
				}
			}
		});
		this.addCommand({
			id: 'create-modal',
			name: 'Create Modal',
			callback: () => {
				new SampleModal(this.app).open();
			},
		});
		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
interface dataInterface {
	nodes: DataSet<{}>,
	edges: Edge[]
}
class SampleModal extends Modal {
	wrapper: HTMLElement;
	sidebar: HTMLElement;
	graph: Network;
	data: dataInterface;
	constructor(app: App) {
		super(app);
			this.setTitle('Graph Editor');
			this.modalEl.style.width = "1000px";
			this.modalEl.style.height = "1000px";
			this.modalEl.style.resize = "both";
			this.sidebar = this.contentEl.createDiv({cls: "mod-sidebar-layout"});
			this.wrapper = this.contentEl.createEl('div', {cls: 'modal-content-wrapper'});
			this.sidebar.style.height = "100%";
			this.sidebar.style.width = "30%";
			this.sidebar.style.float = "right";
			const div = this.sidebar.createDiv({cls: 'modal-button-container'}, (buttonContainerEl) => {
				let addNodeButton: HTMLButtonElement;
				
				addNodeButton = buttonContainerEl.createEl(
					"button",
					{
						attr:{type:"button"},
						cls: "mod-cta",
						text: "Add Node",
					});
				addNodeButton.addEventListener("click", () => {
					this.graph.addNodeMode();
				})

				let addEdgeButton: HTMLButtonElement;
				addEdgeButton = buttonContainerEl.createEl(
					"button",
					{
						attr: {type: "button"},
						cls: "mod-cta",
						text:"Add Edge",
					}
				);
				addEdgeButton.addEventListener("click", () => {
					this.graph.addEdgeMode();
				});
					
			});
			div.style.padding = "5px";
			const nodeData = this.sidebar.createDiv({cls : 'modal-content-wrapper'});
			new Setting(nodeData)
				.setName('Node ID:')
				.addText(async (text) =>{
					text.inputEl.id = "nodeName";
					text.setPlaceholder("");
					});
			new Setting(nodeData)
				.setName("Node Color: ")
				.addColorPicker((colComp) => {
					colComp
						.setValueRgb({r: 0, g: 255, b: 0})
						.onChange((newColor: string) => {
							console.log(newColor);
						})
				});
			const graphData = this.sidebar.createDiv({cls: 'modal-content-wrapper'});
			graphData.createEl("ul").id = "graphDetails";
			this.scope.register(null, 'Delete', () => this.graph.deleteSelected());
			this.wrapper.style.float = "left";
			this.wrapper.style.width = "70%";
			this.wrapper.style.height = "99%";
	}

	onOpen() {
		const {contentEl} = this;
        var results = createGraph(this.wrapper);
		this.graph = results.network;
		this.data = results.data;
		var data = this.data;
		var listEl = document.getElementById('graphDetails');
		var nodeCount = listEl?.createEl("li", {cls: 'modal-content-wrapper', text: "Node count:"});
		var edgeCount = listEl?.createEl("li", {cls: 'modal-content-wrapper', text: "Edge count:"});
		nodeCount?.setText("Node Count: " + data.nodes.length);
		edgeCount?.setText("Edge Count: " + data.edges.length);
		for(let i = 0; i < data.nodes.length; i++){
			var nodeID = data.nodes.getIds()[i]
			var text = data.nodes.get(nodeID).label;
			var nodeDegree = this.graph.getConnectedEdges(nodeID);
			listEl?.createEl("li", {cls: 'modal-content-wrapper', text: "deg(" + text + ") = " + nodeDegree.length});
		}

		this.wrapper.addEventListener("DataSetUpdated", (event: CustomEvent) => {
			this.data = event.detail.data;
			let child = listEl?.lastElementChild;
			while(child){
				listEl?.removeChild(child);
				child = listEl?.lastElementChild;
			}
			var nodeCount = listEl?.createEl("li", {cls: 'modal-content-wrapper', text: "Node count:"});
			var edgeCount = listEl?.createEl("li", {cls: 'modal-content-wrapper', text: "Edge count:"});
			nodeCount?.setText("Node Count: " + data.nodes.length);
			edgeCount?.setText("Edge Count: " + data.edges.length);
			for(let i = 0; i < data.nodes.length; i++){
				var nodeID = data.nodes.getIds()[i]
				var text = data.nodes.get(nodeID).label;
				var nodeDegree = this.graph.getConnectedEdges(nodeID);
				listEl?.createEl("li", {cls: 'modal-content-wrapper', text: "deg(" + text + ") = " + nodeDegree.length});
			}
			console.log(this.data);
		});
		this.graph.on("selectNode", function(params){
			var el = document.getElementById('nodeName');
		});
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}

}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
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
