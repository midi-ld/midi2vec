MIDI2vec: Learning Embeddings for MIDI Vector Space Representations
===================================================================

Compute graph embeddings from MIDI. Pre-computed MIDI embeddings for reliable prediction of metadata (i.e. supervised learning) are available [here](https://github.com/pasqLisena/midi-embs)


# Usage

The library is composed by 2 parts.

## midi2edgelist

Convert a MIDI file in an edgelist.

Requires [Node.js](https://nodejs.org/en/): 


    cd midi2edgelist
    
    npm install

    node index.js -i <midi_folder>


## edgelist2vec

It uses [node2vec](https://cs.stanford.edu/people/jure/pubs/node2vec-kdd16.pdf) for computing the embeddings from the egelists.

    pip install -r edgelist2vec/requirements.txt

    python edgelist2vec/embed.py

# Publications

Pasquale Lisena, Albert Meroño-Peñuela, Raphaël Troncy. **MIDI2vec: Learning MIDI Embeddings for
Reliable Prediction of Symbolic Music Metadata**. Transactions of the International Society for Music
Information Retrieval (TISMIR), under submission (2020).
