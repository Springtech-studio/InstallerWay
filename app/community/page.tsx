"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  arrayUnion 
} from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { 
  Users, 
  MessageSquare, 
  Send, 
  Tag, 
  ThumbsUp, 
  ShieldCheck, 
  Sparkles, 
  LogIn, 
  Clock, 
  ChevronDown, 
  ChevronUp 
} from "lucide-react";

interface ReplyItem {
  id: string;
  authorName: string;
  authorEmail: string;
  content: string;
  createdAt: string;
}

interface PostItem {
  id: string;
  authorName: string;
  authorEmail: string;
  topic: string;
  title: string;
  content: string;
  likes: number;
  likedBy: string[];
  replies: ReplyItem[];
  createdAt: any;
}

const TOPIC_CHIPS = [
  "All Topics",
  "Inverter Setup & Troubleshooting",
  "Lithium & ESS Configuration",
  "BOS, Breakers & Protection",
  "Commercial & Mini-Grid Design",
  "Site Inspection & Solar Math"
];

export default function CommunityPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>("All Topics");
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  // New Post Form State
  const [newTitle, setNewTitle] = useState("");
  const [newTopic, setNewTopic] = useState("Inverter Setup & Troubleshooting");
  const [newContent, setNewContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reply Input State
  const [replyText, setReplyText] = useState<{ [postId: string]: string }>({});

  // 1. Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // 2. Realtime Posts Listener
  useEffect(() => {
    const postsRef = collection(db, "community_posts");
    const q = query(postsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedPosts: PostItem[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            authorName: data.authorName || "Field Engineer",
            authorEmail: data.authorEmail || "",
            topic: data.topic || "General",
            title: data.title || "",
            content: data.content || "",
            likes: data.likes || 0,
            likedBy: data.likedBy || [],
            replies: data.replies || [],
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString() : "Just now"
          };
        });
        setPosts(fetchedPosts);
      },
      (error) => {
        console.error("Firestore listener error:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  // 3. Create a New Post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newTitle.trim() || !newContent.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "community_posts"), {
        authorName: currentUser.displayName || currentUser.email?.split("@")[0] || "Solar Engineer",
        authorEmail: currentUser.email || "",
        topic: newTopic,
        title: newTitle.trim(),
        content: newContent.trim(),
        likes: 0,
        likedBy: [],
        replies: [],
        createdAt: serverTimestamp()
      });

      setNewTitle("");
      setNewContent("");
    } catch (err) {
      console.error("Error creating post:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Like / Upvote Post
  const handleLike = async (post: PostItem) => {
    if (!currentUser) return;
    const postRef = doc(db, "community_posts", post.id);
    const hasLiked = post.likedBy?.includes(currentUser.uid);

    try {
      if (hasLiked) {
        await updateDoc(postRef, {
          likes: Math.max(0, post.likes - 1),
          likedBy: post.likedBy.filter((uid) => uid !== currentUser.uid)
        });
      } else {
        await updateDoc(postRef, {
          likes: post.likes + 1,
          likedBy: [...(post.likedBy || []), currentUser.uid]
        });
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  // 5. Submit Reply
  const handleAddReply = async (postId: string) => {
    if (!currentUser) return;
    const text = replyText[postId]?.trim();
    if (!text) return;

    const postRef = doc(db, "community_posts", postId);
    const newReply: ReplyItem = {
      id: Math.random().toString(36).substring(2, 9),
      authorName: currentUser.displayName || currentUser.email?.split("@")[0] || "Certified Engineer",
      authorEmail: currentUser.email || "",
      content: text,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    try {
      await updateDoc(postRef, {
        replies: arrayUnion(newReply)
      });
      setReplyText((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      console.error("Error adding reply:", err);
    }
  };

  const filteredPosts = selectedTopic === "All Topics" 
    ? posts 
    : posts.filter((p) => p.topic === selectedTopic);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-950/40">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" /> Engineer Communication Hub
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Field Engineers Forum
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Collaborate on commissioning, troubleshoot inrush trips, and share verified technical practices.
          </p>
        </div>

        <div>
          {currentUser ? (
            <div className="flex items-center gap-2 bg-slate-900 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl text-xs text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Signed in as <strong className="text-white">{currentUser.displayName || currentUser.email?.split("@")[0]}</strong></span>
            </div>
          ) : (
            <Link
              href="/auth"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-950"
            >
              <LogIn className="w-4 h-4" /> Sign In to Post &amp; Reply
            </Link>
          )}
        </div>
      </div>

      {/* Topic Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {TOPIC_CHIPS.map((topic) => (
          <button
            key={topic}
            onClick={() => setSelectedTopic(topic)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              selectedTopic === topic
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {topic}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 text-center text-slate-400">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">No active discussions in this topic yet.</p>
              <p className="text-xs mt-1">Be the first engineer to post a question or field observation.</p>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const isExpanded = expandedPostId === post.id;
              const hasLiked = currentUser && post.likedBy?.includes(currentUser.uid);

              return (
                <div 
                  key={post.id}
                  className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 hover:border-slate-700/80 transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                          {post.topic}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" /> {post.createdAt}
                        </span>
                      </div>
                      <h2 className="text-base font-bold text-white tracking-tight">{post.title}</h2>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Posted by <strong className="text-slate-300">{post.authorName}</strong>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                    {post.content}
                  </p>

                  {/* Post Interactions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                    <button
                      onClick={() => handleLike(post)}
                      disabled={!currentUser}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                        hasLiked 
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                          : "text-slate-400 hover:text-white bg-slate-800/60"
                      } disabled:opacity-50`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{post.likes} {post.likes === 1 ? "Endorsement" : "Endorsements"}</span>
                    </button>

                    <button
                      onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                      className="flex items-center gap-1 text-slate-400 hover:text-white transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{post.replies?.length || 0} Replies</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  {/* Collapsible Replies Section */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-slate-800 space-y-3 bg-slate-950/40 p-4 rounded-xl">
                      <div className="space-y-2">
                        {post.replies && post.replies.length > 0 ? (
                          post.replies.map((reply) => (
                            <div key={reply.id} className="bg-slate-900/90 border border-slate-800/80 p-3 rounded-xl text-xs space-y-1">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-emerald-400">{reply.authorName}</span>
                                <span className="text-slate-400 text-[10px]">{reply.createdAt}</span>
                              </div>
                              <p className="text-slate-200">{reply.content}</p>
                            </div>
                          ))
                        ) : (
                          <div className="text-[11px] text-slate-400 text-center py-1">
                            No replies yet. Share your technical opinion below.
                          </div>
                        )}
                      </div>

                      {/* Reply Input Box */}
                      {currentUser ? (
                        <div className="flex gap-2 pt-2">
                          <input
                            type="text"
                            placeholder="Write an engineering reply..."
                            value={replyText[post.id] || ""}
                            onChange={(e) => setReplyText({ ...replyText, [post.id]: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleAddReply(post.id);
                            }}
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:border-emerald-500"
                          />
                          <button
                            onClick={() => handleAddReply(post.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition text-xs font-bold"
                          >
                            Reply
                          </button>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400 text-center pt-1">
                          <Link href="/auth" className="text-emerald-400 underline">Sign in</Link> to reply to this thread.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Create Post Drawer */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sticky top-24 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-slate-800 pb-3">
            <Sparkles className="w-4 h-4 text-emerald-400" /> Start Technical Discussion
          </div>

          {currentUser ? (
            <form onSubmit={handleCreatePost} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Topic Channel</label>
                <select
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-emerald-500"
                >
                  {TOPIC_CHIPS.filter((t) => t !== "All Topics").map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Discussion Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Grounding impedance high on sandy terrain"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-400 focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Description / Field Context</label>
                <textarea
                  rows={4}
                  placeholder="Include inverter model, string voltage, error codes or site layout details..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-400 focus:border-emerald-500 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !newTitle.trim() || !newContent.trim()}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" /> Post to Community
              </button>
            </form>
          ) : (
            <div className="text-center py-6 space-y-3">
              <ShieldCheck className="w-8 h-8 mx-auto text-emerald-400" />
              <p className="text-xs text-slate-300">
                You must be logged into your InstallerWay account to create technical topics or reply.
              </p>
              <Link
                href="/auth"
                className="inline-block px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-950"
              >
                Sign In / Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}