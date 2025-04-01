in vec3 vertex_position;

uniform samplerCube cube_map;

void main() {
	gl_FragColor = vec4(texture(cube_map, vertex_position).rgb, 1.0f);
}
