
import * as React from 'react';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const ThreeDHero: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const animateRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mountRef.current) {
      return; // Ensure the ref is attached
    }

    const currentMount = mountRef.current;
    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); // Add antialias for smoother edges
    renderer.setSize(width, height);
    rendererRef.current = renderer;

    // Append renderer to the DOM
    currentMount.appendChild(renderer.domElement);

    // Load GLTF model
    const loader = new GLTFLoader();
    loader.load(
      '/shopping_cart.gltf', // path to your GLTF file in the public folder
      (gltf) => {
        const model = gltf.scene;

        // --- Adjust position, rotation, and scale here ---

        // Position: Controls the model's location (x, y, z coordinates)
        // Positive x is right, negative x is left.
        // Positive y is up, negative y is down.
        // Positive z is towards the camera, negative z is away from the camera.
        // model.position.x = 0; // Example: Center horizontally
        model.position.y = 1; // Example: Move the model up
        // model.position.z = 0; // Example: Move closer or further

        // Rotation: Controls the model's orientation (rotation around x, y, and z axes in radians)
        // model.rotation.x = Math.PI / 4; // Example: Rotate 45 degrees around the x-axis
        // model.rotation.y = Math.PI / 2; // Example: Rotate 90 degrees around the y-axis
        // model.rotation.z = Math.PI / 6; // Example: Rotate 30 degrees around the z-axis

        // Scale: Controls the model's size (scale factors for x, y, and z axes)
        // Use the same value for x, y, and z to scale uniformly.
        model.scale.set(0.5, 0.5, 0.5); // Example: Scale the model down to 50%

        // -----------------------------------------------------

        scene.add(model);
        modelRef.current = model;
      },
      undefined, // progress callback (optional)
      (error) => {
        console.error('An error occurred while loading the GLTF model:', error);
      }
    );

    // Animation loop
    const animate = () => {
      animateRef.current = requestAnimationFrame(animate);

      // Animation for the model (optional)
      if (modelRef.current) {
        // You can add animation here, e.g., rotation:
        // modelRef.current.rotation.y += 0.01; // Example: Rotate the model around the y-axis
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
         rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    // Handle window resizing - update based on container size
    const handleResize = () => {
      if (!currentMount || !cameraRef.current || !rendererRef.current) return;

      const newWidth = currentMount.clientWidth;
      const newHeight = currentMount.clientHeight;

      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup on component unmount
    return () => {
      if (currentMount && rendererRef.current.domElement) {
        currentMount.removeChild(rendererRef.current.domElement);
      }
      window.removeEventListener('resize', handleResize);

      // Dispose Three.js resources
      if (rendererRef.current) rendererRef.current.dispose();
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if ((object as THREE.Mesh).isMesh) {
            // dispose geometry and material
            (object as THREE.Mesh).geometry.dispose();
            if (((object as THREE.Mesh).material as THREE.Material).isMaterial) {
              (((object as THREE.Mesh).material as THREE.Material)).dispose();
            } else if (Array.isArray(((object as THREE.Mesh).material))) {
              // dispose array of materials
              for (const material of ((object as THREE.Mesh).material as THREE.Material[])) material.dispose();
            }
          }
        });
      }
      if(animateRef.current) cancelAnimationFrame(animateRef.current);
    };
  }, []);

  return (
    <div ref={mountRef} style={{ width: '100%', height: '100vh', position: 'absolute', top: 0, left: 0, zIndex: -1 }}>
      {/* The Three.js renderer will be appended here */}
    </div>
  );
};

export default ThreeDHero;
