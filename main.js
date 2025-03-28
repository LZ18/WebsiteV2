import './style.css';
import * as THREE from 'three';
import { Water } from 'three/examples/jsm/objects/Water';
import { TextureLoader } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { BufferGeometry, Float32BufferAttribute, PointsMaterial, Points } from 'three';
import { DragControls } from 'three/examples/jsm/controls/DragControls';

// Scene, camera, and renderer setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg') });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);


// Camera position
camera.position.set(0, 10, 30);

// Texture loader setup
const loader = new TextureLoader();
loader.setPath('/WebsiteV2/img/'); // Set path for texture loader

// Function to load textures
function loadTexture(path) {
    return loader.load(path);
}

// Materials setup
const materials = [
    'Cplusplus.jpg',
    'github.jpg',
    'LinkdIn.jpg',
    'UofL.jpg',
    'blue-robotic-arm.jpg',
    'aboutme.jpg',
].map(file => new THREE.MeshBasicMaterial({ map: loadTexture(file) }));

// Geometry setup
const boxGeometry = new RoundedBoxGeometry(10, 10, 10, 5, 2); // Rounded box with radius of 2 and 5 segments
const waterGeometry = new THREE.PlaneGeometry(100000, 100000);

// Mesh setup for the box
const box = new THREE.Mesh(boxGeometry, materials);

// Light setup
const pointLight = new THREE.PointLight(0x296AFF);
pointLight.position.set(5, 5, 5);
scene.add(box, pointLight);

const particleCount1 = 100000;
const particles1 = new Float32Array(particleCount1 * 3); // 3 coordinates per particle
const velocities1 = new Float32Array(particleCount1 * 1); // 3 velocity components per particle

for (let i = 0; i < particleCount1; i++) {
    particles1[i * 3] = Math.random() * 1000 - 100; // x
    //particles1[i * 3 + 1] = Math.random() * 200 - 100; // y
    //particles1[i * 3 + 2] = Math.random() * 200 - 100; // z

    velocities1[i * 3] = (Math.random() - 0.5) * 0.2; // velocity x
    velocities1[i * 3 + 1] = (Math.random() - 0.5) * 0.2; // velocity y
    velocities1[i * 3 + 2] = (Math.random() - 0.5) * 0.2; // velocity z
}

const particleGeometry1 = new BufferGeometry();
particleGeometry1.setAttribute('position', new Float32BufferAttribute(particles1, 3));

const particleMaterial1 = new PointsMaterial({
    color: 0xE5E5E5, // Grey color
    size: 0.1,
    transparent: true,
    opacity: 0.3
});

const particleSystem1 = new Points(particleGeometry1, particleMaterial1);
scene.add(particleSystem1);

// Update particles in the animation loop


// Water setup using Water class from three.js examples
const waterNormals = loader.load('waternormals.jpg', function(texture) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
});

const waterParams = {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: waterNormals,
    sunDirection: pointLight.position.clone().normalize(),
    sunColor: 0x175DFF,
    waterColor: 0x00309F,
    distortionScale: 1, // Increased distortion scale for more pronounced waves
   // Adjusting the size parameter for waves
};

const waterObject = new Water(waterGeometry, waterParams);
waterObject.position.y = 1; // Adjust position of water
waterObject.rotation.x = -Math.PI * 0.5; // Adjust rotation for water
scene.add(waterObject);

// Particle system setup for splash
const particleCount = 100;
const particles = new Float32Array(particleCount * 3); // 3 coordinates per particle
for (let i = 0; i < particleCount; i++) {
    particles[i * 3] = 0; // x
    particles[i * 3 + 1] = 0; // y
    particles[i * 3 + 2] = 0; // z
}
const particleGeometry = new BufferGeometry();
particleGeometry.setAttribute('position', new Float32BufferAttribute(particles, 3));
const particleMaterial = new PointsMaterial({ color: 0xffffff, size: 0.01 }); // Increased size for visibility
const particleSystem = new Points(particleGeometry, particleMaterial);
scene.add(particleSystem);

// Helper function to trigger splash
function triggerSplash() {
    const positions = particleGeometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = box.position.x + (Math.random() - 0.5) * 12; // Increased spread x
        positions[i * 3 + 1] = box.position.y + (Math.random() - 0.5) * 2; // y
        positions[i * 3 + 2] = box.position.z + (Math.random() - 0.5) * 12; // Increased spread z
    }
    particleGeometry.attributes.position.needsUpdate = true;
}

// Variables for drag control
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

// Function to handle mouse movement
function onDocumentMouseMove(event) {
    const deltaMove = {
        x: event.offsetX - previousMousePosition.x,
        y: event.offsetY - previousMousePosition.y
    };

    if (isDragging) {
        const deltaRotationQuaternion = new THREE.Quaternion()
            .setFromEuler(new THREE.Euler(
                toRadians(deltaMove.y * 0.5),
                toRadians(deltaMove.x * 0.5),
                0,
                'XYZ'
            ));

        box.quaternion.multiplyQuaternions(deltaRotationQuaternion, box.quaternion);
    }

    previousMousePosition = {
        x: event.offsetX,
        y: event.offsetY
    };
}

function toRadians(angle) {
    return angle * (Math.PI / 180);
}

// Mouse down event listener
renderer.domElement.addEventListener('mousedown', function (event) {
    isDragging = true;
});

// Mouse up event listener
renderer.domElement.addEventListener('mouseup', function (event) {
    isDragging = false;
});

