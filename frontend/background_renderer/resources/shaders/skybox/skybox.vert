#version 330 core
// vertex inputs
in vec3 vertexPosition;
in vec2 vertexTexCoord;
in vec3 vertexNormal;

uniform mat4 projection;
uniform mat4 view;

out vec3 vertex_position;

void main() {
	mat4 new_view = mat4(mat3(view));
	vec4 clip = projection * new_view * vec4(vertexPosition, 1.0f);

	vertex_position = vertexPosition;

	gl_Position = clip.xyww;
}
