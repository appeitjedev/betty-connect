import * as vscode from 'vscode';
import { Connect } from './connect';

interface Entry {
    id?: string;
    parent?: string;
    name: string;
    type: string;
}

export class Models implements vscode.TreeDataProvider<Entry> {

    private _onDidChangeTreeData: vscode.EventEmitter<Entry | undefined> = new vscode.EventEmitter<Entry | undefined>();
    readonly onDidChangeTreeData: vscode.Event<Entry | undefined> = this._onDidChangeTreeData.event;

    public models?: any;
    public sync: boolean;
    connect: Connect;
    constructor(private context: vscode.ExtensionContext) {
        this.sync = true;
        this.connect = new Connect();
        // context.subscriptions.push(vscode.commands.registerCommand('extension.??????', (doctype: string, id: string) => {
        //     this.openTemplateFrom(id, doctype);
        // }));

        // context.subscriptions.push(vscode.workspace.onDidSaveTextDocument((e) => {
        //     let basename = path.basename(e.uri.path, '.tmp');
        //     var html = fs.readFileSync(e.uri.path, 'UTF-8');
        //     var postdata = {
        //         record: {
        //             html: html
        //         }
        //     };
        //     this.connect.putRequest("api/templates/" + basename, JSON.stringify(postdata));
        // }));
    }



    public async getChildren(element?: Entry | undefined): Promise<Entry[]> {
        if (this.sync) {
            await this.getItems();
            this.sync = false;
        }
        const models = this.models;
        return new Promise(function (resolve, reject) {
            if (element) {
                var properties: Entry[] = [];
                const modelProperties = models.map(function (val: any) {
                    if (val["id"] === element.id) {
                        for (let index = 0; index < val["properties"].length; index++) {
                            const item: Entry = {
                                type: val["properties"][index]["kind"],
                                name: val["properties"][index]["name"],
                                id: val["properties"][index]["id"],
                                parent: val["id"]
                            };
                            properties.push(item);

                        }
                        console.log(val["properties"]);
                    }
                    return properties;
                });
                resolve(properties.sort((a: { name: any; }, b: { name: any; }) => String(a.name).localeCompare(String(b.name))));
            }

            if (models) {
                var modelsList = models.map(function (val: any) {
                    const item: Entry = {
                        type: "model",
                        name: val["name"],
                        id: val["id"]
                    };
                    return item;
                });

                resolve(modelsList);
            }
        });
    }



    getTreeItem(element: Entry): vscode.TreeItem | Thenable<vscode.TreeItem> {
        let treeItem = new vscode.TreeItem(element.name, element.type === "model" ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None);
        if (element.type !== "model") {
            treeItem.iconPath = vscode.ThemeIcon.File;
            treeItem.tooltip = element.type;
            treeItem.description = element.type;
            //treeItem.command = { command: 'extension.opentemplate', title: "Open File", arguments: [element.doctype, element.id], };
        }
        return treeItem;
    }



    public async getItems() {
        const json = await this.connect.getRequest("api/models");
        var models: Entry[] = [];
        const modelsList = JSON.parse(String(json));
        for (let index = 0; index < modelsList.length; index++) {
            models.push(modelsList[index]);
        }
        this.models = models;
    }

    refresh(): void {
        this.sync = true;
        this._onDidChangeTreeData.fire();
        console.log("refresh");

    }



}

function onlyUnique(value: any, index: any, self: { indexOf: (arg0: any) => void; }) {
    return self.indexOf(value) === index;
}

export class ModelsView {
    models: Models;
    modelsView: vscode.TreeView<Entry>;
    constructor(private context: vscode.ExtensionContext) {
        this.models = new Models(this.context);
        this.modelsView = vscode.window.createTreeView('models-view', { treeDataProvider: this.models });
    }

    public reloadTemplates() {
        this.models.refresh();
    }

}