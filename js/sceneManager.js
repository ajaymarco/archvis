// --- Scene Manager ---
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

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

let uiManagerInstance;
let canvasElement;
let toolManagerInstanceRef; // Renamed to avoid confusion
let onSceneChangeCallback = () => {};
let historyManagerRef;

// toolManagerInstance is passed here because sceneManager's internal canvas event handlers
// (like click, mousemove) need to delegate to it.
export function initSceneManager(canvas, ui, toolManager, sceneChangeCb, historyApi) {
    canvasElement = canvas;
    uiManagerInstance = ui;
    toolManagerInstanceRef = toolManager;
    if (sceneChangeCb) onSceneChangeCallback = sceneChangeCb;
    historyManagerRef = historyApi;

    if (!canvasElement || typeof THREE === 'undefined') { /* ... error ... */ return false; }

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
                if(selectedObject && uiManagerInstance.populateObjectPropertiesPanel) uiManagerInstance.populateObjectPropertiesPanel(selectedObject, transformControls);
                else if (selectedLight && uiManagerInstance.updateSelectedLightPropertiesPanel) uiManagerInstance.updateSelectedLightPropertiesPanel(selectedLight);
                onSceneChangeCallback();
            }
        });
        transformControls.setSize(0.8); scene.add(transformControls);

        defaultAmbientLight = new THREE.AmbientLight(0x707070, 0.5); scene.add(defaultAmbientLight);
        defaultDirectionalLight = new THREE.DirectionalLight(0xffffff, 0.8); scene.add(defaultDirectionalLight);
        if(defaultDirectionalLight.target) scene.add(defaultDirectionalLight.target);
        gridHelper = new THREE.GridHelper(100, 50, 0x4b5162, 0x3a3f4b); scene.add(gridHelper);
        raycaster = new THREE.Raycaster(); mouse = new THREE.Vector2();
        initStatsInternal();

        // Global listeners (like window resize, keydown) are now handled by EventManager.
        // SceneManager still handles direct canvas interactions.
        canvasElement.addEventListener('click', handleCanvasClick);
        canvasElement.addEventListener('mousemove', handleCanvasMouseMove);

        animateInternal();
        isSceneInitialized = true;
        console.log("SceneManager initialized. Global listeners (keydown, resize) to be handled by EventManager.");
        return true;
    } catch (error) { console.error("Error SceneManager init:", error); isSceneInitialized = false; return false; }
}

function initStatsInternal() { if (typeof Stats === 'undefined') { console.warn("Stats.js not loaded."); return; } statsIntegration = new Stats(); statsIntegration.dom.style.position = 'absolute'; statsIntegration.dom.style.left = '10px'; statsIntegration.dom.style.top = '10px'; const container = renderer.domElement.parentElement; if (container) container.appendChild(statsIntegration.dom); statsIntegration.dom.style.display = 'none'; }
function animateInternal() { if (!isSceneInitialized) return; requestAnimationFrame(animateInternal); orbitControls.update(); renderer.render(scene, camera); if (statsIntegration && statsIntegration.dom.style.display !== 'none') statsIntegration.update(); }

// Public method for EventManager to call
export function handleWindowResize() {
    if (!renderer || !camera || !canvasElement) return;
    const container = canvasElement.closest('#renderCanvasContainer') || canvasElement.parentElement;
    const newWidth = container.clientWidth; const newHeight = container.clientHeight;
    if (newWidth > 0 && newHeight > 0) { camera.aspect = newWidth / newHeight; camera.updateProjectionMatrix(); renderer.setSize(newWidth, newHeight); }
    console.log("SceneManager: handleWindowResize executed.");
}

// Public method for EventManager to call (after toolManager had a chance)
export function handleKeyDown(event) {
    // These are scene-specific shortcuts if not handled by an active tool or global handler (like save/undo)
    console.log("SceneManager: handleKeyDown received event:", event.key);
    switch (event.key.toLowerCase()) {
        case 't': setTransformMode('translate'); break;
        case 'r': setTransformMode('rotate'); break;
        case 's': setTransformMode('scale'); break;
        case 'escape': _deselectAll(); break; // Default deselect if no tool handled escape
        case 'delete': case 'backspace': deleteSelected(); break;
        case 'f': frameSelected(); break;
        case 'x': toggleSnapping(); break;
        // TODO: Implement camera view shortcuts (Num7, Num1, etc.) by calling setCameraView
    }
}


// Internal canvas click handler (called by its own event listener)
function handleCanvasClick(event) {
    if (transformControls && transformControls.dragging) return;
    const rect = canvasElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    if (toolManagerInstanceRef && toolManagerInstanceRef.isToolActive()) {
        const handledByTool = toolManagerInstanceRef.handleCanvasClick(event, mouse, raycaster, camera, groundPlane);
        if (handledByTool) return;
    }

    raycaster.setFromCamera(mouse, camera);
    const intersectsMeshes = raycaster.intersectObjects(sceneObjects, false);
    if (intersectsMeshes.length > 0) { _selectObject(intersectsMeshes[0].object); return; }
    const lightHelpers = sceneLights.map(l => l.userData.helper).filter(h => h && h.visible);
    const intersectsLights = raycaster.intersectObjects(lightHelpers, false);
    if (intersectsLights.length > 0) {
        const light = sceneLights.find(l => l.userData.helper === intersectsLights[0].object);
        if (light) _selectLight(light); return;
    }
    _deselectAll();
}

