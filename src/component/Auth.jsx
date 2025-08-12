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