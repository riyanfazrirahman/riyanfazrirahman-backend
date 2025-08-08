import fetch from "node-fetch";

export default async function handler(req, res) {
  const headers = {
    Authorization: `token ${process.env.GITHUB_TOKEN}`,
    "User-Agent": "repo-proxy",
  };

  const org = process.env.GITHUB_ORG;

  try {
    const response = await fetch(`https://api.github.com/orgs/${org}/repos?per_page=100`, { headers });
    const repos = await response.json();

    const publicRepos = repos.filter((repo) => !repo.private);
    res.status(200).json(publicRepos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal ambil repo organisasi GitHub" });
  }
}
