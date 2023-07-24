import * as THREE from "three"
import { computeBoundsTree,disposeBoundsTree,acceleratedRaycast } from "three-mesh-bvh"

// Introduction of three-mesh-bvh related methods
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree
THREE.Mesh.prototype.raycast = acceleratedRaycast

export default THREE