import Cors from 'cors';
import fetch from 'node-fetch';

// Setup middleware untuk CORS
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

// CORS config
const cors = Cors({
  methods: ['GET', 'HEAD'],
  origin: ['http://localhost:5500', 'https://riyanfazrirahman.github.io']
});

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  const headers = {
    Authorization: `token ${process.env.GITHUB_TOKEN}`,
    "User-Agent": "repo-proxy",
  };

  const org = process.env.GITHUB_ORG;

  try {
    const response = await fetch(`https://api.github.com/orgs/${org}/repos?per_page=100`, {
      headers,
    });

    const repos = await response.json();

    const publicRepos = repos
      .filter((repo) => !repo.private)
      .map((repo) => ({
        name: repo.name,
        html_url: repo.html_url,
        language: repo.language,
        homepage: repo.homepage,
        created_at: repo.created_at,
        updated_at: repo.updated_at,
        owner: repo.owner?.login || "unknown",
      }));

    res.status(200).json(publicRepos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal ambil repo organisasi GitHub" });
  }
}
