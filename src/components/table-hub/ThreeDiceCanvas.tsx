import { useEffect, useRef, FC } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from '../../lib/roundedBoxGeometry'
import { tableAudio } from '../../lib/tableAudio'

interface ThreeDiceCanvasProps {
  diceCount: 1 | 2
  diceValues: number[]
  isRolling: boolean
  onRollComplete?: () => void
}

// Procedural texture for rounded D6 face (creamy ivory with recessed pips)
function createRealisticDiceFaceTexture(number: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  // Warm ivory resin background with gentle ambient center lighting
  const bgGrad = ctx.createRadialGradient(128, 128, 15, 128, 128, 150)
  bgGrad.addColorStop(0, '#ffffff')
  bgGrad.addColorStop(0.7, '#fdfbf7')
  bgGrad.addColorStop(1, '#f3ede2')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, 256, 256)

  // Indented pips (crimson ace on face 1, deep charcoal on faces 2-6)
  const isAce = number === 1
  const pipColor = isAce ? '#e11d48' : '#1e293b'
  const pipShadow = isAce ? '#881337' : '#090d16'
  const r = isAce ? 30 : 18.5

  const drawPip = (x: number, y: number) => {
    ctx.save()
    // 3D recess bevel shadow
    ctx.beginPath()
    ctx.arc(x, y + 1.2, r + 1, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.14)'
    ctx.fill()

    // Inner cavity gradient
    const pipGrad = ctx.createRadialGradient(x - r * 0.25, y - r * 0.25, r * 0.1, x, y, r)
    pipGrad.addColorStop(0, pipColor)
    pipGrad.addColorStop(1, pipShadow)
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = pipGrad
    ctx.fill()

    // Specular highlight
    ctx.beginPath()
    ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.28, 0, Math.PI * 2)
    ctx.fillStyle = isAce ? 'rgba(255, 205, 210, 0.6)' : 'rgba(255, 255, 255, 0.45)'
    ctx.fill()
    ctx.restore()
  }

  const c = 128
  const l = 66
  const ri = 190

  if (number === 1) drawPip(c, c)
  else if (number === 2) { drawPip(l, l); drawPip(ri, ri) }
  else if (number === 3) { drawPip(l, l); drawPip(c, c); drawPip(ri, ri) }
  else if (number === 4) { drawPip(l, l); drawPip(ri, l); drawPip(l, ri); drawPip(ri, ri) }
  else if (number === 5) { drawPip(l, l); drawPip(ri, l); drawPip(c, c); drawPip(l, ri); drawPip(ri, ri) }
  else if (number === 6) { drawPip(l, l); drawPip(ri, l); drawPip(l, c); drawPip(ri, c); drawPip(l, ri); drawPip(ri, ri) }

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

// Contact shadow for table grounding
function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')!
  const grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 60)
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.48)')
  grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.16)')
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(canvas)
}

const ROTATION_MAP: Record<number, { x: number; y: number; z: number }> = {
  1: { x: 0, y: 0, z: 0 },
  2: { x: 0, y: -Math.PI / 2, z: 0 },
  3: { x: Math.PI / 2, y: 0, z: 0 },
  4: { x: -Math.PI / 2, y: 0, z: 0 },
  5: { x: 0, y: Math.PI / 2, z: 0 },
  6: { x: Math.PI, y: 0, z: 0 }
}

