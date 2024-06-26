const RegexTranslator = require('regex-translator');

/**
 Function to translate regex to javascript regex.
 @param {string} regexPattern - The regex pattern in the original language.
 @param {string} originalFlavor - The original flavor of the regex pattern.
 @returns {string} The translated JavaScript regex pattern.
*/

function translateRegex(regexPattern, originalFlavor) {
    const intermediaryString = RegexTranslator.getMediaryStringFromRegexString(regexPattern, originalFlavor);
    return RegexTranslator.getRegexStringFromMediaryString(intermediaryString, 'ecma');
}

module.exports = {
    translateRegex
}
