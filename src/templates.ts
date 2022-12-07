import * as vscode from "vscode";
import { Connect } from "./connect";
import * as fs from "fs";
import * as path from "path";

interface Entry {
  id?: string;
  parent?: string;
  name: string;
  type: string;
  doctype?: string;
}

export class Templates implements vscode.TreeDataProvider<Entry> {
  private _onDidChangeTreeData: vscode.EventEmitter<Entry | undefined> =
    new vscode.EventEmitter<Entry | undefined>();
  readonly onDidChangeTreeData: vscode.Event<Entry | undefined> =
    this._onDidChangeTreeData.event;

  public templates?: any;
  public items?: any;
  public sync: boolean;
  connect: Connect;
  constructor(private context: vscode.ExtensionContext) {
    this.sync = true;
    this.connect = new Connect();
    this.items = [];
    this.context.subscriptions.push(
      vscode.commands.registerCommand(
        "extension.open-bb-template",
        (doctype: string, id: string) => {
          this.openTemplateFrom(id, doctype);
        }
      )
    );
    this.context.subscriptions.push(
      vscode.commands.registerCommand("extension.insert-template", (temp) => {
        if (vscode.window.activeTextEditor) {
          const editor = vscode.window.activeTextEditor;

          // check if there is no selection
          if (editor.selection.isEmpty) {
            // the Position object gives you the line and character where the cursor is
            const position = editor.selection.active;
            if (temp.doctype === "partial") {
              const snippet = new vscode.SnippetString(
                `{% include '${temp.name}' %}`
              );
              editor.insertSnippet(snippet, position);
            }
            if (temp.doctype === "stylesheet") {
              const snippet = new vscode.SnippetString(
                `<link rel="stylesheet" href="{% stylesheet_url '${temp.name}' %}">`
              );
              editor.insertSnippet(snippet, position);
            }
            if (temp.doctype === "javascript") {
              const snippet = new vscode.SnippetString(
                `<script src="{% javascript_url '${temp.name}' %}"></script>`
              );
              editor.insertSnippet(snippet, position);
            }
          }
        }
      })
    );

    this.context.subscriptions.push(
      vscode.workspace.onDidSaveTextDocument((e) => {
        let basename = path
          .basename(e.uri.path)
          .split(".")
          .slice(0, -1)
          .join(".");
        var html = fs.readFileSync(e.uri.path, "UTF-8");
        var postdata = {
          record: {
            html: html,
          },
        };
        this.connect.putRequest(
          "api/templates/" + basename,
          JSON.stringify(postdata)
        );
      })
    );
  }

  public async getChildren(element?: Entry | undefined): Promise<Entry[]> {
    if (this.sync) {
      await this.getItems();
      this.sync = false;
    }
    const templates = this.templates;
    return new Promise(function (resolve, reject) {
      if (element) {
        const items = templates.map(function (val: any) {
          if (val["kind"] === element.name) {
            const temp: Entry = {
              name: val["description"],
              id: val["id"],
              parent: val["kind"],
              type: "template",
              doctype: val["kind"],
            };
            return temp;
          }
        });
        resolve(
          items.sort((a: { name: any }, b: { name: any }) =>
            String(a.name).localeCompare(String(b.name))
          )
        );
      }

      if (templates) {
        var kindslist = templates.map(function (val: any) {
          return val["kind"];
        });
        var kindslistUnique = kindslist.filter(onlyUnique);
        const folders = kindslistUnique.map(function (val: any) {
          const item: Entry = {
            type: "folder",
            name: val,
          };
          return item;
        });
        resolve(folders);
      }
    });
  }

  getTreeItem(element: Entry): vscode.TreeItem | Thenable<vscode.TreeItem> {
    let treeItem = new vscode.TreeItem(
      element.name,
      element.type === "folder"
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None
    );

    if (element.type === "folder") {
    }

    if (element.type === "template") {
      treeItem.iconPath = vscode.ThemeIcon.File;
      treeItem.id = element.id;
      treeItem.command = {
        command: "extension.open-bb-template",
        title: "Open File",
        arguments: [element.doctype, element.id],
      };
      if (
        element.parent === "partial" ||
        element.parent === "javascript" ||
        element.parent === "stylesheet"
      ) {
        treeItem.contextValue = "insert";
      }
    }
    this.items.push(treeItem);
    return treeItem;
  }

  public async getItems() {
    const json = await this.connect.getRequest("api/templates");
    var templates: Entry[] = [];
    const templatesList = JSON.parse(String(json));
    for (let index = 0; index < templatesList.length; index++) {
      if (templatesList[index]["generated_html"] === null) {
        templates.push(templatesList[index]);
      }
    }
    this.templates = templates;
  }

  refresh(): void {
    this.sync = true;
    this._onDidChangeTreeData.fire();
    console.log("refresh");
  }

  async openTemplateFrom(id: string, doctype: string) {
    let json = await this.connect.getRequest("api/templates/" + id);
    let data = JSON.parse(String(json));
    // The code you place here will be executed every time your command is executed
    let dir_path = String(
      vscode.workspace.workspaceFolders![0].uri.path + "/" + doctype
    );

    if (fs.existsSync(dir_path)) {
    } else {
      fs.mkdirSync(dir_path);
    }

    var fextension = doctype;
    switch (doctype) {
      case "stylesheet":
        fextension = "css";
        break;
      case "partial":
        fextension = "liquid";
        break;
      case "endpoint":
        fextension = "liquid";
        break;
      case "javascript":
        fextension = "js";
        break;
      case "mail":
        fextension = "liquid";
        break;
      case "pdf":
        fextension = "liquid";
        break;
      case "soap":
        fextension = "liquid";
        break;
      default:
        break;
    }
    let file_path = String(
      vscode.workspace.workspaceFolders![0].uri.path +
        "/" +
        doctype +
        "/" +
        id +
        "." +
        fextension
    );
    try {
      fs.writeFileSync(file_path, data.html, { mode: 0o755 });
    } catch (err) {
      // An error occurred
      console.error(err);
    }
    let fpath = vscode.Uri.file(file_path);
    vscode.workspace.openTextDocument(fpath).then((document) => {
      vscode.window.showTextDocument(document, { preview: false });
    });
  }
}

function onlyUnique(
  value: any,
  index: any,
  self: { indexOf: (arg0: any) => void }
) {
  return self.indexOf(value) === index;
}

export class TemplatesView {
  templates: Templates;
  templatesView: vscode.TreeView<Entry>;
  constructor(private context: vscode.ExtensionContext) {
    this.templates = new Templates(this.context);
    // vscode.window.registerTreeDataProvider('templates-view', templates);
    this.templatesView = vscode.window.createTreeView("templates-view", {
      treeDataProvider: this.templates,
    });

    this.context.subscriptions.push(
      vscode.window.onDidChangeActiveTextEditor((e) => {
        let basename = path
          .basename(e!.document.uri.path)
          .split(".")
          .slice(0, -1)
          .join(".");
      })
    );
  }

  public reloadTemplates() {
    this.templates.refresh();
  }
}
