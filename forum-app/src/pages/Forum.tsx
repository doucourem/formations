import React, { useState } from "react";

const Forum = () => {
  const forumData = [
    {
      section: "ASRock Bulletin",
      categories: [
        {
          title: "Product News",
          description: "About our product",
          topics: 20,
          posts: 142,
          lastPost: {
            title: "ASRock Announces 2 New X99 Motherboards...",
            time: "Mar 20 2016 at 12:42am",
            author: "by Xaltar",
          },
        },
        {
          title: "Event News",
          description: "Event news around ASRock",
          topics: 5,
          posts: 33,
          lastPost: {
            title: "Play Assassin's Creed Syndicate...",
            time: "Jul 14 2016 at 5:18pm",
            author: "by Xaltar",
          },
        },
      ],
    },
    {
      section: "Technical Support",
      categories: [
        {
          title: "Intel Motherboards",
          description: "Questions about ASRock Intel Motherboards",
          topics: 2623,
          posts: 13822,
          lastPost: {
            title: "No Display on boot (Freshly built)...",
            time: "9 minutes ago",
            author: "by wardog",
          },
        },
        {
          title: "AMD Motherboards",
          description: "Questions about ASRock AMD motherboards",
          topics: 609,
          posts: 3376,
          lastPost: {
            title: "ASRock 970M black screen on reboot...",
            time: "10 minutes ago",
            author: "by Xaltar",
          },
        },
        {
          title: "HTPC/Server/Industrial Boards/Others",
          description: "Includes HTPC & Gaming barebones & others",
          topics: 118,
          posts: 944,
          lastPost: {
            title: "DeskMini 110 - Additional USB ports...",
            time: "Dec 16 2016 at 3:18pm",
            author: "by ket",
          },
        },
        {
          title: "Motherboards (German)",
          description: "Technischer Support in Deutsch",
          topics: 21,
          posts: 148,
          lastPost: {
            title: "UEFI 2.70 nur in geringer Auflösung...",
            time: "60 minutes ago",
            author: "by neubauer",
          },
        },
      ],
    },
  ];

  return (
    <div className="bg-black text-white min-h-screen p-4 font-sans">
      {forumData.map((section, index) => (
        <div key={index} className="mb-10">
          <h2 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-2">
            {section.section}
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-900 text-sm rounded-lg overflow-hidden">
              <thead>
                <tr className="text-left text-gray-300 bg-gray-800">
                  <th className="p-3">Category</th>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-center">Topics</th>
                  <th className="p-3 text-center">Posts</th>
                  <th className="p-3">Last Post</th>
                </tr>
              </thead>
              <tbody>
                {section.categories.map((cat, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-700 hover:bg-gray-800 transition"
                  >
                    <td className="p-3 font-semibold text-blue-400">
                      {cat.title}
                    </td>
                    <td className="p-3 text-gray-400">{cat.description}</td>
                    <td className="p-3 text-center text-yellow-300">{cat.topics}</td>
                    <td className="p-3 text-center text-yellow-300">{cat.posts}</td>
                    <td className="p-3">
                      <p className="text-blue-300">{cat.lastPost.title}</p>
                      <p className="text-gray-400 text-xs">{cat.lastPost.time}</p>
                      <p className="text-green-400 text-xs">{cat.lastPost.author}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Forum;
