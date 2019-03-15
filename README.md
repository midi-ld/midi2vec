midi2vec
===============

Compute graph embeddings from MIDI.

The library is composed by 2 parts.

### midi2edgelist

Convert a MIDI file in an edgelist.

Requires [Node.js](https://nodejs.org/en/): 


    cd midi2edgelist
    
    npm install

    node index.js -i <midi_folder>


### edgelist2vec

It uses [node2vec](https://cs.stanford.edu/people/jure/pubs/node2vec-kdd16.pdf) for computing the embeddings from the egelists.

    pip install -r edgelist2vec/requirements.txt

    python edgelist2vec/embed.py
