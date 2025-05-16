import * as THREE from 'three';

class Camera {
    private readonly camera: THREE.PerspectiveCamera;

    constructor() {
        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        // set fixed transform
        //this.plane_object.position.copy(new THREE.Vector3(120, -40.5, -40));
        this.camera.position.set(-120 / 50, 40.5 / 50, 40 / 50);
        this.camera.rotateOnAxis(new THREE.Vector3(0, 1, 0), THREE.MathUtils.degToRad(-82.7287));
        this.camera.rotateOnAxis(new THREE.Vector3(1, 0, 0), THREE.MathUtils.degToRad(-12.4625));
    }

    public GetCamera() {
        return this.camera;
    }

    public Dispose() {}

    public OnWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }
}

export { Camera };
