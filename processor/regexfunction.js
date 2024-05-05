/**
// write a function that takes two input fields namely the regex pattern and the test string to return a message
 that indicates if there is a match or not
@param {string} regexPattern - The regex pattern to test.
@param {string} testString - The test string to match against the regex pattern.
@returns {boolean} true if match is found, false if not
*/
const regexParser = require('regex-parser');

function regexFunction(regexPattern, testString) {      
    try {
        const regex = regexParser(regexPattern) // parse the regex pattern
        const matches = testString.match(regex);  // finding matches
        return matches !== null; // returns true if matches are found


} catch (error) {
        console.error("Invalid regex pattern:", error.message);
        return  false; // if matches are not found or invalid
    }
}
module.exports = {
    regexFunction
};
