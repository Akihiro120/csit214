out vec2 vertex_texcoords;
uniform float target_height;
out vec2 blurTextureCoords[11];

void main() {
	vertex_texcoords = uv;
	vec2 center_tex_coords = position.xy * 0.5 + 0.5;
	float pixelSize = 1.0 / target_height;

	for (int i = -5; i <= 5; i++) {
		blurTextureCoords[i + 5] = center_tex_coords + vec2(float(i) * pixelSize, 0.0f);
	}

	gl_Position = vec4(position.xy, 0.0, 1.0f);
}
