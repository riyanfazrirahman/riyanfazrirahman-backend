import cors from 'cors';
import fetch from "node-fetch";

app.use(cors({
  origin: ['http://localhost:5500', 'https://riyanfazrirahman.github.io']
}));

export default async function handler(req, res) {
  const headers = {
    Authorization: `token ${process.env.GITHUB_TOKEN}`,
    "User-Agent": "repo-proxy",
  };

  const org = process.env.GITHUB_ORG;

  try {
    const response = await fetch(`https://api.github.com/orgs/${org}/repos?per_page=100`, { headers, });

    const repos = await response.json();

    const publicRepos = repos
      .filter((repo) => !repo.private)
      .map((repo) => ({
        name: repo.name,
        html_url: repo.html_url,
        language: repo.language,
        homepage: repo.has_pages ? `https://${repo.owner.login}.github.io/${repo.name}` : null,
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
