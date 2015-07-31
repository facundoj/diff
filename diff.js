var fs             = require('fs'),
    path           = require('path'),

    filesPaths     = {
        original: process.argv[2] ? path.normalize(process.argv[2]) : null,
        modified: process.argv[3] ? process.argv.slice(3).map(path.normalize) : []
    },

    originalFileLines, comparedFileLines;

// assetions
assertFileExists(filesPaths.original);

// caching original file
originalFileLines = fs.readFileSync(filesPaths.original).toString('utf8').split('\n');

filesPaths.modified.forEach(compareFile(originalFileLines));

function compareFile(originalFileLines) {
    return function compare(modifiedPath) {
        var i = 0, j,
            possiblyAdded,
            possiblyRemoved = [],
            result = [];

        try {
            assertFileExists(modifiedPath);
            comparedFileLines = fs.readFileSync(modifiedPath).toString('utf8').split('\n')

            originalFileLines.forEach(function(line1) {
                var line2,
                    found = false;

                possiblyAdded = [];

                for (j = i; !found && j < comparedFileLines.length; j++) {
                    line2 = comparedFileLines[j];

                    if (line1 === line2) {
                        resolvePrevLines(possiblyAdded, possiblyRemoved, result);
                        possiblyAdded = [];
                        possiblyRemoved = [];

                        result.push({
                            sign: ' ',
                            content: line1
                        });

                        found = true;
                        i = j + 1;
                    } else {
                        possiblyAdded.push(line2);
                    }
                }

                if (!found) {
                    possiblyRemoved.push(line1);
                }
            });

            resolvePrevLines(possiblyAdded, possiblyRemoved, result)
            printResult(result, modifiedPath);

        } catch(e) {
            console.log(e);
        }
    }
}

function resolvePrevLines(possiblyAdded, possiblyRemoved, result) {
    var i, j;
    for (i = 0; i < possiblyRemoved.length; i++) {
        if (possiblyAdded.length) {
            result.push({
                sign: '*',
                content: possiblyRemoved[i] + ' | ' + possiblyAdded[0]
            });
            possiblyAdded.splice(0, 1);
        } else {
            result.push({
                sign: '-',
                content: possiblyRemoved[i]
            });
        }
    }
    possiblyAdded.forEach(function(added) {
        result.push({
            sign: '+',
            content: added
        });
    })
}

function printResult(results, file) {
    console.log('Result: ' + file + ' -------------------------\n');
    results.forEach(function(result) {
        console.log(result.sign + ' ' + result.content);
    });
}

function assertFileExists(filePath) {
    if (!filePath || !fs.existsSync(filePath)) {
        throw 'File not found: ' + filePath;
    }
}
