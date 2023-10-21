import { collisionChecker } from './checkcollision.js';
import HumanInterfaceDevice from './humaninterfacedevice.js';
import * as THREE from './three.module.js';

class Protonic {
    constructor(canvasId, scene, camera, segments, strands, radius, kerning, color, movementType, speed) {
        this.strands = strands;
        this.radius = radius;
        this.kerning = kerning;
        this.color = color;
        this.movementType = movementType;
        this.spinAxis;
        this.canvas = canvasId;
        this.speed = speed;
        this.scene = scene;
        this.position = 0;
        this.camera = camera;
        this.transformedPosition = new THREE.Vector3(0, 0, 0);
        this.segments = segments;
        this.hid = new HumanInterfaceDevice(this.camera, this.canvas);
        // this.checkCollision = new collisionChecker(this.scene, this.camera, this.segments);
    }

    setTransformedPosition(x, y, z) {
        this.transformedPosition = new THREE.Vector3(x, y, z);
    }

    setCamera(camera) {
        this.camera = camera;
    }

    getRandomSpinAxis() {
        const spinAxis = [];
        for (let i = 0; i < 3; i++) {
            const row = [];
            for (let j = 0; j < 3; j++) {
                row.push(Math.random() * 2 - 1); // Generate a random value between -1 and 1
            }
            spinAxis.push(row);
        }
        return spinAxis;
    }

    draw(scene, camera, material) {
        const detachThreshold = 0.5;

        for (let i = 0; i < this.strands; i++) {
            let x = i * (this.radius * 2 + this.kerning);
            let y = 0;
            let z = 0.5 * (this.radius * 2 + this.kerning); // Update the z coordinate

            this.spinAxis = this.getRandomSpinAxis();
            const rotationMatrix = new THREE.Matrix3();
            rotationMatrix.set(
                this.spinAxis[0][0], this.spinAxis[0][1], this.spinAxis[0][2],
                this.spinAxis[1][0], this.spinAxis[1][1], this.spinAxis[1][2],
                this.spinAxis[2][0], this.spinAxis[2][1], this.spinAxis[2][2]
            );

            let translationOffset = new THREE.Vector3();
            if (this.movementType === 'coiling') {
                const coilOffset = Math.sin(this.position / 10) * 20;
                translationOffset.set(coilOffset, 0, -z);
            } else if (this.movementType === 'zigzagging') {
                const zigzagOffset = Math.sin(this.position / 10) * 10;
                translationOffset.set(zigzagOffset, 0, -z);
            }
            else if (this.movementType === 'bouncing') {
                const bounceOffset = Math.abs(Math.sin(this.position / 10)) * 10;
                translationOffset.set(bounceOffset, 0, -z);
            }        
            this.transformedPosition.applyMatrix3(rotationMatrix);

            const geometry = new THREE.CylinderGeometry(this.radius, this.radius, 0.85, 32);
            const wire = new THREE.Mesh(geometry, material);
            const animate = () => {

                for (let i = 0; i < this.strands; i++) {
                    this.transformedPosition = new THREE.Vector3(this.transformedPosition.x, this.transformedPosition.y, z);
                    this.transformedPosition.applyMatrix3(rotationMatrix);
                    wire.position.set(this.transformedPosition.x, this.transformedPosition.y, this.transformedPosition.z);
                    wire.rotateX(x);
                    wire.rotateY(y);
                    wire.rotateZ(z);
                    // Add the wire to the scene
                    this.scene.add(wire);
                    // this.segments.forEach(elem => {
                        new collisionChecker(this.scene, this.camera, this.segments, this.hid);
                    // });
                    
                    // Animate the wire by gradually increasing the z coordinate
                    const animationSpeed = 1.03; // Adjust this value to control the animation speed
                    z += Math.ceil(this.position * animationSpeed);

                    // Remove the wire from the scene when it goes out of view
                    const maxZ = 1000; // Adjust this value based on your scene's dimensions
                    if (z > maxZ) {
                        scene.remove(wire);
                    }
                }

                // Update the position for the next frame
                this.position -= this.speed;

                // Request the next animation frame
                requestAnimationFrame(animate);
            };

            // Start the animation loop
            animate();
        }
        // animate();
    }
}

export default Protonic;