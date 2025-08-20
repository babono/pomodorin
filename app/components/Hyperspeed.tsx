"use client";

import { useEffect, useRef } from "react";
import * as THREE from 'three';
import { BloomEffect, EffectComposer, EffectPass, RenderPass, SMAAEffect, SMAAPreset } from 'postprocessing';

interface HyperspeedProps {
  isTimerRunning: boolean;
}

const Hyperspeed = ({ isTimerRunning }: HyperspeedProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<any>(null);
  
  useEffect(() => {
    if (appRef.current) {
      appRef.current.dispose();
    }

    const turbulentUniforms = {
      uFreq: { value: new THREE.Vector4(4, 8, 8, 1) },
      uAmp: { value: new THREE.Vector4(25, 5, 10, 10) }
    };

    let nsin = (val: number) => Math.sin(val) * 0.5 + 0.5;

    const distortions = {
      turbulentDistortion: {
        uniforms: turbulentUniforms,
        getDistortion: `
          uniform vec4 uFreq;
          uniform vec4 uAmp;
          float nsin(float val){
            return sin(val) * 0.5 + 0.5;
          }
          #define PI 3.14159265358979
          float getDistortionX(float progress){
            return (
              cos(PI * progress * uFreq.r + uTime) * uAmp.r +
              pow(cos(PI * progress * uFreq.g + uTime * (uFreq.g / uFreq.r)), 2. ) * uAmp.g
            );
          }
          float getDistortionY(float progress){
            return (
              -nsin(PI * progress * uFreq.b + uTime) * uAmp.b +
              -pow(nsin(PI * progress * uFreq.a + uTime / (uFreq.b / uFreq.a)), 5.) * uAmp.a
            );
          }
          vec3 getDistortion(float progress){
            return vec3(
              getDistortionX(progress) - getDistortionX(0.0125),
              getDistortionY(progress) - getDistortionY(0.0125),
              0.
            );
          }
        `,
        getJS: (progress: number, time: number) => {
          const uFreq = turbulentUniforms.uFreq.value;
          const uAmp = turbulentUniforms.uAmp.value;

          const getX = (p: number) =>
            Math.cos(Math.PI * p * uFreq.x + time) * uAmp.x +
            Math.pow(Math.cos(Math.PI * p * uFreq.y + time * (uFreq.y / uFreq.x)), 2) * uAmp.y;

          const getY = (p: number) =>
            -nsin(Math.PI * p * uFreq.z + time) * uAmp.z -
            Math.pow(nsin(Math.PI * p * uFreq.w + time / (uFreq.z / uFreq.w)), 5) * uAmp.w;

          let distortion = new THREE.Vector3(
            getX(progress) - getX(progress + 0.007),
            getY(progress) - getY(progress + 0.007),
            0
          );
          let lookAtAmp = new THREE.Vector3(-2, -5, 0);
          let lookAtOffset = new THREE.Vector3(0, 0, -10);
          return distortion.multiply(lookAtAmp).add(lookAtOffset);
        }
      }
    };

    class App {
      renderer: THREE.WebGLRenderer;
      camera: THREE.PerspectiveCamera;
      scene: THREE.Scene;
      composer: EffectComposer;
      clock: THREE.Clock;
      disposed: boolean;
      container: HTMLElement;
      options: any;
      road: Road;
      leftCarLights: CarLights;
      rightCarLights: CarLights;
      leftSticks: LightsSticks;
      fovTarget: number;
      speedUpTarget: number;
      speedUp: number;
      timeOffset: number;
      fogUniforms: any;

      constructor(container: HTMLElement, options: any) {
        this.container = container;
        this.options = options;
        this.disposed = false;
        
        this.renderer = new THREE.WebGLRenderer({
          antialias: false,
          alpha: true
        });
        this.renderer.setSize(container.offsetWidth, container.offsetHeight, false);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.composer = new EffectComposer(this.renderer);
        container.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(
          options.fov,
          container.offsetWidth / container.offsetHeight,
          0.1,
          10000
        );
        this.camera.position.z = -5;
        this.camera.position.y = 8;
        this.camera.position.x = 0;
        
        this.scene = new THREE.Scene();
        this.scene.background = null;

        let fog = new THREE.Fog(
          options.colors.background,
          options.length * 0.2,
          options.length * 500
        );
        this.scene.fog = fog;
        this.fogUniforms = {
          fogColor: { value: fog.color },
          fogNear: { value: fog.near },
          fogFar: { value: fog.far }
        };
        
        this.clock = new THREE.Clock();

        this.road = new Road(this, options);
        this.leftCarLights = new CarLights(
          this,
          options,
          options.colors.leftCars,
          options.movingAwaySpeed,
          new THREE.Vector2(0, 1 - options.carLightsFade)
        );
        this.rightCarLights = new CarLights(
          this,
          options,
          options.colors.rightCars,
          options.movingCloserSpeed,
          new THREE.Vector2(1, 0 + options.carLightsFade)
        );
        this.leftSticks = new LightsSticks(this, options);

        this.fovTarget = options.fov;
        this.speedUpTarget = 0;
        this.speedUp = 0;
        this.timeOffset = 0;

        window.addEventListener("resize", this.onWindowResize.bind(this));
      }

      onWindowResize() {
        const width = this.container.offsetWidth;
        const height = this.container.offsetHeight;

        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.composer.setSize(width, height);
      }

      initPasses() {
        const renderPass = new RenderPass(this.scene, this.camera);
        const bloomPass = new EffectPass(
          this.camera,
          new BloomEffect({
            luminanceThreshold: 0.2,
            luminanceSmoothing: 0,
            resolutionScale: 1
          })
        );

        const smaaPass = new EffectPass(
          this.camera,
          new SMAAEffect({
            preset: SMAAPreset.MEDIUM,
          })
        );
        
        renderPass.renderToScreen = false;
        bloomPass.renderToScreen = false;
        smaaPass.renderToScreen = true;
        
        this.composer.addPass(renderPass);
        this.composer.addPass(bloomPass);
        this.composer.addPass(smaaPass);
      }

      init() {
        this.initPasses();
        const options = this.options;
        
        this.road.init();
        this.leftCarLights.init();
        this.leftCarLights.mesh.position.setX(
          -options.roadWidth / 2 - options.islandWidth / 2
        );
        this.rightCarLights.init();
        this.rightCarLights.mesh.position.setX(
          options.roadWidth / 2 + options.islandWidth / 2
        );
        this.leftSticks.init();
        this.leftSticks.mesh.position.setX(
          -(options.roadWidth + options.islandWidth / 2)
        );

        this.tick();
      }

      setTimerState(isRunning: boolean) {
        if (isRunning) {
          this.speedUpTarget = this.options.speedUp;
        } else {
          this.speedUpTarget = 0.1; // Very slow speed when not running
        }
      }

      update(delta: number) {
        let lerpPercentage = Math.exp(-(-60 * Math.log2(1 - 0.1)) * delta);
        this.speedUp += this.lerp(
          this.speedUp,
          this.speedUpTarget,
          lerpPercentage,
          0.00001
        );
        this.timeOffset += this.speedUp * delta;

        let time = this.clock.elapsedTime + this.timeOffset;

        this.rightCarLights.update(time);
        this.leftCarLights.update(time);
        this.leftSticks.update(time);
        this.road.update(time);

        if (this.options.distortion.getJS) {
          const distortion = this.options.distortion.getJS(0.025, time);
          this.camera.lookAt(
            new THREE.Vector3(
              this.camera.position.x + distortion.x,
              this.camera.position.y + distortion.y,
              this.camera.position.z + distortion.z
            )
          );
          this.camera.updateProjectionMatrix();
        }
      }

      lerp(current: number, target: number, speed = 0.1, limit = 0.001) {
        let change = (target - current) * speed;
        if (Math.abs(change) < limit) {
          change = target - current;
        }
        return change;
      }

      render(delta: number) {
        this.composer.render(delta);
      }

      dispose() {
        this.disposed = true;
        
        if (this.renderer) {
          this.renderer.dispose();
        }
        if (this.composer) {
          this.composer.dispose();
        }
        if (this.scene) {
          this.scene.clear();
        }
        
        window.removeEventListener("resize", this.onWindowResize.bind(this));
      }

      tick() {
        if (this.disposed) return;
        
        const canvas = this.renderer.domElement;
        if (canvas.clientWidth !== canvas.width || canvas.clientHeight !== canvas.height) {
          this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
          this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
          this.camera.updateProjectionMatrix();
        }
        
        const delta = this.clock.getDelta();
        this.render(delta);
        this.update(delta);
        requestAnimationFrame(() => this.tick());
      }
    }

    // Simplified classes for the road elements
    class Road {
      webgl: App;
      options: any;
      uTime: { value: number };
      leftRoadWay!: THREE.Mesh;
      rightRoadWay!: THREE.Mesh;
      island!: THREE.Mesh;

      constructor(webgl: App, options: any) {
        this.webgl = webgl;
        this.options = options;
        this.uTime = { value: 0 };
      }

      createPlane(side: number, width: number, isRoad: boolean) {
        const options = this.options;
        const geometry = new THREE.PlaneGeometry(
          isRoad ? options.roadWidth : options.islandWidth,
          options.length,
          20,
          100
        );
        
        let uniforms: any = {
          uTravelLength: { value: options.length },
          uColor: { value: new THREE.Color(isRoad ? options.colors.roadColor : options.colors.islandColor) },
          uTime: this.uTime
        };

        const material = new THREE.ShaderMaterial({
          fragmentShader: `
            #define USE_FOG;
            varying vec2 vUv; 
            uniform vec3 uColor;
            uniform float uTime;
            void main() {
              vec3 color = vec3(uColor);
              gl_FragColor = vec4(color, 1.);
            }
          `,
          vertexShader: `
            #define USE_FOG;
            uniform float uTime;
            uniform float uTravelLength;
            varying vec2 vUv; 
            ${options.distortion.getDistortion}
            void main() {
              vec3 transformed = position.xyz;
              vec3 distortion = getDistortion((transformed.y + uTravelLength / 2.) / uTravelLength);
              transformed.x += distortion.x;
              transformed.z += distortion.y;
              transformed.y += -1. * distortion.z;  
              
              vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.);
              gl_Position = projectionMatrix * mvPosition;
              vUv = uv;
            }
          `,
          side: THREE.DoubleSide,
          uniforms: Object.assign(
            uniforms,
            this.webgl.fogUniforms,
            options.distortion.uniforms
          )
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.z = -options.length / 2;
        mesh.position.x += (options.islandWidth / 2 + options.roadWidth / 2) * side;
        this.webgl.scene.add(mesh);

        return mesh;
      }

      init() {
        this.leftRoadWay = this.createPlane(-1, this.options.roadWidth, true);
        this.rightRoadWay = this.createPlane(1, this.options.roadWidth, true);
        this.island = this.createPlane(0, this.options.islandWidth, false);
      }

      update(time: number) {
        this.uTime.value = time;
      }
    }

    class CarLights {
      webgl: App;
      options: any;
      colors: any;
      speed: number[];
      fade: THREE.Vector2;
      mesh!: THREE.Mesh;

      constructor(webgl: App, options: any, colors: any, speed: number[], fade: THREE.Vector2) {
        this.webgl = webgl;
        this.options = options;
        this.colors = colors;
        this.speed = speed;
        this.fade = fade;
      }

      init() {
        const options = this.options;
        let curve = new THREE.LineCurve3(
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, 0, -1)
        );
        let geometry = new THREE.TubeGeometry(curve, 40, 1, 8, false);
        let instanced = new THREE.InstancedBufferGeometry();
        instanced.copy(geometry as any);
        instanced.instanceCount = options.lightPairsPerRoadWay * 2;

        // Simplified car lights setup
        const aOffset: number[] = [];
        const aMetrics: number[] = [];
        const aColor: number[] = [];

        for (let i = 0; i < options.lightPairsPerRoadWay; i++) {
          // Add simplified car light data
          aOffset.push(0, 0.5, -Math.random() * options.length);
          aOffset.push(1, 0.5, -Math.random() * options.length);
          
          aMetrics.push(0.1, 10, 60);
          aMetrics.push(0.1, 10, 60);
          
          aColor.push(1, 0.5, 0.8);
          aColor.push(1, 0.5, 0.8);
        }

        instanced.setAttribute("aOffset", new THREE.InstancedBufferAttribute(new Float32Array(aOffset), 3, false));
        instanced.setAttribute("aMetrics", new THREE.InstancedBufferAttribute(new Float32Array(aMetrics), 3, false));
        instanced.setAttribute("aColor", new THREE.InstancedBufferAttribute(new Float32Array(aColor), 3, false));

        const material = new THREE.ShaderMaterial({
          fragmentShader: `
            varying vec3 vColor;
            varying vec2 vUv; 
            uniform vec2 uFade;
            void main() {
              vec3 color = vec3(vColor);
              float alpha = smoothstep(uFade.x, uFade.y, vUv.x);
              gl_FragColor = vec4(color, alpha);
              if (gl_FragColor.a < 0.0001) discard;
            }
          `,
          vertexShader: `
            attribute vec3 aOffset;
            attribute vec3 aMetrics;
            attribute vec3 aColor;
            uniform float uTravelLength;
            uniform float uTime;
            varying vec2 vUv; 
            varying vec3 vColor; 
            ${options.distortion.getDistortion}
            void main() {
              vec3 transformed = position.xyz;
              float radius = aMetrics.r;
              float myLength = aMetrics.g;
              float speed = aMetrics.b;

              transformed.xy *= radius;
              transformed.z *= myLength;
              transformed.z += myLength - mod(uTime * speed + aOffset.z, uTravelLength);
              transformed.xy += aOffset.xy;

              float progress = abs(transformed.z / uTravelLength);
              transformed.xyz += getDistortion(progress);

              vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.);
              gl_Position = projectionMatrix * mvPosition;
              vUv = uv;
              vColor = aColor;
            }
          `,
          transparent: true,
          uniforms: Object.assign({
            uTime: { value: 0 },
            uTravelLength: { value: options.length },
            uFade: { value: this.fade }
          }, this.webgl.fogUniforms, options.distortion.uniforms)
        });

        this.mesh = new THREE.Mesh(instanced, material);
        this.mesh.frustumCulled = false;
        this.webgl.scene.add(this.mesh);
      }

      update(time: number) {
        (this.mesh.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
      }
    }

    class LightsSticks {
      webgl: App;
      options: any;
      mesh!: THREE.Mesh;

      constructor(webgl: App, options: any) {
        this.webgl = webgl;
        this.options = options;
      }

      init() {
        const options = this.options;
        const geometry = new THREE.PlaneGeometry(1, 1);
        let instanced = new THREE.InstancedBufferGeometry();
        instanced.copy(geometry as any);
        instanced.instanceCount = options.totalSideLightSticks;

        // Simplified light sticks
        const aOffset: number[] = [];
        const aColor: number[] = [];
        const aMetrics: number[] = [];

        for (let i = 0; i < options.totalSideLightSticks; i++) {
          aOffset.push(i * 20);
          aColor.push(0.2, 0.8, 1);
          aMetrics.push(0.2, 1.5);
        }

        instanced.setAttribute("aOffset", new THREE.InstancedBufferAttribute(new Float32Array(aOffset), 1, false));
        instanced.setAttribute("aColor", new THREE.InstancedBufferAttribute(new Float32Array(aColor), 3, false));
        instanced.setAttribute("aMetrics", new THREE.InstancedBufferAttribute(new Float32Array(aMetrics), 2, false));

        const material = new THREE.ShaderMaterial({
          fragmentShader: `
            varying vec3 vColor;
            void main(){
              vec3 color = vec3(vColor);
              gl_FragColor = vec4(color, 1.);
            }
          `,
          vertexShader: `
            attribute float aOffset;
            attribute vec3 aColor;
            attribute vec2 aMetrics;
            uniform float uTravelLength;
            uniform float uTime;
            varying vec3 vColor;
            ${options.distortion.getDistortion}
            void main(){
              vec3 transformed = position.xyz;
              float width = aMetrics.x;
              float height = aMetrics.y;
              transformed.xy *= vec2(width, height);
              float time = mod(uTime * 60. * 2. + aOffset, uTravelLength);
              transformed.z += - uTravelLength + time;
              float progress = abs(transformed.z / uTravelLength);
              transformed.xyz += getDistortion(progress);
              transformed.y += height / 2.;
              vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.);
              gl_Position = projectionMatrix * mvPosition;
              vColor = aColor;
            }
          `,
          side: THREE.DoubleSide,
          uniforms: Object.assign({
            uTravelLength: { value: options.length },
            uTime: { value: 0 }
          }, this.webgl.fogUniforms, options.distortion.uniforms)
        });

        this.mesh = new THREE.Mesh(instanced, material);
        this.mesh.frustumCulled = false;
        this.webgl.scene.add(this.mesh);
      }

      update(time: number) {
        (this.mesh.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
      }
    }

    if (containerRef.current) {
      const options: any = {
        distortion: distortions.turbulentDistortion,
        length: 400,
        roadWidth: 10,
        islandWidth: 2,
        lanesPerRoad: 3,
        fov: 90,
        speedUp: 2,
        carLightsFade: 0.4,
        totalSideLightSticks: 20,
        lightPairsPerRoadWay: 40,
        movingAwaySpeed: [60, 80],
        movingCloserSpeed: [-120, -160],
        colors: {
          roadColor: 0x080808,
          islandColor: 0x0a0a0a,
          background: 0x000000,
          leftCars: [0xD856BF, 0x6750A2, 0xC247AC],
          rightCars: [0x03B3C3, 0x0E5EA5, 0x324555],
          sticks: 0x03B3C3,
        }
      };
      
      const myApp = new App(containerRef.current, options);
      appRef.current = myApp;
      myApp.init();
      
      // Set initial state
      myApp.setTimerState(isTimerRunning);
    }

    return () => {
      if (appRef.current) {
        appRef.current.dispose();
      }
    };
  }, []);

  // Update speed when timer state changes
  useEffect(() => {
    if (appRef.current) {
      appRef.current.setTimerState(isTimerRunning);
    }
  }, [isTimerRunning]);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 -z-10"
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default Hyperspeed;
