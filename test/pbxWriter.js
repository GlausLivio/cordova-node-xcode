/**
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 'License'); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */

var pbx = require('../lib/pbxProject'),
    fs = require('fs'),
    myProj;

function testProjectContents(filename, test, expectedFilename) {
    var myProj = new pbx(filename);

    var content;
    if (expectedFilename) {
        content = fs.readFileSync(expectedFilename, 'utf-8');
    } else {
        content = fs.readFileSync(filename, 'utf-8');
    }
    // normalize tabs vs strings
    content = content.replace(/    /g, '\t');

    myProj.parse(function (err, projHash) {
        var written = myProj.writeSync();

        test.equal(content, written);
        test.done();
    });
}

// for debugging failing tests
function testContentsInDepth(filename, test) {
    var myProj = new pbx(filename),
        content = fs.readFileSync(filename, 'utf-8');

    // normalize tabs vs strings
    content = content.replace(/    /g, '\t');

    myProj.parse(function (err, projHash) {
        var written = myProj.writeSync(),
            writtenLines = written.split('\n')
            contentLines = content.split('\n')

        test.equal(writtenLines.length, contentLines.length);

        for (var i=0; i<writtenLines.length; i++) {
            test.equal(writtenLines[i], contentLines[i],
                'match failed on line ' + (i+1))
        }

        test.done();
    });
}

exports.writeSync = {
    'should write out the "hash" test': function (test) {
        testProjectContents('test/parser/projects/hash.pbxproj', test);
    },
    'should write out the "with_array" test': function (test) {
        // Special case in that the originating project does not have a trailing comma for all of its array entries.
        // This is definitely possibly.
        // But when we write/read it out again during testing, the trailing commas are introduced by our library.
        testProjectContents('test/parser/projects/with_array.pbxproj', test, 'test/parser/projects/expected/with_array_expected.pbxproj');
    },
    'should write out the "section" test': function (test) {
        testProjectContents('test/parser/projects/section.pbxproj', test);
    },
    'should write out the "two-sections" test': function (test) {
        testProjectContents('test/parser/projects/two-sections.pbxproj', test);
    },
    'should write out the "section-entries" test': function (test) {
        testProjectContents('test/parser/projects/section-entries.pbxproj', test);
    },
    'should write out the "build-config" test': function (test) {
        testProjectContents('test/parser/projects/build-config.pbxproj', test);
    },
    'should write out the "header-search" test': function (test) {
        testProjectContents('test/parser/projects/header-search.pbxproj', test);
    },
    'should write out the "nested-object" test': function (test) {
        testProjectContents('test/parser/projects/nested-object.pbxproj', test);
    },
    'should write out the "build-files" test': function (test) {
        testProjectContents('test/parser/projects/build-files.pbxproj', test);
    },
    'should write out the "file-references" test': function (test) {
        testProjectContents('test/parser/projects/file-references.pbxproj', test);
    },
    'should not null and undefined with the "omitEmptyValues" option set to false test': function (test) {
        var filename = 'test/parser/projects/with_omit_empty_values_disabled.pbxproj'
        var expectedFilename = 'test/parser/projects/expected/with_omit_empty_values_disabled_expected.pbxproj'
        var content = fs.readFileSync(expectedFilename, 'utf-8').replace(/    /g, '\t');
        var project = new pbx(filename);
        project.parse(function (err) {
            if (err) {
                return test.done(err);
            }
            const group = project.addPbxGroup([], 'CustomGroup', undefined)
            var written = project.writeSync();
            content = content.replace('CUSTOM_GROUP_UUID_REPLACED_BY_TEST', group.uuid)
            test.equal(content, written);
            test.done();
        });
    },
    'should drop null and undefined with the "omitEmptyValues" option set to true test': function (test) {
        var filename = 'test/parser/projects/with_omit_empty_values_enabled.pbxproj'
        var expectedFilename = 'test/parser/projects/expected/with_omit_empty_values_enabled_expected.pbxproj'
        var content = fs.readFileSync(expectedFilename, 'utf-8').replace(/    /g, '\t');
        var project = new pbx(filename);
        project.parse(function (err) {
            if (err) {
                return test.done(err);
            }
            var group = project.addPbxGroup([], 'CustomGroup', undefined);
            var written = project.writeSync({ omitEmptyValues: true });
            content = content.replace('CUSTOM_GROUP_UUID_REPLACED_BY_TEST', group.uuid)
            test.equal(content, written);
            test.done();
        });
    }
}
