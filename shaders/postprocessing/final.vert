out vec2 vertex_texcoords;

void main() {
	vertex_texcoords = uv;
	gl_Position = vec4(position, 1.0f);
}
