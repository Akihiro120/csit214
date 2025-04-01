in vec2 vertex_texcoords;
uniform sampler2D scene_texture;

float exposure = 1.5f;
float gamma = 2.2f;
float constrast = 1.25f;
float temperature = 1.0f;

float aces(float x) {
  const float a = 2.51;
  const float b = 0.03;
  const float c = 2.43;
  const float d = 0.59;
  const float e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

void main() {
	vec3 scene_color = texture(scene_texture, vertex_texcoords).rgb;
	// scene_color = vec3(1.0) - exp(-scene_color * exposure);
	scene_color.x = aces(scene_color.x);
	scene_color.y = aces(scene_color.y);
	scene_color.z = aces(scene_color.z);
	scene_color = pow(scene_color, vec3(1.0f / gamma));
	scene_color = (scene_color - 0.5f) * constrast + 0.5f;
	gl_FragColor = vec4(vec3(scene_color), 1.0f);
}
