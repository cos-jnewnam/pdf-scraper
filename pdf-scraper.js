import express from "express";
import axios from "axios";
import { load } from "cheerio";
import { createWriteStream } from "fs";
import { mkdtemp, rm } from "fs/promises";
import { pipeline } from "stream/promises";
import { ZipArchive } from "archiver";
import { tmpdir } from "os";
import { basename, extname, join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;
const ALLOWED_TYPES = new Set(["pdf", "mp4"]);

/* ------------------ Express setup ------------------ */

app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.set("views", join(__dirname, "views"));

/* ------------------ Helpers ------------------ */

// Strip path separators and unsafe characters so names can't escape the temp dir.
const safeName = (name, fallback) => {
  const cleaned = String(name ?? "")
    .replace(/[^\w.\- ]/g, "_")
    .replace(/^\.+/, "")
    .trim()
    .slice(0, 200);
  return cleaned || fallback;
};

const downloadFile = async (url, filePath) => {
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });
  await pipeline(response.data, createWriteStream(filePath));
};

const createZip = (files, output) =>
  new Promise((resolve, reject) => {
    const archive = new ZipArchive({ zlib: { level: 9 } });
    const stream = createWriteStream(output);
    stream.on("close", resolve);
    archive.on("error", reject);
    archive.pipe(stream);
    files.forEach((file) => archive.file(file, { name: basename(file) }));
    archive.finalize();
  });

/* ------------------ Routes ------------------ */

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/scrape", async (req, res) => {
  const fileType = ALLOWED_TYPES.has(req.body.fileType) ? req.body.fileType : "pdf";
  const zipName = safeName(req.body.zipName, "downloads");

  let url;
  try {
    url = new URL(req.body.url);
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error();
  } catch {
    return res.status(400).type("text").send("Invalid URL. Use an http(s) address.");
  }

  const outputDir = await mkdtemp(join(tmpdir(), "scrapestack-"));
  const zipFilePath = join(outputDir, `${zipName}.zip`);
  const cleanup = () => rm(outputDir, { recursive: true, force: true });

  try {
    const { data } = await axios.get(url.href);
    const $ = load(data);

    const pattern = new RegExp(`\\.${fileType}$`, "i");
    const fileLinks = [];

    $("a[href]").each((i, el) => {
      const href = $(el).attr("href");
      if (!href) return;
      let resolved;
      try {
        resolved = new URL(href, url);
      } catch {
        return;
      }
      if (/^https?:$/.test(resolved.protocol) && pattern.test(resolved.pathname)) {
        fileLinks.push(resolved.href);
      }
    });

    if (fileLinks.length === 0) {
      await cleanup();
      return res
        .status(200)
        .send(`
        <html>
          <head><title>No Files Found</title></head>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h2>No matching <code>.${fileType}</code> files were found on the page.</h2>
            <p><a href="/" style="text-decoration: none; color: #007bff;">&larr; Go back and try again</a></p>
          </body>
        </html>
      `);
    }

    const usedNames = new Set([`${zipName}.zip`]);
    const downloadPromises = [...new Set(fileLinks)].map((link, i) => {
      let raw;
      try {
        raw = decodeURIComponent(basename(new URL(link).pathname));
      } catch {
        raw = "";
      }
      let fileName = safeName(raw, `file_${i}.${fileType}`);
      if (usedNames.has(fileName)) {
        const ext = extname(fileName);
        fileName = `${basename(fileName, ext)}_${i}${ext}`;
      }
      usedNames.add(fileName);
      const filePath = join(outputDir, fileName);
      return downloadFile(link, filePath).then(() => filePath);
    });

    const files = await Promise.all(downloadPromises);

    await createZip(files, zipFilePath);

    res.download(zipFilePath, async (err) => {
      await cleanup();
      if (err && !res.headersSent) res.status(500).send("Failed to download the zip file.");
    });
  } catch (error) {
    await cleanup();
    console.error(error);
    res.status(500).type("text").send(`Error: ${error.message}`);
  }
});

/* ------------------ Start server ------------------ */

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

