import React, { Component } from 'react';
import * as THREE from 'three'
import { toCSG, fromCSG } from 'three-2-csg';

export default class CgiHanoiDisplay extends Component {
  constructor(props) {
    super(props);

    this.state = { towers: props.towers, _3data: {}};
    this.canvas = React.createRef();
    this.initScene = this.initScene.bind(this);
    this.animate = this.animate.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.basicSceneSetup = this.basicSceneSetup.bind(this);
    this.createPlatform = this.createPlatform.bind(this);
    this.createLights = this.createLights.bind(this);
    this.removeDisks = this.removeDisks.bind(this);
    this.createDisks = this.createDisks.bind(this);
    this.createIntersectionPlane = this.createIntersectionPlane.bind(this);
    this.resize = this.resize.bind(this);
    window.addEventListener('mouseup', (event)=>{
      this.onMouseUp(event);
    })
    window.addEventListener('resize', this.resize);

  }

  componentDidMount() {
    this.initScene();
  }

  componentWillReceiveProps(newProps) {
    //this function is called when the towers are changed
    //  the "fresh" variable determines if a move has been made yet
    //  if it has not then it means we're getting this function called because
    //  of a reset. here we remake the disks from scratch

    //otherwise it's being called because a move has been made. in that case
    //  we already handled it in the onMouseUp event
    if(newProps.fresh) {
      this.state.towers = newProps.towers ;
      this.removeDisks();
      this.createDisks();
    }
  }

  basicSceneSetup() {
    var renderer = new THREE.WebGLRenderer( { canvas: this.canvas.current, 
      antialias:true } );
    renderer.shadowMap.enabled	= true;
    renderer.shadowMap.type 		= THREE.PCFSoftShadowMap;
    
    
    var scene = new THREE.Scene();
    var camera = new THREE.OrthographicCamera( - 10, 10, 7, -7, - 100, 1000);
    camera.zoom = 10.0;
    camera.position.x = 25;
    camera.position.y = 15;
    camera.position.z = 20;
    camera.lookAt(1,0,0);
    camera.updateProjectionMatrix();


    
    //we don't want to store this stuff in this.state because we don't want to trigger a 
    //  re-render
    this._3data = { renderer, scene, camera } ;
    this.resize();

  }

  resize() {
    var height = .48*window.innerWidth > .8*window.innerHeight ? .8*window.innerHeight : .48*window.innerWidth;
    this._3data.renderer.setSize( 1.6 * height, height );
  }

  createPlatform() {
    var offWhiteMaterial = new THREE.MeshPhongMaterial( { color: "#eeefd0" } );
    var planeGeometry = new THREE.PlaneGeometry(300, 300);

    //make the floor
    var floor = new THREE.Mesh(planeGeometry, offWhiteMaterial);
    floor.rotation.x = -0.5 * Math.PI;
    floor.position.z = 0;
    floor.position.y = -.229;
    floor.position.x = 5.5;
    floor.receiveShadow = true;
    this._3data.scene.add(floor);

    //make the three tower things that the disc slide onto
    for(var i = 0; i < 3; i ++) {
      var cylinder = new THREE.Mesh( 
        new THREE.CylinderGeometry( .02, .02, .4, 32 ), 
        offWhiteMaterial  
      ); 

      cylinder.castShadow = true;
      cylinder.position.x = i;
      cylinder.position.y = -.1;
      this._3data.scene.add(cylinder);
    }
  }

  createLights() {
    var light = new THREE.DirectionalLight( 0xffffff, 0.2 );
    
    light.position.set( 5, 5, 3 );
    light.castShadow		= true;
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 10;
    light.shadow.camera.left = -5;
    light.shadow.camera.right = 5;
    light.shadow.camera.top = 5;
    light.shadow.camera.bottom = -5;
    light.shadow.bias = -.0001;
    light.distance = 50;
    light.shadow.mapSize.height = 2024;
    light.shadow.mapSize.width = 2024;
    this._3data.scene.add( light );

    var spotlight = new THREE.SpotLight(0xFFFFFF, .6);
 
  
    spotlight.position.set(-1, 3, 0);
    spotlight.castShadow = true;
    spotlight.intensity = .2;
    spotlight.angle = Math.PI / 2;
    spotlight.penumbra = 0;//0.55;
    spotlight.decay = 0;
    spotlight.distance = 3;
    spotlight.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(60, 1, 1, 2500));
    spotlight.shadow.mapSize.width = 2024;
    spotlight.shadow.mapSize.height = 2024;
    spotlight.shadow.camera.near = 1;
    spotlight.shadow.camera.far = 200;
    spotlight.shadow.camera.left = -5;
    spotlight.shadow.camera.right = 5;
    spotlight.shadow.camera.top = 5;
    spotlight.shadow.camera.bottom = -5;

