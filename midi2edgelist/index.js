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
const args = parser.parseArgs();

fs.ensureDirSync(args.output);
Midi.rootFolder = args.input;

// get all MIDI file paths
const paths = klawSync(args.input, {
  nodir: true,
  traverseAll: true,
  filter: p => p.path.endsWith('.mid'),
}).map(p => p.path);


const midi = paths.map(file => new Midi(file));

// notes edgelist
console.info('\nwriting notes edgelist');
const file = path.join(args.output, 'notes.edgelist');
fs.writeFileSync(file, '');
midi.forEach(m => m.noteGroups.slice(0, 600).forEach((note) => {
  console.log(m.id);
  fs.appendFileSync(file, `${m.id} ${note.id}\n`);
  for (const p of note.pitches) fs.appendFileSync(file, `${note.id} ${p}\n`);
  fs.appendFileSync(file, `${note.id} ${note.duration}\n`);
  fs.appendFileSync(file, `${note.id} ${note.velocity}\n`);
}));

// programs edgelist
console.info('writing programs edgelist');
const programEdges = midi.map(m => m.programs.map(p => `${m.id} ${p}`));
fs.writeFile(path.join(args.output, 'program.edgelist'), programEdges.flat().join('\n'));

// tempo edgelist
console.info('writing tempo edgelist');
const tempoEdges = midi.map(m => `${m.id} ${m.bpmClass}`);
fs.writeFile(path.join(args.output, 'tempo.edgelist'), tempoEdges.join('\n'));

// time signature edgelist
const timeSignatureEdges = midi
  .filter(m => m.timeSignature)
  .map(m => `${m.id} ${m.timeSignature}`);
fs.writeFile(path.join(args.output, 'time.signature.edgelist'), timeSignatureEdges.join('\n'));

fs.writeFile(path.join(args.output, 'names.csv'), Midi.nameMaps);

console.log('done');
