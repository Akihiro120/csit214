out vec3 vertex_position;

void main() {
	mat4 new_view = mat4(mat3(viewMatrix));
	vec4 clip = projectionMatrix * new_view * vec4(position, 1.0f);

	vertex_position = position;

	gl_Position = clip.xyww;
}
