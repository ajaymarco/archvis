// --- Scene Manager ---
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { generateUUID } from './utils.js'; // For new object UUIDs if not provided

let scene;
let camera;
let renderer;
let orbitControls;
let transformControls;
let raycaster;
let mouse;

let selectedObject = null;
let selectedLight = null;
const sceneObjects = [];
const sceneLights = [];
let defaultAmbientLight;
let defaultDirectionalLight;
let gridHelper;
let statsIntegration;
let groundPlane;

let isSceneInitialized = false;
let lightHelpersGloballyVisible = true; // Default to true, or load from a config

let uiManagerInstance;
let canvasElement;
let toolManagerInstanceRef;
let onSceneChangeCallback = () => {};
let historyManagerRef;

export function initSceneManager(canvas, ui, toolManager, sceneChangeCb, historyApi) {
    canvasElement = canvas;
    uiManagerInstance = ui;
    toolManagerInstanceRef = toolManager;
    if (sceneChangeCb) onSceneChangeCallback = sceneChangeCb;
    historyManagerRef = historyApi;

    if (!canvasElement || typeof THREE === 'undefined') { isSceneInitialized = false; return false; }

    try {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1d21);
        groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

        const container = canvasElement.closest('#renderCanvasContainer') || canvasElement.parentElement;
        const initialWidth = container.clientWidth || window.innerWidth;
        const initialHeight = container.clientHeight || window.innerHeight;
        camera = new THREE.PerspectiveCamera(60, initialWidth / initialHeight, 0.1, 5000);
        camera.position.set(8, 8, 8); camera.lookAt(0,1,0);
        renderer = new THREE.WebGLRenderer({ canvas: canvasElement, antialias: true, preserveDrawingBuffer: true });
        renderer.setSize(initialWidth, initialHeight); renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        orbitControls = new OrbitControls(camera, renderer.domElement);
        orbitControls.enableDamping = true; orbitControls.target.set(0, 1, 0); orbitControls.update();

        transformControls = new TransformControls(camera, renderer.domElement);
        transformControls.addEventListener('dragging-changed', event => {
            orbitControls.enabled = !event.value;
            if (!event.value) {
                if(selectedObject && uiManagerInstance.populateObjectPropertiesPanel) uiManagerInstance.populateObjectPropertiesPanel(selectedObject, transformControls, sceneManagerApi);
                else if (selectedLight && uiManagerInstance.updateSelectedLightPropertiesPanel) uiManagerInstance.updateSelectedLightPropertiesPanel(selectedLight, sceneManagerApi);
                onSceneChangeCallback();
            }
        });
        transformControls.setSize(0.8); scene.add(transformControls);

        defaultAmbientLight = new THREE.AmbientLight(0x707070, 0.5); defaultAmbientLight.name = "Default Ambient"; defaultAmbientLight.uuid = "defaultAmbientLight_uuid"; scene.add(defaultAmbientLight);
        defaultDirectionalLight = new THREE.DirectionalLight(0xffffff, 0.8); defaultDirectionalLight.name = "Default Sun"; defaultDirectionalLight.uuid = "defaultDirectionalLight_uuid"; scene.add(defaultDirectionalLight);
        if(defaultDirectionalLight.target) scene.add(defaultDirectionalLight.target);
        gridHelper = new THREE.GridHelper(100, 50, 0x4b5162, 0x3a3f4b); gridHelper.name = "EditorGrid"; scene.add(gridHelper);
        raycaster = new THREE.Raycaster(); mouse = new THREE.Vector2();
        initStatsInternal();
        canvasElement.addEventListener('click', handleCanvasClick);
        canvasElement.addEventListener('mousemove', handleCanvasMouseMove);
        animateInternal();
        isSceneInitialized = true;
        console.log("SceneManager initialized.");
        _refreshObjectListUI();
        return true;
    } catch (error) { console.error("Error SceneManager init:", error); isSceneInitialized = false; return false; }
}

function initStatsInternal() { /* ... (as before) ... */ }
function animateInternal() { /* ... (as before) ... */ }
export function handleWindowResize() { /* ... (as before) ... */ }

function _getObjectByUUID(uuid) { return sceneObjects.find(o => o.uuid === uuid); }
function _getLightByUUID(uuid) { return sceneLights.find(l => l.uuid === uuid) || (uuid === defaultAmbientLight.uuid ? defaultAmbientLight : null) || (uuid === defaultDirectionalLight.uuid ? defaultDirectionalLight : null); }

