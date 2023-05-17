# 3D-WebGL-Scene-Creation
## Project Overview
This project harnesses the power of WebGL to sculpt an interactive 3-dimensional scene. It incorporates self-authored shaders, uniquely designed models, and associated data such as vertex attributes, colors, normals, textures, etc., to deliver an immersive experience.

## Key Learning Outcomes
Through this project, we can gain a deep understanding of the WebGL API and the GLSL shading language intricacies. This includes defining and dispatching vertex attributes to the GPU, utilizing vertex colors, normals and texture coordinates, and employing textures to enrich visual aesthetics.

## Project Details
This project offers a unique challenge to create a 3D scene using the WebGL drawing API. While online tools such as shdr.bkcore.com can assist in certain areas, the primary responsibility for the following tasks lies with you:

- **Vertex and Fragment Shaders:** Author your own vertex and fragment shaders, ideally embedded within `<script>` blocks in the HTML code. You're encouraged to create multiple pairs of fragment/vertex shaders for different objects requiring unique shaders.

- **Shader Program Compilation:** Compile and link your shaders into a "program". Feel free to create multiple "programs" if you need different shader routines for different objects.

- **Vertex Attributes and Uniform Variables:** Define your own vertex attributes and uniform variables. This includes querying the linked program for attribute/uniform variables, defining associated data, dispatching it to the GPU, and executing all necessary operations for drawing.

- **Model Geometry:** Define the geometry of your model(s) by providing an indexed set of vertices that form triangles. Buffer this to the GPU and use it in a `drawElements()` call within the draw loop.

- **Transforms:** Create all necessary transforms for the shaders and dispatch them to the GPU, typically as "uniforms".

- **Z-buffer Visibility Mechanism:** Leverage the GPU's visibility query capabilities using the Z-buffer visibility mechanism.

- **Texture Images (Optional):** You can optionally choose to load texture images and provide texture coordinates for your models.

- **Polyhedral Objects:** Include at least one "polyhedral" object with multiple shaded polygonal facets. This ensures that the Z-buffer visibility algorithm is effectively leveraged.

- **Shading:** Implement diffuse and/or specular shading in your objects. It's unacceptable to have objects showing up as a single color without any variation due to lighting.

- **Vertex Attributes:** Use at least three different vertex attributes in your shader, for instance, position/color/normal, position/normal/texture-coordinates, etc.

- **Scene Dynamics:** There must be a provision to effect some change in the scene beyond just controlling the camera position. This could involve a modeling transform, motion along a curve, a hierarchical modeling structure, etc.

- **Camera Placement:** Provide a mechanism to adjust the camera's position relative to the scene.
