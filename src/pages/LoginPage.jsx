import Auth from '../components/Auth';

const LoginPage = () => {
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h2>Login Required</h2>
      <p>Please sign in to continue.</p>
      <Auth />
    </div>
  );
};

export default LoginPage;