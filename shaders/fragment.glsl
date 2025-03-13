uniform sampler2D oneTexture;

varying vec2 vertexUV;

void main(){
    texture2D(oneTexture, vertexUV);
    gl_FragColor = texture2D(oneTexture, vertexUV);
}