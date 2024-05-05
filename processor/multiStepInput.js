const vscode = require('vscode');

const window = vscode.window;
const QuickInputButton = vscode.QuickInputButton;
const Uri = vscode.Uri;


// defining the mybutton class 
class MyButton {
    constructor(iconPath, tooltip) {
        // Ensure the iconPath object contains 'light' and 'dark' properties
        this.iconPath = {
            light: vscode.Uri.file(iconPath.light),
            dark: vscode.Uri.file(iconPath.dark)
        };
        this.tooltip = tooltip;
    }
}

//Create an instance of MyButton to be used as a custom quick input button
//allows users to add new flavors 
async function multiStepInput(context) {
    
    const addFlavorButton = new MyButton({
   
        dark: vscode.Uri.file(context.asAbsolutePath('resources/dark/add.svg')),
        light: vscode.Uri.file(context.asAbsolutePath('resources/light/add.svg')),
    }, 'Add New Flavor');
    



async function selectFlavor(input, state) {
    //Mapping each string in the flavors array to a QuickPickItem object.
    //Each object shows a selectable item with its label set to the flavor name
    const flavors = ['javaScript', 'TypeScript', 'Golang', 'C', 'Python'].map(label => ({ label }));
    const pick = await input.showQuickPick({
        title: 'Pick a Flavor',
        step: 1,
        totalSteps: 3,
        items: flavors,
        placeholder: 'Pick your  flavor',
        buttons: [addFlavorButton]
    });
    state.flavor = pick.label;
    return (input) => inputRegexPattern(input, state); // Proceed to regex pattern input
}



    // function for collection of inputs   
    async function collectInputs() {
        // Initialize state
        const state = {};
        await MultiStepInput.run(input => selectFlavor(input, state));
        return state;
    }
    const state = await collectInputs();
    console.log(`You selected the flavor: ${state.flavor}`);
    
    console.log(`Regex pattern: ${state.regexPattern}`);
    console.log(`Test string: ${state.testString}`);

        // Regex testing
        const regex = new RegExp(state.regexPattern);
        const testResult = regex.test(state.testString);
        vscode.window.showInformationMessage(`Test result: ${testResult}`);
};



async function inputRegexPattern(input, state) {
    const regexPattern = await input.showInputBox({
        title: 'Enter Regex Pattern',
        step: 2,
        totalSteps: 3,
        value: '',
        prompt: 'Enter your regex pattern',
        validate: (text) => text.length > 0 
        
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
        validate: (text) => text.length > 0
    });
    state.testString = testString;
}


   






