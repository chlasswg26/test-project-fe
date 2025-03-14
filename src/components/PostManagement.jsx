import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const PostManagement = () => {
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [postData, setPostData] = useState({ id: '', title: '', content: '', status: 'DRAFT' });
  const [notification, setNotification] = useState({ message: '', type: '' });

  const fetchPosts = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:2626/api');
      setPosts(response.data);
    } catch (error) {
      console.log(error)
      showNotification('Failed to fetch posts.', 'error');
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleModalOpen = (post = { title: '', content: '', status: 'DRAFT' }) => {
    setPostData(post);
    setEditMode(!!post.id);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setPostData({ id: '', title: '', content: '', status: 'DRAFT' });
    setEditMode(false);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.put(`http://localhost:2626/api/${postData.id}`, postData);
        showNotification('Post updated successfully!', 'success');
      } else {
        await axios.post('http://localhost:2626/api', { ...postData });
        showNotification('Post created successfully!', 'success');
      }
      handleModalClose();
      fetchPosts();
    } catch (error) {
      console.log(error)
      showNotification('Failed to save post.', 'error');
    }
  };

  const deletePost = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`http://localhost:2626/api/${id}`);
        showNotification('Post deleted successfully!', 'success');
        fetchPosts();
      } catch (error) {
      console.log(error)
        showNotification('Failed to delete post.', 'error');
      }
    }
  };

  const publishPost = async (id) => {
    try {
      await axios.put(`http://localhost:2626/api/${id}`, { status: 'PUBLISHED' });
      showNotification('Post published successfully!', 'success');
      fetchPosts();
    } catch (error) {
      console.log(error)
      showNotification('Failed to publish post.', 'error');
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 3000);
  };

  return (
    <div className="container mx-auto p-6 bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">Post Management System</h1>

      {notification.message && (
        <div className={`mb-4 p-3 rounded-lg text-white ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {notification.message}
        </div>
      )}

      <button
        onClick={() => handleModalOpen()}
        className="bg-blue-600 text-white p-3 rounded-lg mb-4 hover:bg-blue-700 transition duration-200"
      >
        Create a New Post
      </button>

      <h2 className="text-3xl font-semibold mb-4 text-gray-800">Posts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <div key={post.id} className="bg-white border border-gray-300 rounded-lg p-4 shadow-md">
            <h3 className="text-xl font-bold text-gray-800">{post.title}</h3>
            <p className="text-gray-600 mb-4">{post.content}</p>
            <p className={`text-sm ${post.status === 'PUBLISHED' ? 'text-green-600' : 'text-yellow-600'}`}>
              Status: {post.status}
            </p>
            <div className="flex space-x-2">
              <button onClick={() => handleModalOpen(post)} className="bg-yellow-500 text-white p-2 rounded-lg">Edit</button>
              {post.status !== 'PUBLISHED' && (
                <button onClick={() => publishPost(post.id)} className="bg-green-500 text-white p-2 rounded-lg">Publish</button>
              )}
              <button onClick={() => deletePost(post.id)} className="bg-red-500 text-white p-2 rounded-lg">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-50" onClick={handleModalClose}></div>
          <div className="bg-white rounded-lg shadow-lg p-6 z-10 w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-4">{editMode ? 'Edit Post' : 'Create Post'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={postData.title}
                onChange={(e) => setPostData({ ...postData, title: e.target.value })}
                placeholder="Enter post title"
                className="border border-gray-300 rounded-lg p-3 w-full"
                required
              />
              <textarea
                value={postData.content}
                onChange={(e) => setPostData({ ...postData, content: e.target.value })}
                placeholder="Enter post content"
                className="border border-gray-300 rounded-lg p-3 w-full"
                rows="4"
                required
              />
              <button type="submit" className="bg-blue-600 text-white p-3 rounded-lg w-full">{editMode ? 'Update Post' : 'Add Post'}</button>
            </form>
            <button onClick={handleModalClose} className="mt-4 text-red-500">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostManagement;