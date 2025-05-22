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

uniform float time;

uniform sampler2D noise_map;

void main() {

	vec3 new_position = position;
	world_position = vec3(modelMatrix * vec4(position, 1.0f));
	float height = 0.0f;//sin(time * 1.0f + position.y * 3.0) * 0.1f;
	float frequency = 1.0f;
	float amplitude = 0.5f;
	float lacunarity = 2.0f;
	float persistence = 0.1f;
	for (int i = 0; i < 4; i++) {
		if (position.x < 0.0f) {
			height += sin(time * 2.0f + position.x * frequency) * amplitude * 1.5f;
		} else {
			height += sin(time * -2.0f + 3.141 + position.x * frequency) * amplitude * 1.5f;
		}
		height += sin(time * -1.0f + 3.141 + position.y * frequency) * amplitude;
		// height += sin(time * 1.0f + position.y * frequency) * amplitude;
		// height += sin(time * 1.0f + position.x * frequency * 2.0f) * amplitude;
		frequency *= lacunarity;
		amplitude *= persistence;
	}
	height /= 4.0f;

	new_position.z += height - 0.275f;

	// vertex output
	vertex_normals = vec3(transpose(inverse(modelMatrix)) * vec4(normal, 1.0f));
	vertex_tangents = vec3(transpose(inverse(modelMatrix)) * vec4(tangent.rgb, 1.0));
	vertex_texcoords = uv;
	light_space_matrix = light_matrix * vec4(world_position, 1.0f);

	vec3 T = normalize(vec3(modelMatrix * vec4(tangent.rgb, 0.0)));
	vec3 N = normalize(vec3(modelMatrix * vec4(normal, 0.0)));
	vec3 B = cross(N, T);
	tbn = transpose(mat3(T, B, N));

	// vertex new_position
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(new_position, 1.0f);
}
