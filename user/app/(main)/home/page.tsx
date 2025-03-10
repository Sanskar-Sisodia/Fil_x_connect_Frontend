'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Share2, Image, Video, Smile, Send, MoreHorizontal, Flag, MessageCircle, Heart, Repeat, Copy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { apiRequest } from '@/app/apiconnector/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const DEFAULT_AVATAR = "https://res.cloudinary.com/djvat4mcp/image/upload/v1741357526/zybt9ffewrjwhq7tyvy1.png";
const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/djvat4mcp/image/upload/v1741357526/";

const getFullImageUrl = (profilePicture?: string | null): string => {
  if (!profilePicture) return DEFAULT_AVATAR;
  return profilePicture.startsWith('http') ? profilePicture : CLOUDINARY_BASE_URL + profilePicture;
};

function timeAgo(dateString?: string | null) {
  if (!dateString) return 'Just now';
  const parsedDate = new Date(dateString);
  if (isNaN(parsedDate.getTime())) return 'Just now';

  const diffInSeconds = Math.floor((Date.now() - parsedDate.getTime()) / 1000);
  if (diffInSeconds < 0) return 'Just now';

  const intervals: Record<string, number> = {
    year: 31536000, month: 2592000, week: 604800,
    day: 86400, hour: 3600, minute: 60, second: 1
  };

  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds);
    if (interval >= 1) return `${interval} ${unit}${interval !== 1 ? 's' : ''} ago`;
  }
  return 'Just now';
}

interface User {
  id: string;
  username: string;
  profilePicture: string;
}

interface Post {
  id: string;
  author: User;
  content: string;
  createdAt: string;
  reactions: number;
  likedBy: { user: User; emoji: string }[];
  comments: number;
  commentsList: { id: string; user: User; content: string; createdAt: string }[];
  mediaUrls: { id: string; mediaUrl: string; mediaType: string }[];
}

export default function HomePage() {
  const [newPost, setNewPost] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string>(DEFAULT_AVATAR);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedPreviews, setSelectedPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [commentText, setCommentText] = useState('');
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojis = ['😀', '😂', '❤️', '👍', '🎉', '🔥', '💯', '🚀'];

  useEffect(() => {
    const fetchProfilePicture = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      const user = await apiRequest(`users/${userId}`, 'GET');
      if (user?.profilePicture) setProfilePicture(getFullImageUrl(user.profilePicture));
    };

    fetchProfilePicture();
    window.addEventListener('storage', fetchProfilePicture);
    return () => window.removeEventListener('storage', fetchProfilePicture);
  }, []);

  const fetchConnectionPosts = async () => {
    try {
      const userId = localStorage.getItem('userId') || "404";
      const connections = await apiRequest(`followers/${userId}/followed`, 'GET') || [];
      const activeConnections = connections.filter((user: any) => user.status !== "0");

      const allPosts = await Promise.all(
  activeConnections.map(async (conn: { id: string; status: number }) => {
    const userDetails = await apiRequest(`users/${conn.id}`, 'GET');
    if (userDetails.status === 0) return null;

    const userPosts = await apiRequest(`posts/user/${conn.id}`, 'GET') || [];
    return userPosts.filter((post: any) => post.status === "1");
  })
);

      const enrichedPosts = (allPosts.flat().filter(Boolean) as Post[]).map((post) => ({
        ...post,
        author: { ...post.author, profilePicture: getFullImageUrl(post.author.profilePicture) },
        mediaUrls: post.mediaUrls.map(m => ({ ...m, mediaUrl: getFullImageUrl(m.mediaUrl) })),
      }));

      return enrichedPosts;
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to fetch posts');
      return [];
    }
  };

  useEffect(() => {
    const loadPosts = async () => setPosts(await fetchConnectionPosts());
    loadPosts();
  }, []);

  const sortedPosts = useMemo(() => [...posts].sort((a, b) => {
    return (new Date(b?.createdAt || 0).getTime()) - (new Date(a?.createdAt || 0).getTime());
  }), [posts]);

  const handlePostSubmit = async () => {
    if (!newPost.trim() && selectedFiles.length === 0) return;
    setIsSubmitting(true);

    const userId = localStorage.getItem("userId");
    if (!userId) return setIsSubmitting(false);

    try {
      const response = await apiRequest('posts', 'POST', {
        userId, content: newPost, mediaUrls: selectedPreviews
      });

      if (response) {
        setNewPost('');
        setSelectedFiles([]);
        setSelectedPreviews([]);
        toast.success('Post created successfully!');
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Card className="p-4 mb-6">
        <Textarea
          placeholder="What's on your mind?"
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          rows={2}
        />
        <Button onClick={handlePostSubmit} disabled={isSubmitting}>Post</Button>
      </Card>
      {sortedPosts.map((post) => (
        <Card key={post.id} className="p-4 mb-4">
          <p>{post.content}</p>
          <p>{timeAgo(post.createdAt)}</p>
        </Card>
      ))}
    </div>
  );
}
