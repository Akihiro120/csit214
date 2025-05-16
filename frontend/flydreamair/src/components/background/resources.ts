import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// load shaders


// texture loader
const texture_loader = new THREE.TextureLoader();

// object loader
const obj_loader = new OBJLoader();
const fbx_loader = new FBXLoader();
const gltf_loader = new GLTFLoader();

// export
export const resources = {
    texture_loader,
    obj_loader,
    fbx_loader,
    gltf_loader,
};
