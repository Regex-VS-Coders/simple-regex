<<<<<<< HEAD:Processor/regexfunction.js

const regexParser = require('regex-parser');

console.log(regexParser);

=======
>>>>>>> 5f50ccff0b814ada97d31eb68f1c91f9c469b2e6:processor/regexfunction.js
/**
// write a function that takes two input fields namely the regex pattern and the test string to return a message
 that indicates if there is a match or not

<<<<<<< HEAD:Processor/regexfunction.js
@param {RegExp} regexPattern - The  RegExp object  to test.
@param {string} testString - The test string to test against the regex pattern.
@returns {string} A message indicating whether the test string matches the regex pattern.
*/

function regexfunction(regexPattern, testString){

        // Checking for if regexPattern or testString is null or undefined
        if (regexPattern === null || testString === null) {
            return 'Regex pattern or test string is not valid.';
        }


        

        // Testing the regex against the test string
        if (regexPattern.test(testString)) {
            return 'Match found.';
        } else {
            return 'No match found.';
        }


}


    
    

// converts the string into a RegExp object 
function parseRegex(regexPattern) {
    try {
      // Using the parse function from the regex-parser library
        const parsedPattern = regexParser(regexPattern); 
        return new RegExp(parsedPattern);
         
    } catch (error) {
        // Handle parsing errors
        console.error('Error parsing regex pattern:', error.message);
        throw new Error('Invalid regex pattern.');

    }
=======
@param {string} regexPattern - The regex pattern to test.
@param {string} testString - The test string to match against the regex pattern.
@returns {string} A message indicating whether the test string matches the regex pattern.
*/

const regexParser = require('regex-parser');

function regexfunction(regexPattern, testString) {
    return "";
}

module.exports = {
    regexfunction
>>>>>>> 5f50ccff0b814ada97d31eb68f1c91f9c469b2e6:processor/regexfunction.js
}
