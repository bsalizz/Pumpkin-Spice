"""Builds the Vesperine 3D models and exports them as binary glTF.

Every model is generated from code, so the assets are reproducible and reviewable:

    LD_LIBRARY_PATH=<blender>/lib <blender>/blender --background --factory-startup \
        --python blender/build_models.py -- src/assets/models [--preview /tmp/models.png]

(`LD_LIBRARY_PATH` lets the glTF exporter find Blender's bundled meshoptimizer.)

Outputs:
    pumpkin.glb  Body, Stem, Tendril  - the heirloom "Rouge vif d'Etampes" of the story
    spices.glb   StarAnise, Cinnamon   - the ingredients orbiting the flacon

Colours are stored as per-vertex tints around white. The site multiplies them with its
own materials, so the pumpkin can still ripen and freeze at runtime.
"""

import math
import os
import random
import sys

import bmesh
import bpy
from mathutils import Matrix, Vector, noise

SEED = 31
TAU = math.tau


# --------------------------------------------------------------------------- helpers


def clear_scene():
    for collection in (bpy.data.objects, bpy.data.meshes, bpy.data.materials, bpy.data.lights, bpy.data.cameras):
        for block in list(collection):
            collection.remove(block)


def smoothstep(edge0, edge1, x):
    t = min(1.0, max(0.0, (x - edge0) / (edge1 - edge0)))
    return t * t * (3 - 2 * t)


def mix(a, b, t):
    return tuple(x + (y - x) * t for x, y in zip(a, b))


def to_object(name, bm, colours):
    """Writes a bmesh and one tint per vertex into a new, smooth-shaded object."""
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    attribute = mesh.color_attributes.new("Color", "BYTE_COLOR", "POINT")
    for index, colour in enumerate(colours):
        attribute.data[index].color_srgb = (*colour, 1.0)
    mesh.color_attributes.active_color = attribute
    mesh.shade_smooth()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    return obj


def sweep(bm, path, radius, section, rings, around, cap=True):
    """Sweeps a closed cross-section along a path with parallel-transported frames.

    `path(t)` returns a point, `radius(t)` a scale and `section(t, phi)` a radial factor.
    Returns the vertices ring by ring so callers can colour them.
    """
    points = [path(i / rings) for i in range(rings + 1)]
    tangent = (points[1] - points[0]).normalized()
    normal = tangent.orthogonal().normalized()
    grid = []
    for i, point in enumerate(points):
        t = i / rings
        if 0 < i < rings:
            new_tangent = (points[i + 1] - points[i - 1]).normalized()
        else:
            new_tangent = (points[min(i + 1, rings)] - points[max(i - 1, 0)]).normalized()
        axis = tangent.cross(new_tangent)
        if axis.length > 1e-6:
            angle = tangent.angle(new_tangent)
            normal = Matrix.Rotation(angle, 3, axis.normalized()) @ normal
        tangent = new_tangent
        binormal = tangent.cross(normal)
        ring = []
        for j in range(around):
            phi = TAU * j / around
            r = radius(t) * section(t, phi)
            offset = normal * (math.cos(phi) * r) + binormal * (math.sin(phi) * r)
            ring.append(bm.verts.new(point + offset))
        grid.append(ring)

    for i in range(rings):
        for j in range(around):
            k = (j + 1) % around
            bm.faces.new((grid[i][j], grid[i][k], grid[i + 1][k], grid[i + 1][j]))
    if cap:
        tip = bm.verts.new(points[-1] + tangent * radius(1.0) * 0.15)
        for j in range(around):
            bm.faces.new((grid[-1][j], grid[-1][(j + 1) % around], tip))
        grid.append([tip])
    return grid


# --------------------------------------------------------------------------- pumpkin

RIBS = 10
# Height of the stem cavity floor, where the stem and tendril emerge.
CAVITY = 0.64 * (1 - 0.46)
RIDGE = (1.0, 0.94, 0.86)
GROOVE = (0.5, 0.36, 0.26)
CROWN = (0.66, 0.62, 0.36)
BELLY = (1.0, 0.86, 0.55)