function _refreshObjectListUI() {
    if (uiManagerInstance && uiManagerInstance.updateEditorObjectList) {
        const selectObjCb = (uuid) => { const obj = _getObjectByUUID(uuid); if(obj) _selectObject(obj); };
        const selectLightCb = (uuid) => { const light = _getLightByUUID(uuid); if(light) _selectLight(light); };
        // Include default lights in the list for selection
        const allLightsForList = [...sceneLights, defaultAmbientLight, defaultDirectionalLight].filter(Boolean);
        uiManagerInstance.updateEditorObjectList(sceneObjects, allLightsForList, selectObjCb, selectLightCb, selectedObject?.uuid, selectedLight?.uuid);
    }
}

function handleCanvasClick(event) { /* ... (as before, calls toolManagerInstanceRef.handleCanvasClick or selection logic) ... */ }
function handleCanvasMouseMove(event) { /* ... (as before, delegates to toolManagerInstanceRef) ... */ }
export function handleKeyDown(event) { /* ... (as before, handles scene shortcuts if not handled by tool) ... */ }

function _deselectAll() { /* ... (as before, ensures _refreshObjectListUI is called) ... */ _refreshObjectListUI(); }
function _selectObject(object) { /* ... (as before, ensures _refreshObjectListUI is called) ... */ _refreshObjectListUI(); }
function _selectLight(light) { /* ... (as before, ensures _refreshObjectListUI is called) ... */ _refreshObjectListUI(); }

export function isEditorInitialized() { return isSceneInitialized; }

export function getInitialSceneState() {
    // This should return a minimal state, or the current state if starting fresh
    if (isSceneInitialized) {
        return getCurrentSceneState();
    }
    // Fallback to a very basic default if not initialized (should ideally not happen in normal flow)
    const defaultState = {
        sceneBgColor: "0x1a1d21",
        defaultAmbientLight: { color: "0x707070", intensity: 0.5 },
        defaultDirectionalLight: { color: "0xffffff", intensity: 0.8, position: [10, 10, 10], targetPosition: [0,0,0] },
        camera: { position: [8, 8, 8], target: [0, 1, 0], fov: 60, near: 0.1, far: 5000 },
        objects: [],
        lights: []
    };
    return JSON.stringify(defaultState);
}