// Internal canvas mousemove handler
function handleCanvasMouseMove(event) {
    if (toolManagerInstanceRef && toolManagerInstanceRef.isToolActive()) {
        const rect = canvasElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        toolManagerInstanceRef.handleCanvasMouseMove(event, mouse, raycaster, camera, groundPlane);
    }
}


function _deselectAll() { /* ... (as before, calls uiManagerInstance.updateSelectionPropertiesVisibility) ... */ }
function _selectObject(object) { /* ... (as before, calls uiManagerInstance methods) ... */ }
function _selectLight(light) { /* ... (as before, calls uiManagerInstance methods) ... */ }

export function isEditorInitialized() { return isSceneInitialized; }
export function getInitialSceneState() { /* ... (as before) ... */ }
export function applySceneState(stateString, calledFromHistory = false) { /* ... (as before, calls clearScene, onSceneChangeCallback if !calledFromHistory) ... */ }
export function clearScene(saveToHistory = true) { /* ... (as before, calls onSceneChangeCallback if saveToHistory is true) ... */ }
export function getCurrentSceneState() { /* ... (as before) ... */ }
export function clearHistoryAndSaveInitialSceneState() { if (historyManagerRef && historyManagerRef.clearHistoryAndSaveInitialState) { historyManagerRef.clearHistoryAndSaveInitialState(getCurrentSceneState()); } else { console.warn("SM: historyManagerRef or clearHistoryAndSaveInitialState not available."); } }
export function saveCurrentSceneToHistory() { onSceneChangeCallback(); }
export function cancelActiveToolModes() { if(toolManagerInstanceRef) toolManagerInstanceRef.deactivateCurrentTool(); }

export function addSceneObject(object) { if (scene) scene.add(object); }
export function removeSceneObject(object) { if (scene) scene.remove(object); }
export function setOrbitControlsEnabled(enabled) { if (orbitControls) orbitControls.enabled = enabled; }
export function raycastForObjectAndFace(currentRaycaster, currentMouse, currentCamera) { /* ... (as before) ... */ }
export function extrudeFace(object, faceIndex, normal, height) { /* ... (as before, calls onSceneChangeCallback) ... */ }

export function addObject(type = 'Cube', parameters = {}, calledInternally = false) { /* ... (as before, calls onSceneChangeCallback if !calledInternally) ... */ }
export function addLight(type = 'Point', parameters = {}, calledInternally = false) { /* ... (as before, calls onSceneChangeCallback if !calledInternally) ... */ }
export function getSelectedObject() { return selectedObject; }
export function getSelectedLight() { return selectedLight; }
export function deleteSelected() { /* ... (as before, calls onSceneChangeCallback) ... */ }
export function duplicateSelected() { /* ... */ onSceneChangeCallback(); }
export function setTransformMode(mode) { if(transformControls) transformControls.setMode(mode); if(uiManagerInstance) uiManagerInstance.updateEditorTransformModeButtons(mode); console.log("SceneManager: Transform mode set to", mode); onSceneChangeCallback(); /* Mode change is history-worthy */ }
export function setCameraView(type) { /* ... */ console.log("SceneManager: Set camera view", type); onSceneChangeCallback(); /* Camera change is history-worthy if significant */ }
export function resetCamera() { /* ... */ onSceneChangeCallback(); }
export function frameSelected() { /* ... */ }
export function renderImage() { /* ... */ }
export function toggleGrid() { if(gridHelper) gridHelper.visible = !gridHelper.visible; renderer.render(scene,camera); /* Render one frame */ }
export function toggleWireframe() { sceneObjects.forEach(obj => { if(obj.material) obj.material.wireframe = !obj.material.wireframe; }); renderer.render(scene,camera); onSceneChangeCallback(); /* Wireframe is a visual state change */ }
export function toggleStats() { if(statsIntegration) statsIntegration.dom.style.display = statsIntegration.dom.style.display === 'none' ? 'block' : 'none'; }
export function toggleSnapping() { isSnappingEnabled = !isSnappingEnabled; transformControls.setTranslationSnap(isSnappingEnabled ? 0.5 : null); transformControls.setRotationSnap(isSnappingEnabled ? THREE.MathUtils.degToRad(15) : null); if(uiManagerInstance) uiManagerInstance.showEditorMessageBox(`Snapping ${isSnappingEnabled ? 'Enabled' : 'Disabled'}`, 'info'); }
export function toggleLightHelpers() { sceneLights.forEach(l => { if(l.userData.helper) l.userData.helper.visible = !l.userData.helper.visible; }); renderer.render(scene,camera); onSceneChangeCallback(); /* Visual state change */ }

console.log("sceneManager.js updated: global listeners removed, public handlers retained.");