def build_body():
    rng = random.Random(SEED)
    lobes = [rng.uniform(0.965, 1.035) for _ in range(RIBS)]

    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=112, v_segments=72, radius=1.0)
    colours = []
    for vert in bm.verts:
        v = vert.co.normalized()
        angle = math.atan2(v.y, v.x)
        # Lobes are slightly uneven, like a real fruit.
        warped = angle + 0.035 * math.sin(angle * 3 + 0.7)
        rib = abs(math.cos(warped * RIBS / 2)) ** 0.42
        lobe_position = (warped / TAU * RIBS) % RIBS
        lobe_a = lobes[int(lobe_position) % RIBS]
        lobe_b = lobes[(int(lobe_position) + 1) % RIBS]
        bulge = lobe_a + (lobe_b - lobe_a) * smoothstep(0, 1, lobe_position % 1)

        height = abs(v.z)
        groove = (1 - rib) * (1 - height**3.2)
        radial = bulge * (1 - 0.13 * groove)
        radial += 0.012 * noise.noise(v * 3.1) + 0.004 * noise.noise(v * 11.0)

        top = v.z > 0
        pole = math.exp(-(((1 - height) * (4.2 if top else 5.0)) ** 2))
        squash = 0.64 * (1 - (0.46 if top else 0.3) * pole)
        vert.co = Vector((v.x * radial, v.y * radial, v.z * squash))

        crown = smoothstep(0.82, 0.99, v.z)
        belly = smoothstep(0.6, 0.95, -v.z)
        tint = mix(RIDGE, GROOVE, groove**0.8)
        tint = mix(tint, CROWN, crown * 0.85)
        tint = mix(tint, BELLY, belly * 0.6)
        speckle = 1 + 0.06 * noise.noise(v * 23.0)
        colours.append(tuple(min(1.0, c * speckle) for c in tint))

    return to_object("Body", bm, colours)


def build_stem(base_height):
    bend = Vector((0.16, 0.06, 0.0))

    def path(t):
        lift = 0.02 + 0.56 * t
        return Vector((0, 0, base_height + lift)) + bend * (t**2.2)

    def radius(t):
        flare = 0.11 * math.exp(-t * 11)
        tip = 0.012 * smoothstep(0.82, 1.0, t)
        return 0.072 - 0.012 * t + flare + tip

    def section(t, phi):
        twist = 0.9 * t
        return 1 + 0.16 * math.cos(6 * (phi + twist)) + 0.02 * noise.noise(Vector((phi * 2, t * 6, 0)))

    bm = bmesh.new()
    grid = sweep(bm, path, radius, section, rings=40, around=36)
    bm.verts.index_update()
    colours = [None] * len(bm.verts)
    green = (0.62, 0.72, 0.42)
    dry = (0.94, 0.84, 0.62)
    cut = (1.0, 0.95, 0.78)
    for i, ring in enumerate(grid):
        t = i / (len(grid) - 2)
        for vert in ring:
            ridge = 0.85 + 0.15 * noise.noise(vert.co * 40)
            tint = cut if len(ring) == 1 else mix(green, dry, smoothstep(0.35, 1.0, t))
            colours[vert.index] = tuple(c * ridge for c in tint)
    return to_object("Stem", bm, colours)


def build_tendril(base_height):
    def path(t):
        turns = 2.6 * t
        r = 0.1 + 0.32 * t
        lift = 0.05 + 0.24 * math.sin(t * math.pi) * (1 - 0.4 * t)
        return Vector((
            -0.05 - math.cos(turns * TAU) * r * 0.9,
            math.sin(turns * TAU) * r,
            base_height + lift,
        ))

    def radius(t):
        return 0.016 * (1 - 0.7 * t)

    bm = bmesh.new()
    sweep(bm, path, radius, lambda t, phi: 1.0, rings=140, around=8)
    colours = [(0.58, 0.66, 0.4)] * len(bm.verts)
    return to_object("Tendril", bm, colours)


# --------------------------------------------------------------------------- spices