export function getCurrentSceneState() {
    if (!isSceneInitialized) return JSON.stringify({});

    const state = {
        sceneBgColor: scene.background.getHexString(),
        defaultAmbientLight: {
            color: defaultAmbientLight.color.getHexString(),
            intensity: defaultAmbientLight.intensity,
            // No position for ambient
        },
        defaultDirectionalLight: {
            color: defaultDirectionalLight.color.getHexString(),
            intensity: defaultDirectionalLight.intensity,
            position: defaultDirectionalLight.position.toArray(),
            targetPosition: defaultDirectionalLight.target.position.toArray(),
        },
        camera: {
            position: camera.position.toArray(),
            target: orbitControls.target.toArray(),
            fov: camera.fov,
            near: camera.near,
            far: camera.far,
            zoom: camera.zoom // For Orthographic camera if ever used, or Perspective zoom
        },
        objects: sceneObjects.map(obj => {
            const material = obj.material;
            const geometry = obj.geometry;
            return {
                uuid: obj.uuid,
                name: obj.name,
                userData: { ...obj.userData }, // Preserve all userData, including 'type'
                geometryType: geometry.type,
                geometryParams: { ...geometry.parameters }, // Shallow copy, ensure all params are serializable
                position: obj.position.toArray(),
                rotation: obj.rotation.toArray().slice(0, 3), // Store X, Y, Z of Euler
                scale: obj.scale.toArray(),
                material: {
                    uuid: material.uuid, // Useful for material sharing/deduplication later if needed
                    type: material.type, // e.g., MeshStandardMaterial
                    color: material.color?.getHexString() || '0xffffff', // Default if no color
                    emissive: material.emissive?.getHexString() || '0x000000',
                    roughness: material.roughness,
                    metalness: material.metalness,
                    opacity: material.opacity,
                    transparent: material.transparent,
                    wireframe: material.wireframe,
                    side: material.side,
                    // Future: map, normalMap, etc. (would need texture serialization)
                }
            };
        }),
        lights: sceneLights.map(light => {
            const lightData = {
                uuid: light.uuid,
                name: light.name,
                userData: { ...light.userData }, // Preserve all userData, including 'type'
                type: light.constructor.name, // e.g., PointLight, DirectionalLight
                color: light.color.getHexString(),
                intensity: light.intensity,
                position: light.position.toArray(),
                // Cast shadows property
                castShadow: light.castShadow,
            };
            if (light.target && light.target.position) { // For DirectionalLight, SpotLight
                lightData.targetPosition = light.target.position.toArray();
            }
            if (light.isPointLight || light.isSpotLight) {
                lightData.distance = light.distance;
                lightData.decay = light.decay;
            }
            if (light.isSpotLight) {
                lightData.angle = light.angle;
                lightData.penumbra = light.penumbra;
            }
            // Future: shadow properties (mapSize, bias, etc.)
            return lightData;
        }),
        // Store transform controls state if needed (e.g., current mode)
        transformControlsMode: transformControls.getMode() || 'translate',
        gridHelperVisible: gridHelper.visible,
        // Snapping state if it's part of sceneManager directly
        // snappingEnabled: snappingIsEnabled,
        lightHelpersVisible: lightHelpersGloballyVisible, // Save current helper visibility
    };
    try {
        return JSON.stringify(state);
    } catch (error) {
        console.error("Error serializing scene state:", error);
        // Fallback to a very basic default if serialization fails
        // Ensure this defaultState also includes lightHelpersVisible
        const defaultState = {
            sceneBgColor: "0x1a1d21",
            defaultAmbientLight: { color: "0x707070", intensity: 0.5 },
            defaultDirectionalLight: { color: "0xffffff", intensity: 0.8, position: [10, 10, 10], targetPosition: [0,0,0] },
            camera: { position: [8, 8, 8], target: [0, 1, 0], fov: 60, near: 0.1, far: 5000 },
            objects: [],
            lights: [],
            lightHelpersVisible: true,
        };
        return JSON.stringify(defaultState);
    }
}


