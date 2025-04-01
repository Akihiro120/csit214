attribute vec4 tangent;

// vertex outputs
out vec3 vertex_normals;
out vec3 world_position;
out vec2 vertex_texcoords;
out vec3 vertex_tangents;
out mat3 tbn;
out vec4 light_space_matrix;

uniform mat4 light_matrix;

// transformation matrices
// per object

void main() {
	
	// vertex output
	vertex_normals = vec3(transpose(inverse(modelMatrix)) * vec4(normal, 1.0f));
	vertex_tangents = vec3(transpose(inverse(modelMatrix)) * vec4(tangent.rgb, 1.0));
	vertex_texcoords = uv;
	world_position = vec3(modelMatrix * vec4(position, 1.0f));
	light_space_matrix = light_matrix * vec4(world_position, 1.0f);

	vec3 T = normalize(vec3(modelMatrix * vec4(tangent.rgb, 0.0)));
	vec3 N = normalize(vec3(modelMatrix * vec4(normal, 0.0)));
	vec3 B = cross(N, T);
	tbn = transpose(mat3(T, B, N));

	// vertex position
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0f);
}
