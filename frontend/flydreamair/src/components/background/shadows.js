import * as THREE from 'three';
import { shaders } from './shaders.js';

class ShadowPass {
    constructor() {
        this.map_width = 1024;
        this.map_height = 1024;

        // render target
        this.depth_texture = new THREE.DepthTexture(this.map_width, this.map_height);
        this.depth_texture.type = THREE.UnsignedShortType;
        this.depth_texture.minFilter = THREE.NearestFilter;
        this.depth_texture.magFilter = THREE.NearestFilter;
        this.depth_texture.wrapS = THREE.ClampToEdgeWrapping;
        this.depth_texture.wrapT = THREE.ClampToEdgeWrapping;
        this.depth_texture.borderColor = new THREE.Color(0xffffff);
        this.render_target = new THREE.WebGLRenderTarget(this.map_width, this.map_height, {
            depthTexture: this.depth_texture,
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
            depthBuffer: true,
            magFilter: THREE.LinearFilter,
            minFilter: THREE.LinearFilter,
        });

        // camera
        this.light_camera = new THREE.OrthographicCamera(-1.5, 1.5, -1.5, 1.5, 0.1, 10.0);
        this.light_matrix = new THREE.Matrix4();
        this.depth_material = shaders.depth;
    }

    capture_shadow_map(renderer, scene, light_direction) {
        this.light_camera.position.copy(light_direction);
        this.light_camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.light_matrix.multiplyMatrices(
            this.light_camera.projectionMatrix,
            this.light_camera.matrixWorldInverse
        );

        renderer.setRenderTarget(this.render_target);
        shaders.depth.side = THREE.BackSide;
        renderer.render(scene, this.light_camera);
        renderer.setRenderTarget(null);
    }
}

export { ShadowPass };
