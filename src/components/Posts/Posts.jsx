import React, { useState, useEffect } from 'react';
import postService from '../../api/postService';
import { 
  Loader2, MessageSquare, Plus, Calendar, 
  FileText, Users, ShieldAlert, Layers, Eye, X 
} from 'lucide-react';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  // State for viewing detailed post (Modal)
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // 1. Fetch posts from backend
  const fetchPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await postService.getPosts();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error:", err);
      setError("An error occurred while fetching backend data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // 2. Create a new post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitLoading(true);
    try {
      await postService.createPost({ content: content.trim() });
      setContent(''); 
      fetchPosts(); 
    } catch (err) {
      console.error(err);
      alert("Failed to create the post.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // 3. Fetch single post details by ID (Swagger: /api/posts/{id})
  const handleViewPostDetails = async (id) => {
    setModalLoading(true);
    try {
      const detailedPost = await postService.getSinglePost(id);
      setSelectedPost(detailedPost);
    } catch (err) {
      console.error("Error loading post:", err);
      alert("Failed to load post details.");
    } finally {
      setModalLoading(false);
    }
  };

  // Statistical calculations
  const totalPosts = posts.length;
  const totalComments = posts.reduce((sum, item) => sum + (item.comments?.length || 0), 0);
  const uniqueAuthors = new Set(posts.map(item => item.author?.id).filter(Boolean)).size;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Section: Breadcrumb and Title (White Design) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Layers className="text-teal-600" size={22} />
              Posts Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">Manage all system posts in a table view</p>
          </div>
          <div className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-500 self-start sm:self-auto shadow-sm">
            Dashboard <span className="text-slate-300">/</span> <span className="text-teal-600 font-medium">Posts</span>
          </div>
        </div>

        {/* 1. STATISTICS PANEL (Light mode style with clean shadow) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200/80 p-5 rounded-xl flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Posts</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{loading ? "..." : totalPosts}</h3>
            </div>
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl"><FileText size={22} /></div>
          </div>
          <div className="bg-white border border-slate-200/80 p-5 rounded-xl flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Comments</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{loading ? "..." : totalComments}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><MessageSquare size={22} /></div>
          </div>
          <div className="bg-white border border-slate-200/80 p-5 rounded-xl flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Authors</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{loading ? "..." : uniqueAuthors}</h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Users size={22} /></div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-xs flex items-center gap-2">
            <ShieldAlert size={16} /> {error}
          </div>
        )}

        {/* 2. MAIN LAYOUT GRID (Form + Table) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* LEFT COLUMN: Create Post Form */}
          <div className="lg:col-span-1 bg-white border border-slate-200 p-4 rounded-xl space-y-4 shadow-sm">
            <h2 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Plus size={14} className="text-teal-600" /> Add New Post
            </h2>
            <form onSubmit={handleCreatePost} className="space-y-3">
              <textarea
                placeholder="Write post content here..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 placeholder-slate-400 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-all text-xs h-32 resize-none leading-relaxed"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={submitLoading || !content.trim()}
                className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white py-2.5 rounded-lg font-semibold text-xs hover:opacity-95 active:scale-[0.99] transition-all flex justify-center items-center gap-2 disabled:opacity-40 disabled:pointer-events-none shadow-sm"
              >
                {submitLoading ? <Loader2 className="animate-spin" size={14} /> : "Publish"}
              </button>
            </form>
          </div>

          {/* RIGHT COLUMN: Admin Table (Table - Clean White) */}
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">All Posts List</span>
              <span className="text-[11px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-semibold">Total: {posts.length}</span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-2 text-slate-400">
                <Loader2 className="animate-spin text-teal-600" size={32} />
                <p className="text-xs font-medium">Loading data...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-24 text-slate-400 text-xs">
                No posts available in the system yet.
              </div>
            ) : (
              /* PROFESSIONAL TABLE */
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-4 w-16 text-center">ID</th>
                      <th className="p-4 w-44">Author</th>
                      <th className="p-4">Post Content</th>
                      <th className="p-4 w-32">Date</th>
                      <th className="p-4 w-24 text-center">Comments</th>
                      <th className="p-4 w-20 text-center">View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {posts.map((post) => {
                      const authorName = post.author?.fullName || "System Member";
                      
                      return (
                        <tr key={post.id} className="hover:bg-slate-50/80 transition-colors text-slate-700">
                          {/* ID */}
                          <td className="p-4 text-center font-mono text-slate-400">
                            #{post.id}
                          </td>
                          
                          {/* Author */}
                          <td className="p-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-xs font-bold text-teal-700 uppercase shrink-0">
                                {authorName.charAt(0)}
                              </div>
                              <span className="font-semibold text-slate-900 truncate max-w-[140px]" title={authorName}>
                                {authorName}
                              </span>
                            </div>
                          </td>
                          
                          {/* Post Content */}
                          <td className="p-4 max-w-xs md:max-w-md">
                            <p className="line-clamp-2 text-slate-600 leading-relaxed break-words whitespace-pre-wrap">
                              {post.content}
                            </p>
                          </td>
                          
                          {/* Date */}
                          <td className="p-4 text-slate-400 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={13} className="text-slate-400" />
                              <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "Recently"}</span>
                            </div>
                          </td>
                          
                          {/* Comment Count */}
                          <td className="p-4 text-center">
                            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-md text-[11px] font-bold">
                              <MessageSquare size={12} />
                              {post.comments?.length || 0}
                            </span>
                          </td>

                          {/* Action Button (View) */}
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleViewPostDetails(post.id)}
                              className="text-slate-400 hover:text-teal-600 p-1 rounded hover:bg-slate-100 transition-colors inline-flex justify-center"
                              title="View Details and Comments"
                            >
                              <Eye size={16} />
                            </button>
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

      {/* 3. POST DETAILS MODAL WINDOW (With Comments) */}
      {selectedPost && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-teal-600" />
                <h3 className="font-bold text-slate-900 text-sm">Post Details (ID: #{selectedPost.id})</h3>
              </div>
              <button 
                onClick={() => setSelectedPost(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body (Scrollable section) */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              
              {/* Post Author */}
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold uppercase">
                  {(selectedPost.author?.fullName || "A").charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{selectedPost.author?.fullName || "Unknown Author"}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {selectedPost.createdAt ? new Date(selectedPost.createdAt).toLocaleString() : "Recently"}
                  </p>
                </div>
              </div>

              {/* Post Content */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Post Content:</span>
                <p className="text-slate-700 bg-slate-50/50 p-3 rounded-xl border border-slate-100 leading-relaxed text-xs whitespace-pre-wrap break-words">
                  {selectedPost.content}
                </p>
              </div>

              {/* Comments List (Based on the array from Swagger) */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                  <MessageSquare size={12} className="text-blue-500" />
                  Comments ({selectedPost.comments?.length || 0})
                </span>

                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {(!selectedPost.comments || selectedPost.comments.length === 0) ? (
                    <p className="text-slate-400 text-center py-4 bg-slate-50/30 rounded-xl border border-dashed border-slate-200">
                      No comments have been added to this post yet.
                    </p>
                  ) : (
                    selectedPost.comments.map((comment) => (
                      <div key={comment.id} className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-900">{comment.author?.fullName || "User"}</span>
                          <span className="text-[10px] text-slate-400">
                            {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ""}
                          </span>
                        </div>
                        <p className="text-slate-600 break-words leading-normal">{comment.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedPost(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-1.5 rounded-lg font-semibold transition-all text-xs"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Posts;