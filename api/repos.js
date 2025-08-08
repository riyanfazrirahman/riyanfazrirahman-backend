import fetch from "node-fetch";

export default async function handler(req, res) {
  const headers = {
    Authorization: `token ${process.env.GITHUB_TOKEN}`,
    "User-Agent": "request",
  };

  const username = "riyanfazrirahman";
  const org = "NAMA_ORGANISASI_KAMU";

  const urls = [
    `https://api.github.com/users/${username}/repos`,
    `https://api.github.com/orgs/${org}/repos`,
  ];

  try {
    const [userRes, orgRes] = await Promise.all(
      urls.map((url) => fetch(url, { headers }))
    );

    const userData = await userRes.json();
    const orgData = await orgRes.json();

    const allRepos = [...userData, ...orgData];
    res.status(200).json(allRepos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal ambil data GitHub" });
  }
}
