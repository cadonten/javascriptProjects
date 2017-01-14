function NNet ( ) {

	this.nLyrs = 0;
	this.o = [ ];
	this.n = [ ];
	this.w = [ ];
}


NNet.prototype = {

	constructor  : NNet,

	resize       : function ( pI_Layers = 2 ) {

		this.nLyrs = pI_Layers;

		this.o.push( [ ] );

		for ( var i = 0; i < this.nLyrs - 1; ++i ) {

			this.o.push( [ ] );
			this.n.push( [ ] );
			this.w.push( [ ] );
		}
	},

	resizeLayer  : function ( pI_LayerId, pI_Width ) {

		for ( var i = 0; i < pI_Width + ( pI_LayerId < this.w.length ? 1 : 0 ); ++i ) {

			this.o[ pI_LayerId ].push ( 0 );
		}

		if ( 0 < pI_LayerId ) {

			for ( var i = 0; i < pI_Width; ++i ) {

				this.n[ pI_LayerId - 1 ].push ( 0 );
			}
		}

		for ( var l = 0; l < this.o.length - 1; ++l ) {

			this.o[ l ][ this.o[ l ].length - 1 ] = 1;
		}
	},

	resizeWeights : function ( ) {

		for ( var l = 0; l < this.nLyrs - 1; ++l ) {

			for ( var f = 0; f < this.o[ l ].length; ++f ) {

				this.w[ l ].push ( [ ] );

				for ( var t = 0; t < this.o[ l + 1 ].length - ( l + 2 < this.o.length ? 1 : 0 ); ++t ) {

					this.w[ l ][ f ].push ( Math.random ( ) );
				}
			}
		}
	},

	remember      : function ( pAD_input ) {

		for ( var i = 0; i < this.o[ 0 ].length - 1; ++i ) {

			this.o[ 0 ][ i ] = pAD_input[ i ];
		}

		for ( var l = 0; l < this.n.length; ++l ) {

			for ( var n = 0; n < this.n[ l ].length; ++n ) {

				var
				s = 0;

				for ( var i = 0; i < this.o[ l ].length; ++i ) {

					s += this.o[ l ][ i ] * this.w[ l ][ i ][ n ];
				}

				this.n[ l ][ n ] = s;

				this.o[ l + 1 ][ n ] = 1 / ( 1 + Math.exp( -this.n[ l ][ n ] ) );
			}
		}

		return this.o[ this.n.length ] < .5 ? 0 : 1;
	}
}