export function applySceneState(stateString, calledFromHistory = false) {
    if (!isSceneInitialized) return;

    clearScene(false); // Clear existing dynamic scene content, don't save this clearing to history

    let state;
    try {
        state = JSON.parse(stateString);
    } catch (e) {
        console.error("Error parsing scene state:", e);
        if(uiManagerInstance) uiManagerInstance.showGlobalMessageBox("Error loading scene: Invalid format.", "error");
        // Potentially load a default/empty state or recover
        return;
    }

    if (!state) {
        console.error("Failed to load scene: Parsed state is null or undefined.");
        if(uiManagerInstance) uiManagerInstance.showGlobalMessageBox("Error loading scene: No data.", "error");
        return;
    }

    // Apply Scene Environment
    if (state.sceneBgColor) {
        scene.background = new THREE.Color().setHex(parseInt(state.sceneBgColor.replace("#", "0x"), 16));
    }
    if (state.defaultAmbientLight) {
        defaultAmbientLight.color.setHex(parseInt(state.defaultAmbientLight.color.replace("#", "0x"), 16));
        defaultAmbientLight.intensity = state.defaultAmbientLight.intensity;
    }
    if (state.defaultDirectionalLight) {
        defaultDirectionalLight.color.setHex(parseInt(state.defaultDirectionalLight.color.replace("#", "0x"), 16));
        defaultDirectionalLight.intensity = state.defaultDirectionalLight.intensity;
        defaultDirectionalLight.position.fromArray(state.defaultDirectionalLight.position);
        if (state.defaultDirectionalLight.targetPosition && defaultDirectionalLight.target) {
            defaultDirectionalLight.target.position.fromArray(state.defaultDirectionalLight.targetPosition);
            defaultDirectionalLight.target.updateMatrixWorld(true); // Force update
        }
    }

    // Apply Grid Helper visibility
    if (state.gridHelperVisible !== undefined) {
        gridHelper.visible = state.gridHelperVisible;
    }
    if (uiManagerInstance && uiManagerInstance.updateGridButtonState) { // Assumes such a function exists
        uiManagerInstance.updateGridButtonState(gridHelper.visible);
    }


    // Apply Objects
    if (state.objects && Array.isArray(state.objects)) {
        state.objects.forEach(objData => {
            let geometry;
            const geoParams = objData.geometryParams;
            switch (objData.geometryType) {
                case 'BoxGeometry':
                    geometry = new THREE.BoxGeometry(geoParams.width, geoParams.height, geoParams.depth, geoParams.widthSegments, geoParams.heightSegments, geoParams.depthSegments);
                    break;
                case 'PlaneGeometry':
                    geometry = new THREE.PlaneGeometry(geoParams.width, geoParams.height, geoParams.widthSegments, geoParams.heightSegments);
                    break;
                case 'SphereGeometry':
                    geometry = new THREE.SphereGeometry(geoParams.radius, geoParams.widthSegments, geoParams.heightSegments, geoParams.phiStart, geoParams.phiLength, geoParams.thetaStart, geoParams.thetaLength);
                    break;
                case 'CylinderGeometry':
                    geometry = new THREE.CylinderGeometry(geoParams.radiusTop, geoParams.radiusBottom, geoParams.height, geoParams.radialSegments, geoParams.heightSegments, geoParams.openEnded, geoParams.thetaStart, geoParams.thetaLength);
                    break;
                // Add other geometry types as needed
                default:
                    console.warn(`Unsupported geometry type: ${objData.geometryType}`);
                    return; // Skip this object
            }

            const matParams = objData.material;
            const material = new THREE[matParams.type](); // e.g., MeshStandardMaterial
            if (material) {
                if(matParams.color) material.color.setHex(parseInt(matParams.color.replace("#", "0x"), 16));
                if(matParams.emissive) material.emissive.setHex(parseInt(matParams.emissive.replace("#", "0x"), 16));
                material.roughness = matParams.roughness;
                material.metalness = matParams.metalness;
                material.opacity = matParams.opacity;
                material.transparent = matParams.transparent;
                material.wireframe = matParams.wireframe;
                material.side = matParams.side;
                if (matParams.uuid) material.uuid = matParams.uuid;
            }

            const mesh = new THREE.Mesh(geometry, material);
            mesh.uuid = objData.uuid;
            mesh.name = objData.name;
            mesh.userData = { ...objData.userData };
            mesh.position.fromArray(objData.position);
            mesh.rotation.set(objData.rotation[0], objData.rotation[1], objData.rotation[2]); // XYZ Euler order
            mesh.scale.fromArray(objData.scale);

            scene.add(mesh);
            sceneObjects.push(mesh);
        });
    }

    // Apply Lights
    if (state.lights && Array.isArray(state.lights)) {
        state.lights.forEach(lightData => {
            let light;
            switch (lightData.type) {
                case 'PointLight':
                    light = new THREE.PointLight();
                    if(lightData.distance !== undefined) light.distance = lightData.distance;
                    if(lightData.decay !== undefined) light.decay = lightData.decay;
                    break;
                case 'DirectionalLight':
                    light = new THREE.DirectionalLight();
                    if (lightData.targetPosition && light.target) {
                        scene.add(light.target); // Important: target must be in scene
                        light.target.position.fromArray(lightData.targetPosition);
                        light.target.updateMatrixWorld(true);
                    }
                    break;
                case 'SpotLight':
                    light = new THREE.SpotLight();
                    if(lightData.distance !== undefined) light.distance = lightData.distance;
                    if(lightData.decay !== undefined) light.decay = lightData.decay;
                    if(lightData.angle !== undefined) light.angle = lightData.angle;
                    if(lightData.penumbra !== undefined) light.penumbra = lightData.penumbra;
                     if (lightData.targetPosition && light.target) {
                        scene.add(light.target); // Important: target must be in scene
                        light.target.position.fromArray(lightData.targetPosition);
                        light.target.updateMatrixWorld(true);
                    }
                    break;
                case 'AmbientLight': // Though we have a default one, allow for more if needed
                    light = new THREE.AmbientLight();
                    break;
                default:
                    console.warn(`Unsupported light type: ${lightData.type}`);
                    return; // Skip this light
            }

            light.uuid = lightData.uuid;
            light.name = lightData.name;
            light.userData = { ...lightData.userData };
            light.color.setHex(parseInt(lightData.color.replace("#", "0x"), 16));
            light.intensity = lightData.intensity;
            light.position.fromArray(lightData.position);
            if(lightData.castShadow !== undefined) light.castShadow = lightData.castShadow;

            scene.add(light);
            sceneLights.push(light);
            // Helper creation will be handled by _updateLightHelpersDisplay
        });
    }

    // Restore light helper visibility state
    if (state.lightHelpersVisible !== undefined) {
        lightHelpersGloballyVisible = state.lightHelpersVisible;
    }
    _updateLightHelpersDisplay(); // Create/show/hide helpers based on the loaded global state


    // Apply Camera State
    if (state.camera) {
        camera.position.fromArray(state.camera.position);
        orbitControls.target.fromArray(state.camera.target);
        camera.fov = state.camera.fov;
        camera.near = state.camera.near;
        camera.far = state.camera.far;
        if(state.camera.zoom) camera.zoom = state.camera.zoom;
        camera.updateProjectionMatrix();
        orbitControls.update();
        if (uiManagerInstance && uiManagerInstance.updateCameraSettingsUI) { // Assumes such a function exists
            uiManagerInstance.updateCameraSettingsUI(state.camera);
        }
    }

    // Apply Transform Controls Mode
    if (state.transformControlsMode) {
        transformControls.setMode(state.transformControlsMode);
         if (uiManagerInstance && uiManagerInstance.updateEditorTransformModeButtons) {
            uiManagerInstance.updateEditorTransformModeButtons(state.transformControlsMode);
        }
    }


    _deselectAll(); // Clear any selection from before loading
    _refreshObjectListUI();

    if (!calledFromHistory) {
        onSceneChangeCallback(); // This will save the loaded state as a new history point
    }
    console.log("Scene state applied.");
}

