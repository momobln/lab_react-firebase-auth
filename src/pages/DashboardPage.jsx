import PostList from '../components/PostList';

const DashboardPage = () => {
  return (
    <div>
      <h2>Your Dashboard</h2>
      <p>Welcome to your personal dashboard!</p>
      <hr />
      <PostList />
    </div>
  );
};

export default DashboardPage;