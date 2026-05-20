import React, { useEffect, useState } from 'react';
import authService from '../../api/authService';
import postService from '../../api/postService';
import adminService from '../../api/adminService';
import api from '../../api/axiosInstance';

const Dashboard = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Post creation states
  const [newPostText, setNewPostText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Comment states
  const [commentInputs, setCommentInputs] = useState({});
  const [postComments, setPostComments] = useState({}); 
  const [activeCommentBox, setActiveCommentBox] = useState(null); 

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const profileRes = await api.get('/api/profile/me');
        setUserProfile(profileRes.data);

        const postsRes = await postService.getPosts();
        setPosts(Array.isArray(postsRes) ? postsRes : []);

        if (profileRes.data?.role === 'ADMIN' || profileRes.data?.role === 'ROLE_ADMIN') {
          const usersRes = await adminService.getAllUsers();
          setUsers(Array.isArray(usersRes) ? usersRes : []);
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred while loading data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostText.trim() && !selectedFile) return;

    try {
      let attachmentId = null;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        const attachRes = await api.post('/api/attach', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        attachmentId = attachRes.data?.id;
      }

      const newPost = await postService.createPost({
        content: newPostText,
        attachId: attachmentId
      });

      const postWithAuthor = {
        ...newPost,
        author: newPost.author || { id: userProfile?.id, fullName: userProfile?.fullName }
      };

      setPosts([postWithAuthor, ...posts]);
      setNewPostText('');
      setSelectedFile(null);
    } catch (err) {
      alert("Failed to create post.");
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("Are you sure you want to permanently delete this post?")) {
      try {
        await api.delete(`/api/posts/${postId}`);
        setPosts(posts.filter(post => post.id !== postId));
        if (activeCommentBox === postId) {
          setActiveCommentBox(null);
        }
      } catch (err) {
        alert("Failed to delete the post or you don't have permission.");
      }
    }
  };

  const toggleComments = async (postId) => {
    if (activeCommentBox === postId) {
      setActiveCommentBox(null);
      return;
    }

    setActiveCommentBox(postId);
    try {
      const res = await api.get(`/api/posts/${postId}/comments`);
      setPostComments({ ...postComments, [postId]: res.data });
    } catch (err) {
      console.error("Failed to load comments");
    }
  };

  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    const commentText = commentInputs[postId];
    if (!commentText || !commentText.trim()) return;

    try {
      const res = await api.post(`/api/posts/${postId}/comments`, {
        content: commentText
      });

      const currentComments = postComments[postId] || [];
      setPostComments({
        ...postComments,
        [postId]: [...currentComments, res.data]
      });

      setCommentInputs({ ...commentInputs, [postId]: '' });
    } catch (err) {
      alert("Failed to add comment.");
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        await api.delete(`/api/posts/${postId}/comments/${commentId}`);
        
        const currentComments = postComments[postId] || [];
        setPostComments({
          ...postComments,
          [postId]: currentComments.filter(c => c.id !== commentId)
        });
      } catch (err) {
        alert("Failed to delete the comment.");
      }
    }
  };

  const handleChangeRole = async (userId, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    if (window.confirm(`Do you want to change the user role to ${newRole}?`)) {
      try {
        await api.patch(`/api/admin/users/${userId}`, { role: newRole });
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      } catch (err) {
        alert("Failed to change role.");
      }
    }
  };

  const handleBlockUser = async (userId) => {
    if (window.confirm("Are you sure you want to block this user?")) {
      try {
        await api.delete(`/api/admin/users/${userId}`);
        setUsers(users.filter(u => u.id !== userId));
      } catch (err) {
        alert("An error occurred.");
      }
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500 font-medium">Loading...</div>;
  if (error) return <div className="p-5 m-5 bg-red-50 text-red-500 rounded-xl text-center border border-red-200">{error}</div>;

  const isAdmin = userProfile?.role === 'ADMIN' || userProfile?.role === 'ROLE_ADMIN';

  return (
    /* FIKSALANDI: Telefonda h-auto (erkin skrol), faqat kompyuterda h-screen (fiksirlangan ekran) bo'ladi.
      Telefonda overflow-y-auto butun sahifani skrol qilish imkonini beradi.
    */
    <div className="w-full h-auto lg:h-screen bg-[#f4f5f9] text-slate-800 font-sans antialiased p-4 sm:p-6 overflow-y-auto lg:overflow-hidden flex flex-col">
      
      {/* GRID TIZIMI */}
      <div className={`grid gap-6 w-full ${isAdmin ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
        
        {/* 🚀 LENTA (POSTLAR) USTUNI */}
        <div className={`flex flex-col gap-6 ${isAdmin ? 'lg:col-span-2' : ''} lg:h-[calc(100vh-50px)] lg:overflow-y-auto lg:pr-3`} style={{ scrollbarWidth: 'thin' }}>
          
          {/* Header */}
          <div className="shrink-0">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Social Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Welcome, {userProfile?.fullName || 'User'}</p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0">
            <div className="p-5 bg-[#eceffa] rounded-2xl flex flex-col gap-1 shadow-sm border border-indigo-100">
              <span className="text-[11px] font-bold tracking-wider text-[#5c67a3]">TOTAL POSTS</span>
              <span className="text-2xl font-black text-slate-900">{posts.length}</span>
            </div>
            <div className="p-5 bg-[#e2f6eb] rounded-2xl flex flex-col gap-1 shadow-sm border border-emerald-100">
              <span className="text-[11px] font-bold tracking-wider text-[#2e7d32]">TOTAL USERS</span>
              <span className="text-2xl font-black text-slate-900">{isAdmin ? users.length : 1}</span>
            </div>
            <div className="p-5 bg-[#fdf2e9] rounded-2xl flex flex-col gap-1 shadow-sm border border-orange-100">
              <span className="text-[11px] font-bold tracking-wider text-[#b05d23]">SESSION STATUS</span>
              <span className="text-sm font-semibold text-emerald-600 mt-1">Active (Online)</span>
            </div>
          </div>

          {/* Create Post */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60 shrink-0">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Share your thoughts</h3>
            <form onSubmit={handleCreatePost}>
              <textarea
                className="w-full p-3.5 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl resize-none text-sm outline-none focus:border-indigo-500 focus:bg-white transition"
                placeholder="What's on your mind today?..."
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                rows="3"
              />
              <div className="flex justify-between items-center mt-3">
                <label className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3.5 py-2 rounded-xl cursor-pointer text-xs font-semibold transition">
                  📎 Attach Photo
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setSelectedFile(e.target.files[0])} 
                    className="hidden" 
                  />
                </label>
                {selectedFile && <span className="text-xs text-slate-500 truncate max-w-[150px]">Selected</span>}
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-semibold text-xs shadow-sm transition">
                  Publish
                </button>
              </div>
            </form>
          </div>

          {/* Feed List */}
          <div className="flex flex-col gap-4 pb-4">
            <h3 className="text-sm font-semibold text-slate-900">News Feed</h3>
            {posts.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-8">No posts available yet.</p>
            ) : (
              posts.map(post => {
                const canDeletePost = isAdmin || post.author?.id === userProfile?.id;

                return (
                  <div key={post.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60 relative group">
                    <div className="flex gap-3 mb-3 items-center justify-between">
                      <div className="flex gap-3 items-center">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white text-xs">
                          {post.author?.fullName?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-slate-900">{post.author?.fullName || 'Anonymous'}</h4>
                          <span className="text-[10px] text-slate-400">{new Date(post.createdAt || post.createdDate).toLocaleString()}</span>
                        </div>
                      </div>
                      {canDeletePost && (
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="text-slate-400 hover:text-red-500 text-xs p-1.5 font-bold transition rounded-lg hover:bg-red-50"
                          title="Delete Post"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <p className="text-xs leading-relaxed text-slate-700 mb-3 whitespace-pre-wrap">{post.content}</p>
                    
                    {post.attachmentUrl && (
                      <img 
                        src={`http://45.138.159.253:9099/api/files/uploads/${post.attachmentUrl}`} 
                        alt="Attachment" 
                        className="w-full max-h-[260px] object-cover rounded-xl mb-3" 
                      />
                    )}

                    <div className="border-t border-slate-100 pt-2.5">
                      <button onClick={() => toggleComments(post.id)} className="text-indigo-600 hover:text-indigo-700 text-xs font-semibold flex items-center gap-1">
                        💬 Comments ({postComments[post.id]?.length || 0})
                      </button>
                    </div>

                    {/* Comments */}
                    {activeCommentBox === post.id && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex flex-col gap-2 mb-3 max-h-48 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                          {(postComments[post.id] || []).length === 0 ? (
                            <p className="text-[11px] text-slate-400 italic py-1">No comments yet...</p>
                          ) : (
                            (postComments[post.id] || []).map(c => {
                              const canDeleteComment = isAdmin || c.author?.id === userProfile?.id;
                              return (
                                <div key={c.id} className="flex items-start justify-between bg-white p-2 rounded-lg border border-slate-100 shadow-2xs">
                                  <div className="text-[11px] text-slate-600 pr-2">
                                    <strong className="text-slate-800">{c.author?.fullName || 'User'}: </strong> 
                                    <span className="text-slate-700 break-all">{c.content}</span>
                                  </div>
                                  {canDeleteComment && (
                                    <button 
                                      onClick={() => handleDeleteComment(post.id, c.id)}
                                      className="text-red-400 hover:text-red-600 text-[10px] p-1 font-bold transition rounded-md hover:bg-red-50 shrink-0"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                        <form onSubmit={(e) => handleAddComment(e, post.id)} className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Write a comment..."
                            value={commentInputs[post.id] || ''}
                            onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                            className="flex-1 px-3 py-1.5 bg-white text-xs border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:bg-white transition"
                          />
                          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 rounded-lg text-xs font-semibold shadow-xs transition">
                            Send
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* 🛡️ O'NG TOMON / PASTKI QISM: ADMIN PANEL (USERS) */}
        {isAdmin && (
          /* FIKSALANDI: lg:h-[calc(100vh-50px)] va lg:overflow-y-auto berildi.
            Bu degani kompyuterda o'ngda chiroyli qotib turadi, telefonda esa pastda o'z bo'yiga qarab to'liq ochiladi.
          */
          <div className="w-full flex flex-col mt-4 lg:mt-0 lg:h-[calc(100vh-50px)]">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60 h-full flex flex-col">
              <div className="shrink-0 mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <span>🛡️</span> Admin Panel
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Manage Registered Users</p>
                </div>
                <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                  {users.length} Active
                </span>
              </div>
              
              {/* Foydalanuvchilar ro'yxati (Telefonda 1 yoki 2 qatorli grid bo'ladi, mutlaqo yo'qolib ketmaydi) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 overflow-y-auto pb-4" style={{ scrollbarWidth: 'thin' }}>
                {users.map(u => {
                  const isUserAdmin = u.role === 'ADMIN' || u.role === 'ROLE_ADMIN';
                  
                  return (
                    <div key={u.id} className="flex flex-col p-3.5 bg-slate-50 border border-slate-200/50 hover:border-slate-300 rounded-xl gap-3 shrink-0 transition-all shadow-2xs">
                      
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${
                          isUserAdmin ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
                        }`}>
                          {u.fullName?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-xs text-slate-900 truncate" title={u.fullName}>
                            {u.fullName}
                          </h4>
                          <p className="text-[10px] text-slate-500 truncate" title={u.email}>
                            {u.email}
                          </p>
                        </div>
                        
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          isUserAdmin 
                            ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' 
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}>
                          {isUserAdmin ? 'Admin' : 'User'}
                        </span>
                      </div>

                      <div className="flex gap-2 border-t border-slate-200/60 pt-2.5">
                        <button 
                          onClick={() => handleChangeRole(u.id, u.role)} 
                          className="flex-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 py-1.5 rounded-lg text-[11px] font-semibold transition shadow-2xs flex items-center justify-center gap-1"
                        >
                          🔄 Change Role
                        </button>
                        <button 
                          onClick={() => handleBlockUser(u.id)} 
                          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition flex items-center justify-center gap-1"
                        >
                          🚫 Block
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;