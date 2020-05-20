#!/usr/bin/env node
/* eslint no-use-before-define: "off" */
require = require('esm')(module); // eslint-disable-line

const path = require('path');
const fs = require('fs-extra');
const klawSync = require('klaw-sync');
const { ArgumentParser } = require('argparse');

const Midi = require('./Midi.mjs').default;

// parse arguments
const parser = new ArgumentParser();
parser.addArgument(['-i', '--input'], { help: 'Input directory containing MIDI files.', required: true });
parser.addArgument(['-o', '--output'], { help: 'Output directory for the edgelists.', defaultValue: '../edgelist' });
parser.addArgument(['-n', '--note-groups'], { help: 'Number of groups to be taken in account.', defaultValue: 300, type: 'int' });
const args = parser.parseArgs();

console.log(args);

fs.ensureDirSync(args.output);
Midi.rootFolder = args.input;

// get all MIDI file paths
const paths = klawSync(args.input, {
  nodir: true,
  traverseAll: true,
  filter: (p) => p.path.endsWith('.midi') || p.path.endsWith('.mid'),
}).map((p) => p.path);

// prepare output files
const outputPaths = {
  notes: path.join(args.output, 'notes.edgelist'),
  program: path.join(args.output, 'program.edgelist'),
  tempo: path.join(args.output, 'tempo.edgelist'),
  signature: path.join(args.output, 'time.signature.edgelist'),
  name: path.join(args.output, 'names.csv'),
};
const stream = {};
Object.keys(outputPaths).forEach((p) => {
  if (fs.existsSync(outputPaths[p])) fs.unlinkSync(outputPaths[p]);
  stream[p] = fs.openSync(outputPaths[p], 'w');
});
fs.writeSync(stream.name, 'id,filename\n');


// parse function
function parseMidi(file) {
  const m = new Midi(file);
  if (!m.tracks) return;

  // notes
  m.getNoteGroups(args.note_groups).forEach((note) => {
    fs.writeSync(stream.notes, `${m.id} ${note.id}\n`);
    for (const p of note.pitches) fs.writeSync(stream.notes, `${note.id} ${p}\n`);
    fs.writeSync(stream.notes, `${note.id} ${note.duration}\n`);
    fs.writeSync(stream.notes, `${note.id} ${note.velocity}\n`);
  });

  // programs
  fs.writeSync(stream.program, m.programs.map((p) => `${m.id} ${p}`).join('\n'));
  fs.writeSync(stream.program, '\n');

  // tempo
  if (m.bpmClass) fs.writeSync(stream.tempo, `${m.id} ${m.bpmClass}\n`);

  // time signature
  if (m.timeSignature) fs.writeSync(stream.signature, `${m.id} ${m.timeSignature}\n`);

  fs.writeSync(stream.name, `${m.id},"${m.file}"\n`);
}

paths.forEach(parseMidi);

console.log('done');
