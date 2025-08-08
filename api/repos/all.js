import Cors from "cors";
import fetch from "node-fetch";

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
  methods: ["GET", "HEAD"],
  origin: ["http://localhost:5500", "https://riyanfazrirahman.github.io"],
});

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  const headers = {
    Authorization: `token ${process.env.GITHUB_TOKEN}`,
    "User-Agent": "repo-proxy",
  };

  const org = process.env.GITHUB_ORG;
  const user = process.env.GITHUB_USER;

  try {
    // Ambil repos user dan org
    const [orgRes, userRes] = await Promise.all([
      fetch(`https://api.github.com/orgs/${org}/repos?per_page=100`, {
        headers,
      }),
      fetch(`https://api.github.com/users/${user}/repos?per_page=100`, {
        headers,
      }),
    ]);

    const [orgRepos, userRepos] = await Promise.all([
      orgRes.json(),
      userRes.json(),
    ]);

    const repos = [...orgRepos, ...userRepos].filter((repo) => !repo.private);

    // Ambil data language untuk setiap repo
    const enrichedRepos = await Promise.all(
      repos.map(async (repo) => {
        const languages = await getRepoLanguages(repo.languages_url, headers);

        return {
          name: repo.name,
          html_url: repo.html_url,
          homepage: repo.homepage,
          created_at: repo.created_at,
          updated_at: repo.updated_at,
          owner: repo.owner.login,
          avatar_url: repo.owner.avatar_url,
          languages,
        };
      })
    );

    // Sort by update terbaru
    enrichedRepos.sort(
      (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
    );

    res.status(200).json(enrichedRepos);
  } catch (error) {
    console.error("Error ambil repos:", error);
    res.status(500).json({ error: "Gagal ambil data repositori." });
  }
}

async function getRepoLanguages(languagesUrl, headers) {
  try {
    const langRes = await fetch(languagesUrl, { headers });
    const langData = await langRes.json();

    const total = Object.values(langData).reduce((a, b) => a + b, 0);
    return Object.entries(langData).map(([name, size]) => ({
      name,
      percent: total > 0 ? +((size / total) * 100).toFixed(2) : 0,
    }));
  } catch (err) {
    console.error("Gagal ambil bahasa:", languagesUrl, err);
    return []; // fallback
  }
}