export const ThreeDiceCanvas: FC<ThreeDiceCanvasProps> = ({
  diceCount,
  diceValues,
  isRolling,
  onRollComplete
}) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const isRollingRef = useRef(isRolling)
  isRollingRef.current = isRolling

  const hasNotifiedRef = useRef(false)
  if (isRolling) {
    hasNotifiedRef.current = false
  }

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const width = mount.clientWidth || 320
    const height = mount.clientHeight || 220

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100)
    camera.position.set(0, 1.2, 8.8)
    camera.lookAt(0, -0.2, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    // 2. Studio Lighting
    scene.add(new THREE.AmbientLight(0xfffbf0, 1.6))
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.4)
    keyLight.position.set(5, 9, 6)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 1.0)
    fillLight.position.set(-5, 4, 3)
    scene.add(fillLight)

    // 3. Materials & Physically Rounded Box Geometry (fillet radius 0.3)
    const materials = [
      new THREE.MeshPhysicalMaterial({ map: createRealisticDiceFaceTexture(2), roughness: 0.15, clearcoat: 0.35 }),
      new THREE.MeshPhysicalMaterial({ map: createRealisticDiceFaceTexture(5), roughness: 0.15, clearcoat: 0.35 }),
      new THREE.MeshPhysicalMaterial({ map: createRealisticDiceFaceTexture(3), roughness: 0.15, clearcoat: 0.35 }),
      new THREE.MeshPhysicalMaterial({ map: createRealisticDiceFaceTexture(4), roughness: 0.15, clearcoat: 0.35 }),
      new THREE.MeshPhysicalMaterial({ map: createRealisticDiceFaceTexture(1), roughness: 0.15, clearcoat: 0.35 }),
      new THREE.MeshPhysicalMaterial({ map: createRealisticDiceFaceTexture(6), roughness: 0.15, clearcoat: 0.35 }),
    ]

    // Real rounded corners with RoundedBoxGeometry (width, height, depth, segments, radius)
    const boxGeo = new RoundedBoxGeometry(1.85, 1.85, 1.85, 8, 0.3)
    const shadowGeo = new THREE.PlaneGeometry(2.5, 2.5)
    const shadowMat = new THREE.MeshBasicMaterial({
      map: createContactShadowTexture(),
      transparent: true,
      opacity: 0.65
    })

    // 4. Create Meshes & Shadows
    const diceMeshes: THREE.Mesh[] = []
    const shadowMeshes: THREE.Mesh[] = []

    for (let i = 0; i < diceCount; i++) {
      const mesh = new THREE.Mesh(boxGeo, materials)
      const xOffset = diceCount === 1 ? 0 : (i === 0 ? -1.65 : 1.65)
      mesh.position.set(xOffset, 0, 0)

      const targetVal = diceValues[i] || 1
      const rot = ROTATION_MAP[targetVal] || { x: 0, y: 0, z: 0 }
      mesh.rotation.set(rot.x, rot.y, rot.z)
      scene.add(mesh)
      diceMeshes.push(mesh)

      const shadow = new THREE.Mesh(shadowGeo, shadowMat)
      shadow.rotation.x = -Math.PI / 2
      shadow.position.set(xOffset, -1.2, 0)
      scene.add(shadow)
      shadowMeshes.push(shadow)
    }

    // 5. Physics Animation Loop
    let animId: number
    let rollStartTime = 0
    const rollDuration = 1150

    const animate = (time: number) => {
      animId = requestAnimationFrame(animate)

      if (isRollingRef.current) {
        if (!rollStartTime) rollStartTime = time
        const elapsed = time - rollStartTime
        const progress = Math.min(elapsed / rollDuration, 1)

        diceMeshes.forEach((mesh, idx) => {
          const shadow = shadowMeshes[idx]
          if (progress < 1) {
            const spin = (1 - progress) * 20
            mesh.rotation.x += 0.09 * spin * (idx === 0 ? 1 : -1)
            mesh.rotation.y += 0.11 * spin * (idx === 0 ? 1 : 1.1)
            mesh.rotation.z += 0.05 * spin

            const bounce = Math.abs(Math.sin(progress * Math.PI * 3.5)) * Math.pow(1 - progress, 1.2) * 1.6
            mesh.position.y = bounce

            if (shadow) {
              const scale = THREE.MathUtils.lerp(1.3, 0.8, bounce / 1.6)
              shadow.scale.set(scale, scale, 1)
              shadowMat.opacity = THREE.MathUtils.lerp(0.3, 0.7, 1 - bounce / 1.6)
            }
          } else {
            // Settle precisely onto target face
            const targetVal = diceValues[idx] || 1
            const rot = ROTATION_MAP[targetVal] || { x: 0, y: 0, z: 0 }
            mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, rot.x + Math.PI * 4, 0.22)
            mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, rot.y + Math.PI * 4, 0.22)
            mesh.rotation.z = THREE.MathUtils.lerp(mesh.rotation.z, rot.z, 0.22)
            mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, 0, 0.22)
            if (shadow) {
              shadow.scale.set(1, 1, 1)
              shadowMat.opacity = 0.65
            }
          }
        })

        if (progress >= 1 && !hasNotifiedRef.current) {
          hasNotifiedRef.current = true
          rollStartTime = 0
          if (onRollComplete) onRollComplete()
        }
      } else {
        diceMeshes.forEach((mesh, idx) => {
          mesh.position.y = Math.sin(time * 0.0025 + idx) * 0.06
        })
      }

      renderer.render(scene, camera)
    }

    animId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animId)
      renderer.dispose()
      boxGeo.dispose()
      shadowGeo.dispose()
      materials.forEach(m => m.dispose())
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [diceCount, isRolling])

  useEffect(() => {
    if (isRolling) tableAudio.playDiceRoll()
  }, [isRolling])

  return (
    <div
      ref={mountRef}
      className="w-full h-[220px] flex items-center justify-center cursor-pointer select-none"
    />
  )
}
