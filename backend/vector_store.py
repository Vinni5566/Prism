"""
vector_store.py — Persistent vector database wrapper using ChromaDB.
"""

import os
import chromadb
from typing import List, Dict, Any, Optional
from config import CHROMA_PATH, CHROMA_COLLECTION

# Ensure directory exists before initializing client
os.makedirs(CHROMA_PATH, exist_ok=True)

# Initialize persistent client and collection using cosine distance metric
_client = chromadb.PersistentClient(path=CHROMA_PATH)
_collection = _client.get_or_create_collection(
    name=CHROMA_COLLECTION,
    metadata={"hnsw:space": "cosine"}
)


def add_candidates(
    candidate_ids: List[str],
    vectors: List[List[float]],
    metadatas: Optional[List[Dict[str, Any]]] = None,
    documents: Optional[List[str]] = None,
):
    """
    Bulk add or update candidate vectors and documents in ChromaDB.
    Uses upsert to safely overwrite existing candidate records if they are updated.
    """
    # Ensure metadatas is valid for ChromaDB (dict values must be str, int, float, or bool)
    processed_metadatas = None
    if metadatas:
        processed_metadatas = []
        for meta in metadatas:
            clean_meta = {}
            for k, v in meta.items():
                if isinstance(v, (str, int, float, bool)):
                    clean_meta[k] = v
                elif v is None:
                    clean_meta[k] = ""
                else:
                    # Serialise list/dict to string
                    clean_meta[k] = str(v)
            processed_metadatas.append(clean_meta)

    _collection.upsert(
        ids=candidate_ids,
        embeddings=vectors,
        metadatas=processed_metadatas,
        documents=documents
    )


def add(
    candidate_id: str,
    vector_or_text: Any,
    metadata: Optional[Dict[str, Any]] = None,
    document: Optional[str] = None,
):
    """
    Add a single candidate to the vector database.
    """
    if isinstance(vector_or_text, list) and all(isinstance(x, float) for x in vector_or_text):
        vector = vector_or_text
    else:
        # Fallback if text is passed instead of list (e.g. mock usage)
        from embedder import embed_text
        doc_str = document or str(vector_or_text)
        vector = embed_text(doc_str)
        document = doc_str

    add_candidates(
        candidate_ids=[str(candidate_id)],
        vectors=[vector],
        metadatas=[metadata] if metadata else None,
        documents=[document] if document else None,
    )


def add_candidate(candidate_id: str, text: str, metadata: Optional[Dict[str, Any]] = None):
    """Add candidate using raw text (embeds locally)."""
    from embedder import embed_text
    vector = embed_text(text)
    add(candidate_id, vector, metadata, document=text)


def search(query: Any, top_n: int = 50, top_k: Optional[int] = None) -> List[Dict[str, Any]]:
    """
    Search ChromaDB for nearest candidate vectors.
    
    Args:
        query: list of floats (query vector) or string (raw query text)
        top_n: number of results to return
        top_k: alias for top_n for backwards compatibility
    """
    limit = top_k if top_k is not None else top_n
    
    total_count = count()
    if total_count == 0:
        return []
        
    n_results = min(limit, total_count)
    if n_results <= 0:
        return []

    # If query is text, embed it first
    if isinstance(query, str):
        from embedder import embed_text
        query_vector = embed_text(query)
    else:
        query_vector = query

    results = _collection.query(
        query_embeddings=[query_vector],
        n_results=n_results
    )

    formatted_results = []
    if results and "ids" in results and results["ids"]:
        ids = results["ids"][0]
        distances = results["distances"][0] if "distances" in results and results["distances"] else [0.0] * len(ids)
        metadatas = results["metadatas"][0] if "metadatas" in results and results["metadatas"] else [None] * len(ids)
        documents = results["documents"][0] if "documents" in results and results["documents"] else [None] * len(ids)

        for i in range(len(ids)):
            # In 'cosine' space, ChromaDB returns cosine distance (1.0 - cosine_similarity).
            # We convert it back to cosine similarity score.
            distance = distances[i]
            similarity = 1.0 - distance
            # Clamp to [0, 1] range
            similarity = max(0.0, min(1.0, similarity))

            formatted_results.append({
                "candidate_id": ids[i],
                "id": ids[i],
                "score": similarity,
                "similarity": similarity,
                "metadata": metadatas[i] or {},
                "document": documents[i]
            })

    return formatted_results


def count() -> int:
    """Return total number of documents in collection."""
    return _collection.count()


class VectorStore:
    """Backwards compatible class interface."""
    def __init__(self):
        pass

    def add_candidate(self, candidate_id: str, text: str, metadata: Optional[Dict[str, Any]] = None):
        return add_candidate(candidate_id, text, metadata)

    def add(self, candidate_id: str, vector_or_text: Any, metadata: Optional[Dict[str, Any]] = None, document: Optional[str] = None):
        return add(candidate_id, vector_or_text, metadata, document)

    def search(self, query: Any, top_n: int = 50, top_k: Optional[int] = None):
        return search(query, top_n=top_n, top_k=top_k)

    def count(self) -> int:
        return count()