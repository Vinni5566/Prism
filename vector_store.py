"""
vector_store.py — ChromaDB wrapper.
Stores candidate vectors locally. No server needed.
ChromaDB persists to disk automatically in CHROMA_PATH.
"""

import chromadb
from chromadb.config import Settings
from typing import List, Dict, Tuple
import os

from config import CHROMA_PATH, CHROMA_COLLECTION, TOP_N_SEMANTIC

os.makedirs(CHROMA_PATH, exist_ok=True)

_client: chromadb.PersistentClient = None
_collection = None


def _get_collection():
    global _client, _collection
    if _collection is None:
        _client = chromadb.PersistentClient(
            path=CHROMA_PATH,
            settings=Settings(anonymized_telemetry=False),
        )
        _collection = _client.get_or_create_collection(
            name=CHROMA_COLLECTION,
            metadata={"hnsw:space": "cosine"},   # cosine similarity
        )
    return _collection


def add_candidates(
    candidate_ids: List[str],
    vectors: List[List[float]],
    metadatas: List[Dict],
    documents: List[str],
):
    """
    Bulk-add candidates to ChromaDB.
    Call this during data ingestion. Handles duplicates via upsert.
    """
    col = _get_collection()

    # ChromaDB has a 41,666 batch limit — chunk if needed
    BATCH = 1000
    for i in range(0, len(candidate_ids), BATCH):
        col.upsert(
            ids=candidate_ids[i:i+BATCH],
            embeddings=vectors[i:i+BATCH],
            metadatas=metadatas[i:i+BATCH],
            documents=documents[i:i+BATCH],
        )
    print(f"[VectorStore] Upserted {len(candidate_ids)} candidates.")


def search(
    query_vector: List[float],
    top_n: int = TOP_N_SEMANTIC,
    where: Dict = None,
) -> List[Dict]:
    """
    Given a JD vector, return top_n most similar candidate IDs + scores.

    Returns list of:
        {
          "candidate_id": str,
          "similarity":   float (0-1, higher = more similar),
          "document":     str  (profile text used for embedding)
        }
    """
    col = _get_collection()
    kwargs = dict(
        query_embeddings=[query_vector],
        n_results=min(top_n, col.count() or 1),
        include=["distances", "metadatas", "documents"],
    )
    if where:
        kwargs["where"] = where

    results = col.query(**kwargs)

    output = []
    ids        = results["ids"][0]
    distances  = results["distances"][0]   # cosine distance (0=identical, 2=opposite)
    metadatas  = results["metadatas"][0]
    documents  = results["documents"][0]

    for cid, dist, meta, doc in zip(ids, distances, metadatas, documents):
        similarity = 1.0 - (dist / 2.0)   # convert cosine distance → similarity
        output.append({
            "candidate_id": cid,
            "similarity":   round(similarity, 4),
            "document":     doc,
            "metadata":     meta,
        })

    return output


def count() -> int:
    """Return number of candidates in the vector store."""
    return _get_collection().count()


def delete_candidate(candidate_id: str):
    _get_collection().delete(ids=[candidate_id])


def reset():
    """Wipe all vectors — use only during testing."""
    col = _get_collection()
    col.delete(where={"candidate_id": {"$ne": ""}})
    print("[VectorStore] Reset complete.")
