// Enhanced WebGL fire shader for DOOM title screen
class FireShader {
    constructor() {
        this.canvas = null;
        this.gl = null;
        this.program = null;
        this.animationId = null;
        this.startTime = Date.now();
        this.uniforms = {};
        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupWebGL();
        this.setupShaders();
        this.setupGeometry();
        this.setupUniforms();
        this.startAnimation();
        
        window.addEventListener('resize', () => this.resize());
    }

    setupCanvas() {
        this.canvas = document.getElementById('fire-canvas');
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'fire-canvas';
            const container = document.querySelector('.fire-container');
            if (container) {
                container.appendChild(this.canvas);
            }
        }
        this.resize();
    }

    setupWebGL() {
        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        if (!this.gl) {
            console.error('WebGL not supported');
            return;
        }
        
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    setupShaders() {
        const vertexShaderSource = `
            attribute vec2 a_position;
            attribute vec2 a_texCoord;
            varying vec2 v_texCoord;
            
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
                v_texCoord = a_texCoord;
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;
            
            uniform float u_time;
            uniform vec2 u_resolution;
            varying vec2 v_texCoord;
            
            // Noise functions
            float random(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
            }
            
            float noise(vec2 st) {
                vec2 i = floor(st);
                vec2 f = fract(st);
                float a = random(i);
                float b = random(i + vec2(1.0, 0.0));
                float c = random(i + vec2(0.0, 1.0));
                float d = random(i + vec2(1.0, 1.0));
                vec2 u = f * f * (3.0 - 2.0 * f);
                return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
            }
            
            float fbm(vec2 st) {
                float value = 0.0;
                float amplitude = 0.5;
                float frequency = 1.0;
                
                for (int i = 0; i < 6; i++) {
                    value += amplitude * noise(st * frequency);
                    amplitude *= 0.5;
                    frequency *= 2.0;
                }
                return value;
            }
            
            vec3 fireColor(float intensity) {
                vec3 color1 = vec3(1.0, 0.0, 0.0);      // Red
                vec3 color2 = vec3(1.0, 0.4, 0.0);      // Orange
                vec3 color3 = vec3(1.0, 1.0, 0.2);      // Yellow
                vec3 color4 = vec3(0.0, 0.0, 0.0);      // Black
                
                if (intensity < 0.25) {
                    return mix(color4, color1, intensity * 4.0);
                } else if (intensity < 0.6) {
                    return mix(color1, color2, (intensity - 0.25) * 2.857);
                } else {
                    return mix(color2, color3, (intensity - 0.6) * 2.5);
                }
            }
            
            void main() {
                vec2 st = v_texCoord;
                vec2 uv = st;
                
                // Create fire base shape
                float fireBase = 1.0 - st.y;
                fireBase = pow(fireBase, 2.0);
                
                // Add horizontal wave distortion
                float waveDistortion = sin(st.x * 10.0 + u_time * 2.0) * 0.1;
                uv.x += waveDistortion * fireBase;
                
                // Add vertical flow
                uv.y -= u_time * 0.3;
                
                // Generate noise layers
                float noise1 = fbm(uv * 3.0 + u_time * 0.5);
                float noise2 = fbm(uv * 6.0 - u_time * 0.7);
                float noise3 = fbm(uv * 12.0 + u_time * 1.2);
                
                // Combine noise layers
                float fireNoise = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
                
                // Create fire intensity
                float intensity = fireBase * fireNoise;
                
                // Add flickering effect
                intensity += sin(u_time * 8.0 + st.x * 20.0) * 0.1 * fireBase;
                
                // Create fire shape with falloff
                float centerFalloff = 1.0 - abs(st.x - 0.5) * 2.0;
                centerFalloff = smoothstep(0.0, 1.0, centerFalloff);
                intensity *= centerFalloff;
                
                // Clamp intensity
                intensity = clamp(intensity, 0.0, 1.0);
                
                // Apply fire color
                vec3 color = fireColor(intensity);
                
                // Add glow effect
                if (intensity > 0.1) {
                    color += vec3(0.2, 0.1, 0.0) * intensity;
                }
                
                // Apply alpha based on intensity
                float alpha = intensity;
                
                gl_FragColor = vec4(color, alpha);
            }
        `;

        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
        
        this.program = this.createProgram(vertexShader, fragmentShader);
        this.gl.useProgram(this.program);
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }

    createProgram(vertexShader, fragmentShader) {
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Program linking error:', this.gl.getProgramInfoLog(program));
            this.gl.deleteProgram(program);
            return null;
        }
        
        return program;
    }

    setupGeometry() {
        // Create a quad that covers the entire canvas
        const positions = new Float32Array([
            -1.0, -1.0,  0.0, 0.0,
             1.0, -1.0,  1.0, 0.0,
            -1.0,  1.0,  0.0, 1.0,
             1.0,  1.0,  1.0, 1.0
        ]);

        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);

        const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
        const texCoordLocation = this.gl.getAttribLocation(this.program, 'a_texCoord');

        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 16, 0);

        this.gl.enableVertexAttribArray(texCoordLocation);
        this.gl.vertexAttribPointer(texCoordLocation, 2, this.gl.FLOAT, false, 16, 8);
    }

    setupUniforms() {
        this.uniforms = {
            time: this.gl.getUniformLocation(this.program, 'u_time'),
            resolution: this.gl.getUniformLocation(this.program, 'u_resolution')
        };
    }

    render() {
        const currentTime = (Date.now() - this.startTime) / 1000.0;
        
        // Enable blending for fire effect
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        
        // Clear the canvas
        this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        
        // Update uniforms
        this.gl.uniform1f(this.uniforms.time, currentTime);
        this.gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
        
        // Draw the quad
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }

    startAnimation() {
        const animate = () => {
            this.render();
            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    }

    resize() {
        const container = this.canvas.parentElement;
        if (container) {
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight;
            
            if (this.gl) {
                this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            }
        }
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.gl && this.program) {
            this.gl.deleteProgram(this.program);
        }
    }
}

// Initialize fire shader
window.addEventListener('DOMContentLoaded', () => {
    window.fireShader = new FireShader();
});

