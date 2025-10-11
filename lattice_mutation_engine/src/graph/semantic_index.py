from typing import List, Optional

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
except Exception:  # Optional dependency
    TfidfVectorizer = None
    cosine_similarity = None

from lattice_mutation_engine.models.spec_graph_models import Node


class TfidfSemanticIndex:
    """Lightweight local semantic search using TF-IDF over node text fields.

    Falls back gracefully if scikit-learn is not available.
    """

    def __init__(self, repo):
        self.repo = repo
        self._vectorizer: Optional[TfidfVectorizer] = None
        self._matrix = None
        self._nodes: List[Node] = []

    def _available(self) -> bool:
        return TfidfVectorizer is not None and cosine_similarity is not None

    def _build_corpus(self) -> List[str]:
        # Use all nodes' name + description + content as text
        self._nodes = list(self._iter_nodes())
        corpus = []
        for n in self._nodes:
            parts = [n.name or "", n.description or "", n.content or ""]
            corpus.append("\n".join(parts))
        return corpus

    def _iter_nodes(self) -> List[Node]:
        # Obtain all nodes from repo; in Neo4j, query without filter
        try:
            return self.repo.query_nodes()
        except TypeError:
            # Some repos may require explicit args; default to None
            return self.repo.query_nodes(node_type=None, filters=None)

    def search(self, query: str, top_k: int = 5) -> List[Node]:
        if not self._available():
            # Fallback to repo's built-in semantic_search
            return self.repo.semantic_search(query=query, top_k=top_k)

        corpus = self._build_corpus()
        if not corpus:
            return []

        self._vectorizer = TfidfVectorizer(stop_words="english")
        self._matrix = self._vectorizer.fit_transform(corpus)

        q_vec = self._vectorizer.transform([query])
        sims = cosine_similarity(q_vec, self._matrix).flatten()
        # Get top_k indices sorted by similarity
        top_indices = sims.argsort()[::-1][:top_k]
        return [self._nodes[i] for i in top_indices if sims[i] > 0]

    def refresh(self):
        """Clear cached vectors so next search rebuilds corpus."""
        self._vectorizer = None
        self._matrix = None
        self._nodes = []