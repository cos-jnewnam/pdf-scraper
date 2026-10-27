# ScrapeStack

**ScrapeStack** is a local Node/Express tool that helps you download all matching files (PDF or MP4) from a specified webpage into a single ZIP file. Just enter the URL, choose the file type you'd like to scrape, and give your ZIP file a name. ScrapeStack will find all files of that type, bundle them, and prompt you to download them in one convenient archive.

> **Note:** This is a **local app**. Hosting the UI on GitHub Pages (or any static host) will not perform scraping because it requires the local server.

## Features

- **Scrape PDFs or MP4s**: Choose which file type you want to download from a page.
- **Single ZIP Download**: Bundles all matching files into a single downloadable ZIP.
- **Smart File Naming**: Files are downloaded using their original (sanitized) names.
- **Custom ZIP Name**: Easily name your download package.

## Requirements

- Node.js 18+
- npm (Node Package Manager)

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/cos-jnewnam/pdf-scraper.git
   cd pdf-scraper
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## Usage

1. **Start the server**:

   ```bash
   npm start
   ```

2. **Open the tool**: Visit [http://localhost:3000](http://localhost:3000) in your browser.

3. **Scrape files**:

   - Enter the URL of the page containing the files.
   - Select the file type to scrape (`PDF` or `MP4`).
   - Specify a name for your ZIP file.
   - Click **Scrape** to begin.

4. **Download**: When finished, a ZIP with all matched files will be offered for download.

## Example

1. Start the server and visit [http://localhost:3000](http://localhost:3000)
2. Enter a target page (e.g. `https://example.com/media`)
3. Select `MP4` or `PDF`
4. Name your ZIP file (e.g. `downloads`)
5. Click **Scrape**
6. ScrapeStack collects and zips all matching files, then prompts you to download

> If no matching files are found, ScrapeStack displays a message and skips ZIP creation.

## Troubleshooting

- **No files found?** Ensure the selected file type matches what’s on the page.
- **Empty ZIP file?** The app prevents this by skipping ZIP creation when nothing matches.
- **Errors?** Check the terminal for logs.

## Contributing

Pull requests and feature suggestions are welcome!

## License

MIT License. See the [LICENSE](license) file for details.

## Acknowledgements

- [Bootstrap](https://getbootstrap.com) for UI components
- [Font Awesome](https://fontawesome.com) for icons
- [Cheerio](https://cheerio.js.org) and [Axios](https://axios-http.com) for HTML parsing and HTTP requests
- [Archiver](https://www.npmjs.com/package/archiver) for ZIP generation

---

Made with ❤️ & ☕ by [Jared Newnam](https://jarednewnam.com)
