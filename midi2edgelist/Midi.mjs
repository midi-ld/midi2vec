/* eslint no-use-before-define: "off" */
import fs from 'fs-extra';
import midiconvert from 'midiconvert';

let ROOT_FOLDER = '';
const MAP_FILENAMES = [];

export default class Midi {
  constructor(file) {
    console.info(file);

    this.id = filename2id(file);
    const binary = fs.readFileSync(file, 'binary');
    const midi = midiconvert.parse(binary);
    // fs.writeJsonSync(`json/${this.id}.json`, midi);
    this.tracks = midi.tracks.filter(t => t.notes.length);
    this.header = midi.header;
  }

  get bpmClass() {
    return Math.round(this.header.bpm / 10);
  }

  get timeSignature() {
    if (!this.header.timeSignature) return null;
    return `timesig:${this.header.timeSignature.join('/')}`;
  }

  get programs() {
    return this.tracks
      .map(t => t.instrumentNumber)
      .filter(n => n > -1)
      .map(n => `http://purl.org/midi-ld/programs/${n}`);
  }

  /* Returns groups of notes which start in the same time (<0.01 of time diff).
  * _id_ is an has computed on note/duration
  * _duration_ is the maximum duration of the notes in the group
  * _velocity_ is the average velocity
  * _pitches_ all the notes played
  */
  get noteGroups() {
    const notes = this.tracks.map(t => t.notes).flat();

    const alltimes = unique(notes.map(n => n.time)).sort();
    return alltimes.map((curtime) => {
      const curnotes = notes.filter(n => Math.abs(n.time - curtime) < 0.01);
      // {
      //   "name": "A4",
      //   "midi": 69,
      //   "time": 7.499999000000001,
      //   "velocity": 0.6929133858267716,
      //   "duration": 0.5576922333333325
      // }

      const pitches = unique(curnotes.map(x => x.midi)).sort();
      if (!pitches.length) return null;

      let maxduration = Math.max(...curnotes.map(n => n.duration));
      maxduration = Math.round(maxduration * 10);

      let velocity = average(curnotes.map(x => x.velocity));
      velocity = Math.round(velocity * 10);

      const id = `g${hashCode(`${pitches.join(':')}|${maxduration}`)}`;
      // console.log(id, curtime, maxduration, pitches);

      return {
        id,
        duration: `dur:${maxduration}`,
        velocity: `vel:${velocity}`,
        pitches: pitches.flat().map(p => `http://purl.org/midi-ld/notes/${p}`),
      };
    }).filter(x => x != null);
  }

  static set rootFolder(rootFolder) {
    ROOT_FOLDER = rootFolder;
  }

  static get nameMaps() {
    const csv = MAP_FILENAMES.map(m => `${m.id},${m.file}`);
    return `id,filename\n${csv.join('\n')}`;
  }
}

function filename2id(file) {
  const id = file.replace(ROOT_FOLDER, '')
    .replace(/^\//, '')
    .replace('.mid', '')
    .replace(/[\\/]/g, '-')
    .trim()
    .replace(/ /g, '_');

  MAP_FILENAMES.push({ file, id });
  return id;
}

function unique(list) {
  return [...new Set(list)];
}

function hashCode(str) {
  /* eslint-disable no-bitwise */
  return str.split('').reduce((prevHash, currVal) => (((prevHash << 5) - prevHash) + currVal.charCodeAt(0)) | 0, 0);
}

function average(list) {
  return list.reduce((prev, curr) => prev + curr) / list.length;
}
