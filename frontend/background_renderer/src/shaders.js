import * as THREE from 'three';
import {resources} from './resources.js';

// load in the shaders
// skybox
const skybox = await resources.load_shaders("resources/shaders/skybox/skybox.vert", "resources/shaders/skybox/skybox.frag", 
	{
		light_direction: {value: new THREE.Vector3(0, 0, 0)},
		camera_position: {value: new THREE.Vector3(0, 0, 0)},
	}
);

// shaded
const shaded = await resources.load_shaders("resources/shaders/default.vert", "resources/shaders/default.frag", 
	{
		light_direction: {value: new THREE.Vector3(0, 0, 0)},
		camera_position: {value: new THREE.Vector3(0, 0, 0)},
		albedo_texture: {value: new THREE.Texture()},
		normal_texture: {value: new THREE.Texture()},
		ao_texture: {value: new THREE.Texture()},
		cube_map: {value: new THREE.Texture()},
		shadow_map: {value: new THREE.Texture()},
		light_matrix: {value: new THREE.Matrix4()},
	}
);

// cubemap
const cubemap = await resources.load_shaders("resources/shaders/cubemap/cubemap.vert", "resources/shaders/cubemap/cubemap.frag", 
	{
		cube_map: {value: new THREE.Texture()},
	}
);

// quad texture
const postprocess = await resources.load_shaders("resources/shaders/postprocessing/final.vert", "resources/shaders/postprocessing/final.frag",
	{
		scene_texture: {value: new THREE.Texture()},
	}
);

// depth
const depth = await resources.load_shaders("resources/shaders/shadow/depth.vert", "resources/shaders/shadow/depth.frag",
	{
	}
);

// export
export const shaders = {
	skybox,
	shaded,
	cubemap,
	postprocess,
	depth
}
