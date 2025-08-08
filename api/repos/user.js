import fetch from "node-fetch";

export default async function handler(req, res) {
  const headers = {
    Authorization: `token ${process.env.GITHUB_TOKEN}`,
    "User-Agent": "repo-proxy",
  };

  const username = process.env.GITHUB_USERNAME;

  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`, { headers });
    const repos = await response.json();

    const publicRepos = repos.filter((repo) => !repo.private);
    res.status(200).json(publicRepos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal ambil repo user GitHub" });
  }
}