def build_star_anise():
    rng = random.Random(SEED + 1)
    bm = bmesh.new()
    pod_tint = (0.62, 0.36, 0.22)
    seed_tint = (0.92, 0.68, 0.42)
    colours = []

    def ellipsoid(centre, size, rotation, tint, segments=(24, 14), shape=None):
        created = bmesh.ops.create_uvsphere(
            bm, u_segments=segments[0], v_segments=segments[1], radius=1.0
        )["verts"]
        for vert in created:
            local = vert.co.copy()
            if shape:
                local = shape(local)
            vert.co = rotation @ Vector((local.x * size.x, local.y * size.y, local.z * size.z)) + centre
            vert.index = len(colours)
            colours.append(tint)

    def pod_shape(p):
        # A boat: pointed tip, a seam that splits open on top.
        x = p.x
        taper = (1 - max(0.0, x) ** 2) ** 0.55
        seam = 0.55 * math.exp(-((p.y / 0.35) ** 2)) * max(0.0, p.z)
        return Vector((x, p.y * taper, (p.z - seam) * taper))

    for k in range(8):
        angle = TAU * k / 8 + rng.uniform(-0.05, 0.05)
        rotation = Matrix.Rotation(angle, 3, "Z") @ Matrix.Rotation(rng.uniform(-0.08, 0.08), 3, "X")
        reach = rng.uniform(0.95, 1.05)
        ellipsoid(rotation @ Vector((0.26 * reach, 0, 0)), Vector((0.26 * reach, 0.085, 0.075)),
                  rotation, pod_tint, shape=pod_shape)
        ellipsoid(rotation @ Vector((0.2 * reach, 0, 0.035)), Vector((0.06, 0.035, 0.03)),
                  rotation, seed_tint, segments=(12, 8))
    ellipsoid(Vector((0, 0, 0.0)), Vector((0.07, 0.07, 0.06)), Matrix.Identity(3), pod_tint)

    for vert in bm.verts:
        grain = 0.8 + 0.2 * noise.noise(vert.co * 30)
        colours[vert.index] = tuple(c * grain for c in colours[vert.index])
    bm.verts.sort(key=lambda vert: vert.index)
    return to_object("StarAnise", bm, colours)


def build_cinnamon():
    """A quill of rolled bark: an Archimedean spiral extruded along its length."""
    bm = bmesh.new()
    turns = 2.3
    steps = 64
    thickness = 0.016
    length = 1.0
    slices = 24
    outline = []
    for i in range(steps + 1):
        theta = turns * TAU * i / steps
        r = 0.035 + 0.022 * theta / TAU
        outline.append((theta, r + thickness / 2, True))
    for i in range(steps, -1, -1):
        theta = turns * TAU * i / steps
        r = 0.035 + 0.022 * theta / TAU
        outline.append((theta, r - thickness / 2, False))

    outside = (0.62, 0.36, 0.2)
    inside = (0.86, 0.6, 0.4)
    colours = []
    grid = []
    for s in range(slices + 1):
        y = (s / slices - 0.5) * length
        ring = []
        for theta, r, outer in outline:
            bark = 1 + 0.06 * noise.noise(Vector((theta * 1.3, y * 18, 0)))
            ring.append(bm.verts.new((math.cos(theta) * r * bark, y, math.sin(theta) * r * bark)))
            streak = 0.85 + 0.15 * noise.noise(Vector((theta * 4, y * 3, 1)))
            colours.append(tuple(c * streak for c in (outside if outer else inside)))
        grid.append(ring)
    count = len(outline)
    for s in range(slices):
        for j in range(count):
            k = (j + 1) % count
            bm.faces.new((grid[s][j], grid[s][k], grid[s + 1][k], grid[s + 1][j]))
    for ring, reverse in ((grid[0], True), (grid[-1], False)):
        for j in range(steps):
            quad = (ring[j], ring[j + 1], ring[count - 2 - j], ring[count - 1 - j])
            bm.faces.new(tuple(reversed(quad)) if reverse else quad)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return to_object("Cinnamon", bm, colours)


# --------------------------------------------------------------------------- export


def export(path, objects):
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        use_selection=True,
        export_yup=True,
        export_apply=True,
        export_normals=True,
        export_texcoords=False,
        export_materials="NONE",
        export_vertex_color="ACTIVE",
        export_extras=False,
        # Meshopt-compressed buffers; the site decodes them with three's MeshoptDecoder.
        export_meshopt_compression_enable=True,
    )


