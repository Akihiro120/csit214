import * as THREE from 'three';
import { Shaders } from './shaders.js';

class ShadowPass {
    private shadowMapWidth: number;
    private shadowMapHeight: number;

    private shadowDepthTexture: THREE.DepthTexture;
    private shadowRenderTexture: THREE.WebGLRenderTarget;

    private shadowLightCamera: THREE.OrthographicCamera;
    private shadowLightMatrix: THREE.Matrix4;

    constructor() {
        this.shadowMapWidth = 1024;
        this.shadowMapHeight = 1024;

        // render target
        this.shadowDepthTexture = new THREE.DepthTexture(this.shadowMapWidth, this.shadowMapHeight);
        this.shadowDepthTexture.type = THREE.UnsignedShortType;
        this.shadowDepthTexture.minFilter = THREE.NearestFilter;
        this.shadowDepthTexture.magFilter = THREE.NearestFilter;
        this.shadowDepthTexture.wrapS = THREE.ClampToEdgeWrapping;
        this.shadowDepthTexture.wrapT = THREE.ClampToEdgeWrapping;
        this.shadowRenderTexture = new THREE.WebGLRenderTarget(
            this.shadowMapWidth,
            this.shadowMapHeight,
            {
                depthTexture: this.shadowDepthTexture,
                format: THREE.RGBAFormat,
                type: THREE.FloatType,
                depthBuffer: true,
                magFilter: THREE.LinearFilter,
                minFilter: THREE.LinearFilter,
            }
        );

        // camera
        this.shadowLightCamera = new THREE.OrthographicCamera(-1.5, 1.5, -1.5, 1.5, 0.1, 10.0);
        this.shadowLightMatrix = new THREE.Matrix4();
    }

    public CaptureShadowMap(
        renderer: THREE.WebGLRenderer,
        scene: THREE.Scene,
        lightDirection: THREE.Vector3
    ) {
        this.shadowLightCamera.position.copy(lightDirection);
        this.shadowLightCamera.lookAt(new THREE.Vector3(0, 0, 0));
        this.shadowLightMatrix.multiplyMatrices(
            this.shadowLightCamera.projectionMatrix,
            this.shadowLightCamera.matrixWorldInverse
        );

        renderer.setRenderTarget(this.shadowRenderTexture);
        Shaders.DepthShader.side = THREE.BackSide;
        renderer.render(scene, this.shadowLightCamera);
        renderer.setRenderTarget(null);
    }

    public Dispose() {
        this.shadowDepthTexture.dispose();
        this.shadowRenderTexture.dispose();
    }

    public GetLightMatrix() {
        return this.shadowLightMatrix;
    }

    public GetShadowRenderTexture() {
        return this.shadowRenderTexture;
    }
}

export { ShadowPass };
