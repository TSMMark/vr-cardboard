var camera, scene, renderer;
var effect, controls;
var element, container;
var unitHeight = 10;
var movementSpeed = 20;

var pressedKeys = [];
var KEYCODES = {
  up: 87,
  left: 65,
  down: 83,
  right: 68
};

var clock = new THREE.Clock();

var init = function () {
  renderer = new THREE.WebGLRenderer();
  element = renderer.domElement;
  container = document.getElementById('example');
  container.appendChild(element);

  effect = new THREE.StereoEffect(renderer);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(90, 1, 0.001, 700);
  camera.position.set(0, unitHeight, 0);
  scene.add(camera);

  document.addEventListener('keydown', function (event) {
    console.log("keydown", event.keyCode);
    pressedKeys[event.keyCode] = true;
  }, false);

  document.addEventListener('keyup', function (event) {
    pressedKeys[event.keyCode] = false;
  }, false);

  controls = new THREE.OrbitControls(camera, element);
  controls.rotateUp(Math.PI / 4);
  controls.target.set(
    camera.position.x + 0.1,
    camera.position.y,
    camera.position.z
  );
  controls.noZoom = true;
  controls.noPan = true;

  var setOrientationControls = function (e) {
    if (!e.alpha) {
      return;
    }

    controls = new THREE.DeviceOrientationControls(camera, true);
    controls.connect();
    controls.update();

    element.addEventListener('click', fullscreen, false);

    window.removeEventListener('deviceorientation', setOrientationControls, true);
  }

  window.addEventListener('deviceorientation', setOrientationControls, true);

  var light = new THREE.HemisphereLight(0x777777, 0x000000, 0.6);
  scene.add(light);

  var texture = THREE.ImageUtils.loadTexture(
    'textures/patterns/checker.png'
  );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat = new THREE.Vector2(50, 50);
  texture.anisotropy = renderer.getMaxAnisotropy();

  var material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    specular: 0xffffff,
    shininess: 20,
    shading: THREE.FlatShading,
    map: texture
  });

  // ground

  var plane = new THREE.PlaneGeometry(1000, 1000);
  var mesh = new THREE.Mesh(plane, material);
  mesh.rotation.x = -Math.PI / 2;
  scene.add(mesh);

  // world

  var pyramid = new THREE.CylinderGeometry(0, 10, 30, 4, 1);
  var flatMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    specular: 0xffffff,
    shininess: 20,
    shading: THREE.FlatShading
  });

  for (var i = 0; i < 500; i++) {
    var pyremidMesh = new THREE.Mesh(pyramid, flatMaterial);
    pyremidMesh.position.x = (Math.random() - 0.5) * 1000;
    pyremidMesh.position.y = (Math.random() - 0.5) * 1000;
    pyremidMesh.position.z = (Math.random() - 0.5) * 1000;
    pyremidMesh.updateMatrix();
    pyremidMesh.matrixAutoUpdate = false;
    scene.add(pyremidMesh);
  }

  window.addEventListener('resize', resize, false);
  setTimeout(resize, 1);
}

var resize = function () {
  var width = container.offsetWidth;
  var height = container.offsetHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  effect.setSize(width, height);
}

var handleMovement = function (dt) {
  var xRad = camera.rotation.x;
  // var yRad = camera.rotation.y;
  console.log("camera rotation", xRad);

  var d = movementSpeed * dt;

  // TODO: These are wrong.
  if (pressedKeys[KEYCODES.up]) {
    camera.position.x += (Math.cos(xRad) * d) - (d * 2);
    controls.target.x += (Math.cos(xRad) * d) - (d * 2);
  }
  if (pressedKeys[KEYCODES.down]) {
    camera.position.x -= (Math.cos(xRad) * d) - (d * 2);
    controls.target.x -= (Math.cos(xRad) * d) - (d * 2);
  }
  if (pressedKeys[KEYCODES.left]) {
    camera.position.z += (Math.sin(xRad) * d) - (d * 2);
    controls.target.z += (Math.sin(xRad) * d) - (d * 2);
  }
  if (pressedKeys[KEYCODES.right]) {
    camera.position.z -= (Math.sin(xRad) * d) - (d * 2);
    controls.target.z -= (Math.sin(xRad) * d) - (d * 2);
  }
  // console.log("dt", dt);
}

var update = function (dt) {
  resize();

  handleMovement(dt);

  camera.updateProjectionMatrix();

  controls.update(dt);
}

var render = function (dt) {
  effect.render(scene, camera);
}

var animate = function (t) {
  requestAnimationFrame(animate);
  var dt = clock.getDelta();

  update(dt);
  render(dt);
}

var fullscreen = function () {
  if (container.requestFullscreen) {
    container.requestFullscreen();
  } else if (container.msRequestFullscreen) {
    container.msRequestFullscreen();
  } else if (container.mozRequestFullScreen) {
    container.mozRequestFullScreen();
  } else if (container.webkitRequestFullscreen) {
    container.webkitRequestFullscreen();
  }
}

init();
animate();
