struct GlobalData {
    transform: mat4x4f,
    color: vec4f,
};

@group(0) @binding(0) var<uniform> global: GlobalData;

@vertex fn vs(
    @builtin(vertex_index) vertexIndex : u32
) -> @builtin(position) vec4f {
    let pos = array(
        vec2f( 0.0,  1),  // top center
        vec2f(-1, -1),  // bottom left
        vec2f( 1, -1)   // bottom right
    );

    return global.transform *vec4f(pos[vertexIndex], 0.0, 1.0);
}

@fragment fn fs() -> @location(0) vec4f {
    return global.color;
}