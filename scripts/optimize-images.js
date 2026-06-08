const fs = require("fs")
const path = require("path")
const sharp = require("sharp")

const publicDir = path.join(__dirname, "..", "public")
const excludeDirs = ["favicon"]
const imageExtensions = [".webp", ".jpg", ".jpeg", ".png"]
const AVIF_QUALITY = 75
const WEBP_QUALITY = 75
const CONCURRENCY = 6

let totalOriginalBytes = 0
let totalAvifBytes = 0
let totalWebpBytes = 0
let processedCount = 0
let fileList = []

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (!excludeDirs.includes(entry.name)) walkDir(fullPath)
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase()
      if (imageExtensions.includes(ext)) fileList.push(fullPath)
    }
  }
}

async function optimizeFile(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  const dir = path.dirname(filePath)
  const baseName = path.basename(filePath, ext)
  const avifPath = path.join(dir, `${baseName}.avif`)
  const webpPath = path.join(dir, `${baseName}.webp`)

  const srcStat = fs.statSync(filePath)
  totalOriginalBytes += srcStat.size
  const srcMtime = srcStat.mtimeMs

  const avifExists = fs.existsSync(avifPath)
  const webpExists = fs.existsSync(webpPath)
  const avifFresh = avifExists && fs.statSync(avifPath).mtimeMs >= srcMtime
  const webpFresh = webpExists && fs.statSync(webpPath).mtimeMs >= srcMtime

  try {
    if (!avifFresh) {
      const pipeline = sharp(filePath)
      const tmpAvif = avifPath + ".tmp"
      await pipeline.clone().avif({ quality: AVIF_QUALITY }).toFile(tmpAvif)
      if (avifExists) fs.unlinkSync(avifPath)
      fs.renameSync(tmpAvif, avifPath)
    }
    totalAvifBytes += fs.statSync(avifPath).size

    if (!webpFresh) {
      const pipeline = sharp(filePath)
      const tmpWebp = webpPath + ".tmp"
      await pipeline.clone().webp({ quality: WEBP_QUALITY }).toFile(tmpWebp)
      if (webpExists) fs.unlinkSync(webpPath)
      fs.renameSync(tmpWebp, webpPath)
    }
    totalWebpBytes += fs.statSync(webpPath).size
    processedCount++
  } catch (err) {
    console.error(`  ✗ ${path.basename(filePath)}: ${err.message}`)
    processedCount++
  }
}

async function main() {
  console.log("🖼  Optimización de imágenes — Villa Camila")
  console.log(`   Directorio: ${publicDir}`)
  console.log(`   AVIF calidad: ${AVIF_QUALITY}, WebP calidad: ${WEBP_QUALITY}`)
  console.log(`   Concurrencia: ${CONCURRENCY}`)
  console.log("")

  walkDir(publicDir)
  console.log(`   Archivos encontrados: ${fileList.length}`)
  console.log("")

  const startTime = Date.now()

  // Process with concurrency limit
  const queue = [...fileList]
  async function worker() {
    while (queue.length > 0) {
      const file = queue.shift()
      await optimizeFile(file)
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()))

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  const savedAvif = ((totalOriginalBytes - totalAvifBytes) / 1024 / 1024).toFixed(1)
  const savedWebp = ((totalOriginalBytes - totalWebpBytes) / 1024 / 1024).toFixed(1)

  console.log("")
  console.log(`✓ Completado — ${processedCount} archivos en ${elapsed}s`)
  console.log(`  Original:     ${(totalOriginalBytes / 1024 / 1024).toFixed(1)} MB`)
  console.log(`  AVIF (q${AVIF_QUALITY}):   ${(totalAvifBytes / 1024 / 1024).toFixed(1)} MB  (ahorro: ${savedAvif} MB)`)
  console.log(`  WebP (q${WEBP_QUALITY}):   ${(totalWebpBytes / 1024 / 1024).toFixed(1)} MB  (ahorro: ${savedWebp} MB)`)
}

main().catch((err) => {
  console.error("Error fatal:", err)
  process.exit(1)
})
