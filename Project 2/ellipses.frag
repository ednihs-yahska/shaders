#version 330 compatibility

in vec4  vColor;
in float vLightIntensity;
in vec2  vST;
in vec3 vMCPosition;
in float Z;

uniform float uAd;
uniform float uBd;
uniform float uTol;
uniform float uNoiseAmp;
uniform float uNoiseFreq;
uniform sampler3D Noise3;
uniform float uNoiseAlpha; 
uniform bool uUseChromaDepth;
uniform float uChromaRed;
uniform float uChromaBlue;

vec3
ChromaDepth( float t )
{
	t = clamp( t, 0., 1. );

	float r = 1.;
	float g = 0.0;
	float b = 1.  -  6. * ( t - (5./6.) );

        if( t <= (5./6.) )
        {
                r = 6. * ( t - (4./6.) );
                g = 0.;
                b = 1.;
        }

        if( t <= (4./6.) )
        {
                r = 0.;
                g = 1.  -  6. * ( t - (3./6.) );
                b = 1.;
        }

        if( t <= (3./6.) )
        {
                r = 0.;
                g = 1.;
                b = 6. * ( t - (2./6.) );
        }

        if( t <= (2./6.) )
        {
                r = 1.  -  6. * ( t - (1./6.) );
                g = 1.;
                b = 0.;
        }

        if( t <= (1./6.) )
        {
                r = 1.;
                g = 6. * t;
        }

	return vec3( r, g, b );
}

void
main( )
{
    float s = vST.s*2;
	float t = vST.t;
    float Ar = uAd / 2.;
    float Br = uBd / 2.;
    int numins = int(s / uAd);
    int numint = int(t / uBd);
    float sc = float(numins)*uAd + Ar;
    float tc = float(numint)*uBd + Br;
	float ds = s - sc;
	float dt = t - tc;
	vec3 stx = vec3(vST, vMCPosition.x);
	vec4 nv  = texture3D( Noise3, uNoiseFreq*stx );
	float n = nv.r + nv.g + nv.b + nv.a;    //  1. -> 3.
	n = n - 2.; 
	n*=uNoiseAmp;
	vec4 TheColor;

	float oldDist = sqrt( ds*ds + dt*dt );
	float newDist = n;
	float scale = (newDist+oldDist) / oldDist; 
	
	ds *= scale;
	ds /= Ar;
	dt *= scale;
	dt /= Br;

	float d = (ds*ds)+(dt*dt);

	if(uNoiseAlpha == 0.0 && d < 1){
		discard;
	}

    float sd = ((s-sc)/Ar)*((s-sc)/Ar);
    float td = ((t-tc)/Br)*((t-tc)/Br);


    vec4 uEllipseColor = vec4(1.0, 0.0, 0.0, 1.0*uNoiseAlpha);
    vec4 vColor = vec4(1.0, 1.0, 1.0, 1.0);
    vec4 yellow = vec4(1.0, 1.0, 0.0, 1.0);

	gl_FragColor = vColor;		// default color

    float tolerance = smoothstep( 1.-uTol, 1.+uTol, d );

	if(uUseChromaDepth){
		float t = (2./3.) * (Z - uChromaRed ) / ( uChromaBlue - uChromaRed );
		t = clamp( t, 0., 2./3. );
		//mix( uEllipseColor*ChromaDepth( t ), yellow, tolerance );
		TheColor = mix(uEllipseColor, vec4(ChromaDepth( t ), 1.0), tolerance );
	}else{
		TheColor = mix( uEllipseColor, yellow, tolerance );
	}

	gl_FragColor = TheColor*vLightIntensity;	// apply lighting model
}
