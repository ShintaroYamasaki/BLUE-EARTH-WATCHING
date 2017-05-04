//シーンの作成
var scene = new THREE.Scene();

canvas = document.getElementById('canvas');

//シーンの大きさ
var scene_w  = canvas.clientWidth;//横
var scene_h = canvas.clientHeight;//縦

//window.alert(scene_h);
// Init renderer
var renderer = new THREE.WebGLRenderer({ antialias:true, alpha: true });
renderer.setSize( scene_w, scene_h );
renderer.setClearColor(0x000000, 0);//背景色
canvas.appendChild(renderer.domElement);//最後に生成した要素を追加

// Camera setting
var fov    = 60; //画角
var aspect = scene_w / scene_h; //撮影の縦横比
var near   = 1; //nearより近い領域は表示されない
var far    = 2000; //farより遠い領域は表示されない
var camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
camera.position.set(200, 100, 300 );//カメラ位置

// Add light
var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
directionalLight.position.set(0, 100,30);
scene.add( directionalLight );

// Add AmbientLight
light = new THREE.AmbientLight(0xFFFFFF);
scene.add(light);

// Track ball
trackball = new THREE.TrackballControls(camera);
trackball.minDistance = 200;
trackball.maxDistance = 300;
trackball.noPan = false;


var rayReceiveObjects = []

// Prepare earth texture
textures = []
function loadTextures(num, callback) {
	if (num > 0) {
		loader = new THREE.TextureLoader();
		imagePath = "/images/earth_lv" + num + ".jpg"
		loader.load(imagePath, function(texture) {
			textures[num - 1] = texture
			loadTextures(num - 1, callback)
		});
	} else {
		callback()
	}
}
loadTextures(7, function() {
	createEarth(textures[0]);

	render();
});

var sphereEarth;

// Create earth
function createEarth(texture) {
	sphereEarth = new THREE.Mesh(
		new THREE.SphereGeometry(80, 20, 20),
		new THREE.MeshLambertMaterial({
			map: texture
		})
	);
	sphereEarth.position.set(0, 0, 0);
	scene.add(sphereEarth);
	rayReceiveObjects.push(sphereEarth);

	loader = new THREE.TextureLoader();
	imagePath = "/images/pin.png"
	loader.load(imagePath, function(texture) {
		// Pin
		//var pinGeometry = new THREE.SphereGeometry(1);
		var pinGeometry = new THREE.PlaneGeometry(8, 8);
		var pinMaterial = new THREE.MeshBasicMaterial({
			map : texture
		});
		// Osaka position
		var vector = new THREE.Vector3(-47, 49,-46);
		//vector.unproject(sphereEarth.position);
		var pin1 = new THREE.Mesh(pinGeometry, pinMaterial)
		pin1.position.set(vector.x, vector.y, vector.z)
		//pin1.rotation.z = 45 * Math.PI / 180;
		scene.add(pin1)
		var pin2 = new THREE.Mesh(pinGeometry, pinMaterial)
		pin2.position.set(vector.x, vector.y, vector.z)
		//pin2.rotation.z = 45 * Math.PI / 180;
		pin2.rotation.y = 180 * Math.PI / 180;
		scene.add(pin2)
	});
};

var sun_count = 0

// Touch Event
function touchEvent() {
	renderer.domElement.addEventListener('mousedown', function(e){
		var mouse_x =   ((e.pageX-e.target.offsetParent.offsetLeft) / renderer.domElement.width)  * 2 - 1;
		var mouse_y = - ((e.pageY-e.target.offsetParent.offsetTop) / renderer.domElement.height) * 2 + 1;
		var vector = new THREE.Vector3(mouse_x, mouse_y, 0.5);
		vector.unproject(camera);

		var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
		var obj = ray.intersectObjects(rayReceiveObjects);

		if(obj.length > 0){
			console.log("clicked: " + obj[0].point.x + ", " + obj[0].point.y + "," + obj[0].point.z)
            // osaka point
            if (
                (obj[0].point.x < -25 && obj[0].point.x > -59) &&
                (obj[0].point.y > 33 && obj[0].point.y < 57) &&
                (obj[0].point.z < -34 && obj[0].point.z > -58)
            ) {
                location.href = '/sealevel/index.html' + '?level=' + sun_count + '&city=osaka'
                console.log('click osaka')
            }
            // houston point
            else if (
                false
            ) {
                location.href = '/sealevel/index.html' + '?level=' + sun_count + '&city=houston'
                console.log('click houston')
            }
		}

	}, false);
}


function render() {
	touchEvent();
	renderer.render(scene, camera);
}

// Animation
( function renderLoop () {
	requestAnimationFrame( renderLoop );

	renderer.render( scene, camera );
	trackball.update();
} )();


// Each params
meters = [0, 50, 100, 150, 200, 250, 300]
degrees = [0, 350, 700, 1050, 1400, 1750, 2100]
// params
//document.getElementById("params").innerHTML = "meter: +" + meters[0] + " m<br>" + "degree: +" + degrees[0] + " deg C";
document.getElementById("params").innerHTML = "meter: +" + meters[0] + " m";


////// Sun Button //////
sun_button = document.getElementById('sun_button');
sun_count = 0
sun_current_size = 80
sun_init_size = sun_current_size
sun_button.style.backgroundSize = "" + sun_current_size + "px"
sun_button.style.height = "" + sun_current_size + "px"
sun_button.style.width = "" + sun_current_size + "px"
sun_button.style.backgroundImage = "url(/images/sun_lv1.png)"

sun_button.onclick = function () {
	sun_count += 1
	sun_current_size = sun_current_size * 1.1
	if (sun_count == 7) {
		sun_count = 0
		sun_current_size = sun_init_size
	}
	console.log(sun_current_size)
	file_count = sun_count + 1
	sun_button.style.backgroundSize = "" + sun_current_size + "px"
	sun_button.style.height = "" + sun_current_size + "px"
	sun_button.style.width = "" + sun_current_size + "px"
	sun_button.style.backgroundImage = "url(/images/sun_lv" + file_count + ".png)"
	// Change earth texture
	sphereEarth.material = new THREE.MeshLambertMaterial({
		map: textures[sun_count]
	})
	// Change labels
	// prams
	//document.getElementById("params").innerHTML = "meter: +" + meters[sun_count] + " m<br>" + "degree: +" + degrees[sun_count] + " deg C";
	document.getElementById("params").innerHTML = "meter: +" + meters[sun_count] + " m";
	console.log("Sun: Lv." + sun_count)
};



////// Reset Button //////
reset_button = document.getElementById('reset_button')
reset_button.onclick = function() {
	sun_count = 0
	sun_current_size = sun_init_size
	sun_button.style.backgroundSize = "" + sun_current_size + "px"
	sun_button.style.height = "" + sun_current_size + "px"
	sun_button.style.width = "" + sun_current_size + "px"
	sun_button.style.backgroundImage = "url(/images/sun_lv1.png)"
	sphereEarth.material = new THREE.MeshLambertMaterial({
		map: textures[0]
	})
	document.getElementById("params").innerHTML = "meter: +" + meters[0] + " m<br>" + "degree: +" + degrees[0] + " deg C";

	trackball.reset()
}