export function clearScene(saveToHistory = true) {
    if (!isSceneInitialized) return;

    // Deselect and remove transform controls target
    _deselectAll(); // This also detaches transform controls

    // Remove dynamic objects
    sceneObjects.forEach(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
            if (Array.isArray(obj.material)) {
                obj.material.forEach(mat => mat.dispose());
            } else {
                obj.material.dispose();
            }
        }
        scene.remove(obj);
    });
    sceneObjects.length = 0; // Clear array

    // Remove dynamic lights and their helpers
    sceneLights.forEach(light => {
        if (light.helper) scene.remove(light.helper); // Remove helper from scene
        // Light itself doesn't have dispose method, just remove from scene
        scene.remove(light);
        if (light.target && !(light.target === defaultDirectionalLight.target) ) { // Don't remove default light's target if it was reused
             scene.remove(light.target);
        }
    });
    sceneLights.length = 0;

    // Reset selection state
    selectedObject = null;
    selectedLight = null;

    if (uiManagerInstance) {
        uiManagerInstance.populateObjectPropertiesPanel(null, transformControls, sceneManagerApi); // Clear properties panel
        uiManagerInstance.updateSelectedLightPropertiesPanel(null, sceneManagerApi); // Clear light panel
    }

    _refreshObjectListUI();

    if (saveToHistory) {
        onSceneChangeCallback(); // Save the cleared state to history
    }
    console.log("Scene cleared.");
}

// export function getCurrentSceneState() { /* ... (as before, ensure full serialization) ... */ } // This is now defined above
export function clearHistoryAndSaveInitialSceneState(initialStateString) { /* ... (as before) ... */ }
export function saveCurrentSceneToHistory() { onSceneChangeCallback(); }
export function cancelActiveToolModes() { if(toolManagerInstanceRef) toolManagerInstanceRef.deactivateCurrentTool(); }

export function addSceneObject(object) { if (scene) scene.add(object); /* Does not call history or list update; for temp objects */ }
export function removeSceneObject(object) { if (scene) scene.remove(object); /* Does not call history or list update */ }
export function setOrbitControlsEnabled(enabled) { if (orbitControls) orbitControls.enabled = enabled; }

export function raycastForObjectAndFace(currentRaycaster, currentMouse, currentCamera) {
    currentRaycaster.setFromCamera(currentMouse, currentCamera);
    const intersects = currentRaycaster.intersectObjects(sceneObjects, false); // false = non-recursive
    if (intersects.length > 0) {
        const intersect = intersects[0];
        // Ensure face and faceIndex are available (might not be for some geometries or if raycast misses faces)
        if (intersect.face && intersect.faceIndex !== undefined) {
            return { object: intersect.object, face: intersect.face, faceIndex: intersect.faceIndex, point: intersect.point };
        }
    }
    return null;
}

