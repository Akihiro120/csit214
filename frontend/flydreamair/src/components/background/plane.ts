import * as THREE from 'three';
import { resources } from './resources.js';
import { Shaders } from './shaders.js';

class Plane {
    private planeObject: THREE.Object3D;

    // construct plane object
    constructor(scene: THREE.Scene, shader: THREE.ShaderMaterial) {
        this.planeObject = new THREE.Object3D();

        // load the model - Fuck this file format, who tf uses glb
        resources.gltf_loader.load('/plane/plane.glb', (object) => {
            // Allocate the object the 3D model
            this.planeObject = object.scene;

            // set material
            this.planeObject.traverse((child) => {
                if ((child as THREE.Mesh).isMesh) {
                    const mesh = child as THREE.Mesh;
                    mesh.material = shader;
                }
            });

            // Load the assets into the shader
            resources.texture_loader.load('/plane/plane_A.png', (texture) => {
                Shaders.ShadedShader.uniforms.albedo_texture.value = texture;
            });
            resources.texture_loader.load('/plane/plane_N.png', (texture) => {
                Shaders.ShadedShader.uniforms.normal_texture.value = texture;
            });
            resources.texture_loader.load('/plane/plane_AO.png', (texture) => {
                Shaders.ShadedShader.uniforms.ao_texture.value = texture;
            });
            resources.texture_loader.load('/noise.png', (texture) => {
                Shaders.ShadedShader.uniforms.noise_map.value = texture;
            });

            // set the position
            this.planeObject.position.copy(new THREE.Vector3(0, 0, 0));
            this.planeObject.rotateOnAxis(
                new THREE.Vector3(0, 1, 0),
                THREE.MathUtils.degToRad(-35)
            );
            this.planeObject.scale.set(1.0, 1.0, 1.0);

            // add to scene
            this.planeObject.layers.set(1);
            scene.add(this.planeObject);
        });
    }

    public Dispose() {
        // Clear any textures and assets
        const uniforms = Shaders.ShadedShader.uniforms;

        uniforms.albedo_texture.value.dispose();
        uniforms.normal_texture.value.dispose();
        uniforms.ao_texture.value.dispose();
        uniforms.noise_map.value.dispose();

        if (this.planeObject) {
            this.planeObject.traverse((child) => {
                if ((child as THREE.Mesh).isMesh) {
                    const mesh = child as THREE.Mesh;

                    if (mesh.geometry) {
                        mesh.geometry.dispose();
                    }
                }
            });
        }

        // Free any assets
        while (this.planeObject.children.length > 0) {
            this.planeObject.remove(this.planeObject.children[0]);
        }

        console.log('Sucessfully Disposed Assets');
    }

    animate(time: number) {
        // Set the Time Variable
        Shaders.ShadedShader.uniforms.time.value = time;

        // Calculate the Pitch and Roll
        const pitchAmplitude: number = 0.1; // maximum pitch oscillation in radians
        const rollAmplitude: number = 0.1; // maximum roll oscillation in radians
        const speed: number = 3;

        this.planeObject.rotation.x =
            Number(pitchAmplitude) * Math.sin(Number(speed) * Number(time));
        this.planeObject.rotation.z =
            Number(rollAmplitude) * Math.sin(Number(speed) * Number(time) + Math.PI / 2); // phase offset for variation
    }
}

export { Plane };
