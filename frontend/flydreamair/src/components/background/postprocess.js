import * as THREE from "three";
import { shaders } from "./shaders";

class PostProcessPass {
  constructor(scene) {
    this.scene_texture = new THREE.WebGLRenderTarget(
      window.innerWidth / 2,
      window.innerHeight / 2,
      {
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        depthBuffer: true,
        magFilter: THREE.LinearFilter,
        minFilter: THREE.LinearFilter,
      },
    );

    this.scene_texture_plane = new THREE.WebGLRenderTarget(
      window.innerWidth / 2,
      window.innerHeight / 2,
      {
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        depthBuffer: true,
        magFilter: THREE.LinearFilter,
        minFilter: THREE.LinearFilter,
      },
    );

    this.bright_filter_texture = new THREE.WebGLRenderTarget(
      window.innerWidth / 2,
      window.innerHeight / 2,
      {
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        depthBuffer: true,
        magFilter: THREE.LinearFilter,
        minFilter: THREE.LinearFilter,
      },
    );
    this.hblur_texture = new THREE.WebGLRenderTarget(
      window.innerWidth / 5,
      window.innerHeight / 5,
      {
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        depthBuffer: true,
        magFilter: THREE.LinearFilter,
        minFilter: THREE.LinearFilter,
      },
    );
    this.vblur_texture = new THREE.WebGLRenderTarget(
      window.innerWidth / 5,
      window.innerHeight / 5,
      {
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        depthBuffer: true,
        magFilter: THREE.LinearFilter,
        minFilter: THREE.LinearFilter,
      },
    );

    const geom = new THREE.PlaneGeometry(2, 2, 2);
    const mat = shaders.postprocess;
    this.quad_mesh = new THREE.Mesh(geom, mat);
    this.quad_mesh.layers.set(1);
    scene.add(this.quad_mesh);

    // bright
    this.bright_scene = new THREE.Scene();
    this.bright_quad_mesh = new THREE.Mesh(geom, shaders.bright_filter);
    this.bright_quad_mesh.layers.set(1);
    this.bright_scene.add(this.bright_quad_mesh);

    // hblur
    this.hblur_scene = new THREE.Scene();
    this.hblur_quad_mesh = new THREE.Mesh(geom, shaders.horizontal_blur);
    this.hblur_quad_mesh.layers.set(1);
    this.hblur_scene.add(this.hblur_quad_mesh);

    // vblur
    this.vblur_scene = new THREE.Scene();
    this.vblur_quad_mesh = new THREE.Mesh(geom, shaders.vertical_blur);
    this.vblur_quad_mesh.layers.set(1);
    this.vblur_scene.add(this.vblur_quad_mesh);
  }

  render_hblur(renderer, camera) {
    shaders.horizontal_blur.uniforms.target_height.value =
      this.hblur_texture.width;
    shaders.horizontal_blur.uniforms.scene_texture.value =
      this.bright_filter_texture.texture;
    renderer.setRenderTarget(this.hblur_texture);
    camera.layers.enable(1);
    renderer.render(this.hblur_scene, camera);
    renderer.setRenderTarget(null);
  }

  render_vblur(renderer, camera) {
    shaders.vertical_blur.uniforms.target_height.value =
      this.vblur_texture.height;
    shaders.vertical_blur.uniforms.scene_texture.value =
      this.hblur_texture.texture;
    renderer.setRenderTarget(this.vblur_texture);
    camera.layers.enable(1);
    renderer.render(this.vblur_scene, camera);
    renderer.setRenderTarget(null);
  }

  render_bloom_pass(renderer, scene, camera) {
    renderer.setRenderTarget(this.bright_filter_texture);
    camera.layers.enable(1);
    renderer.render(this.bright_scene, camera);
    renderer.setRenderTarget(null);

    this.render_hblur(renderer, camera);
    this.render_vblur(renderer, camera);
  }

  render_final_pass(renderer, scene, camera) {
    renderer.setRenderTarget(this.scene_texture_plane);
    camera.layers.disableAll();
    camera.layers.enable(0);
    camera.layers.enable(1);
    camera.layers.enable(2);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
  }
}

export { PostProcessPass };
