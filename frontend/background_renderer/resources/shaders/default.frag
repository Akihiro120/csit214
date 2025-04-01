// vertex inputs
in vec3 vertex_normals;
in vec3 world_position;
in vec2 vertex_texcoords;
in vec3 vertex_tangents;
in mat3 tbn;
in vec4 light_space_matrix;

// uniforms
uniform vec3 light_direction;
uniform vec3 camera_position;
float PI = 3.14159265359;

uniform sampler2D albedo_texture;
uniform sampler2D normal_texture;
uniform sampler2D ao_texture;
uniform sampler2D shadow_map;
uniform samplerCube cube_map;

float shadow_calculation(vec3 normal, vec3 light_dir) {

	vec3 proj_coords = light_space_matrix.xyz / light_space_matrix.w;
	proj_coords = proj_coords * 0.5 + 0.5;


	float closest_depth = texture(shadow_map, proj_coords.xy).r;
	float current_depth = proj_coords.z;

	float shadow = 0.0f;
	float bias = max(0.05 * (1.0 - dot(normal, light_dir)), 0.005);
	vec2 texel_size = 1.0 / vec2(textureSize(shadow_map, 0));
	for (int x = -1; x <= 1; x++) {
		for (int y = -1; y <= 1; y++) {
			float pcf_depth = texture(shadow_map, proj_coords.xy + vec2(x, y) * texel_size).r;
			shadow += current_depth - bias > pcf_depth ? 1.0 : 0.0;
		}
	}
	shadow /= 9.0;

	if (proj_coords.z > 1.0) {
		shadow = 0.0;
	}

	return shadow;
}

vec3 fresnel_schlick(float cos_theta, vec3 F0) {
	return F0 + (1.0 - F0) * pow(clamp(1.0 - cos_theta, 0.0f, 1.0f), 5.0);
}

float distribution_GGX(vec3 N, vec3 H, float roughness)
{
    float a      = roughness*roughness;
    float a2     = a*a;
    float NdotH  = max(dot(N, H), 0.0);
    float NdotH2 = NdotH*NdotH;
	
    float num   = a2;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = PI * denom * denom;
	
    return num / denom;
}

float geometry_schlick_GGX(float NdotV, float roughness)
{
    float r = (roughness + 1.0);
    float k = (r*r) / 8.0;

    float num   = NdotV;
    float denom = NdotV * (1.0 - k) + k;
	
    return num / denom;
}
float geometry_smith(vec3 N, vec3 V, vec3 L, float roughness)
{
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float ggx2  = geometry_schlick_GGX(NdotV, roughness);
    float ggx1  = geometry_schlick_GGX(NdotL, roughness);
	
    return ggx1 * ggx2;
}

void main() {

	// vec3 N = normalize(vertex_normals);	
	// vec3 N = texture(normal_texture, vertex_texcoords * vec2(2.0f)).rgb;
	// N = N * 2.0 - 1.0;
	vec3 N = normalize(vertex_normals);//normalize(N) * 0.5;

	vec3 I = normalize(world_position - camera_position);
	vec3 R = reflect(I, normalize(vertex_normals));

	vec3 albedo = vec3(1.0f, 0.0f, 0.0f);//texture(albedo_texture, vertex_texcoords).rgb;

	vec3 L = normalize(light_direction);
	vec3 V = normalize(camera_position - world_position);
	vec3 H = normalize(V + L);
	vec3 ao_v3 = texture(ao_texture, vec2(vertex_texcoords.x, vertex_texcoords.y)).rgb;
	float ao = ao_v3.r;

	float roughness = 0.25;
	float metallic = 0.4f;

	vec3 F0 = vec3(0.04);
	F0 = mix(F0, albedo, metallic);
	vec3 lo = vec3(0.0f);
	{
		float NDF = distribution_GGX(N, H, roughness);
		float G = geometry_smith(N, V, L, roughness);
		vec3 F = fresnel_schlick(max(dot(H, V), 0.0), F0);

		vec3 kS = F;
		vec3 kD = vec3(1.0 - kS);
		kD *= 1.0 - metallic;
		
		vec3 numerator = NDF * G * F;
		float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.0001f;
		vec3 specular = numerator / denominator;

		float NdotL = max(dot(N, L), 0.0);
		lo += (kD * albedo / PI + specular) * 3.14 * vec3(5.0) * NdotL;
	}

	vec3 reflection_map = texture(cube_map, R).rgb;
	vec3 ambient = vec3(0.1) * albedo;
	float shadow = shadow_calculation(N, L);
	vec3 color = ambient + ((lo + reflection_map) * (1.0 - shadow));
	gl_FragColor = vec4(color, 1.0f);
}
