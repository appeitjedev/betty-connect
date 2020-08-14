import * as vscode from 'vscode';
import * as request from 'request';

export class TemplateEndpoint implements vscode.TreeDataProvider<Template> {
    tempType: string;
    username: string;
    password: string;
    bettyapp: string;
    constructor(private context: vscode.ExtensionContext, tempType: string, username: string, password: string, bettyapp: string) {
        this.tempType = tempType;
        this.username = username;
        this.password = password;
        this.bettyapp = bettyapp;
    }

    public async getChildren(temp?: Template): Promise<Template[]> {
        const url = "https://" + this.bettyapp + ".bettyblocks.com/api/templates?f[name]=" + this.tempType;
        function getData(url: string, username: string, password: string, tempType: string): Promise<Template[]> {
            var templates: Template[] = [];
            return new Promise(function (resolve, reject) {
                request.get({
                    url: url,
                    method: "GET",
                    headers: {
                        'Content-type': 'application/json',
                        'Authorization': 'Basic ' + Buffer.from(username + ':' + password).toString('Base64')
                    }
                }, (err, res, body) => {
                    if (err) {
                        vscode.window.showInformationMessage(err);
                        reject(err);
                    }
                    if (res.statusCode === 200) {
                        let items = JSON.parse(body);
                        var docType = tempType;
                        for (let index = 0; index < items.length; index++) {
                            if (items[index]["generated_html"] === null) {
                                const item = new Template(items[index]["description"], items[index]["id"], items[index]["description"], vscode.TreeItemCollapsibleState.None, { command: 'extension.open-bb-template', title: "Execute", arguments: [docType, items[index]["description"], items[index]["id"]] });
                                templates.push(item);
                            }
                        }
                        console.log("loaded readdy");
                        resolve(templates.sort((a, b) => String(a.label).localeCompare(String(b.label))));
                    }
                });
            });
        }

        let templates = await getData(url, this.username, this.password, this.tempType);
        console.log("get data");
        console.log(templates);
        return templates;
    }

    getTreeItem(temp: Template): vscode.TreeItem {
        return temp;
    }
}

class Template extends vscode.TreeItem {

    type: string;

    constructor(
        type: string,
        id: string,
        label: string,
        collapsibleState: vscode.TreeItemCollapsibleState,
        command?: vscode.Command
    ) {
        super(label, collapsibleState);
        this.type = type;
        this.command = command;
        this.id = id;
    }

}