// Mouse move event listener
renderer.domElement.addEventListener('mousemove', onDocumentMouseMove);

function onMouseClick(event) {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const object = intersects[0].object;
        console.log('Clicked object:', object);

        // Example: Redirect to different pages based on face clicked
        if (object === box) {
            // Determine which face was clicked
            console.log('Face index:', intersects[0].faceIndex);
            
            switch (intersects[0].faceIndex) {
                case 0: // Face 1 clicked
                    window.location.href = 'page1.html';
                    break;
                case 1: // Face 2 clicked
                    window.location.href = 'page2.html';
                    break;
                // Add more cases for each face as needed
                default:
                    break;
            }
        }
    }
}

renderer.domElement.addEventListener('mousemove', onMouseClick);


//////////////////////////////////////////////////////////////////////////////
//MAIN FUNCTION///////////////////////////////////////////////////////////////

/*=============== SHOW MENU ===============*/
const showMenu = (toggleId, navId) =>{
    const toggle = document.getElementById(toggleId),
          nav = document.getElementById(navId)
 
    toggle.addEventListener('click', () =>{
        // Add show-menu class to nav menu
        nav.classList.toggle('show-menu')
        // Add show-icon to show and hide menu icon
        toggle.classList.toggle('show-icon')
    })
 }
 
 showMenu('nav-toggle','nav-menu')
 
 /*=============== SHOW DROPDOWN MENU ===============*/
 const dropdownItems = document.querySelectorAll('.dropdown__item')
 
 // 1. Select each dropdown item
 dropdownItems.forEach((item) =>{
     const dropdownButton = item.querySelector('.dropdown__button') 
 
     // 2. Select each button click
     dropdownButton.addEventListener('click', () =>{
         // 7. Select the current show-dropdown class
         const showDropdown = document.querySelector('.show-dropdown')
         
         // 5. Call the toggleItem function
         toggleItem(item)
 
         // 8. Remove the show-dropdown class from other items
         if(showDropdown && showDropdown!== item){
             toggleItem(showDropdown)
         }
     })
 })
 
 // 3. Create a function to display the dropdown
 const toggleItem = (item) =>{
     // 3.1. Select each dropdown content
     const dropdownContainer = item.querySelector('.dropdown__container')
 
     // 6. If the same item contains the show-dropdown class, remove
     if(item.classList.contains('show-dropdown')){
         dropdownContainer.removeAttribute('style')
         item.classList.remove('show-dropdown')
     } else{
         // 4. Add the maximum height to the dropdown content and add the show-dropdown class
         dropdownContainer.style.height = dropdownContainer.scrollHeight + 'px'
         item.classList.add('show-dropdown')
     }
 }
 
 /*=============== DELETE DROPDOWN STYLES ===============*/
 const mediaQuery = matchMedia('(min-width: 1118px)'),
       dropdownContainer = document.querySelectorAll('.dropdown__container')
 
 // Function to remove dropdown styles in mobile mode when browser resizes
 const removeStyle = () =>{
     // Validate if the media query reaches 1118px
     if(mediaQuery.matches){
         // Remove the dropdown container height style
         dropdownContainer.forEach((e) =>{
             e.removeAttribute('style')
         })
 
         // Remove the show-dropdown class from dropdown item
         dropdownItems.forEach((e) =>{
             e.classList.remove('show-dropdown')
         })
     }
 }
 
 addEventListener('resize', removeStyle)

 window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


// Animation loop
function animate() {
    requestAnimationFrame(animate);

    waterObject.material.uniforms['time'].value += 0.02; // Increase time step for faster waves

    // Rotate the box
    box.rotation.x += 0.001;
    box.rotation.y += 0.001;
    box.rotation.z += 0.001;

    // Bobbing motion for the box
    const bobSpeed = 0.005; // Adjust speed of bobbing
    const bobHeight = 2; // Adjust height of bobbing
    const time = Date.now() * bobSpeed;
    const delta = Math.sin(time) * bobHeight;
    box.position.y = 0.8 + delta;

    // Trigger splash when the box reaches the lowest point
    if (Math.abs(delta - 2) < 0.1) {
        triggerSplash();
    }

    // Animate particles for splash effect
    const positions = particleGeometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] -= 1; // Move particles down
        if (positions[i * 3 + 1] < 0) {
            positions[i * 3 + 1] = box.position.y; // Reset particle position
        }
    }
    particleGeometry.attributes.position.needsUpdate = true;

    function updateParticles1() {
        const positions1 = particleGeometry1.attributes.position.array;
    
        for (let i = 0; i < particleCount1; i++) {
            positions1[i * 3] += velocities1[i * 3];
            positions1[i * 3 + 1] += velocities1[i * 3 + 1];
            positions1[i * 3 + 2] += velocities1[i * 3 + 2];
    
            // Wrap particles around when they move out of bounds
            if (positions1[i * 3] > 100 || positions1[i * 3] < -100) velocities1[i * 3] *= -1;
            if (positions1[i * 3 + 1] > 100 || positions1[i * 3 + 1] < -100) velocities1[i * 3 + 1] *= -1;
            if (positions1[i * 3 + 2] > 100 || positions1[i * 3 + 2] < -100) velocities1[i * 3 + 2] *= -1;
        }
    
        particleGeometry1.attributes.position.needsUpdate = true;
    }

    updateParticles1();
    

    // Render scene
    renderer.render(scene, camera);
}

//////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////

animate();