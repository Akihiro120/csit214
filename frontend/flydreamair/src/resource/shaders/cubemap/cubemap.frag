in vec3 vertex_position;

uniform samplerCube cube_map;

void main() {
	gl_FragColor = vec4(textureLod(cube_map, vertex_position, 1.2).rgb, 1.0f);
}
