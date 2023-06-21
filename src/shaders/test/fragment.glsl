uniform vec3 uColor;
uniform sampler2D uTexture;

varying vec2 vUv;
varying float vElevation;

void main() {
    // vec4 textureColor = texture2D(uTexture, vUv);
    // textureColor.rgb *= vElevation * 2.0 + 0.65;
    // gl_FragColor = textureColor;
    // gl_FragColor = vec4(vUv, 1.0, 1.0);

    // float brightness = dot(uColor.rgb, vec3(0.2126, 0.7152, 0.0722)); // Weights for human perception of brightness
    // float bloomAmount = clamp((brightness - 0.5) * 2.0, 0.0, 1.0) * 50.; // Simple bloom factor calculation
    // gl_FragColor = vec4(uColor.rgb + bloomAmount, 0.1);

    float dist = distance(vUv, vec2(0.5)); // compute distance from the center of the object
    float glowFactor = 1. * (1.0 - dist); // the glow decreases with the distance
    vec3 color = mix(uColor, uColor, glowFactor);
    gl_FragColor = vec4(color, 0.1);
}