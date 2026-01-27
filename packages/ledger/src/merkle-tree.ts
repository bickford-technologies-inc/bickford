import { createHash } from "crypto";

export interface MerkleProof {
  path: Buffer[];
  indices: number[];
  leaf: Buffer;
  root: Buffer;
}

export class MerkleTree {
  private leaves: Buffer[];
  private layers: Buffer[][];

  constructor(leaves: Buffer[] = []) {
    this.leaves = leaves;
    this.layers = [];
    if (leaves.length > 0) {
      this.buildTree();
    }
  }

  private hash(data: Buffer): Buffer {
    return createHash("sha256").update(data).digest();
  }

  private pairHash(left: Buffer, right: Buffer): Buffer {
    return this.hash(Buffer.concat([left, right]));
  }

  private buildTree(): void {
    if (this.leaves.length === 0) {
      throw new Error("Cannot build tree with zero leaves");
    }

    this.layers = [this.leaves];
    let currentLayer = this.leaves;

    while (currentLayer.length > 1) {
      const nextLayer: Buffer[] = [];

      for (let i = 0; i < currentLayer.length; i += 2) {
        if (i + 1 < currentLayer.length) {
          nextLayer.push(this.pairHash(currentLayer[i], currentLayer[i + 1]));
        } else {
          nextLayer.push(currentLayer[i]);
        }
      }

      this.layers.push(nextLayer);
      currentLayer = nextLayer;
    }
  }

  getRoot(): Buffer {
    if (this.layers.length === 0) {
      throw new Error("Tree is empty");
    }
    return this.layers[this.layers.length - 1][0];
  }

  getLeaves(): Buffer[] {
    return [...this.leaves];
  }

  getProof(index: number): MerkleProof {
    if (index < 0 || index >= this.leaves.length) {
      throw new Error(`Invalid leaf index: ${index}`);
    }

    const path: Buffer[] = [];
    const indices: number[] = [];
    let currentIndex = index;

    for (
      let layerIndex = 0;
      layerIndex < this.layers.length - 1;
      layerIndex++
    ) {
      const layer = this.layers[layerIndex];
      const isRightNode = currentIndex % 2 === 1;
      const siblingIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;

      if (siblingIndex < layer.length) {
        path.push(layer[siblingIndex]);
        indices.push(siblingIndex);
      }

      currentIndex = Math.floor(currentIndex / 2);
    }

    return {
      path,
      indices,
      leaf: this.leaves[index],
      root: this.getRoot(),
    };
  }

  static verify(proof: MerkleProof): boolean {
    let currentHash = proof.leaf;
    let currentIndex = proof.indices.length > 0 ? proof.indices[0] : 0;

    const isLeafRightNode = currentIndex % 2 === 1;

    for (let i = 0; i < proof.path.length; i++) {
      const sibling = proof.path[i];
      const siblingIndex = proof.indices[i];

      const isCurrentLeft =
        siblingIndex > (isLeafRightNode ? currentIndex - 1 : currentIndex);

      currentHash = isCurrentLeft
        ? MerkleTree.prototype.pairHash.call(
            {
              hash: (data: Buffer) =>
                createHash("sha256").update(data).digest(),
            },
            currentHash,
            sibling,
          )
        : MerkleTree.prototype.pairHash.call(
            {
              hash: (data: Buffer) =>
                createHash("sha256").update(data).digest(),
            },
            sibling,
            currentHash,
          );

      currentIndex = Math.floor(currentIndex / 2);
    }

    return currentHash.equals(proof.root);
  }

  append(leaf: Buffer): void {
    this.leaves.push(leaf);
    this.buildTree();
  }

  getStats(): {
    totalLeaves: number;
    treeHeight: number;
    rootHash: string;
    totalNodes: number;
  } {
    const totalNodes = this.layers.reduce(
      (sum, layer) => sum + layer.length,
      0,
    );

    return {
      totalLeaves: this.leaves.length,
      treeHeight: this.layers.length,
      rootHash: this.layers.length > 0 ? this.getRoot().toString("hex") : "",
      totalNodes,
    };
  }
}
