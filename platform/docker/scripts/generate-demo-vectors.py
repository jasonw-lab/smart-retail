#!/usr/bin/env python3
"""
generate-demo-vectors.py
========================
Generate 512-dimensional demo feature vectors for testing k-NN search.

This script:
1. Reads the existing demo bulk ndjson file
2. Adds feature_vector to selected documents (based on propertyType)
3. Outputs an updated bulk file

Usage:
    python generate-demo-vectors.py \
        --input platform/docker/opensearch/init/realty-listings-demo-bulk.ndjson \
        --output platform/docker/opensearch/init/realty-listings-demo-bulk.ndjson

The vectors are deterministic (seeded by propertyKey) so they can be regenerated consistently.
Vectors are grouped by propertyType to enable meaningful similarity search:
- mansion: vectors clustered around one region
- house: vectors clustered around another region
- office/retail/land: vectors clustered around other regions
"""

import argparse
import hashlib
import json
import random
import sys
from typing import Optional


# Base vectors for each property type (normalized)
# These serve as "centroids" for each category
PROPERTY_TYPE_CENTROIDS = {
    "mansion": [0.8, 0.2, 0.1, 0.05, 0.3],  # High-rise residential
    "house": [0.2, 0.8, 0.1, 0.05, 0.2],    # Single-family homes
    "office": [0.1, 0.1, 0.8, 0.3, 0.1],    # Commercial office
    "retail": [0.1, 0.2, 0.3, 0.8, 0.1],    # Retail stores
    "land": [0.3, 0.3, 0.2, 0.1, 0.5],      # Land
}

VECTOR_DIMENSION = 512


def generate_vector(property_key: str, property_type: str) -> list[float]:
    """
    Generate a 512-dimensional vector based on property type and key.

    - Uses property_key as seed for reproducibility
    - Applies property_type centroid to cluster similar types
    - Adds random noise to differentiate individual properties
    """
    # Seed random generator with property_key for reproducibility
    seed = int(hashlib.md5(property_key.encode()).hexdigest()[:8], 16)
    rng = random.Random(seed)

    # Get centroid for property type
    centroid_base = PROPERTY_TYPE_CENTROIDS.get(property_type, [0.5] * 5)

    # Extend centroid to full dimension by repeating pattern
    centroid = []
    for i in range(VECTOR_DIMENSION):
        idx = i % len(centroid_base)
        centroid.append(centroid_base[idx])

    # Generate vector with noise around centroid
    vector = []
    for i in range(VECTOR_DIMENSION):
        # Add Gaussian noise (std=0.1) to centroid
        noise = rng.gauss(0, 0.1)
        value = centroid[i] + noise
        # Clamp to reasonable range
        value = max(-1.0, min(1.0, value))
        vector.append(round(value, 6))

    # Normalize to unit length (for cosine similarity)
    norm = sum(v ** 2 for v in vector) ** 0.5
    if norm > 0:
        vector = [round(v / norm, 6) for v in vector]

    return vector


def process_bulk_file(input_path: str, output_path: str, add_vectors: bool = True) -> dict:
    """
    Process the bulk ndjson file and add feature_vector to documents.

    Returns statistics about the processing.
    """
    stats = {
        "total_docs": 0,
        "vectors_added": 0,
        "vectors_existing": 0,
        "skipped": 0,
    }

    lines = []

    with open(input_path, 'r', encoding='utf-8') as f:
        raw_lines = f.readlines()

    i = 0
    while i < len(raw_lines):
        action_line = raw_lines[i].strip()
        if not action_line:
            i += 1
            continue

        # Parse action line (index/create/update)
        try:
            action = json.loads(action_line)
        except json.JSONDecodeError:
            lines.append(raw_lines[i])
            i += 1
            continue

        # Check if this is an index action
        if "index" not in action:
            lines.append(raw_lines[i])
            i += 1
            continue

        lines.append(raw_lines[i])  # Add action line

        # Get document line
        if i + 1 >= len(raw_lines):
            break

        doc_line = raw_lines[i + 1].strip()
        try:
            doc = json.loads(doc_line)
        except json.JSONDecodeError:
            lines.append(raw_lines[i + 1])
            i += 2
            continue

        stats["total_docs"] += 1

        # Check if vector already exists
        if "feature_vector" in doc and doc["feature_vector"]:
            stats["vectors_existing"] += 1
        elif add_vectors:
            # Add feature_vector based on propertyKey and propertyType
            property_key = doc.get("propertyKey", "")
            property_type = doc.get("propertyType", "")

            if property_key and property_type:
                doc["feature_vector"] = generate_vector(property_key, property_type)
                doc["feature_model"] = "mobilenetv3_small"
                doc["feature_version"] = "v1"
                stats["vectors_added"] += 1
            else:
                stats["skipped"] += 1

        # Add document line (updated)
        lines.append(json.dumps(doc, ensure_ascii=False) + "\n")
        i += 2

    # Write output
    with open(output_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)

    return stats


def main():
    parser = argparse.ArgumentParser(
        description="Generate demo feature vectors for k-NN search testing"
    )
    parser.add_argument(
        "--input", "-i",
        required=True,
        help="Input ndjson bulk file path"
    )
    parser.add_argument(
        "--output", "-o",
        required=True,
        help="Output ndjson bulk file path"
    )
    parser.add_argument(
        "--no-vectors",
        action="store_true",
        help="Don't add vectors (just validate the file)"
    )

    args = parser.parse_args()

    print(f"Processing: {args.input}")
    print(f"Output: {args.output}")

    stats = process_bulk_file(args.input, args.output, add_vectors=not args.no_vectors)

    print(f"\nResults:")
    print(f"  Total documents: {stats['total_docs']}")
    print(f"  Vectors added: {stats['vectors_added']}")
    print(f"  Vectors existing: {stats['vectors_existing']}")
    print(f"  Skipped: {stats['skipped']}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
