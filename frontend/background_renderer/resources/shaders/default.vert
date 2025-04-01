// vertex outputs
out vec3 vertex_normals;
out vec3 world_position;
out vec2 vertex_texcoords;

// transformation matrices
// per object

void main() {
	
	// vertex output
	vertex_normals = vec3(transpose(inverse(modelMatrix)) * vec4(normal, 1.0f));
	vertex_texcoords = uv;
	world_position = vec3(modelMatrix * vec4(position, 1.0f));

	// vertex position
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0f);
}
