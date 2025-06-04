export const games = [
  {
    id: 1,
    title: "示例游戏 - Snake Master",
    slug: "example-snake-master",
    description: "这是一个示例游戏，展示平台的基本功能。你可以在管理后台隐藏这个游戏，专注于管理你自己上传的游戏。",
    thumbnail: "/assets/images/placeholder.svg",
    categoryIds: [1, 5], // Arcade, Casual
    tags: ["示例", "演示", "平台游戏"],
    rating: 4.0,
    playCount: 0,
    releaseDate: "2023-10-15",
    developer: "GameHub Platform",
    featured: false,
    isMobile: true
  }
];

// 将游戏数据设置到全局对象中，供管理后台使用
if (typeof window !== 'undefined') {
  window.__PLATFORM_GAMES__ = games;
}