export function extrudeFace(objectToExtrude, faceIndex, worldFaceNormal, extrusionHeight) {
    if (!objectToExtrude || faceIndex === undefined || !worldFaceNormal || !extrusionHeight) {
        console.error("SceneManager.extrudeFace: Missing parameters.");
        return;
    }

    const originalGeometry = objectToExtrude.geometry;
    const originalMaterial = objectToExtrude.material;
    let newMesh;

    if (originalGeometry.type === 'PlaneGeometry') {
        const params = originalGeometry.parameters;
        const planeWidth = params.width;
        const planeDepth = params.height; // PlaneGeometry's 'height' parameter maps to depth in XZ plane

        const newBoxGeo = new THREE.BoxGeometry(planeWidth, extrusionHeight, planeDepth);
        newMesh = new THREE.Mesh(newBoxGeo, originalMaterial.clone());

        newMesh.position.copy(objectToExtrude.position).addScaledVector(worldFaceNormal, extrusionHeight / 2);
        newMesh.rotation.copy(objectToExtrude.rotation);
        newMesh.scale.copy(objectToExtrude.scale);
        newMesh.name = (objectToExtrude.name || "Plane") + "_Extruded";

        removeSceneObject(objectToExtrude); // Remove old plane from scene
        const objIndex = sceneObjects.indexOf(objectToExtrude);
        if (objIndex > -1) sceneObjects.splice(objIndex, 1);
        if(objectToExtrude.geometry) objectToExtrude.geometry.dispose();
        if(objectToExtrude.material) objectToExtrude.material.dispose();

    } else if (originalGeometry.type === 'BoxGeometry') {
        const params = originalGeometry.parameters;
        const worldScale = objectToExtrude.scale.clone(); // Use world scale of the object

        let newBoxWidth, newBoxHeight, newBoxDepth;
        const positionOffset = new THREE.Vector3();

        // Determine new dimensions and position offset based on the face normal
        // Note: worldFaceNormal is normalized.
        if (Math.abs(worldFaceNormal.x) > 0.9) { // Extruding along X
            newBoxWidth = extrusionHeight;
            newBoxHeight = params.height * worldScale.y;
            newBoxDepth = params.depth * worldScale.z;
            positionOffset.x = worldFaceNormal.x * ((params.width * worldScale.x / 2) + (extrusionHeight / 2));
        } else if (Math.abs(worldFaceNormal.y) > 0.9) { // Extruding along Y
            newBoxWidth = params.width * worldScale.x;
            newBoxHeight = extrusionHeight;
            newBoxDepth = params.depth * worldScale.z;
            positionOffset.y = worldFaceNormal.y * ((params.height * worldScale.y / 2) + (extrusionHeight / 2));
        } else if (Math.abs(worldFaceNormal.z) > 0.9) { // Extruding along Z
            newBoxWidth = params.width * worldScale.x;
            newBoxHeight = params.height * worldScale.y;
            newBoxDepth = extrusionHeight;
            positionOffset.z = worldFaceNormal.z * ((params.depth * worldScale.z / 2) + (extrusionHeight / 2));
        } else {
            console.error("SceneManager.extrudeFace: Could not determine primary extrusion axis for Box.");
            return;
        }

        const newBoxGeo = new THREE.BoxGeometry(newBoxWidth, newBoxHeight, newBoxDepth);
        newMesh = new THREE.Mesh(newBoxGeo, originalMaterial.clone());
        newMesh.position.copy(objectToExtrude.position).add(positionOffset);
        newMesh.rotation.copy(objectToExtrude.rotation);
        // Scale of new box is 1,1,1 as its geometry is already scaled.
        newMesh.name = (objectToExtrude.name || "Box") + "_Extrusion";
    } else {
        if(uiManagerInstance) uiManagerInstance.showEditorMessageBox("Push/Pull is currently only supported for basic Planes and Boxes.", "info");
        return;
    }

    if (newMesh) {
        newMesh.uuid = generateUUID(); // Assign new UUID
        scene.add(newMesh);
        sceneObjects.push(newMesh);
        _selectObject(newMesh);
        onSceneChangeCallback();
        _refreshObjectListUI();
        console.log(`SceneManager: Face extruded, new object ${newMesh.name} created.`);
    }
}


