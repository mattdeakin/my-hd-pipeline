// --- START OF FILE jest.config.js ---
module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  reporters: [ // <--- ADD THIS SECTION
    "default", // This keeps the standard console output from Jest
    [ "jest-junit", {
        "outputDirectory": ".",         // Output to the workspace root
        "outputName": "junit.xml"       // Name the file junit.xml
      }
    ]
  ] // <--- END OF ADDED SECTION
};
// --- END OF FILE jest.config.js ---