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
		irradiance_map: {value: new THREE.Texture()},
	}
);

// cubemap
const cubemap = await resources.load_shaders("resources/shaders/cubemap/cubemap.vert", "resources/shaders/cubemap/cubemap.frag", 
	{
		cube_map: {value: new THREE.Texture()},
	}
);

const irradiance = await resources.load_shaders("resources/shaders/cubemap/cubemap.vert", "resources/shaders/pbr/irradiance.frag", 
	{
		cube_map: {value: new THREE.Texture()},
	}
);

const prefilter = await resources.load_shaders("resources/shaders/cubemap/cubemap.vert", "resources/shaders/pbr/prefilter.frag", 
	{
		cube_map: {value: new THREE.Texture()},
	}
);

// quad texture
const postprocess = await resources.load_shaders("resources/shaders/postprocessing/final.vert", "resources/shaders/postprocessing/final.frag",
	{
		scene_texture: {value: new THREE.Texture()},
		bloom_texture: {value: new THREE.Texture()},
	}
);

// depth
const depth = await resources.load_shaders("resources/shaders/shadow/depth.vert", "resources/shaders/shadow/depth.frag",
	{
	}
);

const bright_filter = await resources.load_shaders("resources/shaders/postprocessing/final.vert", "resources/shaders/postprocessing/bright_filter.frag",
	{
		scene_texture: {value: new THREE.Texture()},
	}
);

const horizontal_blur = await resources.load_shaders("resources/shaders/postprocessing/hblur.vert", "resources/shaders/postprocessing/hblur.frag",
	{
		scene_texture: {value: new THREE.Texture()},
		target_height: {value: 0},
	}
);

const vertical_blur = await resources.load_shaders("resources/shaders/postprocessing/vblur.vert", "resources/shaders/postprocessing/vblur.frag",
	{
		scene_texture: {value: new THREE.Texture()},
		target_height: {value: 0},
	}
);

// export
export const shaders = {
	skybox,
	shaded,
	cubemap,
	postprocess,
	depth,
	irradiance,
	prefilter,
	bright_filter,
	horizontal_blur,
	vertical_blur,
}
