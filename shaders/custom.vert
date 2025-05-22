out vec3 vertex_position;

void main() {
	vertex_position = position;

	mat4 new_view = mat4(mat3(viewMatrix));
	vec4 vert_pos = projectionMatrix * new_view * vec4(position, 1.0f);
	gl_Position = vert_pos.xyww;
}
