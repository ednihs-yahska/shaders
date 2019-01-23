#version 330 compatibility

in vec4  vColor;
in float vLightIntensity;
in vec2  vST;

uniform float uAd;
uniform float uBd;
uniform float uTol;



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

	
    float sd = ((s-sc)/Ar)*((s-sc)/Ar);
    float td = ((t-tc)/Br)*((t-tc)/Br);

    vec4 uEllipseColor = vec4(1.0, 0.0, 0.0, 1.0);
    vec4 vColor = vec4(1.0, 1.0, 1.0, 1.0);
    vec4 yellow = vec4(1.0, 1.0, 0.0, 1.0);

	gl_FragColor = vColor;		// default color

	if( (sd + td) > 1 )
	{
		gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
	}else{
        float t = smoothstep( 1.-uTol, 1.+uTol, (sd + td) );
		gl_FragColor = mix( uEllipseColor, yellow, t );
    }
	gl_FragColor.rgb *= vLightIntensity;	// apply lighting model
}
