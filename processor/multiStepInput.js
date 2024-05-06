const vscode = require('vscode');

const regexTranslator = require('./regexTranslator');

// Creates an instance of MyButton to be used as a custom quick input button
// Allows users to add new flavors
async function multiStepInput(context) {

	// class MyButton {
	// 	constructor(iconPath, tooltip) {
	// 		this.iconPath = iconPath;
	// 		this.tooltip = tooltip;
	// 	}
	// }

	class MyButton {
		constructor(iconPath, tooltip) {
			this.iconPath = iconPath;
			this.tooltip = tooltip;
		}
	}
    
    const createFlavorButton = new MyButton({
        dark: vscode.Uri.file(context.asAbsolutePath('resources/dark/add.svg')),
        light: vscode.Uri.file(context.asAbsolutePath('resources/light/add.svg')),
    }, 'Input Supported Programming Language');

	const flavors = ['JavaScript', 'TypeScript', 'Golang', 'C'].map(label => ({ label }));

	const languageToFlavorMap = new Map();

	languageToFlavorMap.set('JavaScript', 'ecma');
	languageToFlavorMap.set('TypeScript', 'ecma');
	languageToFlavorMap.set('Golang', 're2');
	languageToFlavorMap.set('C', 'basic');
	
	// Defines a unction for collection of inputs   
    async function collectInputs() {
        // Initialize state
        const state = {};
        await MultiStepInput.run(input => pickRegexPattern(input, state));
        return state;
    }

    async function pickRegexPattern(input, state) {
        const pick = await input.showQuickPick({
            title: 'Pick a Language',
            step: 1,
            totalSteps: 3,
            items: flavors,
            activeItem: typeof state.flavor !== 'string' ? state.flavor : undefined,
			placeholder: 'Pick your language',
            buttons: [createFlavorButton],
			shouldResume: shouldResume
        });
		
        state.flavor = pick;
        return (input) => inputRegexPattern(input, state); // Proceed to regex pattern input
    }

    const state = await collectInputs();

    async function inputRegexPattern(input, state) {
        const regexPattern = await input.showInputBox({
            title: 'Enter Regex Pattern',
            step: 2,
            totalSteps: 3,
            value: '',
            prompt: 'Enter your regex pattern',
            validate: validateString,
            shouldResume: shouldResume
        });
        state.regexPattern = regexPattern;
        return (input) => inputTestString(input, state); // can now Proceed to test string input
    }

    async function inputTestString(input, state) {
        const testString = await input.showInputBox({
            title: 'Enter Test String',
            step: 3,
            totalSteps: 3,
            value: '',
            prompt: 'Enter a string to test against the regex',
            validate: validateString,
			shouldResume: shouldResume
        });
        state.testString = testString;
    }

	function shouldResume() {
		// Could show a notification with the option to resume.
		return new Promise((resolve, reject) => {});
	}

	async function validateString(input) {
		// ...validate...
		await new Promise(resolve => setTimeout(resolve, 1000));
		return input.trim().length == 0 ? 'String is blank/empty' : undefined;
	}

	// Regex testing
	const sourceRegex = regexTranslator.translateRegex(
		state.regexPattern, 
		languageToFlavorMap.get(state.flavor.label)
	);
    const regex = new RegExp(sourceRegex);
    const testResult = regex.test(state.testString);

	vscode.window.showInformationMessage(`Test result: ${testResult}`);
}

// -------------------------------------------------------
// Helper code that wraps the API for the multi-step case.
// -------------------------------------------------------

class InputFlowAction {
	static back() {new InputFlowAction()};
	static cancel() {new InputFlowAction()};
	static resume() {new InputFlowAction()};
}

class MultiStepInput {
	current;
	steps = [];

	static async run(start) {
		const input = new MultiStepInput();
		return input.stepThrough(start);
	}

	async stepThrough(start) {
		let step = start;
		while (step) {
			this.steps.push(step);
			if (this.current) {
				this.current.enabled = false;
				this.current.busy = true;
			}
			try {
				step = await step(this);
			} catch (err) {
				if (err === InputFlowAction.back) {
					this.steps.pop();
					step = this.steps.pop();
				} else if (err === InputFlowAction.resume) {
					step = this.steps.pop();
				} else if (err === InputFlowAction.cancel) {
					step = undefined;
				} else {
					throw err;
				}
			}
		}
		if (this.current) {
			this.current.dispose();
		}
	}

	async showQuickPick({ title, step, totalSteps, items, activeItem, ignoreFocusOut, placeholder, buttons, shouldResume }) {
		const disposables = [];
		try {
			return await new Promise((resolve, reject) => {
				const input = vscode.window.createQuickPick();
				input.title = title;
				input.step = step;
				input.totalSteps = totalSteps;
				input.ignoreFocusOut = ignoreFocusOut ?? false;
				input.placeholder = placeholder;
				input.items = items;
				if (activeItem) {
					input.activeItems = [activeItem];
				}
				input.buttons = [
					...(this.steps.length > 1 ? [vscode.QuickInputButtons.Back] : []),
					...(buttons || [])
				];
				disposables.push(
					input.onDidTriggerButton(item => {
						if (item === vscode.QuickInputButtons.Back) {
							reject(InputFlowAction.back);
						} else {
							resolve(item);
						}
					}),
					input.onDidChangeSelection(items => resolve(items[0])),
					input.onDidHide(() => {
						(async () => {
							reject(shouldResume && await shouldResume() ? InputFlowAction.resume : InputFlowAction.cancel);
						})()
							.catch(reject);
					})
				);
				if (this.current) {
					this.current.dispose();
				}
				this.current = input;
				this.current.show();
			});
		} finally {
			disposables.forEach(d => d.dispose());
		}
	}

	async showInputBox({ title, step, totalSteps, value, prompt, validate, buttons, ignoreFocusOut, placeholder, shouldResume }) {
		const disposables = [];
		try {
			return await new Promise((resolve, reject) => {
				const input = vscode.window.createInputBox();
				input.title = title;
				input.step = step;
				input.totalSteps = totalSteps;
				input.value = value || '';
				input.prompt = prompt;
				input.ignoreFocusOut = ignoreFocusOut ?? false;
				input.placeholder = placeholder;
				input.buttons = [
					...(this.steps.length > 1 ? [vscode.QuickInputButtons.Back] : []),
					...(buttons || [])
				];
				let validating = validate('');
				disposables.push(
					input.onDidTriggerButton(item => {
						if (item === vscode.QuickInputButtons.Back) {
							reject(InputFlowAction.back);
						} else {
							resolve(item);
						}
					}),
					input.onDidAccept(async () => {
						const value = input.value;
						input.enabled = false;
						input.busy = true;
						if (!(await validate(value))) {
							resolve(value);
						}
						input.enabled = true;
						input.busy = false;
					}),
					input.onDidChangeValue(async text => {
						const current = validate(text);
						validating = current;
						const validationMessage = await current;
						if (current === validating) {
							input.validationMessage = validationMessage;
						}
					}),
					input.onDidHide(() => {
						(async () => {
							reject(shouldResume && await shouldResume() ? InputFlowAction.resume : InputFlowAction.cancel);
						})()
							.catch(reject);
					})
				);
				if (this.current) {
					this.current.dispose();
				}
				this.current = input;
				this.current.show();
			});
		} finally {
			disposables.forEach(d => d.dispose());
		}
	}
}

module.exports = {
	multiStepInput
}
