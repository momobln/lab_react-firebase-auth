# lab_react-firebase-auth

![logo_ironhack_blue 7](https://user-images.githubusercontent.com/23629340/40541063-a07a0a8a-601a-11e8-91b5-2f13e4e6b441.png)

# LAB | React Firebase - Protected Routes & Data

## Learning Goals

After this exercise, you will be able to:

- Implement protected routes that require user authentication.
- Conditionally render UI elements based on a user's login status.
- Structure data-fetching logic into custom React hooks.
- Secure database access using Firebase Security Rules.
- Build a full CRUD (Create, Read, Update, Delete) interface for authenticated users.

<br>

## Requirements

- Fork this repo.
- Clone this repo.
- You will need a Google account to create a Firebase project.

<br>

## Submission

- Upon completion, run the following commands:

```shell
$ git add .
$ git commit -m "Solved lab"
$ git push origin master
```

- Create a Pull Request so that your TAs can check your work.

<br>

## Test Your Code

This LAB is not equipped with automated unit tests. You will test your application's functionality by running it in the browser.

1.  Run your React application using `npm run dev`.
2.  Open the application in your browser (usually `http://localhost:5173`).
3.  Use the browser's Developer Tools to check for console errors, inspect network requests, and debug your components.

<br>

## Instructions

The goal of this exercise is to build a simple "Community Wall" application where users can sign in with Google to post, edit, and delete their own messages. This will put the concepts from the lesson into practice, focusing on protected actions and data ownership.

This exercise is split into multiple iterations. You will start from scratch, building the project structure, connecting to Firebase, and then implementing the features step-by-step.

### Iteration 0 - Project Setup

Before writing any code, you need to set up your Firebase project and your local React development environment.

1.  **Firebase Project**:

    - Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
    - **Enable Authentication**: In the console, go to **Build > Authentication** and enable the **Google** sign-in provider.
    - **Enable Realtime Database**: Go to **Build > Realtime Database**, create a database, and start it in **"locked mode"**.
    - **Get Config Keys**: In your Project Settings, register a new Web App (`</>`) and copy the `firebaseConfig` object.

2.  **React Project**:

    - Create a new React project using Vite:
      ```bash
      npm create vite@latest community-wall -- --template react
      ```
    - Navigate into the new directory:
      ```bash
      cd community-wall
      ```
    - Install the necessary dependencies:
      ```bash
      npm install firebase react-firebase-hooks react-router-dom
      ```
    - Create a `.env.local` file in the root of your `community-wall` project. Paste your `firebaseConfig` keys into it, prefixed with `VITE_`:
      ```env
      # .env.local
      VITE_API_KEY="your-api-key"
      VITE_AUTH_DOMAIN="your-auth-domain"
      VITE_DATABASE_URL="your-database-url"
      # ... and so on for all keys
      ```

3.  **Folder Structure**:
    - Inside the `src` folder, create the following directories: `components`, `config`, `hooks`, and `pages`.

### Iteration 1 - Firebase Configuration & Basic Auth

First, let's connect our app to Firebase and create a simple component to handle logging in and out.

1.  **Create the Firebase config file** in `src/config/firebase.js`. This file will initialize Firebase and export the services we need.

    ```javascript
    // src/config/firebase.js
    import { initializeApp } from 'firebase/app';
    import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
    import { getDatabase } from 'firebase/database';

    const firebaseConfig = {
      apiKey: import.meta.env.VITE_API_KEY,
      authDomain: import.meta.env.VITE_AUTH_DOMAIN,
      databaseURL: import.meta.env.VITE_DATABASE_URL,
      projectId: import.meta.env.VITE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_APP_ID
    };

    const app = initializeApp(firebaseConfig);
    export const auth = getAuth(app);
    export const db = getDatabase(app);

    const googleProvider = new GoogleAuthProvider();

    export const signInWithGoogle = async () => {
      try {
        await signInWithPopup(auth, googleProvider);
      } catch (err) {
        console.error(err);
      }
    };

    export const signOutUser = async () => {
      try {
        await signOut(auth);
      } catch (err) {
        console.error(err);
      }
    };
    ```

2.  **Create an `Auth.jsx` component** in `src/components/Auth.jsx`. This will display the user's status and provide login/logout buttons.

    > [!TIP]
    > Use the `useAuthState` hook from `react-firebase-hooks/auth`. It's the cleanest way to get the current user, loading state, and any errors.

3.  **Update `App.jsx`** to display the `Auth` component. For now, just put it in a simple layout.

<details>
<summary>⭐ **Click for Iteration 1 Solution** ⭐</summary>

**`src/components/Auth.jsx`**

```jsx
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, signInWithGoogle, signOutUser } from '../config/firebase';

const Auth = () => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <nav>
      {user ? (
        <div>
          <span>Welcome, {user.displayName}!</span>
          <button onClick={signOutUser}>Sign Out</button>
        </div>
      ) : (
        <button onClick={signInWithGoogle}>Sign in with Google</button>
      )}
    </nav>
  );
};

export default Auth;
```

**`src/App.jsx`**

```jsx
import Auth from './components/Auth';
import './App.css';

function App() {
  return (
    <div className="App">
      <header>
        <h1>Community Wall</h1>
        <Auth />
      </header>
      <main>
        <p>Welcome to the community wall. Sign in to post a message!</p>
      </main>
    </div>
  );
}

export default App;
```

</details>

### Iteration 2 - Protected Routes

Most apps have pages that should only be visible to logged-in users. Let's create a "Dashboard" page and protect it.

1.  **Create page components**:

    - `src/pages/HomePage.jsx`: A simple welcome page.
    - `src/pages/DashboardPage.jsx`: A placeholder page for authenticated users.
    - `src/pages/LoginPage.jsx`: A page that tells the user they need to log in. It can reuse the `Auth` component.

2.  **Create a `ProtectedRoute.jsx` component** in `src/components/ProtectedRoute.jsx`. This component is the key to protecting routes.

    - It should use the `useAuthState` hook.
    - If `loading`, it can show a loading message.
    - If there's **no user**, it should redirect to the `/login` page using the `Navigate` component from `react-router-dom`.
    - If there **is a user**, it should render its `children`.

3.  **Set up the router**. Modify `App.jsx` (or `main.jsx`) to use `react-router-dom` to define your routes.
    - The `/` route should show `HomePage`.
    - The `/login` route should show `LoginPage`.
    - The `/dashboard` route should be wrapped by your `ProtectedRoute` component.

<details>
<summary>⭐ **Click for Iteration 2 Solution** ⭐</summary>

**`src/components/ProtectedRoute.jsx`**

```jsx
import { useAuthState } from 'react-firebase-hooks/auth';
import { Navigate } from 'react-router-dom';
import { auth } from '../config/firebase';

const ProtectedRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
```

**`src/pages/LoginPage.jsx`**

```jsx
import Auth from '../components/Auth';

const LoginPage = () => {
  return (
    <div>
      <h2>Login Required</h2>
      <p>Please sign in to continue.</p>
      <Auth />
    </div>
  );
};

export default LoginPage;
```

**`src/App.jsx` (Router Setup)**

```jsx
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import Auth from './components/Auth';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header>
          <h1>Community Wall</h1>
          <nav>
            <Link to="/">Home</Link> | <Link to="/dashboard">Dashboard</Link>
          </nav>
          <Auth />
        </header>
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
```

</details>

### Iteration 3 - CRUD Functionality & Security Rules

Now for the main feature: posting messages to the wall. This involves creating, reading, and deleting data, and securing it so users can only delete their own posts.

1.  **Update Firebase Security Rules**. Go to your Realtime Database rules in the Firebase Console and replace the default rules. The rules should allow anyone to read the posts, but only authenticated users to write. Deletion should be restricted to the post's original author.

    ```json
    {
      "rules": {
        "posts": {
          ".read": "true",
          "$postId": {
            // User must be logged in to write (create/update/delete)
            ".write": "auth != null",
            // On CREATE: new data must have a `uid` matching the user's auth.uid
            ".validate": "newData.hasChildren(['text', 'uid']) && newData.child('uid').val() === auth.uid",
            // On DELETE: existing data's uid must match the user's auth.uid
            ".validate": "newData.val() === null ? data.child('uid').val() === auth.uid : true"
          }
        }
      }
    }
    ```

    > [!CAUTION]
    > Security rules are critical. The rules above ensure data integrity. The first `.validate` ensures new posts are created correctly, and the second one checks ownership before allowing a delete (`newData.val() === null`).

2.  **Create a custom hook `usePosts.js`** in `src/hooks/`. This hook will encapsulate all the logic for interacting with the `posts` collection in your database. It should handle:

    - Fetching all posts in real-time.
    - Adding a new post (tagged with the user's `uid`).
    - Deleting a post.

3.  **Create a `PostList.jsx` component** in `src/components/`. This component will:

    - Use your `usePosts` hook to get the data and functions.
    - Display a form for adding a new post (only show this if the user is logged in).
    - Map over the posts and display them.
    - For each post, show a "Delete" button **only if the current user is the author of the post**.

4.  **Integrate `PostList.jsx`** into your `HomePage.jsx` or `DashboardPage.jsx` so users can see and interact with the wall.

<details>
<summary>⭐ **Click for Iteration 3 Solution** ⭐</summary>

**`src/hooks/usePosts.js`**

```javascript
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
      setPosts(postList.reverse()); // Show newest first
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
        author: user.displayName
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
```

**`src/components/PostList.jsx`**

```jsx
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
        <form onSubmit={handleSubmit}>
          <h3>Create a new post</h3>
          <textarea value={newPostText} onChange={e => setNewPostText(e.target.value)} placeholder="What's on your mind?" rows={3} />
          <button type="submit">Post</button>
        </form>
      )}

      <h2>Community Posts</h2>
      <div className="post-container">
        {posts.length === 0 ? (
          <p>No posts yet. Be the first!</p>
        ) : (
          posts.map(post => (
            <div key={post.id} className="post-card">
              <p>
                <strong>{post.author || 'Anonymous'}</strong> wrote:
              </p>
              <p>{post.text}</p>
              {user && user.uid === post.uid && <button onClick={() => deletePost(post.id)}>Delete</button>}
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default PostList;
```

**`src/pages/HomePage.jsx` (Updated)**

```jsx
import PostList from '../components/PostList';

const HomePage = () => {
  return (
    <div>
      <h2>Welcome!</h2>
      <p>This is the community wall. See what others are saying and sign in to join the conversation.</p>
      <hr />
      <PostList />
    </div>
  );
};

export default HomePage;
```

</details>

<br>

**Happy coding!** :heart:

<br>

## Extra Resources

- [Official Firebase Docs for Web](https://firebase.google.com/docs/web/setup)
- [react-firebase-hooks Documentation](https://github.com/CSFrequency/react-firebase-hooks)
- [React Router Docs](https://reactrouter.com/en/main)
- [Firebase Security Rules Docs](https://firebase.google.com/docs/database/security)
