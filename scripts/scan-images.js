const fs = require("fs")
const path = require("path")

const publicDir = path.join(__dirname, "..", "public")
const outputDir = path.join(__dirname, "..", "data")
const outputFile = path.join(outputDir, "apartment-images.ts")

const imageExtensions = [".jpeg", ".jpg", ".png", ".webp"]

const entries = fs.readdirSync(publicDir, { withFileTypes: true })
const folders = entries
  .filter((e) => e.isDirectory() && /^Apartamento \d+/.test(e.name))
  .sort((a, b) => {
    const idA = parseInt(a.name.match(/^Apartamento (\d+)/)?.[1] ?? "0", 10)
    const idB = parseInt(b.name.match(/^Apartamento (\d+)/)?.[1] ?? "0", 10)
    return idA - idB
  })

const manifest = {}

for (const folder of folders) {
  const id = parseInt(folder.name.match(/^Apartamento (\d+)/)[1], 10)
  const folderPath = path.join(publicDir, folder.name)
  const files = fs
    .readdirSync(folderPath)
    .filter((f) => imageExtensions.includes(path.extname(f).toLowerCase()))
    .sort()

  manifest[id] = files.map((f) => `/${folder.name}/${f}`)
}

const header =
  "// Generado automáticamente por scripts/scan-images.js -- NO MODIFICAR MANUALMENTE\n"
const content = `${header}export const apartmentImages: Record<number, string[]> = ${JSON.stringify(manifest, null, 2)}\n`

fs.writeFileSync(outputFile, content, "utf-8")
console.log(
  `✓ Generadas imágenes para ${Object.keys(manifest).length} apartamentos (${Object.values(manifest).flat().length} archivos)`,
)
