# Betty Connect README

Betty Connect makes template editing possible directly in Visual Code. It will add a Betty Logo to the activity bar where it will show a tree view with all your templates. If you click a template it will open in an editor. When you save the file it wil save back to Betty Blocks. If you want to join the private slack channel about the development of this extension or have any questions contact me on appeitjedev@icloud.com.

## Features

- NEW - Model Browser to have a quick overview of all your property names and relations.
- NEW - Insert partials, javascript snd css files on cursor location including the liquid and html tags.
- Connect visual code to a Betty App to directly edit your templates in visual code.
- When you save a file it will be written back to Betty Blocks.
- Reload the the template list with a simple click on a button.
- Have different Visual code workspaces connected to different Betty Blocks Apps.

## Requirements

- You need your app identifier (**your-app-identiefer**_.bettyblocks.com_).
- You need your Betty Blocks user account (**name@company.com**).
- You need a API key. In Application user management in (**my.bettyblocks.com**) you can enable a API key for a user.

## Usage

1. To use Betty Connect first you must open a project folder in Visual Code.
2. Then open your Command Pallet (CMD-SHIFT-P for macOS).
3. Type Betty Connect.
4. Input your app identifier and press ENTER.
5. Input your user account and press ENTER.
6. Input your API key and press ENTER.
7. Click on the Betty logo and you should see a treeview with your template types and when you expand the types your templates will be listed.
8. Click on a template to open it in a editor.
9. Save the file (CMD-S on macOS) and it wil be written back to Betty Blocks.

When you click the + button next to a partial, javascript or css file it wil be inserted on the current cursor location.
If you want to reload the list of templates in the treeview click on the refresh button on the top or type Betty Reload Templates in you command pallette.

## Known Issues

When you edit a template in Betty Blocks and that file is still open in visual code you wil not have the updated version in Visual Code. Just close the file without saving and when you click it in the treeview again you get the updated version.
If you accidentally save or overwrite a version of a template you can always role back the edits in your template history in Betty Blocks.

## Upcoming Features

- Create new templates from extension.
- Model Browser treeview with properties and relations names. Option to do quick inserts of those names on cursor location.
- Endpoint browser that will show all endpoint variables and render web template variables to do quick inserts on cursor location.

## Release Notes

- NEW Model Browser to have a quick overview of all your property names and relations.
