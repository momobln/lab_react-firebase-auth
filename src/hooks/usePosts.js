import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { ref, onValue, push, remove, set } from 'firebase/database';
import { auth, db } from '../config/firebase';

export const usePosts = () => {
  const [user] = useAuthState(auth);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const postsRef = ref(db, 'posts');
    const unsubscribe = onValue(postsRef, snapshot => {
      const data = snapshot.val();
      const postList = [];
      if (data) {
        for (const id in data) {
          postList.push({ id, ...data[id] });
        }
      }
      setPosts(postList.reverse());
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addPost = async (text) => {
    if (!user) throw new Error('Not authenticated');
    try {
      const postsRef = ref(db, 'posts');
      const newPostRef = push(postsRef);
      await set(newPostRef, {
        text,
        uid: user.uid,
        author: user.displayName,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error adding post:', error);
    }
  };

  const deletePost = async (postId) => {
    if (!user) throw new Error('Not authenticated');
    try {
      const postRef = ref(db, `posts/${postId}`);
      await remove(postRef);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  return { posts, loading, addPost, deletePost, user };
};