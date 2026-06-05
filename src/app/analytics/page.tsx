"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (!res.ok) {
          router.push("/login");
          return;
        }

        const auth = await res.json();
        const user = auth.user;

        if (!user || user.role !== "ADMIN") {
          router.push("/");
          return;
        }

        const analyticsRes = await fetch("/api/analytics", {
          credentials: "include",
        });

        const json = await analyticsRes.json();
        setData(json);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [router]);

  const pageStyle: React.CSSProperties = {
  background: "#f9f9f9",
  color: "#111",
  minHeight: "100vh",
  padding: "24px",
  fontFamily: "sans-serif",
};

  const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: "12px",
  padding: "12px",
  width: "220px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  border: "1px solid #eee",
};

  if (loading) {
    return (
      <div style={pageStyle}>
        <h1>Loading Analytics...</h1>
        <div style={{ height: "300px", background: "#222", borderRadius: "10px" }} />
      </div>
    );
  }

  if (!data) return null;

  const viewData =
    data.views?.map((v: any) => ({
      artworkId: v.artworkId,
      title: v.title,
      imageUrl: v.imageUrl,
      views: v.views,
    })) || [];

  const likeData =
    data.likes?.map((l: any) => ({
      artworkId: l.artworkId,
      title: l.title,
      imageUrl: l.imageUrl,
      likes: l.likes,
    })) || [];

  const unlikeData =
    data.unlikes?.map((u: any) => ({
      artworkId: u.artworkId,
      title: u.title,
      imageUrl: u.imageUrl,
      unlikes: u.unlikes,
    })) || [];

  const userData =
    data.activeUsers?.map((u: any) => ({
      name: u.name,
      activity: u.activity,
    })) || [];

  const searchData =
    data.searches?.map((s: any) => ({
      term: s.term,
      count: s.count,
    })) || [];

  const categoryData =
    data.categories?.map((c: any) => ({
      category: c.category,
      count: c.count,
    })) ||
    data.popularCategories?.map((c: any) => ({
      category: c.category,
      count: c.count,
    })) || [];

  const engagementMap: Record<string, any> = {};

  viewData.forEach((v: any) => {
    engagementMap[v.artworkId] = {
      ...v,
      likes: 0,
      unlikes: 0,
    };
  });

  likeData.forEach((l: any) => {
    if (!engagementMap[l.artworkId]) {
      engagementMap[l.artworkId] = {
        ...l,
        views: 0,
        unlikes: 0,
      };
    } else {
      engagementMap[l.artworkId].likes = l.likes;
    }
  });

  unlikeData.forEach((u: any) => {
    if (!engagementMap[u.artworkId]) {
      engagementMap[u.artworkId] = {
        ...u,
        views: 0,
        likes: 0,
      };
    } else {
      engagementMap[u.artworkId].unlikes = u.unlikes;
    }
  });

  const topArtworks = Object.values(engagementMap)
    .map((a: any) => ({
      ...a,
      score: a.views + a.likes * 2 - a.unlikes,
    }))
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 5);

  const totalViews = viewData.reduce((s: number, a: any) => s + a.views, 0);
  const totalLikes = likeData.reduce((s: number, a: any) => s + a.likes, 0);
  const totalUnlikes = unlikeData.reduce((s: number, a: any) => s + a.unlikes, 0);


  const totalEvents =
    totalViews + totalLikes + totalUnlikes + (data.totalSearches || 0);

  const totalSearches = data.totalSearches || 0;

  return (
    <div style={pageStyle}>
      <h1>📊 Admin Analytics Dashboard</h1>

      <div style={{ display: "flex", gap: "12px", margin: "20px 0", flexWrap: "wrap" }}>
        <div style={cardStyle}>
          <h3>Total Views</h3>
          <p>{totalViews}</p>
        </div>

        <div style={cardStyle}>
          <h3>Total Likes</h3>
          <p>{totalLikes}</p>
        </div>

        <div style={cardStyle}>
          <h3>Total Unlikes</h3>
          <p>{totalUnlikes}</p>
        </div>


        <div style={cardStyle}>
          <h3>Total Searches</h3>
          <p>{totalSearches}</p>
        </div>

        <div style={cardStyle}>
          <h3>Total Events</h3>
          <p>{totalEvents}</p>
        </div>
      </div>

      <h2>🔥 Top Artworks</h2>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        {topArtworks.map((item: any) => (
          <div key={item.artworkId} style={cardStyle}>
            <img
              src={item.imageUrl}
              style={{
                width: "100%",
                height: "140px",
                objectFit: "cover",
                borderRadius: "10px",
              }}
            />

            <p><b>{item.title}</b></p>
            <p>👁 {item.views}</p>
            <p>❤️ {item.likes}</p>
            <p>👎 {item.unlikes}</p>
            <p>🔥 {item.score}</p>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: "40px" }}>Views</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={viewData}>
          <XAxis dataKey="title" stroke="#fff" />
          <YAxis stroke="#fff" />
          <Tooltip />
          <Bar dataKey="views" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>

      <h2 style={{ marginTop: "40px" }}>Likes</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={likeData}>
          <XAxis dataKey="title" stroke="#fff" />
          <YAxis stroke="#fff" />
          <Tooltip />
          <Bar dataKey="likes" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>

      <h2 style={{ marginTop: "40px" }}>Unlikes</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={unlikeData}>
          <XAxis dataKey="title" stroke="#fff" />
          <YAxis stroke="#fff" />
          <Tooltip />
          <Bar dataKey="unlikes" fill="#ff4d4d" />
        </BarChart>
      </ResponsiveContainer>

      <h2 style={{ marginTop: "40px" }}>🔎 Top Searches</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={searchData}>
          <XAxis dataKey="term" stroke="#fff" />
          <YAxis stroke="#fff" />
          <Tooltip />
          <Bar dataKey="count" fill="#facc15" />
        </BarChart>
      </ResponsiveContainer>

      <h2>🎨 Popular Categories</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={categoryData}>
          <XAxis dataKey="category" stroke="#fff" />
          <YAxis stroke="#fff" />
          <Tooltip />
          <Bar dataKey="count" fill="#60a5fa" />
        </BarChart>
      </ResponsiveContainer>

      <h2 style={{ marginTop: "40px" }}>👤 Top Users</h2>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        {userData.slice(0, 5).map((u: any) => (
          <div key={u.name} style={cardStyle}>
            <p><b>{u.name}</b></p>
            <p>⚡ Activity score: {u.activity}</p>
          </div>
        ))}
      </div>
    </div>
  );
}