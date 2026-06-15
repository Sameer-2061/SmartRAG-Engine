// backend/utils/mathUtils.js

/**
 * Calculates the Cosine Similarity between two vectors (arrays of numbers).
 * Formula: (A dot B) / (||A|| * ||B||)
 * This avoids heavy ML libraries and runs purely on the CPU using basic array iteration.
 */
function cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) {
        throw new Error("Vectors must be of the same length");
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    // Single loop to calculate dot product and magnitudes simultaneously for performance O(N)
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

module.exports = { cosineSimilarity };