export function addObject(type = 'Cube', parameters = {}, calledInternally = false) {
    let geometry, mesh;
    const material = new THREE.MeshStandardMaterial({ color: new THREE.Color(parameters.material?.color || 0xcccccc), roughness:0.6, metalness:0.2 });
    // ... (rest of geometry creation as before) ...
    if (!geometry) geometry = new THREE.BoxGeometry(1,1,1);
    mesh = new THREE.Mesh(geometry, material);
    mesh.name = parameters.name || `${type}_${sceneObjects.length + 1}`;
    mesh.uuid = parameters.uuid || generateUUID(); // Use new generateUUID
    mesh.userData.type = type;
    if(parameters.position) mesh.position.fromArray(parameters.position); else mesh.position.set(0,0.5,0);
    if(parameters.rotation) mesh.rotation.fromArray(parameters.rotation);
    if(parameters.scale) mesh.scale.fromArray(parameters.scale);
    scene.add(mesh); sceneObjects.push(mesh);
    _selectObject(mesh);
    if(!calledInternally) onSceneChangeCallback();
    _refreshObjectListUI();
    return mesh;
}
export function addLight(type = 'Point', parameters = {}, calledInternally = false) { /* ... (as before, ensure _refreshObjectListUI and onSceneChangeCallback) ... */ _refreshObjectListUI(); }
export function getSelectedObject() { return selectedObject; }
export function getSelectedLight() { return selectedLight; }
export function deleteSelected() { /* ... (as before, calls onSceneChangeCallback and _refreshObjectListUI) ... */ }
export function duplicateSelected() { /* ... */ onSceneChangeCallback(); _refreshObjectListUI(); }
export function setTransformMode(mode) { /* ... (as before, calls onSceneChangeCallback) ... */ }
export function setCameraView(type) { /* ... */ onSceneChangeCallback(); }
export function resetCamera() { /* ... */ onSceneChangeCallback(); }
export function frameSelected() { /* ... */ }
export function renderImage() { /* ... */ }
export function toggleGrid() {
    if (!isSceneInitialized) return;
    gridHelper.visible = !gridHelper.visible;
    if (uiManagerInstance && uiManagerInstance.updateGridButtonState) {
        uiManagerInstance.updateGridButtonState(gridHelper.visible);
    }
    // No onSceneChangeCallback() here unless grid visibility is considered part of savable scene state
    // It is saved in getCurrentSceneState as gridHelperVisible, so a change should trigger history.
    onSceneChangeCallback();
}

export function toggleWireframe() { /* ... calls onSceneChangeCallback ... */ }
export function toggleStats() { /* ... */ }
export function toggleSnapping() { /* ... */ }

function _updateLightHelpersDisplay() {
    if (!isSceneInitialized) return;

    const lightsWithHelpers = [...sceneLights, defaultDirectionalLight /* defaultAmbientLight typically doesn't have a helper */];

    lightsWithHelpers.forEach(light => {
        if (!light) return; // Skip if light is null (e.g. if defaultAmbient was included and is null)

        if (lightHelpersGloballyVisible) {
            if (!light.helper) { // Create helper if it doesn't exist
                if (light.isPointLight) light.helper = new THREE.PointLightHelper(light, 0.5);
                else if (light.isDirectionalLight) light.helper = new THREE.DirectionalLightHelper(light, 1);
                else if (light.isSpotLight) light.helper = new THREE.SpotLightHelper(light);
                // Add other helper types (HemisphereLightHelper, RectAreaLightHelper) if those lights are used

                if (light.helper) {
                    light.helper.name = `${light.name}_Helper`;
                    scene.add(light.helper);
                }
            }
            if (light.helper) light.helper.visible = true;
        } else {
            if (light.helper) {
                light.helper.visible = false;
                // Optionally dispose and remove helpers if they are not needed anymore
                // scene.remove(light.helper);
                // light.helper.dispose();
                // light.helper = null;
            }
        }
    });
     if (uiManagerInstance && uiManagerInstance.updateLightHelpersButtonState) { // Assumes such a function exists
        uiManagerInstance.updateLightHelpersButtonState(lightHelpersGloballyVisible);
    }
}

export function toggleLightHelpers() {
    lightHelpersGloballyVisible = !lightHelpersGloballyVisible;
    _updateLightHelpersDisplay();
    onSceneChangeCallback(); // Helper visibility is part of scene state
}