def build(out_dir):
    os.makedirs(out_dir, exist_ok=True)
    clear_scene()
    body = build_body()
    stem = build_stem(CAVITY)
    tendril = build_tendril(CAVITY)
    export(os.path.join(out_dir, "pumpkin.glb"), [body, stem, tendril])

    anise = build_star_anise()
    cinnamon = build_cinnamon()
    export(os.path.join(out_dir, "spices.glb"), [anise, cinnamon])
    return {
        obj.name: {"vertices": len(obj.data.vertices), "faces": len(obj.data.polygons)}
        for obj in (body, stem, tendril, anise, cinnamon)
    }


# --------------------------------------------------------------------------- preview


def preview_material(name, base, roughness):
    """Multiplies the vertex tints with a base colour, as the site's materials do."""
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    nodes, links = material.node_tree.nodes, material.node_tree.links
    bsdf = nodes["Principled BSDF"]
    tint = nodes.new("ShaderNodeVertexColor")
    tint.layer_name = "Color"
    multiply = nodes.new("ShaderNodeMix")
    multiply.data_type = "RGBA"
    multiply.blend_type = "MULTIPLY"
    multiply.inputs["Factor"].default_value = 1.0
    multiply.inputs["A"].default_value = (*base, 1.0)
    links.new(tint.outputs["Color"], multiply.inputs["B"])
    links.new(multiply.outputs["Result"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = roughness
    return material


def render_preview(path):
    """Stages the built models under warm studio light and renders a still for review."""
    skin = preview_material("Skin", (0.69, 0.12, 0.012), 0.45)
    stalk = preview_material("Stalk", (0.075, 0.045, 0.012), 0.85)
    spice = preview_material("Spice", (0.35, 0.12, 0.04), 0.7)
    staging = {
        "Body": (skin, (0, 0, 0), (0, 0, 0), 1.0),
        "Stem": (stalk, (0, 0, 0), (0, 0, 0), 1.0),
        "Tendril": (stalk, (0, 0, 0), (0, 0, 0), 1.0),
        "StarAnise": (spice, (1.45, -1.6, -0.2), (1.0, 0.15, 0.3), 1.6),
        "Cinnamon": (spice, (-1.55, -1.2, -0.35), (0.3, 0.0, 1.2), 1.0),
    }
    for name, (material, location, rotation, scale) in staging.items():
        obj = bpy.data.objects[name]
        obj.data.materials.append(material)
        obj.location, obj.rotation_euler, obj.scale = location, rotation, (scale,) * 3

    scene = bpy.context.scene
    camera = bpy.data.objects.new("Camera", bpy.data.cameras.new("Camera"))
    camera.location = (0, -6.2, 2.2)
    camera.rotation_euler = (math.radians(73), 0, 0)
    scene.collection.objects.link(camera)
    scene.camera = camera
    for name, location, energy, colour in (
        ("Key", (3, -3, 4), 900, (1, 0.85, 0.7)),
        ("Rim", (-3, 3, 2), 700, (1, 0.45, 0.15)),
        ("Fill", (-4, -4, 1), 150, (0.6, 0.7, 1)),
    ):
        light = bpy.data.lights.new(name, "AREA")
        light.energy, light.color, light.size = energy, colour, 3
        obj = bpy.data.objects.new(name, light)
        obj.location = location
        obj.rotation_euler = (-Vector(location)).to_track_quat("-Z", "Y").to_euler()
        scene.collection.objects.link(obj)

    scene.world = scene.world or bpy.data.worlds.new("World")
    scene.world.use_nodes = True
    scene.world.node_tree.nodes["Background"].inputs[0].default_value = (0.02, 0.008, 0.004, 1)
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x, scene.render.resolution_y = 1280, 720
    scene.render.filepath = path
    bpy.ops.render.render(write_still=True)


if __name__ == "__main__":
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    print(build(argv[0] if argv else "src/assets/models"))
    if "--preview" in argv:
        render_preview(argv[argv.index("--preview") + 1])
