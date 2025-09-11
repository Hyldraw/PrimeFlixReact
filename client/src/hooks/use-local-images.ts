
import { useState, useEffect } from 'react';

export const useLocalImages = () => {
  // Simple passthrough functions since we're using images directly from storage.ts
  const getActorImage = (actorName: string, fallbackUrl?: string) => {
    return fallbackUrl || `https://via.placeholder.com/48x48/ec4899/ffffff?text=${actorName.charAt(0)}`;
  };

  const getDirectorImage = (directorName: string, fallbackUrl?: string) => {
    return fallbackUrl || `https://via.placeholder.com/48x48/666666/ffffff?text=${directorName.charAt(0)}`;
  };

  const getBannerImage = (fallbackUrl?: string) => {
    return fallbackUrl || 'https://via.placeholder.com/1920x1080/333333/ffffff?text=Banner';
  };

  const getPosterImage = (fallbackUrl?: string) => {
    return fallbackUrl || 'https://via.placeholder.com/300x450/666666/ffffff?text=Poster';
  };

  return {
    getActorImage,
    getDirectorImage,
    getBannerImage,
    getPosterImage
  };
};
