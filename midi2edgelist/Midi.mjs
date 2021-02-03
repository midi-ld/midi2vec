/* eslint no-use-before-define: "off" */
import fs from 'fs-extra';
import * as midilib from '@tonejs/midi';

let ROOT_FOLDER = '';
const MAP_FILENAMES = [];

export default class Midi {
  constructor(file) {
    console.info(file);

    this.file = file;
    this.id = filename2id(file);

    const midi = new midilib.Midi(fs.readFileSync(this.file));
    // fs.writeJsonSync(`json/${this.id}.json`, midi);
    this.tracks = midi.tracks.filter((t) => t.notes.length);
    this.header = midi.header;
  }

  get bpmClass() {
    if (!this.header || !this.header.tempos) return null;
    if (!this.header.tempos.length) return null;
    return Math.round(this.header.tempos[0].bpm / 10);
  }

  get timeSignature() {
    if (!this.header || !this.header.timeSignatures) return null;
    if (!this.header.timeSignatures.length) return null;
    return `timesig:${this.header.timeSignatures[0].timeSignature.join('/')}`;
  }

  get programs() {
    return this.tracks
      .map((t) => t.instrument.number)
      .filter((n) => n > -1)
      .map((n) => `http://purl.org/midi-ld/programs/${n}`);
  }

  /* Returns groups of notes which start in the same time (<0.01 of time diff).
  * _id_ is an has computed on note/duration
  * _duration_ is the maximum duration of the notes in the group
  * _velocity_ is the average velocity
  * _pitches_ all the notes played
  */
  get noteGroups() {
    return this.getNoteGroups();
  }

  getNoteGroups(num, ignore_drums = false) {
    let trk = this.tracks;
    if (ignore_drums) trk = trk.filter(t => t.channel != 10);

    const notes = trk.map((t) => t.notes).flat();
    let alltimes = unique(notes.map((n) => n.time)).sort();

    if (num) alltimes = alltimes.slice(0, num);

    return alltimes.map((curtime) => {
      const curnotes = notes.filter((n) => Math.abs(n.time - curtime) < 0.01);
      // {
      //   "name": "A4",
      //   "midi": 69,
      //   "time": 7.499999000000001,
      //   "velocity": 0.6929133858267716,
      //   "duration": 0.5576922333333325
      // }

      const pitches = unique(curnotes.map((x) => x.midi)).sort();
      if (!pitches.length) return null;

      let maxduration = Math.max(...curnotes.map((n) => n.duration));
      maxduration = Math.round(maxduration * 10);

      let velocity = average(curnotes.map((x) => x.velocity));
      velocity = Math.round(velocity * 10);

      const id = `g${hashCode(`${pitches.join(':')}|${maxduration}`)}`;
      // console.log(id, curtime, maxduration, pitches);

      return {
        id,
        duration: `dur:${maxduration}`,
        velocity: `vel:${velocity}`,
        pitches: pitches.flat().map((p) => `http://purl.org/midi-ld/notes/${p}`),
      };
    }).filter((x) => x != null);
  }

  static set rootFolder(rootFolder) {
    ROOT_FOLDER = rootFolder;
  }

  static get nameMaps() {
    const csv = MAP_FILENAMES.map((m) => `${m.id},"${m.file}"`);
    return `id,filename\n${csv.join('\n')}`;
  }
}

function filename2id(file) {
  return file.replace(ROOT_FOLDER, '')
    .replace(/^\//, '')
    .replace(/\.midi?$/i, '')
    .replace(/,/g, '+')
    .replace(/[\\/]/g, '-')
    .trim()
    .replace(/ /g, '_');
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
