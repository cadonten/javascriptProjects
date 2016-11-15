
var Const = { 
	
	SPHERE : 0,
	PLANE : 1
 };

function PhysObj ( mesh, stc, typus, bound ){
	
	this.typus = typus;
	this.bound = bound;
	this.mesh = mesh;
	this.stc = stc;
	this.vel = new THREE.Vector3();
	this.acc = new THREE.Vector3();
	this.phi = new THREE.Vector3();
	this.dphi = new THREE.Vector3();
	this.ddphi = new THREE.Vector3();
	this.mass = 1;
	
	if ( this.typus == 0){
		this.bound = this.mesh.geometry.parameters.radius;
	}
	else if ( this.typus == 1){
		this.bound = Math.abs(this.mesh.geometry.vertices[0].x);
	}
}

PhysObj.prototype = {
	
	move : function(dt)	{
		
		var dp = this.vel.clone().multiplyScalar(dt);
		var dv = this.acc.clone().multiplyScalar(dt);
		
		this.mesh.position.add(dp);
		this.vel.add(dv);
		
	}, 
	accel : function(dt){
		
		this.acc.set (0, -.8*this.mesh.position.y, 0);
	},
	init : function (  mass, pos, vel ){
		this.vel = vel;
		this.mass = mass;
		this.mesh.position.copy(pos);
	},
	intrscBound : function ( physObj ){
				
		return this.mesh.position.clone( ).sub( physObj.mesh.position ).length() < this.bound + physObj.bound  >.0001;
	},
	intrs : function( physObj ){
		
		if ( !this.intrscBound( physObj ) ) {
			
			return false;
		}			
	
		switch ( this.typus ) {
		
			case Const.SPHERE : {
					
				if ( this.intrsSphere( physObj ) && physObj.typus == 1){
					this.SpheretoPlane( physObj );
					return;
				}
				else if ( this.intrsSphere( physObj) && physObj.typus == 0 ) {
					this.SpheretoSphere( physObj );
					return;
				}
			}
			
			case Const.PLANE : {
			
				//return this.intrsPlane( physObj );
			}
			default : return false;
		}
		return false;
	},
	
};

function PhysSphere ( mesh, stc){
	
	PhysObj.call (this, mesh, stc, Const.SPHERE);
}

PhysSphere.prototype = new PhysObj;
PhysSphere.prototype.constructor = PhysSphere;

PhysSphere.prototype.intrsSphere = function( physObj ){
	
	switch ( physObj.typus ) {
		
		case Const.SPHERE : {
			return true;
		}
		case Const.PLANE: {
			
			var e = physObj.mesh.matrix.elements;
			var u = new THREE.Vector3( e[0], e[1], e[2] );
			var v = new THREE.Vector3( e[4], e[5], e[6] );
			var n = new THREE.Vector3( e[8], e[9], e[10] );
			
			u.multiplyScalar(Math.abs(physObj.mesh.geometry.vertices[0].x) + .5*this.mesh.geometry.parameters.radius );
			v.multiplyScalar(Math.abs(physObj.mesh.geometry.vertices[0].y) + .5*this.mesh.geometry.parameters.radius );
			var dist = physObj.mesh.position.clone().sub(this.mesh.position);
			var c = n.dot(dist);
			if (Math.abs(c) > this.mesh.geometry.parameters.radius || c == 0)
				return false;
			
			var a = u.dot(dist)/u.dot(u);
			var b = v.dot(dist)/v.dot(v);
					
			if ( Math.abs(a) < 1. && Math.abs(b) < 1. ) 
				return true;
			
			break;
		}
		default : break;
	}
}

PhysSphere.prototype.SpheretoPlane = function ( physObj ){
	
	var e = physObj.mesh.matrix.elements;
	var n = new THREE.Vector3( e[8], e[9], e[10] ).normalize();
	
	var scale = this.vel.dot(n);
	n.multiplyScalar(-2*scale);
	this.vel.add(n);
}

PhysSphere.prototype.SpheretoSphere = function ( physObj ){
	
	var dist = this.mesh.position.clone().sub(physObj.mesh.position);
	var distr = physObj.mesh.position.clone().sub(this.mesh.position);
	dist.normalize();
	distr.normalize();
	
	vrad1 = dist.clone().multiplyScalar( this.vel.dot(dist) );
	vrad2 = distr.clone().multiplyScalar( physObj.vel.dot(distr) );
	
	var vtang1 = this.vel.clone().sub( vrad1 );
	var vtang2 = physObj.vel.clone().sub( vrad2 );
	
	var crad1 = ( this.mass * vrad1.length() + physObj.mass*( 2*vrad2.length() - vrad1.length() ) )/(this.mass + physObj.mass);
	var crad2 = ( physObj.mass * vrad2.length() + this.mass*( 2*vrad1.length() - vrad2.length() ) )/(this.mass + physObj.mass);
	
	vrad2.normalize().multiplyScalar(crad1);
	vrad1.normalize().multiplyScalar(crad2);
	
	var vnew1 = vrad2.add( vtang1 );
	var vnew2 = vrad1.add( vtang2 );
	
	this.vel = vnew1;
	physObj.vel = vnew2;
	this.mesh.position.x = this.mesh.position.x -.5;
}

function PhysPlane ( mesh, stc ){
	
	PhysObj.call (this, mesh, stc, Const.PLANE );
}

PhysPlane.prototype = new PhysObj;
PhysPlane.prototype.constructor = PhysPlane;

PhysPlane.prototype.intrsPlane = function( physObj ){
	
	switch ( physObj.typus ) {
		
		case Const.SPHERE : {
			
				
			break;
		}
		case Const.PLANE: {
		
			break;
		}
		default : break;
	}
}

function Physics ( ){
	
	this.objs = [];
}

Physics.prototype = {
	
	add : function( object ){
		
		this.objs.push( object );
	},
	run : function ( dt ){
		
		for ( var i = 0; i < this.objs.length; i++ ){
			
			this.objs[i].accel(dt);
		}
		for ( var i = 0; i < this.objs.length; i++ ){
			
			this.objs[i].move(dt);
		}
		for ( var i = 0; i < this.objs.length; i++ ){
			for ( var j = i+1; j < this.objs.length; j++ ){
			
				this.objs[i].intrs( this.objs[j] );
			}
		}
	}
}
