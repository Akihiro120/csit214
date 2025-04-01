import * as THREE from 'three';
import {Camera} from './camera.js';
import {Skybox, capture_skybox, capture_irradiance, capture_prefilter} from './skybox.js';
import {shaders} from './shaders.js';
import {Plane} from './plane.js';
import {ShadowPass} from './shadows.js'
import {PostProcessPass} from './postprocess.js'

// prepare renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// create scene objects
const clock = new THREE.Clock();
const scene = new THREE.Scene();
const screen_scene = new THREE.Scene();
const shadow_scene = new THREE.Scene();
const camera = new Camera();
const skybox = new Skybox(scene);
const plane = new Plane(scene, shaders.shaded);
const shadow_plane = new Plane(shadow_scene, shaders.depth);

// passes
const final_pass = new PostProcessPass(screen_scene);
const shadow_pass = new ShadowPass();

// capture skybox
skybox.calculateSunDirection(10);
const skybox_capture = capture_skybox(renderer, skybox.light_direction);
const irradiance_capture = capture_irradiance(renderer, skybox_capture);
//const prefilter_capture = capture_prefilter(renderer, skybox_capture);

// update uniforms
function update_uniforms() {
	// update skybox uniforms

	// update shaded uniforms
	shaders.shaded.uniforms.camera_position.value.copy(camera.camera.position);
	shaders.shaded.uniforms.light_direction.value.copy(skybox.light_direction);
	shaders.shaded.uniforms.cube_map.value = skybox_capture;
	shaders.shaded.uniforms.shadow_map.value = shadow_pass.render_target.depthTexture;
	shaders.shaded.uniforms.light_matrix.value.copy(shadow_pass.light_matrix);
	shaders.shaded.uniforms.irradiance_map.value = irradiance_capture;

	// update skybox display
	shaders.cubemap.uniforms.cube_map.value = skybox_capture;//irradiance_capture;
	shaders.cubemap.side = THREE.BackSide;
	shaders.cubemap.depthWrite = false;

	// scene texture
	shaders.postprocess.uniforms.scene_texture.value = final_pass.scene_texture.texture;
	//shaders.postprocess.uniforms.scene_texture.value = shadow_pass.render_target.depthTexture;

	// update
	//shaders.skybox.needsUpdate = true;
	//shaders.shaded.needsUpdate = true;
	//shaders.cubemap.needsUpdate = true;
	//shaders.postprocess.needsUpdate = true;
}

// render
	final_pass.render_final_pass(renderer, scene, camera.camera);
function render_loop() { 
	// provide skybox data
	update_uniforms();
	plane.animate(clock.getElapsedTime());
	shadow_plane.animate(clock.getElapsedTime());

	// shadow pass
	shadow_pass.capture_shadow_map(renderer, shadow_scene, skybox.light_direction);

	// render scene to display
	renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
	final_pass.render_final_pass(renderer, scene, camera.camera);

	// display the final render texture
	renderer.render(screen_scene, camera.camera);
}
renderer.setAnimationLoop(render_loop);
