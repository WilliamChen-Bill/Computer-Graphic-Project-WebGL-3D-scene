function start() {

    // Get canvas, WebGL context
    var canvas = document.getElementById("mycanvas");
    var gl = canvas.getContext("webgl");

    // Sliders at center
    var slider1 = document.getElementById('slider1');
    slider1.value = 0;
    var slider2 = document.getElementById('slider2');
    slider2.value = 0;

    function draw_cube(){
        // Data ...
        // vertex positions
        var vertexPos = new Float32Array(
            [  1, 1, 1,  -1, 1, 1,  -1,-1, 1,   1,-1, 1,
                1, 1, 1,   1,-1, 1,   1,-1,-1,   1, 1,-1,
                1, 1, 1,   1, 1,-1,  -1, 1,-1,  -1, 1, 1,
                -1, 1, 1,  -1, 1,-1,  -1,-1,-1,  -1,-1, 1,
                -1,-1,-1,   1,-1,-1,   1,-1, 1,  -1,-1, 1,
                1,-1,-1,  -1,-1,-1,  -1, 1,-1,   1, 1,-1 ]);
                
        // vertex colors
        var vertexColors = new Float32Array(
            [  1, 0, 0,   1, 0, 0,   1, 0, 0,   1, 0, 0,
               0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1, 
               0, 1, 0,   0, 1, 0,   0, 1, 0,   0, 1, 0,
               1, 1, 0,   1, 1, 0,   1, 1, 0,   1, 1, 0,
               0, 1, 1,   0, 1, 1,   0, 1, 1,   0, 1, 1,
               1, 0, 1,   1, 0, 1,   1, 0, 1,   1, 0, 1,]);
                        
        // element index array
        var triangleIndices = new Uint8Array(
            [  0, 1, 2,   0, 2, 3,    // front
                4, 5, 6,   4, 6, 7,    // right
                8, 9,10,   8,10,11,    // top
                12,13,14,  12,14,15,    // left
                16,17,18,  16,18,19,    // bottom
                20,21,22,  20,22,23 ]); // back
            
        // we need to put the vertices into a buffer so we can
        // block transfer them to the graphics hardware
        var trianglePosBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertexPos, gl.STATIC_DRAW);
        trianglePosBuffer.itemSize = 3;
        trianglePosBuffer.numItems = 24;
        
        
        // a buffer for colors
        var colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertexColors, gl.STATIC_DRAW);
        colorBuffer.itemSize = 3;
        colorBuffer.numItems = 24;
        
        
        // a buffer for indices
        var indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangleIndices, gl.STATIC_DRAW);   
        
        // Read shader source
        var vertexSource = document.getElementById("vertexShader").text;
        var fragmentSource = document.getElementById("fragmentShader").text;

        // Compile vertex shader
        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader,vertexSource);
        gl.compileShader(vertexShader);
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(vertexShader)); return null; }
        
        // Compile fragment shader
        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader,fragmentSource);
        gl.compileShader(fragmentShader);
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(fragmentShader)); return null; }
        
        // Attach the shaders and link
        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialize shaders"); }
        gl.useProgram(shaderProgram);	    
            
            
        // with the vertex shader, we need to pass it positions
        // as an attribute - so set up that communication
        shaderProgram.PositionAttribute = gl.getAttribLocation(shaderProgram, "position");
        gl.enableVertexAttribArray(shaderProgram.PositionAttribute);
        shaderProgram.ColorAttribute = gl.getAttribLocation(shaderProgram, "normal");
        gl.enableVertexAttribArray(shaderProgram.ColorAttribute);    
        
        // this gives us access to the matrix uniform
        shaderProgram.normalMtrix = gl.getUniformLocation(shaderProgram,"normalMatrix");
        shaderProgram.modelViewMatrix = gl.getUniformLocation(shaderProgram,"modelViewMatrix");
        shaderProgram.projectionMatrix = gl.getUniformLocation(shaderProgram,"projectionMatrix");
        shaderProgram.time = gl.getUniformLocation(shaderProgram, "time")
        // Translate slider values to angles in the [-pi,pi] interval
        var angle1 = slider1.value*0.01*Math.PI;
        var angle2 = slider2.value*0.01*Math.PI;
	
        // Circle around the y-axis
        var eye = [400*Math.sin(angle1),150.0,400.0*Math.cos(angle1)];
        var target = [0,0,0];
        var up = [0,1,0];
	
        var tModel = mat4.create();
        mat4.fromScaling(tModel,[100,100,100]);
        mat4.rotate(tModel,tModel,angle2,[1,1,1]);
	
        var tCamera = mat4.create();
        mat4.lookAt(tCamera, eye, target, up);      

        var tProjection = mat4.create();
        mat4.perspective(tProjection,Math.PI/4,1,10,1000);
	
        var tMVP = mat4.create();
        mat4.multiply(tMVP,tCamera,tModel); // "modelView" matrix
        mat4.multiply(tMVP,tProjection,tMVP);
        var nMatrix = mat3.create();        
        var pMatrix = mat4.create();

        // Clear screen, prepare for rendering
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
        // Set up uniforms & attributes
        gl.uniformMatrix4fv(shaderProgram.projectionMatrix,false,pMatrix);
        gl.uniformMatrix4fv(shaderProgram.modelViewMatrix,false,tMVP);
        gl.uniformMatrix3fv(shaderProgram.normalMtrix,false,nMatrix);
        
        var t = new Date();
        gl.uniform1f(shaderProgram.time, t.getMilliseconds()/1000.0);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.vertexAttribPointer(shaderProgram.ColorAttribute, colorBuffer.itemSize,
			       gl.FLOAT,false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer);
        gl.vertexAttribPointer(shaderProgram.PositionAttribute, trianglePosBuffer.itemSize,
			       gl.FLOAT, false, 0, 0);
        
        var tX = -2.0, tY = -0.0, tZ = -0.0;
        var translation = gl.getUniformLocation (shaderProgram, "translation");
        gl.uniform3f(translation, tX, tY, tZ);
	    // Do the drawing
        gl.drawElements(gl.TRIANGLES, triangleIndices.length, gl.UNSIGNED_BYTE, 0);
        
    }
    
    function draw_triangle(){
        // Read shader source
        var vertexSource2 = document.getElementById("vertexShader2").text;
        var fragmentSource2 = document.getElementById("fragmentShader2").text;
        
        // Data ...
        
        // vertex positions
        var vPos = new Float32Array([   0.5, 0.5, 0.5,  
                                        -1, 1, 1,
                                        -1, -1, 1,  
                                        0, 0, 1.5 ]);
        // vertex colors
        var vColors = new Float32Array([ 1, 0, 0,   
                                         1, 0, 0,   
                                         1, 0, 0, 
                                         1, 0, 0  ]);
        // element index array
        var tIndices = new Uint8Array([ 0,1,2, 
                                        0,1,3,
                                        0,2,3,
                                        1,2,3 ]);
        
        // we need to put the vertices into a buffer so we can
        // block transfer them to the graphics hardware
        var tPosBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, tPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vPos, gl.STATIC_DRAW);
        tPosBuffer.itemSize = 3;
        tPosBuffer.numItems = 4;

        // a buffer for colors
        var cBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vColors, gl.STATIC_DRAW);
        cBuffer.itemSize = 3;
        cBuffer.numItems = 4;
        
        // a buffer for indices
        var iBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, tIndices, gl.STATIC_DRAW); 

        // Compile vertex shader
        var vertexShader2 = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader2,vertexSource2);
        gl.compileShader(vertexShader2);
        if (!gl.getShaderParameter(vertexShader2, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(vertexShader2)); return null; }
        
        // Compile fragment shader
        var fragmentShader2 = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader2,fragmentSource2);
        gl.compileShader(fragmentShader2);
        if (!gl.getShaderParameter(fragmentShader2, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(fragmentShader2)); return null; }
        
        // Attach the shaders and link
        var shaderProgram2 = gl.createProgram();
        gl.attachShader(shaderProgram2, vertexShader2);
        gl.attachShader(shaderProgram2, fragmentShader2);
        gl.linkProgram(shaderProgram2);
        if (!gl.getProgramParameter(shaderProgram2, gl.LINK_STATUS)) {
        alert("Could not initialize shaders"); }
        gl.useProgram(shaderProgram2);	    
        
        
        // with the vertex shader, we need to pass it positions
        // as an attribute - so set up that communication
        shaderProgram2.PositionAttribute = gl.getAttribLocation(shaderProgram2, "position");
        gl.enableVertexAttribArray(shaderProgram2.PositionAttribute);
        shaderProgram2.ColorAttribute = gl.getAttribLocation(shaderProgram2, "normal");
        gl.enableVertexAttribArray(shaderProgram2.ColorAttribute);    
        
        // this gives us access to the matrix uniform
        shaderProgram2.normalMtrix = gl.getUniformLocation(shaderProgram2,"normalMatrix");
        shaderProgram2.modelViewMatrix = gl.getUniformLocation(shaderProgram2,"modelViewMatrix");
        shaderProgram2.projectionMatrix = gl.getUniformLocation(shaderProgram2,"projectionMatrix");
        shaderProgram2.time = gl.getUniformLocation(shaderProgram2, "time")
        
        // Translate slider values to angles in the [-pi,pi] interval
        var angle1 = slider1.value*0.01*Math.PI;
        var angle2 = slider2.value*0.01*Math.PI;
	
        // Circle around the y-axis
        var eye = [400*Math.sin(angle1),150.0,400.0*Math.cos(angle1)];
        var target = [0,0,0];
        var up = [0,1,0];
	
        var tModel = mat4.create();
        mat4.fromScaling(tModel,[100,100,100]);
        mat4.rotate(tModel,tModel,angle2,[1,1,1]);
	
        var tCamera = mat4.create();
        mat4.lookAt(tCamera, eye, target, up);      

        var tProjection = mat4.create();
        mat4.perspective(tProjection,Math.PI/4,1,10,1000);
	
        var tMVP = mat4.create();
        mat4.multiply(tMVP,tCamera,tModel); // "modelView" matrix
        mat4.multiply(tMVP,tProjection,tMVP);
        var nMatrix = mat3.create();        
        var pMatrix = mat4.create();
        // Set up uniforms & attributes
        gl.uniformMatrix4fv(shaderProgram2.projectionMatrix,false,pMatrix);
        gl.uniformMatrix4fv(shaderProgram2.modelViewMatrix,false,tMVP);
        gl.uniformMatrix3fv(shaderProgram2.normalMtrix,false,nMatrix);
        
        var t = new Date();
        gl.uniform1f(shaderProgram2.time, t.getMilliseconds()/1000.0);

        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.vertexAttribPointer(shaderProgram2.ColorAttribute, cBuffer.itemSize,
                gl.FLOAT,false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, tPosBuffer);
        gl.vertexAttribPointer(shaderProgram2.PositionAttribute, tPosBuffer.itemSize,
                gl.FLOAT, false, 0, 0);
        
        var tX = -0.5, tY = 0.0, tZ = -1.0;
        var translation = gl.getUniformLocation (shaderProgram2, "translation");
        gl.uniform3f(translation, tX, tY, tZ);
        // Do the drawing
        gl.drawElements(gl.TRIANGLES, tIndices.length, gl.UNSIGNED_BYTE, 0);
    }

    // Scene (re-)draw routine
    function draw() {
        draw_cube();
        draw_triangle();
    }
    
    slider1.addEventListener("input",draw);
    slider2.addEventListener("input",draw);
    draw();
}

window.onload=start;



