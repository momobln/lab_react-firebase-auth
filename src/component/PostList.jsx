import { useState } from 'react';
import { usePosts } from '../hooks/usePosts';

const PostList = () => {
  const { posts, loading, addPost, deletePost, user } = usePosts();
  const [newPostText, setNewPostText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPostText.trim()) {
      addPost(newPostText);
      setNewPostText('');
    }
  };

  if (loading) return <p>Loading posts...</p>;

  return (
    <section>
      {user && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
          <h3>Create a new post</h3>
          <textarea 
            value={newPostText} 
            onChange={e => setNewPostText(e.target.value)} 
            placeholder="What's on your mind?" 
            rows={3}
            style={{ width: '100%', padding: '10px' }}
          />
          <button type="submit" style={{ marginTop: '10px' }}>Post</button>
        </form>
      )}

      <h2>Community Posts</h2>
      <div className="post-container">
        {posts.length === 0 ? (
          <p>No posts yet. Be the first!</p>
        ) : (
          posts.map(post => (
            <div key={post.id} className="post-card" style={{
              border: '1px solid #ccc',
              padding: '15px',
              margin: '10px 0',
              borderRadius: '5px'
            }}>
              <p>
                <strong>{post.author || 'Anonymous'}</strong> wrote:
              </p>
              <p>{post.text}</p>
              {user && user.uid === post.uid && (
                <button 
                  onClick={() => deletePost(post.id)}
                  style={{ backgroundColor: '#ff4444', color: 'white' }}
                >
                  Delete
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default PostList;