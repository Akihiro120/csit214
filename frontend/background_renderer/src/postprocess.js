import * as THREE from 'three';
import { shaders } from './shaders';

class PostProcessPass {
	constructor(scene) {
		this.scene_texture = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
			format: THREE.RGBAFormat,
			type: THREE.FloatType,
			depthBuffer: true,
			magFilter: THREE.LinearFilter,
			minFilter: THREE.LinearFilter
		});

		const geom = new THREE.PlaneGeometry(2, 2, 2);
		const mat = shaders.postprocess;
		this.quad_mesh = new THREE.Mesh(geom, mat);
		this.quad_mesh.layers.set(1);
		scene.add(this.quad_mesh);
	}

	render_final_pass(renderer, scene, camera) {
		renderer.setRenderTarget(this.scene_texture);
		camera.layers.enable(1);
		camera.layers.enable(2);
		renderer.render(scene, camera);
		renderer.setRenderTarget(null);
	}
}

export {PostProcessPass};
