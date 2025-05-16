import * as THREE from 'three';
import { Shaders } from './shaders';

class PostProcessPass {
    // Render Targets
    private sceneTexture: THREE.WebGLRenderTarget;
    private sceneTexturePlane: THREE.WebGLRenderTarget;
    private brightFilterTexture: THREE.WebGLRenderTarget;
    private hBlurTexture: THREE.WebGLRenderTarget;
    private vBlurTexture: THREE.WebGLRenderTarget;

    // Geometry and Meshes
    private quadMesh: THREE.Mesh;
    private brightQuadMesh: THREE.Mesh;
    private hBlurQuadMesh: THREE.Mesh;
    private vBlurQuadMesh: THREE.Mesh;

    // Scenes
    private brightScene: THREE.Scene;
    private hBlurScene: THREE.Scene;
    private vBlurScene: THREE.Scene;

    constructor(screenScene: THREE.Scene) {
        // Create Render Targets
        this.sceneTexture = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
            depthBuffer: true,
            magFilter: THREE.LinearFilter,
            minFilter: THREE.LinearFilter,
        });

        this.sceneTexturePlane = this.sceneTexture.clone();

        this.brightFilterTexture = new THREE.WebGLRenderTarget(
            window.innerWidth / 2,
            window.innerHeight / 2,
            {
                format: THREE.RGBAFormat,
                type: THREE.FloatType,
                depthBuffer: true,
                magFilter: THREE.LinearFilter,
                minFilter: THREE.LinearFilter,
            }
        );

        this.hBlurTexture = new THREE.WebGLRenderTarget(
            window.innerWidth / 5,
            window.innerHeight / 5,
            {
                format: THREE.RGBAFormat,
                type: THREE.FloatType,
                depthBuffer: true,
                magFilter: THREE.LinearFilter,
                minFilter: THREE.LinearFilter,
            }
        );

        this.vBlurTexture = this.hBlurTexture.clone();

        // Fullscreen quad geometry
        const quadGeom = new THREE.PlaneGeometry(2, 2, 2);

        // Main postprocess quad
        this.quadMesh = new THREE.Mesh(quadGeom, Shaders.PostProcessShader);
        this.quadMesh.layers.set(1);
        screenScene.add(this.quadMesh);

        // Bright filter pass
        this.brightScene = new THREE.Scene();
        this.brightQuadMesh = new THREE.Mesh(quadGeom, Shaders.BrightFilterShader);
        this.brightQuadMesh.layers.set(1);
        this.brightScene.add(this.brightQuadMesh);

        this.hBlurScene = new THREE.Scene();
        this.hBlurQuadMesh = new THREE.Mesh(quadGeom, Shaders.HorizontalBlurShader);
        this.hBlurQuadMesh.layers.set(1);
        this.hBlurScene.add(this.hBlurQuadMesh);

        // Vertical blur pass
        this.vBlurScene = new THREE.Scene();
        this.vBlurQuadMesh = new THREE.Mesh(quadGeom, Shaders.VerticalBlurShader);
        this.vBlurQuadMesh.layers.set(1);
        this.vBlurScene.add(this.vBlurQuadMesh);
    }

    public GetSceneTexture() {
        return this.sceneTexturePlane;
    }

    public GetVerticalBlurTexture() {
        return this.vBlurTexture;
    }

    public GetBrightTexture() {
        return this.brightFilterTexture;
    }

    private RenderHBlur(renderer: THREE.WebGLRenderer, camera: THREE.Camera) {
        Shaders.HorizontalBlurShader.uniforms.target_height.value = this.hBlurTexture.height;
        Shaders.HorizontalBlurShader.uniforms.scene_texture.value =
            this.brightFilterTexture.texture;

        renderer.setRenderTarget(this.hBlurTexture);
        camera.layers.set(1);
        renderer.render(this.hBlurScene, camera);
        renderer.setRenderTarget(null);
    }

    private RenderVBlur(renderer: THREE.WebGLRenderer, camera: THREE.Camera) {
        Shaders.VerticalBlurShader.uniforms.target_height.value = this.vBlurTexture.height;
        Shaders.VerticalBlurShader.uniforms.scene_texture.value = this.hBlurTexture.texture;

        renderer.setRenderTarget(this.vBlurTexture);
        camera.layers.set(1);
        renderer.render(this.vBlurScene, camera);
        renderer.setRenderTarget(null);
    }

    public RenderBloomPass(renderer: THREE.WebGLRenderer, camera: THREE.Camera) {
        renderer.setRenderTarget(this.brightFilterTexture);
        camera.layers.set(1);
        renderer.render(this.brightScene, camera);
        renderer.setRenderTarget(null);

        this.RenderHBlur(renderer, camera);
        this.RenderVBlur(renderer, camera);
    }

    public RenderFinalPass(
        renderer: THREE.WebGLRenderer,
        scene: THREE.Scene,
        camera: THREE.Camera
    ) {
        renderer.setRenderTarget(this.sceneTexturePlane);
        camera.layers.disableAll();
        camera.layers.enable(0);
        camera.layers.enable(1);
        camera.layers.enable(2);
        renderer.render(scene, camera);
        renderer.setRenderTarget(null);
    }

    public dispose() {
        this.sceneTexture.dispose();
        this.sceneTexturePlane.dispose();
        this.brightFilterTexture.dispose();
        this.hBlurTexture.dispose();
        this.vBlurTexture.dispose();
    }
}

export { PostProcessPass };
