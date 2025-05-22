in vec2 vertex_texcoords;
uniform sampler2D scene_texture;
in vec2 blurTextureCoords[11];

void main() {
	vec4 out_colour = vec4(0.0);
	out_colour += texture(scene_texture, blurTextureCoords[0]) * 0.0093;
	out_colour += texture(scene_texture, blurTextureCoords[1]) * 0.028002;
	out_colour += texture(scene_texture, blurTextureCoords[2]) * 0.065984;
	out_colour += texture(scene_texture, blurTextureCoords[3]) * 0.121703;
	out_colour += texture(scene_texture, blurTextureCoords[4]) * 0.175713;
	out_colour += texture(scene_texture, blurTextureCoords[5]) * 0.198596;
	out_colour += texture(scene_texture, blurTextureCoords[6]) * 0.175713;
	out_colour += texture(scene_texture, blurTextureCoords[7]) * 0.121703;
	out_colour += texture(scene_texture, blurTextureCoords[8]) * 0.065984;
	out_colour += texture(scene_texture, blurTextureCoords[9]) * 0.028002;
	out_colour += texture(scene_texture, blurTextureCoords[10]) * 0.0093;

	gl_FragColor = vec4(out_colour.rgb, 1.0f);
}