    this._3data.scene.add(spotlight);

  
    var ambiColor = "#1c1c1c";
    var ambientLight = new THREE.AmbientLight(ambiColor, 5.);
    this._3data.scene.add(ambientLight);

  }
  removeDisks() {
    var data = this._3data;
    for(var i = 0; i < data.discs.length; i++) {
      for(var i2 = 0; i2 < data.discs[i].length; i2++) {
        data.scene.remove(data.discs[i][i2]);
      }
    }
    delete data.discs;
  }

  createDisks() {
    var discs = []; 
    for(var i = 0; i < this.state.towers.length; i++) {
      discs[i] = [];
      for(var i2 = 0; i2 < this.state.towers[i].length; i2++) {
        
        var outerGeometry =  new THREE.CylinderGeometry( 
          this.state.towers[i][i2]*.05, this.state.towers[i][i2]*.05, .05, 100 
        );

        var innerGeometry = new THREE.CylinderGeometry(
          .02,.02,.1,100
        );

        var outerCSG = toCSG(outerGeometry);
        var innerCSG = toCSG(innerGeometry);

        var subtractCSG = outerCSG.subtract(innerCSG);
        var discGeometry = fromCSG(subtractCSG);

        var disc = new THREE.Mesh(
          discGeometry,
          new THREE.MeshLambertMaterial( { color: "#ff0000" } ) 
        );
        //x position is same as tower number in array
        disc.position.x = i;
        //y position is height of disc times number of discs
        disc.position.y = -.2 + (i2*.05);
        disc.castShadow = true;
        disc.receiveShadow = true;
        this._3data.scene.add(disc);
        discs[i][i2] = disc;
      }
    }
    this._3data.discs = discs;
  }

  //this is a plane that doesnt get added to the scene, its used to calculate where the mouse
  //  location should be mapped onto the stage
  createIntersectionPlane() {
    var planeMaterial = new THREE.MeshPhongMaterial({
      color: 0xeeefd0
    });
    var planeGeometry = new THREE.PlaneGeometry(300, 300);
    this._3data.plane = new THREE.Mesh(planeGeometry, planeMaterial);
    
  }

  initScene() {
    this.basicSceneSetup();
    this.createPlatform();
    this.createLights();
    this.createDisks();
    this.createIntersectionPlane();

    this.animate();
  }

  animate() {
    //requestAnimationFrame( this.animate );
    var data = this._3data;

    // Render the scene
    data.renderer.render(data.scene, data.camera);
  
  }

  onMouseDown(event) {
    event.preventDefault();
    var data = this._3data;

    var mouse = new THREE.Vector2();
    var rect = this.canvas.current.getBoundingClientRect();
    mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
    mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;

    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, data.camera);
    //map mouse position onto the x-y plane, basically
    var intersection = raycaster.intersectObject(data.plane)[0].point;

    //allow for a wide margin of error on the intersection, just click in the realm of one of the towers
    var clickedTower = undefined; 
    if(intersection.y > -1.5 && intersection.y < .3) {
      if(intersection.x > -.6 && intersection.x < .4) {
        clickedTower = 0;
      }
      else if(intersection.x > .6 && intersection.x < 1.4) {
        clickedTower = 1;
      }
      else if(intersection.x > 1.6 && intersection.x < 2.4) {
        clickedTower = 2;
      }

    }
    if(clickedTower != undefined) {
      var tower = this.state.towers[clickedTower];
      if(tower.length > 0 ) {
        this.movingDisc = data.discs[clickedTower][tower.length-1];
        //we want the disc to render in front of everything else when we are 
        //  clicking and dragging it 
        this.movingDisc.material.depthTest = false; 
        this.movingDisc.receiveShadow = false;
        this.movingDisc.material.needsUpdate = true;

        this.movingFrom = clickedTower;
      }
    }

  }

  onMouseMove(event) {
    event.preventDefault();
    if(this.movingDisc) {
      var data = this._3data;
      var mouse = new THREE.Vector2();
      var rect = this.canvas.current.getBoundingClientRect();
      mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
      mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;
    
      var raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, data.camera);
  
      //if we are clicking and dragging a disk, then we want the disk position
      //  to match the mouse position (mapped onto x y plane)
      var intersection = raycaster.intersectObject(data.plane)[0].point;
      this.movingDisc.position.copy(intersection);

    }
    this.animate();

  }

  onMouseUp(event) {
    event.preventDefault();
    if(this.movingDisc) {
      var data = this._3data;
      var mouse = new THREE.Vector2();
      var rect = this.canvas.current.getBoundingClientRect();
      mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
      mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;
    
      var raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, data.camera);
  
      var intersection = raycaster.intersectObject(data.plane)[0].point;
      var movingTo = Math.round(intersection.x);
      if(movingTo > 2) movingTo = 2;
      else if(movingTo < 0) movingTo = 0;

      if(!this.props.move(this.movingFrom, movingTo)) {
        //if the move is invalid, move it back in place. 
        this.movingDisc.position.x = this.movingFrom;
        this.movingDisc.position.y = -.2 + ((this.state.towers[this.movingFrom].length -1 )*.05);
      }
      else {
        // if it is valid, move the disc
        data.discs[movingTo].push(data.discs[this.movingFrom].pop());

        this.movingDisc.position.x = movingTo;
        this.movingDisc.position.y = -.2 + ((this.state.towers[movingTo].length -1 )*.05);
      }
      this.movingDisc.material.depthTest = true;
      this.movingDisc.receiveShadow = true;
      this.movingDisc.material.needsUpdate = true;

      data.renderer.clearDepth();

    }
    
    this.movingDisc = undefined;
    this.animate();

  }

  render() {
    return <div id="hanoi-canvas-container" >
      <canvas 
        onMouseDown={this.onMouseDown } 
        onMouseMove={this.onMouseMove}
        id="hanoi-canvas"
        ref={this.canvas}>
      
      </canvas>
    </div>;
  }

}