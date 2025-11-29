import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
});

export const getLessonByCustomId = async (customId: string) => {
  const res = await API.get(`/lessons/by-custom-id/${customId}`);
  return res.data;
};

export const getLessons = async (query?: string) => {
  const res = await API.get(`/lessons${query ? `?${query}` : ""}`);
  return res.data;
};
