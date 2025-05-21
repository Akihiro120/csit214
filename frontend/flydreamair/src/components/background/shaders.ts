import * as THREE from 'three';

export type ShaderUniformValue = number | boolean | THREE.Vector2 | THREE.Vector3 | THREE.Vector4 | THREE.Matrix3 | THREE.Matrix4 | THREE.Texture;
export type ShaderUniforms = Record<string, { value: ShaderUniformValue }>;
export interface Shader {
    material: THREE.ShaderMaterial;
    uniforms: {
        [key: string]: { value: ShaderUniformValue };
    };
}

// load in the shaders
async function loadShaders(vertFile: string, fragFile: string, uniforms = {}) {
    const [vertexShader, fragmentShader] = await Promise.all([
        fetch(vertFile).then((res) => res.text()),
        fetch(fragFile).then((res) => res.text()),
    ]);

    // create material
    const material = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms,
    });

    // return material
    return material;
}

// skybox
export const Shaders = {
    SkyboxShader: await loadShaders(
        '/shaders/skybox/skybox.vert',
        '/shaders/skybox/skybox.frag',
        {
            light_direction: { value: new THREE.Vector3(0, 0, 0) },
            camera_position: { value: new THREE.Vector3(0, 0, 0) },
        }
    ),

    // shaded
    ShadedShader: await loadShaders(
        '/shaders/default.vert',
        '/shaders/default.frag',
        {
            light_direction: { value: new THREE.Vector3(0, 0, 0) },
            camera_position: { value: new THREE.Vector3(0, 0, 0) },
            albedo_texture: { value: new THREE.Texture() },
            normal_texture: { value: new THREE.Texture() },
            ao_texture: { value: new THREE.Texture() },
            cube_map: { value: new THREE.Texture() },
            shadow_map: { value: new THREE.Texture() },
            light_matrix: { value: new THREE.Matrix4() },
            irradiance_map: { value: new THREE.Texture() },
            noise_map: { value: new THREE.Texture() },
            time: { value: 0.0 },
        }
    ),

    // cubemap
    CubemapShader: await loadShaders(
        '/shaders/cubemap/cubemap.vert',
        '/shaders/cubemap/cubemap.frag',
        {
            cube_map: { value: new THREE.Texture() },
        }
    ),

    IrradianceShader: await loadShaders(
        '/shaders/cubemap/cubemap.vert',
        '/shaders/pbr/irradiance.frag',
        {
            cube_map: { value: new THREE.Texture() },
        }
    ),

    // quad texture
    PostProcessShader: await loadShaders(
        '/shaders/postprocessing/final.vert',
        '/shaders/postprocessing/final.frag',
        {
            scene_texture: { value: new THREE.Texture() },
            bloom_texture: { value: new THREE.Texture() },
        }
    ),

    // depth
    DepthShader: await loadShaders(
        '/shaders/shadow/depth.vert',
        '/shaders/shadow/depth.frag',
        {}
    ),

    BrightFilterShader: await loadShaders(
        '/shaders/postprocessing/final.vert',
        '/shaders/postprocessing/bright_filter.frag',
        {
            scene_texture: { value: new THREE.Texture() },
        }
    ),

    HorizontalBlurShader: await loadShaders(
        '/shaders/postprocessing/hblur.vert',
        '/shaders/postprocessing/hblur.frag',
        {
            scene_texture: { value: new THREE.Texture() },
            target_height: { value: 0 },
        }
    ),

    VerticalBlurShader: await loadShaders(
        '/shaders/postprocessing/vblur.vert',
        '/shaders/postprocessing/vblur.frag',
        {
            scene_texture: { value: new THREE.Texture() },
            target_height: { value: 0 },
        }
    ),

    // Dipose of the mateirals
    Dispose() {
        const allShaders = [
            this.ShadedShader,
            this.DepthShader,
            this.SkyboxShader,
            this.CubemapShader,
            this.IrradianceShader,
            this.PostProcessShader,
            this.BrightFilterShader,
            this.VerticalBlurShader,
            this.HorizontalBlurShader,
        ];

        for (const shaders of allShaders) {
            shaders.dispose();
        }
    },
};
