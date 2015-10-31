var camera, scene, renderer;
var effect, controls;
var element, container;
var unitHeight = 10;
var movementSpeed = 20;
var mapSideLength = 1000;

var sphereX;
var sphereZ;

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

  // controls = new THREE.OrbitControls(camera, element);
  // controls.rotateUp(Math.PI / 4);
  // controls.target.set(
  //   camera.position.x + 0.1,
  //   camera.position.y,
  //   camera.position.z
  // );
  // controls.noZoom = true;
  // controls.noPan = true;

  controls = new THREE.FlyControls(camera, element);
  controls.movementSpeed = movementSpeed;
  controls.rollSpeed = movementSpeed;
  // controls.domElement = container;
  controls.rollSpeed = Math.PI / 24;
  controls.autoForward = true;
  controls.dragToLook = false;

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

  var light = new THREE.HemisphereLight(Math.random() * 0x7777777, 0x000000, 0.6);
  scene.add(light);

  var groundLight = new THREE.DirectionalLight(Math.random() * 0xFFFFFF, Math.random() * 0.9);
  groundLight.position.set(0, 1, 0);
  groundLight.rotation.set(Math.PI * Math.random() * 2, Math.PI * Math.random() * 2, Math.PI * Math.random() * 2);
  scene.add(groundLight);

  var ambientColor = Math.random() * 0x777777;
  var ambientLight = new THREE.AmbientLight(ambientColor);
  scene.add(ambientLight);

  // Sunlight
  // var directionalLight = new THREE.DirectionalLight(Math.random() * 0xFFFFFF, Math.random() * 0.5);
  // directionalLight.position.set(Math.random() * 500 + 500, Math.random() * 500 + 500, Math.random() * 500 + 500);
  // directionalLight.rotation.set(Math.PI * Math.random() * 2, Math.PI * Math.random() * 2, Math.PI * Math.random() * 2);
  // scene.add(directionalLight);

  // for(var i = 0; i < 9; i++) {
  //   var pointLight = new THREE.PointLight(Math.random() * 0xFFFFFF, Math.random() * 0.5, Math.random() * mapSideLength, Math.random() * mapSideLength);
  //   pointLight.position.set(Math.random() * 500 + 500, Math.random() * 500 + 500, Math.random() * 500 + 500);
  //   // pointLight.rotation.set(Math.PI * Math.random() * 2, Math.PI * Math.random() * 2, Math.PI * Math.random() * 2);
  //   scene.add(pointLight);
  // }

  for(var i = 0; i < 3; i++) {
    var spotLight = new THREE.SpotLight(Math.random() * 0xFFFFFF, Math.random() * 0.5, Math.random() * mapSideLength, Math.random() * Math.PI / 2);
    spotLight.position.set(Math.random() * 500 + 500, Math.random() * 500 + 500, Math.random() * 500 + 500);

    spotLight.castShadow = true;

    spotLight.shadowMapWidth = 1024;
    spotLight.shadowMapHeight = 1024;

    spotLight.shadowCameraNear = 500;
    spotLight.shadowCameraFar = 4000;
    spotLight.shadowCameraFov = 30;

    // spotLight.rotation.set(Math.PI * Math.random() * 2, Math.PI * Math.random() * 2, Math.PI * Math.random() * 2);
    scene.add(spotLight);
  }

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

  var plane = new THREE.PlaneGeometry(mapSideLength, mapSideLength);
  var mesh = new THREE.Mesh(plane, material);
  mesh.rotation.x = -Math.PI / 2;
  scene.add(mesh);

  // world

  var pyramid = new THREE.CylinderGeometry(0, 10, 30, 4, 1);
  var cube = new THREE.BoxGeometry(10, 10, 10);
  var torus = new THREE.TorusKnotGeometry(10, 2, 50, 16);
  var dodecahedron = new THREE.DodecahedronGeometry(10, 0);

  var possibleGeometries = [
    pyramid,
    cube,
    // torus,
    dodecahedron
  ];

  var flatMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    specular: 0xffffff,
    shininess: 20,
    shading: THREE.FlatShading
  });

  for (var i = 0; i < 500; i++) {
    var geometry = possibleGeometries[parseInt(Math.random() * possibleGeometries.length)];
    var randomMesh = new THREE.Mesh(geometry, flatMaterial);
    randomMesh.position.x = (Math.random() - 0.5) * mapSideLength;
    randomMesh.position.y = (Math.random() - 0.5) * mapSideLength;
    randomMesh.position.z = (Math.random() - 0.5) * mapSideLength;
    randomMesh.updateMatrix();
    randomMesh.matrixAutoUpdate = false;
    scene.add(randomMesh);
  }

  sphereX = new THREE.Mesh(
    new THREE.SphereGeometry(5, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xFF0000 })
  );
  sphereX.position.y = 5;
  scene.add(sphereX);

  sphereZ = new THREE.Mesh(
    new THREE.SphereGeometry(5, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0x00FF00 })
  );
  sphereZ.position.y = 5;
  scene.add(sphereZ);

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
  sphereX.position.x += dt;
  sphereZ.position.z += dt;
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
