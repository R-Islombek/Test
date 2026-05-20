import React, { useState, useEffect } from 'react';
import postService from '../../api/postService';
import commentService from '../../api/commentService';
import { 
  Loader2, MessageSquare, Plus, Calendar, 
  ShieldAlert, Filter 
} from 'lucide-react';

const Comments = () => {
  const [posts, setPosts] = useState([]); // List of posts for select dropdown
  const [selectedPostId, setSelectedPostId] = useState(''); // Selected Post ID
  const [comments, setComments] = useState([]); // Comments list
  const [commentContent, setCommentContent] = useState(''); // New comment text

  // Loading and error states
  const [postsLoading, setPostsLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Fetch all posts for the select dropdown on initial load
  useEffect(() => {
    const fetchAllPosts = async () => {
      setPostsLoading(true);
      try {
        const data = await postService.getPosts();
        const postsArray = Array.isArray(data) ? data : [];
        setPosts(postsArray);
        
        // Automatically select the first post if available
        if (postsArray.length > 0) {
          setSelectedPostId(postsArray[0].id);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load posts from the server.");
      } finally {
        setPostsLoading(false);
      }
    };
    fetchAllPosts();
  }, []);

  // 2. Fetch comments whenever the selected Post ID changes
  const fetchComments = async (postId) => {
    if (!postId) return;
    setCommentsLoading(true);
    setError('');
    try {
      const data = await commentService.getCommentsByPostId(postId);
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch comments for this post.");
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPostId) {
      fetchComments(selectedPostId);
    }
  }, [selectedPostId]);

  // 3. Handle new comment submission
  const handleCreateComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim() || !selectedPostId) return;

    setSubmitLoading(true);
    try {
      await commentService.createComment(selectedPostId, { 
        content: commentContent.trim() 
      });
      setCommentContent(''); // Clear textarea
      fetchComments(selectedPostId); // Refresh comments list
    } catch (err) {
      console.error(err);
      alert("An error occurred while posting your comment.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Find the currently selected post details to display in the header
  const currentPost = posts.find(p => p.id === Number(selectedPostId));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <MessageSquare className="text-blue-600" size={22} />
              Comments Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">Filter, review, and moderate user discussions across posts</p>
          </div>
          <div className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-500 shadow-sm">
            Dashboard <span className="text-slate-300">/</span> <span className="text-blue-600 font-medium">Comments</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-xs flex items-center gap-2">
            <ShieldAlert size={16} /> {error}
          </div>
        )}

        {/* MAIN TWO-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* LEFT COLUMN: Post Filter & Add Comment Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Sidebar Card 1: Filter by Post */}
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-3">
              <h2 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Filter size={14} className="text-blue-600" /> Select Post
              </h2>
              <div>
                {postsLoading ? (
                  <div className="flex items-center gap-2 text-xs text-slate-400 py-1">
                    <Loader2 className="animate-spin text-blue-600" size={14} /> Loading posts...
                  </div>
                ) : (
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none focus:border-blue-500 font-medium cursor-pointer"
                    value={selectedPostId}
                    onChange={(e) => setSelectedPostId(e.target.value)}
                  >
                    {posts.map((post) => (
                      <option key={post.id} value={post.id}>
                        ID: #{post.id} | {post.author?.fullName || "Unknown"}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Sidebar Card 2: Submit a New Comment */}
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-3">
              <h2 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Plus size={14} className="text-blue-600" /> Write a Comment
              </h2>
              <form onSubmit={handleCreateComment} className="space-y-3">
                <textarea
                  placeholder="Type your comment for this post here..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all text-xs h-28 resize-none leading-relaxed"
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  required
                  disabled={!selectedPostId}
                />
                <button
                  type="submit"
                  disabled={submitLoading || !commentContent.trim() || !selectedPostId}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg font-semibold text-xs hover:opacity-95 active:scale-[0.99] transition-all flex justify-center items-center gap-2 disabled:opacity-40 disabled:pointer-events-none shadow-sm"
                >
                  {submitLoading ? <Loader2 className="animate-spin" size={14} /> : "Submit Comment"}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: Data Table for Comments */}
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            
            {/* Meta header showing selected post content preview */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase font-extrabold text-blue-600 tracking-wider block">Selected Post Content:</span>
                <p className="text-xs text-slate-600 italic mt-0.5 line-clamp-1 max-w-xl">
                  {currentPost ? `"${currentPost.content}"` : "No post selected"}
                </p>
              </div>
              <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-md font-bold whitespace-nowrap self-start sm:self-auto">
                Total Comments: {comments.length}
              </span>
            </div>

            {commentsLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-2 text-slate-400">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <p className="text-xs font-medium">Loading comments table...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-24 text-slate-400 text-xs space-y-1">
                <MessageSquare className="mx-auto text-slate-300 mb-2" size={28} />
                <p>No comments found for this post yet.</p>
                <p className="text-[11px] text-slate-400/80">Be the first to share a thought using the panel on the left.</p>
              </div>
            ) : (
              /* RESPONSIVE COMMENTS DATA TABLE */
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-4 w-16 text-center">ID</th>
                      <th className="p-4 w-44">Author</th>
                      <th className="p-4">Comment Statement</th>
                      <th className="p-4 w-32 text-center">Date Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {comments.map((comment) => {
                      const authorName = comment.author?.fullName || "Community Member";
                      
                      return (
                        <tr key={comment.id} className="hover:bg-slate-50/60 transition-colors text-slate-700">
                          {/* Comment ID */}
                          <td className="p-4 text-center font-mono text-slate-400">
                            #{comment.id}
                          </td>
                          
                          {/* Comment Author info */}
                          <td className="p-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 uppercase shrink-0">
                                {authorName.charAt(0)}
                              </div>
                              <div className="truncate max-w-[140px]">
                                <span className="font-semibold text-slate-900 block" title={authorName}>
                                  {authorName}
                                </span>
                                <span className="text-[10px] text-slate-400 block font-mono">UID: {comment.author?.id || 0}</span>
                              </div>
                            </div>
                          </td>
                          
                          {/* Comment Content */}
                          <td className="p-4 max-w-xs md:max-w-md">
                            <p className="text-slate-600 leading-relaxed break-words whitespace-pre-wrap font-medium">
                              {comment.content}
                            </p>
                          </td>
                          
                          {/* Date details */}
                          <td className="p-4 text-slate-400 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <Calendar size={13} className="text-slate-400" />
                              <span>{comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : "Just now"}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Comments;