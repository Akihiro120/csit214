import * as THREE from 'three';
import { resources } from './resources.js';
import { shaders } from './shaders.js';

class Plane {
	// construct plane object
	constructor(scene, shader) {

		this.plane_object = new THREE.Object3D();

		// load the model - Fuck this file format, who tf uses glb
		resources.gltf_loader.load("resources/plane/plane.glb", (object) => {
			this.plane_object = object.scene;

			// set material
			this.plane_object.traverse((child) => {

				child.material = shader;
			});

			resources.texture_loader.load("resources/plane/plane_A.png", (texture) => {
				shaders.shaded.uniforms.albedo_texture.value = texture;
			});
			resources.texture_loader.load("resources/plane/plane_N.png", (texture) => {
				shaders.shaded.uniforms.normal_texture.value = texture;
			});
			resources.texture_loader.load("resources/plane/plane_AO.png", (texture) => {
				shaders.shaded.uniforms.ao_texture.value = texture;
			});

			// set the position
			//this.plane_object.position.copy(new THREE.Vector3(120, -40.5, -40));
			this.plane_object.position.copy(new THREE.Vector3(0, 0, 0));
			this.plane_object.rotateOnAxis(new THREE.Vector3(0, 1, 0), THREE.MathUtils.degToRad(-35));
			this.plane_object.scale.set(50.0, 50.0, 50.0);

			// add to scene
			this.plane_object.layers.set(1);
			scene.add(this.plane_object);
		});
	}

	animate(time) {
		const pitchAmplitude = 0.05; // maximum pitch oscillation in radians
		const rollAmplitude  = 0.05; // maximum roll oscillation in radians
		const speed = 0.3;
		this.plane_object.rotation.x = pitchAmplitude * Math.sin(speed * time);
		this.plane_object.rotation.z = rollAmplitude * Math.sin(speed * time + Math.PI / 2); // phase offset for variation
	}
}

export { Plane };
