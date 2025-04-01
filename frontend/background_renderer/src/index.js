import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

// create scene objects
const clock = new THREE.Clock();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

// begin scene

// load shader
async function load_shaders(vert_file, frag_file) {
	const [vertex_src, fragment_src] = await Promise.all([
		fetch(vert_file).then(res => res.text()),
		fetch(frag_file).then(res => res.text())
	]);

	// create material
	const material = new THREE.ShaderMaterial({
		vertexShader: vertex_src,
		fragmentShader: fragment_src,
		uniforms: {
			light_direction: { value: new THREE.Vector3(1.5, 3.4, 0) },
			camera_position: { value: new THREE.Vector3(0, 0, 0) },
		}
	})

	return material;
}

const skybox_shader = await load_shaders("resources/shaders/skybox/skybox.vert", "resources/shaders/skybox/skybox.frag");
const default_shader = await load_shaders("resources/shaders/default.vert", "resources/shaders/default.frag");

const obj_loader = new OBJLoader();
let plane = new THREE.Object3D();
obj_loader.load("resources/plane.obj", (object) => {
	plane = object;
	scene.add(plane);
	plane.position.set(0, 0, -5);
	plane.traverse((child) => {
		if (child.isMesh) {
			child.material = default_shader;
		}

		const textureLoader = new THREE.TextureLoader();
		const texture = textureLoader.load("resources/plane.tga.png", (texture) => {
			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapT = THREE.RepeatWrapping;
			texture.repeat.set(5, 5);
		});

		default_shader.uniforms.albedo_texture = { value: texture };
	});
});

const geometry = new THREE.BoxGeometry(200, 200, 200);
const cube = new THREE.Mesh(geometry, skybox_shader);

// add all objects to scene
scene.add(cube);

// prepare renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// controls
camera.position.set(-1.25, 1.25, -9.5);
const angle = THREE.MathUtils.degToRad(150);
camera.rotateOnAxis(new THREE.Vector3(0, 1, 0), -angle);
const angle1 = THREE.MathUtils.degToRad(10);
camera.rotateOnAxis(new THREE.Vector3(1, 0, 0), -angle1);

function calculateSunDirection(dayandnight) {
	const theta = ((dayandnight - 6) / 24) * 2 * Math.PI;
  
  	// Calculate the sun's direction components.
  	const x = Math.cos(theta);   
  	const y = Math.sin(theta); 
	const z = Math.sin(theta);

  	// Construct and normalise the vector.
  	// In this model, the sun moves in the X-Y plane.
  	const sunDirection = new THREE.Vector3(x, y, 0).normalize();
  
  	return sunDirection;
}

// render
let cycle = 6;
function render_loop() {
	cycle += 0.5 * clock.getDelta();
	const light_direction = calculateSunDirection(cycle);
	camera.updateMatrixWorld(true);

	// update uniforms
	skybox_shader.uniforms.camera_position.value = camera.position; 
	skybox_shader.uniforms.light_direction.value = light_direction;

	default_shader.uniforms.camera_position.value = camera.position;
	default_shader.uniforms.light_direction.value = light_direction;

	const time = clock.getElapsedTime();
	const pitchAmplitude = 0.05; // maximum pitch oscillation in radians
	const rollAmplitude  = 0.05; // maximum roll oscillation in radians
	const speed = 0.3;
	plane.rotation.x = pitchAmplitude * Math.sin(speed * time);
   plane.rotation.z = rollAmplitude * Math.sin(speed * time + Math.PI / 2); // phase offset for variation

	// render
	skybox_shader.depthWrite = false;
	skybox_shader.depthTest = false;
	skybox_shader.side = THREE.BackSide;
	renderer.render(scene, camera);
}
renderer.setAnimationLoop(render_loop);
