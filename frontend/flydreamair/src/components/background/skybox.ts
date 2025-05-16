import * as THREE from 'three';
import { Shaders } from './shaders.js';

class Skybox {
    private skyboxMesh: THREE.Mesh;
    private lightDirection: THREE.Vector3;

    constructor(scene: THREE.Scene) {
        const geometry = new THREE.BoxGeometry(100, 100, 100);

        this.skyboxMesh = new THREE.Mesh(geometry, Shaders.SkyboxShader);
        this.lightDirection = new THREE.Vector3(0, 0, 0);
        this.skyboxMesh.layers.set(2);
        scene.add(this.skyboxMesh);
    }

    public CalculateSunDirection(dayandnight: number) {
        const theta = ((dayandnight - 6) / 24) * 2 * Math.PI;

        // Calculate the sun's direction components.
        const x = Math.cos(theta);
        const y = Math.sin(theta);
        //const z = Math.sin(theta);

        // Construct and normalise the vector.
        this.lightDirection = new THREE.Vector3(x, y, 0).normalize();
    }

    public GetLightDirection() {
        return this.lightDirection;
    }

    public Dispose() {
        this.skyboxMesh.remove();
    }
}

// returns a render texture
function CaptureSkybox(renderer: THREE.WebGLRenderer, lightDirection: THREE.Vector3) {
    const skybox_capture = new THREE.WebGLCubeRenderTarget(512, {
        format: THREE.RGBAFormat,
        magFilter: THREE.LinearFilter,
        minFilter: THREE.LinearMipMapLinearFilter,
        generateMipmaps: true,
    });

    const scene = new THREE.Scene();
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = Shaders.SkyboxShader;
    const skybox = new THREE.Mesh(geometry, material);
    scene.add(skybox);

    const camera = new THREE.CubeCamera(1, 10, skybox_capture);

    Shaders.SkyboxShader.uniforms.camera_position.value.copy(new THREE.Vector3(0, 0, 0));
    Shaders.SkyboxShader.uniforms.light_direction.value.copy(lightDirection);
    Shaders.SkyboxShader.side = THREE.BackSide;
    camera.update(renderer, scene);

    // return texture
    return skybox_capture.texture;
}

function CaptureIrradiance(renderer: THREE.WebGLRenderer, cubemap: THREE.Texture) {
    const skybox_capture = new THREE.WebGLCubeRenderTarget(128, {
        format: THREE.RGBAFormat,
        magFilter: THREE.LinearFilter,
        minFilter: THREE.LinearMipMapLinearFilter,
        generateMipmaps: true,
    });

    const scene = new THREE.Scene();
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = Shaders.IrradianceShader;
    const skybox = new THREE.Mesh(geometry, material);
    scene.add(skybox);

    const camera = new THREE.CubeCamera(1, 10, skybox_capture);
    Shaders.IrradianceShader.side = THREE.BackSide;
    Shaders.IrradianceShader.uniforms.cube_map.value = cubemap;

    camera.update(renderer, scene);

    // return texture
    return skybox_capture.texture;
}

export { Skybox, CaptureIrradiance, CaptureSkybox };
