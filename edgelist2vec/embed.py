import os
import argparse
import networkx as nx
import entity2vec.node2vec as node2vec


def main(args):
    print(args)
    edgelists = [qf for qf in os.listdir(args.input) if qf.endswith(".edgelist")]
    g = None

    print('loading edgelists...')
    for eg in edgelists:
        print('- ' + eg)
        h = nx.read_edgelist(os.path.join(args.input, eg), nodetype=str, create_using=nx.DiGraph())
        for edge in h.edges():
            h[edge[0]][edge[1]]['weight'] = 1

        g = h if g is None else nx.compose(g, h)

    g = g.to_undirected()

    print('Nodes: %d' % nx.number_of_nodes(g))
    print('Edges: %d' % nx.number_of_edges(g))

    node2vec_graph = node2vec.Node2Vec(args.directed,
                                       args.preprocessing,
                                       args.weighted,
                                       args.p,
                                       args.q,
                                       args.walk_length,
                                       args.num_walks,
                                       args.dimensions,
                                       args.window_size,
                                       args.workers,
                                       args.iter)

    node2vec_graph.G = g
    node2vec_graph.learn_embeddings(args.output, 'text')


def parse_args():
    parser = argparse.ArgumentParser(description="Run edgelist 2 vec.")

    parser.add_argument('--input', nargs='?', default='./edgelist',
                        help='Input graph path')

    parser.add_argument('--output', nargs='?', default='embeddings.txt',
                        help='emb file name')

    parser.add_argument('--output_format', nargs='?', default='text',
                        help='Format of the emb file. It accepts "binary" (default) or "text"')

    parser.add_argument('--walk_length', type=int, default=10,
                        help='Length of walk per source. Default is 10.')

    parser.add_argument('--num_walks', type=int, default=40,
                        help='Number of walks per source. Default is 40.')

    parser.add_argument('--p', type=float, default=1,
                        help='Return hyperparameter. Default is 1.')

    parser.add_argument('--q', type=float, default=1,
                        help='Inout hyperparameter. Default is 1.')

    parser.add_argument('--weighted', dest='weighted', action='store_true',
                        help='Boolean specifying (un)weighted. Default is unweighted.')
    parser.set_defaults(weighted=False)

    parser.add_argument('--directed', dest='directed', action='store_true',
                        help='Graph is (un)directed. Default is directed.')
    parser.set_defaults(directed=False)

    parser.add_argument('--preprocessing', dest='preprocessing', action='store_true',
                        help='Whether preprocess all transition probabilities or compute on the fly')
    parser.set_defaults(preprocessing=False)

    parser.add_argument('--dimensions', type=int, default=100,
                        help='Number of dimensions. Default is 100.')

    parser.add_argument('--window-size', type=int, default=5,
                        help='Context size for optimization. Default is 5.')

    parser.add_argument('--iter', default=5, type=int,
                        help='Number of epochs in SGD')

    parser.add_argument('--workers', type=int, default=8,
                        help='Number of parallel workers. Default is 8.')

    return parser.parse_args()


if __name__ == '__main__':
    main(parse_args())
