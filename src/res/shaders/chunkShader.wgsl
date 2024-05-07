struct GlobalData {
    projView: mat4x4f,
    view: mat4x4f,
    proj: mat4x4f,
};

struct Vertex {
    @location(0) pos: vec3f,
    @location(1) uv: vec2f,
    @location(2) tex: f32
};

struct VertOutput {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f
};

@group(0) @binding(0) var<uniform> global: GlobalData;

@vertex fn vs(
    vert : Vertex
) -> VertOutput {
    var vsOut : VertOutput;

    vsOut.position = global.projView *vec4f(vert.pos, 1.0);
    vsOut.color = vec4f(vert.tex / 10);

    return vsOut;
}

@fragment fn fs(fragIn: VertOutput) -> @location(0) vec4f {
    return fragIn.color;
}