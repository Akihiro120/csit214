import * as THREE from 'three';
import { shaders } from './shaders.js';

class Skybox {
	constructor(scene) {

		const geometry = new THREE.BoxGeometry(100, 100, 100);
		const material = shaders.cubemap;

		this.skybox = new THREE.Mesh(geometry, material);
		this.light_direction = new THREE.Vector3(0, 0, 0);
		this.skybox.layers.set(2);
		scene.add(this.skybox);
	}

	calculateSunDirection(dayandnight) {
		const theta = ((dayandnight - 6) / 24) * 2 * Math.PI;
	  
		// Calculate the sun's direction components.
		const x = Math.cos(theta);   
		const y = Math.sin(theta); 
		//const z = Math.sin(theta);

		// Construct and normalise the vector.
		this.light_direction = new THREE.Vector3(x, y, 0).normalize();
	}
}

// returns a render texture
function capture_skybox(renderer, light_direction) {
	const skybox_capture = new THREE.WebGLCubeRenderTarget(512, {
		format: THREE.RGBAFormat,
		magFilter: THREE.LinearFilter,
		minFilter: THREE.LinearMipMapLinearFilter,
		generateMipmaps: true
	});

	const scene = new THREE.Scene();
	const geometry = new THREE.BoxGeometry(2, 2, 2);
	const material = shaders.skybox;
	const skybox = new THREE.Mesh(geometry, material);
	scene.add(skybox);

	const camera = new THREE.CubeCamera(1, 10, skybox_capture);

	shaders.skybox.uniforms.camera_position.value.copy(new THREE.Vector3(0, 0, 0));
	shaders.skybox.uniforms.light_direction.value.copy(light_direction);
	shaders.skybox.side = THREE.BackSide;
	camera.update(renderer, scene);

	// return texture
	return skybox_capture.texture;
}

function capture_irradiance(renderer, cube_map) {
	const skybox_capture = new THREE.WebGLCubeRenderTarget(512, {
		format: THREE.RGBAFormat,
		magFilter: THREE.LinearFilter,
		minFilter: THREE.LinearMipMapLinearFilter,
		generateMipmaps: true
	});

	const scene = new THREE.Scene();
	const geometry = new THREE.BoxGeometry(2, 2, 2);
	const material = shaders.irradiance;
	const skybox = new THREE.Mesh(geometry, material);
	scene.add(skybox);

	const camera = new THREE.CubeCamera(1, 10, skybox_capture);
	shaders.irradiance.side = THREE.BackSide;
	shaders.irradiance.uniforms.cube_map.value = cube_map;

	camera.update(renderer, scene);

	// return texture
	return skybox_capture.texture;
}

function capture_prefilter(renderer, cube_map) {
	const skybox_capture = new THREE.WebGLCubeRenderTarget(512, {
		format: THREE.RGBAFormat,
		magFilter: THREE.LinearFilter,
		minFilter: THREE.LinearMipMapLinearFilter,
		generateMipmaps: true
	});

	const scene = new THREE.Scene();
	const geometry = new THREE.BoxGeometry(2, 2, 2);
	const material = shaders.prefilter;
	const skybox = new THREE.Mesh(geometry, material);
	scene.add(skybox);

	const camera = new THREE.CubeCamera(1, 10, skybox_capture);
	shaders.prefilter.side = THREE.BackSide;
	shaders.prefilter.uniforms.cube_map.value = cube_map;

	camera.update(renderer, scene);

	// return texture
	return skybox_capture.texture;
}

export { Skybox, capture_skybox, capture_irradiance, capture_prefilter};
