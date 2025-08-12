import PostList from '../components/PostList';

const HomePage = () => {
  return (
    <div>
      <h2>Welcome to Community Wall!</h2>
      <p>This is the community wall. See what others are saying and sign in to join the conversation.</p>
      <hr />
      <PostList />
    </div>
  );
};

export default HomePage;