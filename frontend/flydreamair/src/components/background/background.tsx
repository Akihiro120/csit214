// import the plane renderer bs
import * as THREE from 'three';
import { Camera } from './camera.js';
import { Plane } from './plane.js';
import { PostProcessPass } from './postprocess.js';
import { shaders } from './shaders.js';
import { ShadowPass } from './shadows.js';
import { Skybox, capture_irradiance, capture_skybox } from './skybox.js';

// react stuff
import { useEffect, useRef } from 'react';

export function PlaneBackground() {
    const mountRef = useRef(null);
    const requestRef = useRef();
    const rendererRef = useRef();

    useEffect(() => {
        console.log('useeffect ran');
        const container = mountRef.current;
        if (!container) return;

        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // initialize three assets
        const clock = new THREE.Clock();
        const scene = new THREE.Scene();
        const screen_scene = new THREE.Scene();
        const shadow_scene = new THREE.Scene();
        const camera = new Camera();
        const skybox = new Skybox(scene);
        const plane = new Plane(scene, shaders.shaded);
        const shadow_plane = new Plane(shadow_scene, shaders.depth);

        window.addEventListener('resize', onWindowResize, false);

        function onWindowResize() {
            camera.camera.aspect = window.innerWidth / window.innerHeight;
            camera.camera.updateProjectionMatrix();

            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        // passes
        const final_pass = new PostProcessPass(screen_scene);
        const shadow_pass = new ShadowPass();

        // capture skybox
        //skybox.calculateSunDirection(10);
        skybox.calculateSunDirection(8);
        const skybox_capture = capture_skybox(renderer, skybox.light_direction);
        const irradiance_capture = capture_irradiance(renderer, skybox_capture);
        //const prefilter_capture = capture_prefilter(renderer, skybox_capture);

        // update uniforms
        const update_uniforms = () => {
            // update skybox uniforms

            // update shaded uniforms
            shaders.shaded.uniforms.camera_position.value.copy(camera.camera.position);
            shaders.shaded.uniforms.light_direction.value.copy(skybox.light_direction);
            shaders.shaded.uniforms.cube_map.value = skybox_capture;
            shaders.shaded.uniforms.shadow_map.value = shadow_pass.render_target.depthTexture;
            shaders.shaded.uniforms.light_matrix.value.copy(shadow_pass.light_matrix);
            shaders.shaded.uniforms.irradiance_map.value = irradiance_capture;

            // update skybox display
            shaders.cubemap.uniforms.cube_map.value = skybox_capture; //irradiance_capture;
            shaders.cubemap.side = THREE.BackSide;
            shaders.cubemap.depthWrite = false;

            // scene texture
            shaders.bright_filter.uniforms.scene_texture.value =
                final_pass.scene_texture_plane.texture;
            shaders.postprocess.uniforms.scene_texture.value =
                final_pass.scene_texture_plane.texture;
            shaders.postprocess.uniforms.bloom_texture.value = final_pass.vblur_texture.texture;
            //shaders.postprocess.uniforms.scene_texture.value = shadow_pass.render_target.depthTexture;
        };

        final_pass.render_final_pass(renderer, scene, camera.camera);
        const render_loop = () => {
            requestRef.current = requestAnimationFrame(render_loop);

            // provide skybox data
            update_uniforms();
            plane.animate(clock.getElapsedTime());
            shadow_plane.animate(clock.getElapsedTime());

            // shadow pass
            shadow_pass.capture_shadow_map(renderer, shadow_scene, skybox.light_direction);

            // render scene to display
            renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
            final_pass.render_bloom_pass(renderer, scene, camera.camera);
            final_pass.render_final_pass(renderer, scene, camera.camera);

            // display the final render texture
            renderer.render(screen_scene, camera.camera);
        };

        render_loop();

        // dispose of it, dont need it no mo'
        return () => {};
    });

    return (
        <div
            ref={mountRef}
            className="fixed inset-0 -z-10 w-screen h-screen overflow-hidden bg-black"
        />
    );
}
