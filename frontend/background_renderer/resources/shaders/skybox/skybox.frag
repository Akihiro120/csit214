#version 330 core
layout (location = 0) out vec4 frag_color;

const float PI = 3.14159265359;
const float E = 2.71828182845904523536;
in vec3 vertex_position;

uniform vec3 light_direction;
uniform vec3 camera_position;

// atmosphere geometry
const float earth_radius = 6371e3;
const float atmosphere_radius = 6471e3;

// atmospheric scale heights
const float rayleigh_scale_height = 8e3;
const float mie_scale_height = 1.2e3;

// scattering strengths
const float rayleigh_strength = 1e-5;
const float mie_strength = 21e-6;
const float sun_intensity = 5.0;

// mie phase asymmetry
const float mie_g = 0.76;

// tone mapping
float exposure = 1.0f;
float gamma = 2.2f;

// simple exponent function
float get_density(float height, float scale_height) {
	height = max(height, 0.0);
	return exp(-height / scale_height);
}

// phase functions
float rayleigh_phase(float cos_theta) {
	return (3.0 / (16.0 * PI)) * (1.0 + cos_theta * cos_theta);
}

float mie_phase(float cos_theta) {
	float g2 = mie_g * mie_g;
	float num = (1.0 - g2) * (1.0 + cos_theta * cos_theta);
	float denom = (2.0 + g2) * pow(1.0 + g2 - 2.0 * mie_g * cos_theta, 1.5);
	return (3.0 / (8.0 * PI)) * num / denom;
}

vec3 tonemapACES(vec3 x) {
    return (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14);
}

void main() {
	// compute view direction
	vec3 view_dir = normalize(vertex_position);
	vec3 sun_dir = normalize(light_direction);
	vec3 camera_pos = camera_position + vec3(0.0f, 6371e3, 0.0);

	// ray sphere intersection
	float b = 2.0 * dot(camera_pos, view_dir);
	float c = dot(camera_pos, camera_pos) - atmosphere_radius * atmosphere_radius;
	float discriminant = b * b - 4.0 * c;
	if (discriminant < 0.0) {
		frag_color = vec4(0.0);
		return;
	}

	float sqrt_disc = sqrt(discriminant);
	float t0 = (-b - sqrt_disc) * 0.5;
	float t1 = (-b + sqrt_disc) * 0.5;
	float t_min = (t0 < 0.0) ? 0.0 : min(t0, t1);
	float t_max = max(t0, t1);

	float segment_length = t_max - t_min;
	if (segment_length <= 0.0) {
		frag_color = vec4(0.0);
		return;
	}

	// raymarch
	const int STEPS = 16;
	float step_size = segment_length / float(STEPS);
	vec3 accumulated_light = vec3(0.0f);
	float accumulated_rayleigh_depth = 0.0;
	float accumulated_mie_depth = 0.0;

	for (int i = 0; i < STEPS; i++) {
		// mid point
		float t = t_min + (float(i) + 0.5) * step_size;
		vec3 sample_pos = camera_pos + view_dir * t;

		// altitude
		float height = length(sample_pos) - earth_radius;
		height = max(height, 0.0);

		// compute density
		float rayleigh_density = get_density(height, rayleigh_scale_height);
		float mie_density = get_density(height, mie_scale_height);

		// optical depth
		float delta_rayleigh = rayleigh_density * step_size;
		float delta_mie = mie_density * step_size;

		// calculate extinction
		accumulated_rayleigh_depth += delta_rayleigh;
		accumulated_mie_depth += delta_mie;

		// calcualate phase
		float cos_theta = dot(view_dir, sun_dir);
		float phase_r = rayleigh_phase(cos_theta);
		float phase_m = mie_phase(cos_theta);

		vec3 lambda = vec3(680.0, 550.0, 440.0);
		float reference = 550.0;
		vec3 beta_r = rayleigh_strength * pow(lambda / reference, vec3(-4.0));
		vec3 beta_m = mie_strength * pow(lambda / reference, vec3(-0.84));

		// accumulate
		vec3 scatter_at_step = vec3(sun_intensity * 
		(beta_r * phase_r * delta_rayleigh +
		beta_m * phase_m * delta_mie));

		// extinction
		vec3 extinction = vec3(exp(-(beta_r * accumulated_rayleigh_depth
		+ beta_m * accumulated_mie_depth)));

		accumulated_light += scatter_at_step * extinction;
	}

	accumulated_light = vec3(1.0) - exp(-accumulated_light * exposure);
	// accumulated_light = tonemapACES(accumulated_light);
	frag_color = vec4(pow(accumulated_light, vec3(1.0 / 2.2)), 1.0);
}

