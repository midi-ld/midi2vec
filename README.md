MIDI2vec: Learning Embeddings for MIDI Vector Space Representations
===================================================================

Compute graph embeddings from MIDI.

This library is described in detail in the following paper ([bib](http://pasqlisena.github.io/publication/lisena2021midi2vec.bib))

> Lisena P., Meroño-Peñuela A. & Troncy R. MIDI2vec: Learning MIDI Embeddings for Reliable Prediction of Symbolic Music Metadata. In Semantic Web Journal, Special issue on Deep Learning for Knowledge Graphs, vol.13, no.3, pp. 357-377, IOSPress, 6 April 2022
> http://doi.org/10.3233/SW-210446

The experiments described in the paper are available [here](https://github.com/pasqLisena/midi-embs).

Pre-computed MIDI embeddings used in the paper are available in [Zenodo](https://zenodo.org/record/5082300).


# Usage

The library is composed by 2 parts.

## midi2edgelist

Convert a MIDI file into a graph, in edgelist format.

Requires [Node.js](https://nodejs.org/en/):

    cd midi2edgelist

    npm install

    node index.js -i <midi_folder>

Optional arguments:
 
- `-i`, `--input`.  Input directory containing MIDI files. `REQUIRED`
- `-o`, `--output` Output directory for the edgelists. Default: `./edgelist`
- `-n`, `--note-groups` Number of groups of simultaneous notes to be taken in account for each MIDI. For example, `-n 300` uses the first 300 groups. Default: all.

The output is formed by 4 edgelist (notes, program, tempo and time signature) and a csv containing the mapping between the file names and the given identifiers.

## edgelist2vec

It uses [node2vec](https://cs.stanford.edu/people/jure/pubs/node2vec-kdd16.pdf) for computing the embeddings from the egelists.

It requires Python 3.8.

    pip install -r edgelist2vec/requirements.txt

    python edgelist2vec/embed.py
    
Optional arguments:

- `-i`, `--input` Input graph (edgelists) path. Default: `.\edgelist`;
- `-o`, `--output` Output file name. Default: `embeddings.bin`;
- `--walk_length` Length of walk per source. Default: 10;
- `--num_walks` Number of walks per source. Default: 40;
- `-p` Return hyper-parameter (as in node2vec). Default: 1;
- `-q` Inout hyper-parameter (as in node2vec). Default: 1;
- `--dimensions` Number of dimensions. Default: 100;
- `--window-size` Context size for optimization. Default: 5;
- `--iter` Number of epochs in word2vec. Default: 5;
- `--workers` Number of parallel workers. Default: 0 (full use);
- `--exclude` Edgelists to be excluded from the computation.