const sceneManagerApi = { updateObjectProperty, updateLightProperty, updateCameraProperty }; // Add updateCameraProperty here

export function updateCameraProperty(property, value) {
    if (!isSceneInitialized || !camera) return;
    let changed = false;
    switch(property) {
        case 'fov':
            if (camera.isPerspectiveCamera && camera.fov !== value) {
                camera.fov = value;
                changed = true;
            }
            break;
        case 'near':
            if (camera.near !== value) {
                camera.near = value;
                changed = true;
            }
            break;
        case 'far':
            if (camera.far !== value) {
                camera.far = value;
                changed = true;
            }
            break;
        // Add 'zoom' or other properties if needed
    }

    if (changed) {
        camera.updateProjectionMatrix();
        if (uiManagerInstance && uiManagerInstance.updateCameraSettingsUI) {
            // Pass the current camera state to UI
            uiManagerInstance.updateCameraSettingsUI({
                fov: camera.fov,
                near: camera.near,
                far: camera.far,
                // zoom: camera.zoom // if applicable
            });
        }
        onSceneChangeCallback(); // Camera changes should be saved
    }
}

// Make sure updateObjectProperty and updateLightProperty also call onSceneChangeCallback if they make actual changes.
// Example for updateObjectProperty (assuming it exists or needs creation for property panel interaction)
function updateObjectProperty(object, propertyPath, value) {
    if (!object) return;

    let changed = false;
    const pathParts = propertyPath.split('.');
    let currentTarget = object;

    for (let i = 0; i < pathParts.length - 1; i++) {
        currentTarget = currentTarget[pathParts[i]];
        if (!currentTarget) return; // Path is invalid
    }

    const finalProperty = pathParts[pathParts.length - 1];

    // Special handling for color as it's an object
    if ((finalProperty === 'color' || finalProperty === 'emissive') && currentTarget[finalProperty] && currentTarget[finalProperty].isColor) {
        if (currentTarget[finalProperty].getHexString() !== value.replace("#", "0x")) {
            currentTarget[finalProperty].set(value);
            changed = true;
        }
    } else if (currentTarget[finalProperty] !== value) {
        // Handle numeric conversions for properties like position, rotation, scale components
        if (['x', 'y', 'z'].includes(finalProperty) && (currentTarget === object.position || currentTarget === object.rotation || currentTarget === object.scale)) {
            const numValue = parseFloat(value);
            if (currentTarget[finalProperty] !== numValue) {
                currentTarget[finalProperty] = numValue;
                changed = true;
            }
        } else if (typeof currentTarget[finalProperty] === 'number') {
            const numValue = parseFloat(value);
            if (currentTarget[finalProperty] !== numValue) {
                currentTarget[finalProperty] = numValue;
                changed = true;
            }
        } else if (typeof currentTarget[finalProperty] === 'boolean') {
             const boolValue = typeof value === 'string' ? value.toLowerCase() === 'true' : !!value;
             if (currentTarget[finalProperty] !== boolValue) {
                currentTarget[finalProperty] = boolValue;
                changed = true;
            }
        }
        else { // For strings like name, uuid, type
            if (currentTarget[finalProperty] !== value) {
                currentTarget[finalProperty] = value;
                changed = true;
            }
        }
    }

    if (changed) {
        if (object.isLight && object.helper) object.helper.update(); // Update light helper if light changes
        if (transformControls && transformControls.object === object) transformControls.needsUpdate = true; // May need to update TransformControls

        onSceneChangeCallback();
        // No need to call _refreshObjectListUI here unless name changes, which is handled by populateObjectPropertiesPanel
        // uiManagerInstance.populateObjectPropertiesPanel might be better to refresh the whole panel
    }
}

// Placeholder for updateLightProperty, similar to updateObjectProperty
function updateLightProperty(light, propertyPath, value) {
    // Similar logic to updateObjectProperty, tailored for light properties
    // Ensure light.helper.update() is called if relevant properties change (e.g., color, intensity for some helpers)
    // Call onSceneChangeCallback()
    updateObjectProperty(light, propertyPath, value); // Can reuse if structure is similar enough
}


console.log("sceneManager.js updated with extrudeFace and raycastForObjectAndFace implementations, and refined UI update calls.");
