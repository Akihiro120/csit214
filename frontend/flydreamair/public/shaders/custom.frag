precision highp float;
in vec3 vertex_position;

void main() {
	vec3 view_pos = normalize(vertex_position);
	float cos_theta = clamp(dot(view_pos, vec3(0.0f, 1.0f, 0.0f)), 0.0f, 1.0f);

	gl_FragColor = vec4(vec3(cos_theta), 1.0f);
}
