in vec2 vertex_texcoords;
uniform sampler2D scene_texture;

void main() {
	vec3 scene_color = texture(scene_texture, vertex_texcoords).rgb;
	float brightness = dot(scene_color, vec3(0.2126, 0.7152, 0.0722));
	if (brightness > 1.0) {
		gl_FragColor = vec4(scene_color, 1.0f);
	} else {
		gl_FragColor = vec4(0.0f, 0.0f, 0.0f, 1.0f);
	}
}
