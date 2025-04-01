// vertex inputs
in vec3 vertex_normals;
in vec3 world_position;
in vec2 vertex_texcoords;

// uniforms
uniform vec3 light_direction;
uniform vec3 camera_position;
float PI = 3.14159265359;

uniform sampler2D albedo_texture;

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
	vec3 albedo = texture(albedo_texture, vertex_texcoords).rgb;
	vec3 L = normalize(light_direction);
	vec3 V = normalize(camera_position - world_position);
	vec3 H = normalize(V + L);
	vec3 N = normalize(vertex_normals);

	float roughness = 0.2;
	float metallic = 0.01f;

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

	vec3 ambient = vec3(0.05) * albedo * 1.0f;
	vec3 color = ambient + lo;
	color *= vec3(255, 202, 128) / vec3(255);
	color = color / (color + vec3(1.0f));
	color = pow(color, vec3(1.0 / 2.2));
	gl_FragColor = vec4(color, 1.0f);
}
