import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// load shaders
async function load_shaders(vert_file, frag_file, uniforms = {}) {
    const [vertex_src, fragment_src] = await Promise.all([
        fetch(vert_file).then(res => res.text()),
        fetch(frag_file).then(res => res.text())
    ]);

    // create material
    const material = new THREE.ShaderMaterial({
        vertexShader: vertex_src,
        fragmentShader: fragment_src,
        uniforms
    })

    // return material
    return material;
}

// texture loader
const texture_loader = new THREE.TextureLoader();

// object loader
const obj_loader = new OBJLoader();
const fbx_loader = new FBXLoader();
const gltf_loader = new GLTFLoader();

// export
export const resources = {
    load_shaders,
    texture_loader,
    obj_loader,
    fbx_loader,
    gltf_loader
}
