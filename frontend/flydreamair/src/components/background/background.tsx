// import the plane renderer bs
import * as THREE from 'three';
import { Camera } from './camera.js';
import { Plane } from './plane.js';
import { PostProcessPass } from './postprocess.js';
import { Shaders } from './shaders.js';
import { ShadowPass } from './shadows.js';
import { Skybox, CaptureIrradiance, CaptureSkybox } from './skybox.js';

// react stuff
import { useEffect, useRef } from 'react';

interface IBackgroundRendererAssets {
    clock: THREE.Clock;
    scene: THREE.Scene;
    screenScene: THREE.Scene;
    shadowScene: THREE.Scene;
    camera: Camera;
    skybox?: Skybox;
    plane?: Plane;
    shadowPlane?: Plane;
}

function CreateBackgroundAssets() {
    const assets: IBackgroundRendererAssets = {
        clock: new THREE.Clock(),
        scene: new THREE.Scene(),
        screenScene: new THREE.Scene(),
        shadowScene: new THREE.Scene(),
        camera: new Camera(),
    };

    assets.skybox = new Skybox(assets.scene);
    assets.plane = new Plane(assets.scene, Shaders.ShadedShader);
    assets.shadowPlane = new Plane(assets.shadowScene, Shaders.DepthShader);


    return assets;
}

export function PlaneBackground() {
    const mountRef = useRef<HTMLDivElement | null>(null);
    const requestRef = useRef<number | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const backgroundAssets = useRef<IBackgroundRendererAssets | null>(null);

    useEffect(() => {
        const container = mountRef.current;
        if (!container) return;

        rendererRef.current = new THREE.WebGLRenderer();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(rendererRef.current.domElement);

        // initialize three assets
        backgroundAssets.current = CreateBackgroundAssets();
        const camera = backgroundAssets.current.camera;
        const scene = backgroundAssets.current.scene;
        const screenScene = backgroundAssets.current.screenScene;
        const shadowScene = backgroundAssets.current.shadowScene;
        const skybox = backgroundAssets.current.skybox!;
        const plane = backgroundAssets.current.plane!;
        const shadowPlane = backgroundAssets.current.shadowPlane!;
        const clock = backgroundAssets.current.clock;

        // passes
        const finalPass = new PostProcessPass(screenScene);
        const shadowPass = new ShadowPass();

        // capture skybox
        skybox.CalculateSunDirection(8);
        const skyboxCaptureTexture = CaptureSkybox(rendererRef.current, skybox.GetLightDirection());
        const irradianceCaptureTexture = CaptureIrradiance(rendererRef.current, skyboxCaptureTexture);


        /// METHODS ----------------
        const onWindowResize = () => {
            camera.OnWindowResize();
            rendererRef.current?.setSize(window.innerWidth, window.innerHeight);

            console.log("Resized");
        }

        window.addEventListener('resize', onWindowResize, false);
        // update uniforms
        const update_uniforms = () => {
            // update shaded uniforms
            //
            // for the love of god do not touch this code, it works for some reason, im not sure, but the plane will crash into the bermuda if its gone.
            Shaders.ShadedShader.uniforms.camera_position.value.copy(camera.GetCamera().position);
            Shaders.ShadedShader.uniforms.light_direction.value.copy(skybox.GetLightDirection());
            Shaders.ShadedShader.uniforms.cube_map.value = skyboxCaptureTexture;
            Shaders.ShadedShader.uniforms.shadow_map.value = shadowPass.GetShadowRenderTexture().depthTexture;
            Shaders.ShadedShader.uniforms.light_matrix.value.copy(shadowPass.GetLightMatrix());
            Shaders.ShadedShader.uniforms.irradiance_map.value = irradianceCaptureTexture;

            // update Skybox display
            Shaders.CubemapShader.uniforms.cube_map.value = skyboxCaptureTexture;
            Shaders.CubemapShader.side = THREE.BackSide;
            Shaders.CubemapShader.depthWrite = false;

            // Scene texture
            Shaders.BrightFilterShader.uniforms.scene_texture.value = finalPass.GetSceneTexture().texture;
            Shaders.PostProcessShader.uniforms.scene_texture.value = finalPass.GetSceneTexture().texture;
            Shaders.PostProcessShader.uniforms.bloom_texture.value = finalPass.GetVerticalBlurTexture().texture;
        };

        const render_loop = () => {
            requestRef.current = requestAnimationFrame(render_loop);

            // provide skybox data
            update_uniforms();
            plane.animate(clock.getElapsedTime());
            shadowPlane.animate(clock.getElapsedTime());

            // shadow pass
            shadowPass.CaptureShadowMap(rendererRef.current!, shadowScene, skybox.GetLightDirection());

            // render scene to display
            rendererRef.current?.setViewport(0, 0, window.innerWidth, window.innerHeight);
            finalPass.RenderBloomPass(rendererRef.current!, camera.GetCamera());
            finalPass.RenderFinalPass(rendererRef.current!, scene, camera.GetCamera());

            // display the final render texture
            rendererRef.current?.render(screenScene, camera.GetCamera());
        };
        render_loop();

        // dispose of it, dont need it no mo'
        return () => {
            window.removeEventListener('resize', onWindowResize);

            // Cancel the fucking animations, the bozo that fucking wrote this cant clean up his own shit
            // animations running in background is bad.
            if (requestRef.current != null) {
                cancelAnimationFrame(requestRef.current!);
            }

            // clean up all memory and assets.
            // fuck, javascript, where is your garbage collector.
            backgroundAssets.current?.plane?.Dispose();
            backgroundAssets.current?.skybox?.Dispose();
            rendererRef.current?.dispose();

            if (rendererRef.current?.domElement) {
                container.removeChild(rendererRef.current.domElement);
            }
        };
    }, []);

    return (
        <div
            ref={mountRef}
            className="fixed inset-0 -z-10 w-screen h-screen overflow-hidden bg-black"
        />
    );
}
