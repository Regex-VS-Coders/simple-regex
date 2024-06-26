// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

const vscode = require('vscode');
// const regexFunction = require('./processor/regexFunction');
const multiStepInput = require('./processor/multiStepInput');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "simple-regex" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	// let disposable = vscode.commands.registerCommand('simple-regex.helloWorld', function () {
	// 	// The code you place here will be executed every time your command is executed

	// 	// Display a message box to the user
	// 	vscode.window.showInformationMessage('Hello World from Simple Regex!');
	// });

	// context.subscriptions.push(disposable);

	context.subscriptions.push(
		vscode.commands.registerCommand('simple-regex.quickInput', () => {
		// const options = {
		// 	multiStepInput
		// };
		// const quickPick = vscode.window.createQuickPick();
		// quickPick.items = Object.keys(options).map(label => ({ label }));
		// quickPick.onDidChangeSelection(selection => {
		// 	multiStepInput.multiStepInput(context)
		// 		.catch(console.error);
		// });
		// quickPick.onDidHide(() => quickPick.dispose());
		// quickPick.show();
		multiStepInput.multiStepInput(context)
			.catch(console.error);
	}));
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
